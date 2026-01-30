'use client';

import { useState, useCallback, useRef } from 'react';
import { useUserStore } from '@/entities/user';
import { detectFace, findBestMatch } from '@/shared/lib/face-api';
import { FACE_DETECTION_CONFIG } from '@/shared/config/constants';

interface VerificationResult {
  isVerified: boolean;
  userId: string | null;
  userName: string | null;
  confidence: number;
  faceDetected: boolean;
}

interface VerificationOptions {
  showOverlay?: boolean; // 얼굴 박스/이름 표시 여부
}

export function useFaceVerification() {
  const [isVerifying, setIsVerifying] = useState(false);
  const [lastResult, setLastResult] = useState<VerificationResult | null>(null);
  const { users, getLabeledDescriptors, addAccessLog, getUserById } = useUserStore();
  const verificationIntervalRef = useRef<number | null>(null);

  // 단일 검증
  const verifySingleFace = useCallback(
    async (video: HTMLVideoElement): Promise<VerificationResult> => {
      const detection = await detectFace(video);

      if (!detection) {
        const result: VerificationResult = {
          isVerified: false,
          userId: null,
          userName: null,
          confidence: 0,
          faceDetected: false,
        };
        setLastResult(result);
        return result;
      }

      const labeledDescriptors = getLabeledDescriptors();

      if (labeledDescriptors.length === 0) {
        const result: VerificationResult = {
          isVerified: false,
          userId: null,
          userName: '등록된 사용자 없음',
          confidence: 0,
          faceDetected: true,
        };
        setLastResult(result);
        return result;
      }

      const bestMatch = findBestMatch(detection.descriptor, labeledDescriptors);

      if (!bestMatch || bestMatch.label === 'unknown') {
        const result: VerificationResult = {
          isVerified: false,
          userId: null,
          userName: null,
          confidence: bestMatch ? 1 - bestMatch.distance : 0,
          faceDetected: true,
        };
        setLastResult(result);
        return result;
      }

      const matchedUser = getUserById(bestMatch.label);
      const confidence = 1 - bestMatch.distance;
      const isVerified = confidence >= (1 - FACE_DETECTION_CONFIG.MATCH_THRESHOLD);

      const result: VerificationResult = {
        isVerified,
        userId: bestMatch.label,
        userName: matchedUser?.name || null,
        confidence,
        faceDetected: true,
      };

      setLastResult(result);
      return result;
    },
    [getLabeledDescriptors, getUserById]
  );

  // 연속 검증 시작
  const startContinuousVerification = useCallback(
    (
      video: HTMLVideoElement,
      canvas: HTMLCanvasElement,
      onVerification?: (result: VerificationResult) => void,
      options?: VerificationOptions
    ) => {
      // 이미 실행 중이면 기존 인터벌 정리
      if (verificationIntervalRef.current) {
        console.log('Clearing existing verification interval');
        clearInterval(verificationIntervalRef.current);
        verificationIntervalRef.current = null;
      }

      if (users.length === 0) {
        console.warn('No users registered, cannot start verification');
        return;
      }

      const { showOverlay = false } = options || {};

      console.log('Starting continuous verification with', users.length, 'registered users');
      console.log('Video state:', {
        readyState: video.readyState,
        videoWidth: video.videoWidth,
        videoHeight: video.videoHeight
      });
      setIsVerifying(true);

      const verify = async () => {
        try {
          // 비디오가 준비되지 않았으면 스킵
          if (video.readyState < 2) {
            console.log('Video not ready, readyState:', video.readyState);
            return;
          }

          const detection = await detectFace(video);

          // 캔버스 클리어
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
          }

          // 얼굴이 감지되지 않으면 faceDetected: false로 상태 업데이트
          if (!detection) {
            const noFaceResult: VerificationResult = {
              isVerified: false,
              userId: null,
              userName: null,
              confidence: 0,
              faceDetected: false,
            };
            setLastResult(noFaceResult);
            return;
          }

          const labeledDescriptors = getLabeledDescriptors();
          console.log('Face detected, comparing with', labeledDescriptors.length, 'descriptors');

          const bestMatch = labeledDescriptors.length > 0
            ? findBestMatch(detection.descriptor, labeledDescriptors)
            : null;

          const box = detection.detection.box;
          const isMatch = bestMatch && bestMatch.label !== 'unknown';
          const confidence = bestMatch ? 1 - bestMatch.distance : 0;

          console.log('Match result:', { isMatch, confidence: (confidence * 100).toFixed(1) + '%', label: bestMatch?.label });

          // 오버레이 표시 옵션이 켜져 있을 때만 박스/이름 그리기
          if (showOverlay && ctx) {
            // 박스 색상 설정
            ctx.strokeStyle = isMatch ? '#00ff00' : '#ff0000';
            ctx.lineWidth = 3;
            ctx.strokeRect(box.x, box.y, box.width, box.height);

            // 이름/상태 표시 (캔버스가 CSS로 반전되므로 텍스트도 미리 반전)
            ctx.fillStyle = isMatch ? '#00ff00' : '#ff0000';
            ctx.font = 'bold 16px Arial';

            const label = isMatch
              ? `${getUserById(bestMatch!.label)?.name || 'Unknown'} (${(confidence * 100).toFixed(0)}%)`
              : `확인 중 (${(confidence * 100).toFixed(0)}%)`;

            // 텍스트 반전 처리
            ctx.save();
            ctx.scale(-1, 1);
            ctx.fillText(label, -(box.x + box.width), box.y - 10);
            ctx.restore();
          }

          // 결과 콜백 - 얼굴이 감지된 경우에만
          const result: VerificationResult = {
            isVerified: isMatch || false,
            userId: isMatch ? bestMatch!.label : null,
            userName: isMatch ? getUserById(bestMatch!.label)?.name || null : null,
            confidence,
            faceDetected: true,
          };

          setLastResult(result);
          onVerification?.(result);
        } catch (err) {
          console.error('Verification error:', err);
        }
      };

      // 초기 실행
      console.log('Running initial verification...');
      verify();

      // 인터벌 설정
      verificationIntervalRef.current = window.setInterval(() => {
        verify();
      }, 500);

      console.log('Verification interval set:', verificationIntervalRef.current);
    },
    [users.length, getLabeledDescriptors, getUserById]
  );

  // 연속 검증 중지
  const stopContinuousVerification = useCallback(() => {
    console.log('Stopping continuous verification, interval:', verificationIntervalRef.current);
    if (verificationIntervalRef.current) {
      clearInterval(verificationIntervalRef.current);
      verificationIntervalRef.current = null;
    }
    setIsVerifying(false);
    setLastResult(null);
  }, []);

  // 출입 기록 저장
  const logAccess = useCallback(
    (result: VerificationResult) => {
      addAccessLog(
        result.userId,
        result.userName,
        result.isVerified ? 'success' : 'failed',
        result.confidence
      );
    },
    [addAccessLog]
  );

  return {
    isVerifying,
    lastResult,
    verifySingleFace,
    startContinuousVerification,
    stopContinuousVerification,
    logAccess,
  };
}
