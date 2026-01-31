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

            // 박스 그리기
            ctx.strokeStyle = '#00ff00';
            ctx.lineWidth = 2;
            ctx.strokeRect(x, y, width, height);

            // 랜드마크 메쉬 그리기
            const landmarks = detection.landmarks;
            const positions = landmarks.positions;

            // 좌표 변환 헬퍼 함수
            const transformPoint = (point: { x: number; y: number }) => ({
              x: point.x * scale - shiftX,
              y: point.y * scale - shiftY
            });

            // 1. 얼굴 윤곽선 (0-16)
            ctx.strokeStyle = 'rgba(0, 255, 136, 0.6)';
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            for (let i = 0; i < 17; i++) {
              const p = transformPoint(positions[i]);
              if (i === 0) ctx.moveTo(p.x, p.y);
              else ctx.lineTo(p.x, p.y);
            }
            ctx.stroke();

            // 2. 왼쪽 눈썹 (17-21)
            ctx.strokeStyle = 'rgba(0, 255, 200, 0.7)';
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            for (let i = 17; i < 22; i++) {
              const p = transformPoint(positions[i]);
              if (i === 17) ctx.moveTo(p.x, p.y);
              else ctx.lineTo(p.x, p.y);
            }
            ctx.stroke();

            // 3. 오른쪽 눈썹 (22-26)
            ctx.beginPath();
            for (let i = 22; i < 27; i++) {
              const p = transformPoint(positions[i]);
              if (i === 22) ctx.moveTo(p.x, p.y);
              else ctx.lineTo(p.x, p.y);
            }
            ctx.stroke();

            // 4. 코 브릿지 (27-30)
            ctx.strokeStyle = 'rgba(0, 255, 255, 0.6)';
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            for (let i = 27; i < 31; i++) {
              const p = transformPoint(positions[i]);
              if (i === 27) ctx.moveTo(p.x, p.y);
              else ctx.lineTo(p.x, p.y);
            }
            ctx.stroke();

            // 5. 코 아래 (31-35)
            ctx.beginPath();
            for (let i = 31; i < 36; i++) {
              const p = transformPoint(positions[i]);
              if (i === 31) ctx.moveTo(p.x, p.y);
              else ctx.lineTo(p.x, p.y);
            }
            ctx.closePath();
            ctx.stroke();

            // 6. 왼쪽 눈 (36-41)
            ctx.strokeStyle = 'rgba(255, 100, 255, 0.7)';
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            for (let i = 36; i < 42; i++) {
              const p = transformPoint(positions[i]);
              if (i === 36) ctx.moveTo(p.x, p.y);
              else ctx.lineTo(p.x, p.y);
            }
            ctx.closePath();
            ctx.stroke();

            // 7. 오른쪽 눈 (42-47)
            ctx.beginPath();
            for (let i = 42; i < 48; i++) {
              const p = transformPoint(positions[i]);
              if (i === 42) ctx.moveTo(p.x, p.y);
              else ctx.lineTo(p.x, p.y);
            }
            ctx.closePath();
            ctx.stroke();

            // 8. 입 바깥 윤곽 (48-59)
            ctx.strokeStyle = 'rgba(255, 80, 80, 0.7)';
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            for (let i = 48; i < 60; i++) {
              const p = transformPoint(positions[i]);
              if (i === 48) ctx.moveTo(p.x, p.y);
              else ctx.lineTo(p.x, p.y);
            }
            ctx.closePath();
            ctx.stroke();

            // 9. 입 안쪽 윤곽 (60-67)
            ctx.strokeStyle = 'rgba(255, 120, 120, 0.6)';
            ctx.lineWidth = 1;
            ctx.beginPath();
            for (let i = 60; i < 68; i++) {
              const p = transformPoint(positions[i]);
              if (i === 60) ctx.moveTo(p.x, p.y);
              else ctx.lineTo(p.x, p.y);
            }
            ctx.closePath();
            ctx.stroke();

            // 10. 포인트 그리기 (작은 원)
            ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
            positions.forEach((point) => {
              const p = transformPoint(point);
              ctx.beginPath();
              ctx.arc(p.x, p.y, 1.5, 0, 2 * Math.PI);
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
