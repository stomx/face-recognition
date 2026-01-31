'use client';

/**
 * 얼굴 인식 훅 (동기 상태 추적 버전)
 *
 * 핵심: phaseRef로 동기적 상태 체크하여 중복 호출 완전 차단
 */

import { useState, useRef, useCallback, useEffect } from 'react';
import { useUserRepository, useAccessLogRepository, useFaceMatchRepository } from '@/entities/user';
import { verifyFace } from '../lib/verifyFace';
import type { ScanResult, VerificationResult } from './types';
import { TIMING } from './types';
import { debug } from '@/shared/lib/debug';

const log = debug.scope('VerificationMachine');

type Phase = 'idle' | 'scanning' | 'result';

interface VerificationMachineOptions {
  autoMode?: boolean;
  minConfidence?: number;
}

export function useVerificationMachine(options: VerificationMachineOptions = {}) {
  const { autoMode = false, minConfidence = 0.1 } = options;

  // UI 렌더링용 상태
  const [phase, setPhase] = useState<Phase>('idle');
  const [lastScan, setLastScan] = useState<ScanResult | null>(null);
  const [result, setResult] = useState<VerificationResult | null>(null);
  const [isClosing, setIsClosing] = useState(false); // 닫히는 애니메이션용

  // ★ 동기 상태 추적용 ref (React 상태는 비동기라 중복 호출 방지 불가)
  const phaseRef = useRef<Phase>('idle');

  const faceMatchRepo = useFaceMatchRepository();
  const userRepo = useUserRepository();
  const accessLogRepo = useAccessLogRepository();

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const intervalRef = useRef<number | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const lastVerifyKeyRef = useRef<string | null>(null);

  // 스캐너 중지
  const stopScanner = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  // 타이머 정리
  const clearTimer = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  // 단일 스캔 실행
  const performScan = useCallback(async (): Promise<ScanResult | null> => {
    // ★ 스캔 전에 phase 체크 (result 상태면 스캔하지 않음)
    if (phaseRef.current !== 'scanning') {
      return null;
    }

    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas || video.readyState < 2) return null;

    // ⭐ 공통 인증 함수 사용
    const labeledDescriptors = faceMatchRepo.getLabeledDescriptors();
    const result = await verifyFace(video, labeledDescriptors, userRepo.getById);

    // ★ 스캔 완료 후에도 다시 체크 (스캔 중 상태가 바뀌었을 수 있음)
    if (phaseRef.current !== 'scanning') {
      return null;
    }

    // 캔버스 클리어
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }

    if (!result.detection) {
      return {
        faceDetected: false,
        isVerified: false,
        userId: null,
        userName: null,
        confidence: 0,
      };
    }

    // FaceBox 정보 추출
    const box = result.detection.detection.box;

    return {
      faceDetected: true,
      faceBox: {
        x: box.x,
        y: box.y,
        width: box.width,
        height: box.height,
      },
      isVerified: result.success,
      userId: result.userId,
      userName: result.userName,
      confidence: result.confidence,
    };
  }, [faceMatchRepo, userRepo]);

  // 스캐너 시작
  const startScanner = useCallback(() => {
    if (intervalRef.current) return;

    const runScan = async () => {
      // ★ 매 스캔마다 phase 체크
      if (phaseRef.current !== 'scanning') return;

      const scanResult = await performScan();
      if (scanResult && phaseRef.current === 'scanning') {
        setLastScan(scanResult);
      }
    };

    runScan();
    intervalRef.current = window.setInterval(runScan, TIMING.SCAN_INTERVAL);
  }, [performScan]);

  // ★ 인증 실행 (ref로 동기 체크)
  const verify = useCallback((scan: ScanResult) => {
    // ★★★ 동기 체크: phaseRef가 scanning이 아니면 즉시 리턴 ★★★
    if (phaseRef.current !== 'scanning') {
      log.log('blocked - phase is not scanning', 'verify', { phase: phaseRef.current });
      return;
    }

    // 얼굴 미감지 또는 거리 문제
    if (!scan.faceDetected || !scan.faceBox || scan.faceBox.height < TIMING.MIN_FACE_HEIGHT) {
      return;
    }

    // ★★★ 즉시 ref 업데이트 (이 시점부터 모든 추가 호출 차단) ★★★
    phaseRef.current = 'result';
    log.log('phase locked to result', 'verify');

    // 스캐너 중지
    stopScanner();

    // React 상태 업데이트 (UI 반영용)
    setPhase('result');

    // 출입 기록 저장
    accessLogRepo.add(
      scan.userId,
      scan.userName,
      scan.isVerified ? 'success' : 'failed',
      scan.confidence
    );

    // 결과 저장
    setResult({
      isVerified: scan.isVerified,
      userId: scan.userId,
      userName: scan.userName,
      confidence: scan.confidence,
      timestamp: new Date(),
    });

    // 5초 후 닫기 애니메이션 시작
    clearTimer();
    timerRef.current = setTimeout(() => {
      log.log('5s passed, starting close animation', 'verify');
      setIsClosing(true);

      // 닫기 애니메이션 후 (0.3초) 스캐너 재시작
      timerRef.current = setTimeout(() => {
        log.log('close animation done, restarting scanner', 'verify');
        setIsClosing(false);
        setResult(null);
        setLastScan(null);

        // ★ ref와 state 모두 업데이트
        phaseRef.current = 'scanning';
        setPhase('scanning');

        startScanner();
      }, 300);
    }, TIMING.RESULT_DURATION);

  }, [stopScanner, accessLogRepo, clearTimer, startScanner]);

  // 수동 인증 요청
  const requestVerify = useCallback(() => {
    if (phaseRef.current !== 'scanning' || !lastScan) return;
    verify(lastScan);
  }, [lastScan, verify]);

  // 자동 모드
  useEffect(() => {
    // ★ ref로 동기 체크
    if (!autoMode || phaseRef.current !== 'scanning' || !lastScan) return;

    if (!lastScan.faceDetected || !lastScan.faceBox) return;
    if (lastScan.faceBox.height < TIMING.MIN_FACE_HEIGHT) return;
    if (lastScan.confidence < minConfidence && !lastScan.isVerified) return;

    // 중복 방지
    const verifyKey = `${lastScan.userId}-${lastScan.isVerified}-${Math.floor(Date.now() / 3000)}`;
    if (lastVerifyKeyRef.current === verifyKey) return;
    lastVerifyKeyRef.current = verifyKey;

    // This is intentional: auto-verify when face detection conditions are met
    // eslint-disable-next-line react-hooks/set-state-in-effect
    verify(lastScan);
  }, [autoMode, lastScan, minConfidence, verify]);

  // 시작
  const start = useCallback((video: HTMLVideoElement, canvas: HTMLCanvasElement) => {
    videoRef.current = video;
    canvasRef.current = canvas;

    phaseRef.current = 'scanning';
    setPhase('scanning');

    startScanner();
  }, [startScanner]);

  // 정지
  const stop = useCallback(() => {
    clearTimer();
    stopScanner();

    phaseRef.current = 'idle';
    setPhase('idle');

    setLastScan(null);
    setResult(null);
    lastVerifyKeyRef.current = null;
  }, [clearTimer, stopScanner]);

  // 클린업
  useEffect(() => {
    return () => {
      clearTimer();
      stopScanner();
    };
  }, [clearTimer, stopScanner]);

  const canVerify = phase === 'scanning' &&
    lastScan?.faceDetected === true &&
    lastScan?.faceBox != null &&
    lastScan.faceBox.height >= TIMING.MIN_FACE_HEIGHT;

  return {
    isIdle: phase === 'idle',
    isScanning: phase === 'scanning',
    isShowingResult: phase === 'result',
    isClosing, // 닫히는 애니메이션 중
    lastScan: phase === 'scanning' ? lastScan : null,
    result,
    canVerify,
    start,
    stop,
    requestVerify,
  };
}
