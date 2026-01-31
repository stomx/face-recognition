import { useRef, useEffect, useState } from 'react';
import { CAMERA_CONFIG } from '@/shared/config/constants';
import type { Resolution, Orientation } from '@/shared/types';
import { RESOLUTION_MAP } from '@/shared/types';
import { debug } from '@/shared/lib/debug';

const log = debug.scope('CameraStream');

interface UseCameraStreamOptions {
  autoStart: boolean;
  resolution: Resolution;
  orientation: Orientation;
  onVideoReady?: (video: HTMLVideoElement, canvas: HTMLCanvasElement) => void;
  onVideoStop?: () => void;
}

/**
 * 카메라 스트림 공통 로직 Hook
 *
 * 책임:
 * - 카메라 시작/중지
 * - 스트림 상태 관리
 * - 에러 처리
 */
export function useCameraStream({
  autoStart,
  resolution,
  orientation,
  onVideoReady,
  onVideoStop,
}: UseCameraStreamOptions) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const isStartedRef = useRef(false);

  // 콜백을 ref로 저장하여 의존성 문제 해결
  const onVideoReadyRef = useRef(onVideoReady);
  const onVideoStopRef = useRef(onVideoStop);

  useEffect(() => {
    onVideoReadyRef.current = onVideoReady;
    onVideoStopRef.current = onVideoStop;
  }, [onVideoReady, onVideoStop]);

  const startCamera = async () => {
    if (isStartedRef.current || streamRef.current) return;
    isStartedRef.current = true;

    try {
      setError(null);

      // 해상도 및 방향에 따른 설정
      const { width, height } = RESOLUTION_MAP[resolution];
      const videoConstraints = orientation === 'portrait'
        ? { width: { ideal: height }, height: { ideal: width } }
        : { width: { ideal: width }, height: { ideal: height } };

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          ...videoConstraints,
          facingMode: CAMERA_CONFIG.FACING_MODE,
        },
      });

      streamRef.current = stream;

      if (videoRef.current) {
        const video = videoRef.current;
        video.srcObject = stream;

        // 비디오가 준비되면 재생
        video.onloadedmetadata = async () => {
          try {
            await video.play();
            setIsStreaming(true);

            if (canvasRef.current && videoRef.current) {
              // requestAnimationFrame으로 정확한 렌더링 후 크기 측정
              requestAnimationFrame(() => {
                requestAnimationFrame(() => {
                  if (canvasRef.current && videoRef.current) {
                    // getBoundingClientRect로 정확한 렌더링 크기 측정
                    const rect = videoRef.current.getBoundingClientRect();
                    canvasRef.current.width = rect.width;
                    canvasRef.current.height = rect.height;

                    onVideoReadyRef.current?.(videoRef.current, canvasRef.current);
                  }
                });
              });
            }
          } catch (playError) {
            // AbortError는 무시 (새로운 로드 요청으로 인한 중단)
            if ((playError as Error).name !== 'AbortError') {
              log.error('Video play failed', 'startCamera', undefined, playError);
            }
          }
        };
      }
    } catch (err) {
      log.error('Camera access failed', 'startCamera', { resolution, orientation }, err);
      setError('카메라에 접근할 수 없습니다. 카메라 권한을 확인해주세요.');
      isStartedRef.current = false;
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }

    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }

    setIsStreaming(false);
    isStartedRef.current = false;
    onVideoStopRef.current?.();
  };

  // 자동 시작 (한 번만 실행)
  useEffect(() => {
    if (autoStart && !isStartedRef.current) {
      startCamera();
    }

    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return {
    videoRef,
    canvasRef,
    isStreaming,
    error,
    startCamera,
    stopCamera,
  };
}
