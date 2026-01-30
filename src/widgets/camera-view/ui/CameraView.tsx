'use client';

import { useRef, useEffect, useState } from 'react';
import { Card, CardBody, Button } from '@/shared/ui';
import { CAMERA_CONFIG } from '@/shared/config/constants';

type Resolution = '480p' | '720p' | '1080p';
type Orientation = 'landscape' | 'portrait';

interface CameraViewProps {
  onVideoReady?: (video: HTMLVideoElement, canvas: HTMLCanvasElement) => void;
  onVideoStop?: () => void;
  showControls?: boolean;
  autoStart?: boolean;
  className?: string;
  fullScreen?: boolean; // 전체 화면 모드 (Card 래퍼 제거)
  resolution?: Resolution; // 해상도 설정
  orientation?: Orientation; // 방향 설정
}

const RESOLUTION_MAP = {
  '480p': { width: 640, height: 480 },
  '720p': { width: 1280, height: 720 },
  '1080p': { width: 1920, height: 1080 },
};

export function CameraView({
  onVideoReady,
  onVideoStop,
  showControls = true,
  autoStart = false,
  className = '',
  fullScreen = false,
  resolution = '720p',
  orientation = 'landscape',
}: CameraViewProps) {
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

            if (canvasRef.current) {
              canvasRef.current.width = video.videoWidth;
              canvasRef.current.height = video.videoHeight;
              onVideoReadyRef.current?.(video, canvasRef.current);
            }
          } catch (playError) {
            // AbortError는 무시 (새로운 로드 요청으로 인한 중단)
            if ((playError as Error).name !== 'AbortError') {
              console.error('Video play error:', playError);
            }
          }
        };
      }
    } catch (err) {
      console.error('Camera error:', err);
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

  // 전체 화면 모드 - Card 래퍼 없이 렌더링
  if (fullScreen) {
    return (
      <div className={`relative bg-gray-900 ${className}`}>
        <video
          ref={videoRef}
          className="w-full h-full object-cover"
          style={{ transform: 'scaleX(-1)' }}
          playsInline
          muted
        />
        <canvas
          ref={canvasRef}
          className="absolute top-0 left-0 w-full h-full pointer-events-none"
          style={{ transform: 'scaleX(-1)' }}
        />

        {/* 오버레이 - 카메라 비활성화 */}
        {!isStreaming && !error && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-900/80">
            <div className="text-center text-white">
              <svg
                className="w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-4 opacity-50"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2 2v8a2 2 0 002 2z"
                />
              </svg>
              <p className="text-base sm:text-lg opacity-75">카메라가 비활성화되어 있습니다</p>
            </div>
          </div>
        )}

        {/* 에러 메시지 */}
        {error && (
          <div className="absolute inset-0 flex items-center justify-center bg-red-900/80">
            <div className="text-center text-white p-6">
              <svg
                className="w-14 h-14 sm:w-16 sm:h-16 mx-auto mb-3"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
              <p className="text-base sm:text-lg">{error}</p>
            </div>
          </div>
        )}
      </div>
    );
  }

  // 일반 모드 - Card 래퍼 포함
  return (
    <Card className={`overflow-hidden ${className}`}>
      <CardBody className="p-0 relative">
        {/* 비디오 컨테이너 - 적응형 */}
        <div className="relative aspect-video bg-gray-900">
          <video
            ref={videoRef}
            className="w-full h-full object-cover"
            style={{ transform: 'scaleX(-1)' }}
            playsInline
            muted
          />
          <canvas
            ref={canvasRef}
            className="absolute top-0 left-0 w-full h-full pointer-events-none"
            style={{ transform: 'scaleX(-1)' }}
          />

          {/* 오버레이 */}
          {!isStreaming && !error && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-900/80">
              <div className="text-center text-white">
                <svg
                  className="w-12 h-12 portrait:w-14 portrait:h-14 xl:w-16 xl:h-16 2xl:w-20 2xl:h-20 3xl:w-24 3xl:h-24 mx-auto mb-3 portrait:mb-4 xl:mb-4 2xl:mb-5 3xl:mb-6 opacity-50"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2 2v8a2 2 0 002 2z"
                  />
                </svg>
                <p className="text-xs portrait:text-sm xl:text-sm 2xl:text-base 3xl:text-lg opacity-75">카메라가 비활성화되어 있습니다</p>
              </div>
            </div>
          )}

          {/* 에러 메시지 */}
          {error && (
            <div className="absolute inset-0 flex items-center justify-center bg-red-900/80">
              <div className="text-center text-white p-4 portrait:p-5 xl:p-6 2xl:p-8 3xl:p-10">
                <svg
                  className="w-10 h-10 portrait:w-12 portrait:h-12 xl:w-12 xl:h-12 2xl:w-14 2xl:h-14 3xl:w-16 3xl:h-16 mx-auto mb-2 portrait:mb-3 xl:mb-3 2xl:mb-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
                <p className="text-xs portrait:text-sm xl:text-sm 2xl:text-base 3xl:text-lg">{error}</p>
              </div>
            </div>
          )}

          {/* 스트리밍 인디케이터 - 적응형 (가로/세로) */}
          {isStreaming && (
            <div className="absolute top-3 portrait:top-4 xl:top-4 2xl:top-5 3xl:top-6 left-3 portrait:left-4 xl:left-4 2xl:left-5 3xl:left-6 flex items-center gap-1.5 portrait:gap-2 xl:gap-2 2xl:gap-2.5 3xl:gap-3">
              <span className="w-2.5 h-2.5 portrait:w-3 portrait:h-3 xl:w-3 xl:h-3 2xl:w-3.5 2xl:h-3.5 3xl:w-4 3xl:h-4 bg-red-500 rounded-full animate-pulse" />
              <span className="text-white text-xs portrait:text-sm xl:text-sm 2xl:text-base 3xl:text-lg font-medium drop-shadow">LIVE</span>
            </div>
          )}
        </div>

        {/* 컨트롤 버튼 - 적응형 (가로/세로) */}
        {showControls && (
          <div className="p-3 portrait:p-4 xl:p-4 2xl:p-5 3xl:p-6 bg-gray-50 flex justify-center gap-3 portrait:gap-4 xl:gap-4 2xl:gap-5 3xl:gap-6">
            {!isStreaming ? (
              <Button onClick={startCamera} variant="primary" className="text-xs portrait:text-sm xl:text-sm 2xl:text-base 3xl:text-lg px-3 portrait:px-4 xl:px-4 2xl:px-5 3xl:px-6 py-2 portrait:py-2.5 xl:py-2.5 2xl:py-3 3xl:py-3.5">
                <svg
                  className="w-4 h-4 portrait:w-5 portrait:h-5 xl:w-5 xl:h-5 2xl:w-6 2xl:h-6 3xl:w-7 3xl:h-7 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                  />
                </svg>
                카메라 시작
              </Button>
            ) : (
              <Button onClick={stopCamera} variant="danger" className="text-xs portrait:text-sm xl:text-sm 2xl:text-base 3xl:text-lg px-3 portrait:px-4 xl:px-4 2xl:px-5 3xl:px-6 py-2 portrait:py-2.5 xl:py-2.5 2xl:py-3 3xl:py-3.5">
                <svg
                  className="w-4 h-4 portrait:w-5 portrait:h-5 xl:w-5 xl:h-5 2xl:w-6 2xl:h-6 3xl:w-7 3xl:h-7 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 10a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z"
                  />
                </svg>
                카메라 중지
              </Button>
            )}
          </div>
        )}
      </CardBody>
    </Card>
  );
}
