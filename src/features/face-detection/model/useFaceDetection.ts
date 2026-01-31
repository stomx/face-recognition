'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { loadModels, detectFace, faceapi } from '@/shared/lib/face-api';
import type { ModelLoadingStatus } from '@/shared/types';

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

      setIsDetecting(true);

      const detect = async () => {
        const detection = await detectFace(video);

        // 캔버스에 결과 그리기
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.clearRect(0, 0, canvas.width, canvas.height);

          if (detection) {
            // object-cover 좌표 변환 계산
            const videoWidth = video.videoWidth;
            const videoHeight = video.videoHeight;
            const canvasWidth = canvas.width;
            const canvasHeight = canvas.height;

            const videoRatio = videoWidth / videoHeight;
            const canvasRatio = canvasWidth / canvasHeight;

            let scale: number;
            let shiftX: number;
            let shiftY: number;

            if (canvasRatio > videoRatio) {
              // 캔버스가 더 넓음 -> 비디오 위아래 잘림
              scale = canvasWidth / videoWidth;
              shiftX = 0;
              shiftY = (videoHeight * scale - canvasHeight) / 2;
            } else {
              // 캔버스가 더 좁음 -> 비디오 좌우 잘림
              scale = canvasHeight / videoHeight;
              shiftX = (videoWidth * scale - canvasWidth) / 2;
              shiftY = 0;
            }

            // 박스 좌표 변환
            const box = detection.detection.box;
            const x = box.x * scale - shiftX;
            const y = box.y * scale - shiftY;
            const width = box.width * scale;
            const height = box.height * scale;

            ctx.strokeStyle = '#00ff00';
            ctx.lineWidth = 3;
            ctx.strokeRect(x, y, width, height);

            // 랜드마크 좌표 변환
            const landmarks = detection.landmarks;
            ctx.fillStyle = '#00ff00';
            landmarks.positions.forEach((point) => {
              const px = point.x * scale - shiftX;
              const py = point.y * scale - shiftY;
              ctx.beginPath();
              ctx.arc(px, py, 2, 0, 2 * Math.PI);
              ctx.fill();
            });
          }
        }

        onDetection?.(detection);
      };

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
