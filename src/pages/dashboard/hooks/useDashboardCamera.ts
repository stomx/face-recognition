import { useState, useRef, useCallback } from 'react';
import type { Resolution, Orientation } from '@/shared/types';

/**
 * DashboardPage 카메라 상태 관리 Hook
 *
 * 책임:
 * - 카메라 해상도/방향 상태 관리
 * - 카메라 on/off 상태 관리
 * - Video/Canvas Ref 관리
 */
export function useDashboardCamera() {
  const [resolution, setResolution] = useState<Resolution>('fhd');
  const [orientation, setOrientation] = useState<Orientation>('landscape');
  const [isCameraOn, setIsCameraOn] = useState(true);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // 비디오 준비 핸들러
  const handleVideoReady = useCallback((video: HTMLVideoElement, canvas: HTMLCanvasElement) => {
    videoRef.current = video;
    canvasRef.current = canvas;
    setIsCameraOn(true);
  }, []);

  // 비디오 중지 핸들러
  const handleVideoStop = useCallback(() => {
    videoRef.current = null;
    canvasRef.current = null;
    setIsCameraOn(false);
  }, []);

  // 카메라 토글
  const handleCameraToggle = useCallback(() => {
    setIsCameraOn((prev) => !prev);
  }, []);

  // 해상도 변경 (카메라 재시작)
  const handleResolutionChange = useCallback((newResolution: Resolution) => {
    setResolution(newResolution);
    setIsCameraOn(false);
    setTimeout(() => setIsCameraOn(true), 100);
  }, []);

  // 방향 변경 (카메라 재시작)
  const handleOrientationChange = useCallback((newOrientation: Orientation) => {
    setOrientation(newOrientation);
    setIsCameraOn(false);
    setTimeout(() => setIsCameraOn(true), 100);
  }, []);

  return {
    // 상태
    resolution,
    orientation,
    isCameraOn,
    videoRef,
    canvasRef,
    // 핸들러
    handleVideoReady,
    handleVideoStop,
    handleCameraToggle,
    handleResolutionChange,
    handleOrientationChange,
  };
}
