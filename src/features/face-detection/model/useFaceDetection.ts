'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { loadModels, detectFace, faceapi } from '@/shared/lib/face-api';
import type { ModelLoadingStatus } from '@/shared/types';

/**
 * 좌표 변환 함수
 * video.videoWidth/Height 기준 좌표를 canvas display 좌표로 변환
 */
function transformCoordinates(
  video: HTMLVideoElement,
  canvas: HTMLCanvasElement
) {
  const videoWidth = video.videoWidth;   // 실제 비디오 해상도 (예: 1920)
  const videoHeight = video.videoHeight; // 실제 비디오 해상도 (예: 1080)

  const displayWidth = canvas.width;     // 화면 표시 너비 (clientWidth)
  const displayHeight = canvas.height;   // 화면 표시 높이 (clientHeight)

  // 비디오와 표시 영역의 비율
  const videoAspect = videoWidth / videoHeight;
  const displayAspect = displayWidth / displayHeight;

  let scale: number;
  let offsetX: number;
  let offsetY: number;

  // object-cover 동작:
  // - 컨테이너를 꽉 채우되, 비율 유지
  // - 넘치는 부분은 잘림
  if (displayAspect > videoAspect) {
    // 디스플레이가 비디오보다 더 넓음 → 가로에 맞춤
    scale = displayWidth / videoWidth;
    offsetX = 0;
    offsetY = (displayHeight - videoHeight * scale) / 2;
  } else {
    // 디스플레이가 비디오보다 더 좁음 → 세로에 맞춤
    scale = displayHeight / videoHeight;
    offsetX = (displayWidth - videoWidth * scale) / 2;
    offsetY = 0;
  }

  return {
    // 비디오 좌표 → 디스플레이 좌표로 변환
    transform: (x: number, y: number) => ({
      x: x * scale + offsetX,
      y: y * scale + offsetY,
    }),
    scale,
    offsetX,
    offsetY,
  };
}

/**
 * 얼굴 랜드마크 메쉬 그리기
 */
function drawFaceMesh(
  ctx: CanvasRenderingContext2D,
  landmarks: faceapi.FaceLandmarks68,
  transform: (x: number, y: number) => { x: number; y: number }
) {
  const positions = landmarks.positions;

  // 1. 얼굴 윤곽선 (0-16: 턱선)
  ctx.strokeStyle = 'rgba(0, 255, 136, 0.8)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  for (let i = 0; i <= 16; i++) {
    const p = transform(positions[i].x, positions[i].y);
    if (i === 0) ctx.moveTo(p.x, p.y);
    else ctx.lineTo(p.x, p.y);
  }
  ctx.stroke();

  // 2. 왼쪽 눈썹 (17-21)
  ctx.strokeStyle = 'rgba(0, 200, 255, 0.8)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  for (let i = 17; i <= 21; i++) {
    const p = transform(positions[i].x, positions[i].y);
    if (i === 17) ctx.moveTo(p.x, p.y);
    else ctx.lineTo(p.x, p.y);
  }
  ctx.stroke();

  // 3. 오른쪽 눈썹 (22-26)
  ctx.beginPath();
  for (let i = 22; i <= 26; i++) {
    const p = transform(positions[i].x, positions[i].y);
    if (i === 22) ctx.moveTo(p.x, p.y);
    else ctx.lineTo(p.x, p.y);
  }
  ctx.stroke();

  // 4. 코 브릿지 (27-30)
  ctx.strokeStyle = 'rgba(255, 255, 0, 0.8)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  for (let i = 27; i <= 30; i++) {
    const p = transform(positions[i].x, positions[i].y);
    if (i === 27) ctx.moveTo(p.x, p.y);
    else ctx.lineTo(p.x, p.y);
  }
  ctx.stroke();

  // 5. 코 하단 (31-35)
  ctx.beginPath();
  for (let i = 31; i <= 35; i++) {
    const p = transform(positions[i].x, positions[i].y);
    if (i === 31) ctx.moveTo(p.x, p.y);
    else ctx.lineTo(p.x, p.y);
  }
  ctx.closePath();
  ctx.stroke();

  // 6. 왼쪽 눈 (36-41)
  ctx.strokeStyle = 'rgba(255, 100, 255, 0.8)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  for (let i = 36; i <= 41; i++) {
    const p = transform(positions[i].x, positions[i].y);
    if (i === 36) ctx.moveTo(p.x, p.y);
    else ctx.lineTo(p.x, p.y);
  }
  ctx.closePath();
  ctx.stroke();

  // 7. 오른쪽 눈 (42-47)
  ctx.beginPath();
  for (let i = 42; i <= 47; i++) {
    const p = transform(positions[i].x, positions[i].y);
    if (i === 42) ctx.moveTo(p.x, p.y);
    else ctx.lineTo(p.x, p.y);
  }
  ctx.closePath();
  ctx.stroke();

  // 8. 입 바깥 윤곽 (48-59)
  ctx.strokeStyle = 'rgba(255, 80, 80, 0.8)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  for (let i = 48; i <= 59; i++) {
    const p = transform(positions[i].x, positions[i].y);
    if (i === 48) ctx.moveTo(p.x, p.y);
    else ctx.lineTo(p.x, p.y);
  }
  ctx.closePath();
  ctx.stroke();

  // 9. 입 안쪽 윤곽 (60-67)
  ctx.strokeStyle = 'rgba(255, 120, 120, 0.7)';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  for (let i = 60; i <= 67; i++) {
    const p = transform(positions[i].x, positions[i].y);
    if (i === 60) ctx.moveTo(p.x, p.y);
    else ctx.lineTo(p.x, p.y);
  }
  ctx.closePath();
  ctx.stroke();

  // 10. 모든 포인트 그리기
  ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
  positions.forEach((point) => {
    const p = transform(point.x, point.y);
    ctx.beginPath();
    ctx.arc(p.x, p.y, 2, 0, 2 * Math.PI);
    ctx.fill();
  });
}

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
        try {
          const detection = await detectFace(video);
          const ctx = canvas.getContext('2d');

          if (!ctx) return;

          // 캔버스 초기화
          ctx.clearRect(0, 0, canvas.width, canvas.height);

          if (detection) {
            // 좌표 변환 함수 생성
            const { transform } = transformCoordinates(video, canvas);

            // 얼굴 박스 그리기
            const box = detection.detection.box;
            const topLeft = transform(box.x, box.y);
            const bottomRight = transform(box.x + box.width, box.y + box.height);

            ctx.strokeStyle = '#00ff00';
            ctx.lineWidth = 3;
            ctx.strokeRect(
              topLeft.x,
              topLeft.y,
              bottomRight.x - topLeft.x,
              bottomRight.y - topLeft.y
            );

            // 랜드마크 메쉬 그리기
            drawFaceMesh(ctx, detection.landmarks, transform);
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
