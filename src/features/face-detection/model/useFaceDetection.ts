'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { loadModels, detectFace, faceapi } from '@/shared/lib/face-api';
import type { ModelLoadingStatus } from '@/shared/types';
import { CoordinateTransformer } from '@/shared/lib/canvas/CoordinateTransformer';
import { FaceMeshRenderer } from '../lib';

export function useFaceDetection() {
  const [modelStatus, setModelStatus] = useState<ModelLoadingStatus>('idle');
  const [isDetecting, setIsDetecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const detectionIntervalRef = useRef<number | null>(null);

  // 모델 로드
  const initializeModels = useCallback(async () => {
    if (modelStatus === 'loaded' || modelStatus === 'loading') return;

    setModelStatus('loading');
    setError(null);

    try {
      await loadModels();
      setModelStatus('loaded');
    } catch (err) {
      setModelStatus('error');
      setError('모델 로드에 실패했습니다. 페이지를 새로고침 해주세요.');
      console.error('Model loading error:', err);
    }
  }, [modelStatus]);

  // 단일 얼굴 감지
  const detectSingleFace = useCallback(
    async (video: HTMLVideoElement) => {
      if (modelStatus !== 'loaded') {
        throw new Error('모델이 아직 로드되지 않았습니다.');
      }

      return await detectFace(video);
    },
    [modelStatus]
  );

  // 연속 얼굴 감지 시작
  const startContinuousDetection = useCallback(
    (
      video: HTMLVideoElement,
      canvas: HTMLCanvasElement,
      onDetection?: (
        detection: faceapi.WithFaceDescriptor<
          faceapi.WithFaceLandmarks<{ detection: faceapi.FaceDetection }>
        > | null
      ) => void
    ) => {
      if (modelStatus !== 'loaded') return;

      // 이미 실행 중이면 먼저 정지
      if (detectionIntervalRef.current) {
        clearInterval(detectionIntervalRef.current);
        detectionIntervalRef.current = null;
      }

      setIsDetecting(true);

      const detect = async () => {
        try {
          // 캔버스 유효성 검사
          const ctx = canvas.getContext('2d');
          if (!ctx) return;

          // 캔버스 크기가 0이면 건너뛰기 (아직 렌더링 안됨)
          if (canvas.width === 0 || canvas.height === 0) return;

          // 얼굴 감지
          const detection = await detectFace(video);

          // 캔버스 초기화
          ctx.clearRect(0, 0, canvas.width, canvas.height);

          if (detection) {
            // 매 프레임마다 좌표 변환 및 렌더러 재생성 (canvas 크기 변경 대응)
            const transformer = new CoordinateTransformer(video, canvas);
            const renderer = new FaceMeshRenderer(transformer);

            // 얼굴 박스 및 랜드마크 렌더링
            renderer.renderFaceBox(ctx, detection.detection.box);
            renderer.renderLandmarks(ctx, detection.landmarks);
          }

          onDetection?.(detection);
        } catch (err) {
          console.error('Detection error:', err);
        }
      };

      // 100ms마다 감지
      detectionIntervalRef.current = window.setInterval(detect, 100);
    },
    [modelStatus]
  );

  // 연속 감지 중지
  const stopContinuousDetection = useCallback(() => {
    if (detectionIntervalRef.current) {
      clearInterval(detectionIntervalRef.current);
      detectionIntervalRef.current = null;
    }
    setIsDetecting(false);
  }, []);

  // 컴포넌트 언마운트 시 정리
  useEffect(() => {
    return () => {
      stopContinuousDetection();
    };
  }, [stopContinuousDetection]);

  return {
    modelStatus,
    isDetecting,
    error,
    initializeModels,
    detectSingleFace,
    startContinuousDetection,
    stopContinuousDetection,
  };
}
