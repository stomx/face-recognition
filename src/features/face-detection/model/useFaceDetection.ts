'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { loadModels, detectFace, faceapi } from '@/shared/lib/face-api';
import type { ModelLoadingStatus } from '@/shared/types';
import { CoordinateTransformer } from '@/shared/lib/canvas/CoordinateTransformer';
import { FaceMeshRenderer } from '../lib';
import { debug } from '@/shared/lib/debug';

const log = debug.scope('FaceDetection');

// Cache key for tracking canvas dimensions
interface CanvasDimensions {
  width: number;
  height: number;
  videoWidth: number;
  videoHeight: number;
}

export function useFaceDetection() {
  const [modelStatus, setModelStatus] = useState<ModelLoadingStatus>('idle');
  const [isDetecting, setIsDetecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const detectionIntervalRef = useRef<number | null>(null);

  // Cached objects for performance optimization
  const transformerRef = useRef<CoordinateTransformer | null>(null);
  const rendererRef = useRef<FaceMeshRenderer | null>(null);
  const cachedDimensionsRef = useRef<CanvasDimensions | null>(null);

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
      log.error('Model loading failed', 'initializeModels', undefined, err);
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
            // Check if canvas dimensions changed - only recreate objects when needed
            const currentDimensions: CanvasDimensions = {
              width: canvas.width,
              height: canvas.height,
              videoWidth: video.videoWidth,
              videoHeight: video.videoHeight,
            };

            const needsRecreate =
              !cachedDimensionsRef.current ||
              cachedDimensionsRef.current.width !== currentDimensions.width ||
              cachedDimensionsRef.current.height !== currentDimensions.height ||
              cachedDimensionsRef.current.videoWidth !== currentDimensions.videoWidth ||
              cachedDimensionsRef.current.videoHeight !== currentDimensions.videoHeight;

            if (needsRecreate) {
              // Only recreate when dimensions change
              transformerRef.current = new CoordinateTransformer(video, canvas);
              rendererRef.current = new FaceMeshRenderer(transformerRef.current);
              cachedDimensionsRef.current = currentDimensions;
            }

            // Use cached renderer for face rendering
            if (rendererRef.current) {
              rendererRef.current.renderFaceBox(ctx, detection.detection.box);
              rendererRef.current.renderLandmarks(ctx, detection.landmarks);
            }
          }

          onDetection?.(detection);
        } catch (err) {
          log.error('Continuous detection failed', 'detect', undefined, err);
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
