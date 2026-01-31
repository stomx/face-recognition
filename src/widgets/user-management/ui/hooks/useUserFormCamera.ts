import { useState, useRef, useCallback } from 'react';

/**
 * UserFormModal 카메라 관리 Hook
 *
 * 책임:
 * - 카메라 on/off 상태 관리
 * - Video/Canvas Ref 관리
 * - 비디오 준비 핸들러
 */
export function useUserFormCamera() {
  const [isCameraOn, setIsCameraOn] = useState(true);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const handleVideoReady = useCallback((video: HTMLVideoElement, canvas: HTMLCanvasElement) => {
    videoRef.current = video;
    canvasRef.current = canvas;
  }, []);

  const turnOffCamera = useCallback(() => {
    setIsCameraOn(false);
  }, []);

  const turnOnCamera = useCallback(() => {
    setIsCameraOn(true);
  }, []);

  return {
    isCameraOn,
    videoRef,
    canvasRef,
    handleVideoReady,
    turnOffCamera,
    turnOnCamera,
  };
}
