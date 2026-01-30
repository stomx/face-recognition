'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useUserStore } from '@/entities/user';
import { CameraView } from '@/widgets/camera-view';
import { CameraControlPanel } from '@/widgets/camera-control';
import { AccessLogTimeline } from '@/widgets/access-log';
import { UserManagementPanel } from '@/widgets/user-management';
import { useFaceDetection } from '@/features/face-detection';
import { loadModels, detectFace, findBestMatch, faceapi } from '@/shared/lib/face-api';
import { Toast } from '@/shared/ui';

type Resolution = '480p' | '720p' | '1080p';
type Orientation = 'landscape' | 'portrait';

interface ToastState {
  message: string;
  type: 'success' | 'error' | 'info';
}

export function DashboardPage() {
  const router = useRouter();
  const { users, addAccessLog, hydrate, isHydrated, getLabeledDescriptors, getUserById } = useUserStore();
  const { modelStatus, initializeModels } = useFaceDetection();

  const [resolution, setResolution] = useState<Resolution>('720p');
  const [orientation, setOrientation] = useState<Orientation>('landscape');
  const [isCameraOn, setIsCameraOn] = useState(false);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [toast, setToast] = useState<ToastState | null>(null);

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
    setIsCameraOn((prev) => !prev);
  };

  // 해상도 변경
  const handleResolutionChange = (newResolution: Resolution) => {
    setResolution(newResolution);
    setIsCameraOn(false);
    setTimeout(() => setIsCameraOn(true), 100);
  };

  // 방향 변경
  const handleOrientationChange = (newOrientation: Orientation) => {
    setOrientation(newOrientation);
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
      const detection = await detectFace(videoRef.current);

      if (!detection) {
        addAccessLog(null, null, 'failed');
        setToast({ message: '얼굴이 감지되지 않았습니다', type: 'error' });
        return;
      }

      const labeledDescriptors = getLabeledDescriptors();
      const bestMatch = findBestMatch(detection.descriptor, labeledDescriptors);

      if (!bestMatch || bestMatch.label === 'unknown') {
        addAccessLog(null, '미확인 사용자', 'failed');
        setToast({ message: '등록되지 않은 얼굴입니다', type: 'error' });
      } else {
        const user = getUserById(bestMatch.label);
        const userName = user?.name || '알 수 없음';
        const confidence = 1 - bestMatch.distance;
        addAccessLog(bestMatch.label, userName, 'success', confidence);
        setToast({ message: `인증 성공: ${userName}`, type: 'success' });
      }

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
      setToast({ message: '인증 중 오류가 발생했습니다', type: 'error' });
    } finally {
      setIsAuthenticating(false);
    }
  };

  const todaySuccessCount = users.length > 0 ? useUserStore.getState().accessLogs.filter(l => l.status === 'success').length : 0;
  const todayFailCount = users.length > 0 ? useUserStore.getState().accessLogs.filter(l => l.status === 'failed').length : 0;

  return (
    <div className="fixed inset-0 bg-black overflow-hidden">
      {/* 배경 그라데이션 */}
      <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-black to-gray-900 opacity-90" />

      {/* 헤더 */}
      <div className="absolute top-0 left-0 right-0 z-20 p-4 sm:p-6">
        <div className="flex items-start justify-between">
          {/* 좌측: 제목 */}
          <div className="bg-black/40 backdrop-blur-md rounded-2xl px-6 py-4 shadow-2xl border border-white/10">
            <h1 className="text-2xl font-bold text-white mb-1">
              대시보드 테스트
            </h1>
            <p className="text-sm text-gray-400">
              얼굴 인식 출입 통제 시스템 관리
            </p>
          </div>

          {/* 우측: 상태 및 홈 버튼 */}
          <div className="flex items-center gap-3">
            {/* 모델 상태 */}
            <div className={`flex items-center gap-2 px-4 py-2.5 rounded-full backdrop-blur-sm border ${
              modelStatus === 'loaded'
                ? 'bg-green-500/20 border-green-400/30 text-green-400'
                : modelStatus === 'loading'
                ? 'bg-yellow-500/20 border-yellow-400/30 text-yellow-400'
                : 'bg-red-500/20 border-red-400/30 text-red-400'
            }`}>
              <span className={`w-2.5 h-2.5 rounded-full ${
                modelStatus === 'loaded' ? 'bg-green-400' : 'bg-yellow-400 animate-pulse'
              }`} />
              <span className="text-sm font-medium">
                {modelStatus === 'loaded' ? '준비' : modelStatus === 'loading' ? '로딩' : '오류'}
              </span>
            </div>

            {/* 통계 */}
            <div className="hidden sm:flex items-center gap-4 bg-black/40 backdrop-blur-md rounded-2xl px-5 py-2.5 border border-white/10">
              <div className="text-center">
                <p className="text-green-400 text-xl font-bold">{todaySuccessCount}</p>
                <p className="text-gray-500 text-xs">승인</p>
              </div>
              <div className="w-px h-8 bg-white/10" />
              <div className="text-center">
                <p className="text-red-400 text-xl font-bold">{todayFailCount}</p>
                <p className="text-gray-500 text-xs">거부</p>
              </div>
            </div>

            {/* 홈 버튼 */}
            <button
              onClick={() => router.push('/')}
              className="w-12 h-12 rounded-full bg-black/40 backdrop-blur-sm hover:bg-black/60 flex items-center justify-center text-white transition-all border border-white/10 shadow-lg"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* 메인 컨텐츠 */}
      <div className="absolute inset-0 pt-32 pb-6 px-4 sm:px-6 overflow-y-auto z-10">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* 상단: 카메라 + 컨트롤 */}
          <div className="grid lg:grid-cols-3 gap-6">
            {/* 라이브 카메라 피드 */}
            <div className="lg:col-span-2">
              <div className="bg-black/40 backdrop-blur-md rounded-3xl overflow-hidden shadow-2xl border border-white/10">
                <div className="p-4 border-b border-white/10">
                  <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                    <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                    라이브 카메라
                  </h3>
                </div>
                <div className="p-4">
                  <div className="rounded-2xl overflow-hidden">
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
      </div>

      {/* Toast */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
}
