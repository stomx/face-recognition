'use client';

import { useCallback } from 'react';

/**
 * 얼굴 이미지 캡처 로직을 재사용하기 위한 Hook
 */
export function useFaceImageCapture() {
  const captureImage = useCallback(
    (video: HTMLVideoElement, canvas: HTMLCanvasElement): string | null => {
      const ctx = canvas.getContext('2d');
      if (!ctx) return null;

      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      ctx.drawImage(video, 0, 0);

      return canvas.toDataURL('image/jpeg', 0.8);
    },
    []
  );

  return { captureImage };
}
