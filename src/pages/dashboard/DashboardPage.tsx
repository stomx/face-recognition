'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useUserStore } from '@/entities/user';
import { CameraView } from '@/widgets/camera-view';
import { CameraControlPanel } from '@/widgets/camera-control';
import { AccessLogTimeline } from '@/widgets/access-log';
import { UserManagementPanel } from '@/widgets/user-management';
import { Button, Badge } from '@/shared/ui';
import { useFaceDetection } from '@/features/face-detection';
import { loadModels, detectFace, findBestMatch, faceapi } from '@/shared/lib/face-api';

type Resolution = '480p' | '720p' | '1080p';
type Orientation = 'landscape' | 'portrait';

export function DashboardPage() {
  const router = useRouter();
  const { users, addAccessLog, hydrate, isHydrated, getLabeledDescriptors, getUserById } = useUserStore();
  const { modelStatus, initializeModels } = useFaceDetection();

  const [resolution, setResolution] = useState<Resolution>('720p');
  const [orientation, setOrientation] = useState<Orientation>('landscape');
  const [isCameraOn, setIsCameraOn] = useState(false);
  const [isAuthenticating, setIsAuthenticating] = useState(false);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // 초기화
  useEffect(() => {
    if (!isHydrated) {
      hydrate();
    }
    initializeModels();
  }, [isHydrated, hydrate, initializeModels]);

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
  const handleCameraToggle = () => {
    // CameraView 컴포넌트가 key 변경으로 재마운트되도록 처리
    setIsCameraOn((prev) => !prev);
  };

  // 해상도 변경
  const handleResolutionChange = (newResolution: Resolution) => {
    setResolution(newResolution);
    // 카메라 재시작을 위해 상태 초기화
    setIsCameraOn(false);
    setTimeout(() => setIsCameraOn(true), 100);
  };

  // 방향 변경
  const handleOrientationChange = (newOrientation: Orientation) => {
    setOrientation(newOrientation);
    // 카메라 재시작을 위해 상태 초기화
    setIsCameraOn(false);
    setTimeout(() => setIsCameraOn(true), 100);
  };

  // 수동 인증
  const handleManualAuth = async () => {
    if (!videoRef.current || !canvasRef.current || modelStatus !== 'loaded' || users.length === 0) {
      return;
    }

    setIsAuthenticating(true);

    try {
      // 얼굴 감지
      const detection = await detectFace(videoRef.current);

      if (!detection) {
        addAccessLog(null, null, 'failed');
        alert('얼굴이 감지되지 않았습니다.');
        return;
      }

      // 등록된 사용자와 비교
      const labeledDescriptors = getLabeledDescriptors();
      const bestMatch = findBestMatch(detection.descriptor, labeledDescriptors);

      if (!bestMatch || bestMatch.label === 'unknown') {
        addAccessLog(null, '미확인 사용자', 'failed');
        alert('등록되지 않은 얼굴입니다.');
      } else {
        const user = getUserById(bestMatch.label);
        const userName = user?.name || '알 수 없음';
        const confidence = 1 - bestMatch.distance; // distance를 confidence로 변환
        addAccessLog(bestMatch.label, userName, 'success', confidence);
        alert(`인증 성공: ${userName}`);
      }

      // 캔버스에 결과 그리기
      const ctx = canvasRef.current.getContext('2d');
      if (ctx) {
        ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
        const box = detection.detection.box;
        ctx.strokeStyle = '#00ff00';
        ctx.lineWidth = 3;
        ctx.strokeRect(box.x, box.y, box.width, box.height);
      }
    } catch (error) {
      console.error('인증 실패:', error);
      addAccessLog(null, null, 'failed');
      alert('인증 중 오류가 발생했습니다.');
    } finally {
      setIsAuthenticating(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 헤더 */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                대시보드 테스트
              </h1>
              <p className="text-sm text-gray-600 mt-1">
                얼굴 인식 출입 통제 시스템 관리
              </p>
            </div>
            <div className="flex items-center gap-4">
              {/* 모델 상태 */}
              <div className="flex items-center gap-2">
                {modelStatus === 'loaded' ? (
                  <Badge variant="success">모델 로드 완료</Badge>
                ) : modelStatus === 'loading' ? (
                  <Badge variant="warning">모델 로딩 중...</Badge>
                ) : modelStatus === 'error' ? (
                  <Badge variant="danger">모델 로드 실패</Badge>
                ) : (
                  <Badge variant="warning">대기 중...</Badge>
                )}
              </div>
              {/* 홈 버튼 */}
              <Button
                variant="secondary"
                size="sm"
                onClick={() => router.push('/')}
              >
                <svg
                  className="w-4 h-4 mr-1.5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                  />
                </svg>
                홈으로
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* 메인 컨텐츠 */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-6">
          {/* 상단: 카메라 + 컨트롤 */}
          <div className="grid lg:grid-cols-3 gap-6">
            {/* 라이브 카메라 피드 */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  라이브 카메라
                </h3>
                <CameraView
                  key={`${resolution}-${orientation}-${isCameraOn}`}
                  onVideoReady={handleVideoReady}
                  onVideoStop={handleVideoStop}
                  showControls={false}
                  autoStart={isCameraOn}
                  resolution={resolution}
                  orientation={orientation}
                />
              </div>
            </div>

            {/* 카메라 컨트롤 패널 */}
            <div>
              <CameraControlPanel
                resolution={resolution}
                orientation={orientation}
                isCameraOn={isCameraOn}
                onResolutionChange={handleResolutionChange}
                onOrientationChange={handleOrientationChange}
                onCameraToggle={handleCameraToggle}
                onManualAuth={handleManualAuth}
                isAuthenticating={isAuthenticating}
              />
            </div>
          </div>

          {/* 출입 기록 타임라인 */}
          <AccessLogTimeline />

          {/* 등록된 사용자 관리 */}
          <UserManagementPanel />
        </div>
      </main>
    </div>
  );
}
