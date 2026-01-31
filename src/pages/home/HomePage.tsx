'use client';

import { useEffect, useState, useRef, useCallback, useMemo } from 'react';
import { useUserRepository, useAccessLogRepository, useHydration } from '@/entities/user';
import { useFaceDetection } from '@/features/face-detection';
import { useVerificationMachine } from '@/features/face-verification';
import { CameraView } from '@/widgets/camera-view';
import {
  TimeDisplay,
  LoadingSpinner,
  ResultOverlay,
  SettingsPanel,
} from '@/shared/ui';
import type { Resolution, Orientation } from '@/shared/types';
import { RESOLUTION_MAP } from '@/shared/types';

export function HomePage() {
  const userRepo = useUserRepository();
  const accessLogRepo = useAccessLogRepository();
  const { isHydrated, hydrate } = useHydration();
  const { modelStatus, initializeModels } = useFaceDetection();

  const users = userRepo.getAll();
  const accessLogs = accessLogRepo.getAll();

  const [isAutoMode, setIsAutoMode] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [resolution, setResolution] = useState<Resolution>('fhd');
  const [orientation, setOrientation] = useState<Orientation>('landscape');

  const videoReadyRef = useRef(false);

  // 상태 머신 훅 사용
  const machine = useVerificationMachine({ autoMode: isAutoMode });

  // 초기화
  useEffect(() => {
    hydrate();
    initializeModels();
  }, [hydrate, initializeModels]);

  // 카메라 준비 핸들러
  const handleVideoReady = useCallback((video: HTMLVideoElement, canvas: HTMLCanvasElement) => {
    videoReadyRef.current = true;

    if (modelStatus === 'loaded' && users.length > 0) {
      machine.start(video, canvas);
    }
  }, [modelStatus, users.length, machine]);

  // 모델 로드 완료 시 스캔 시작
  // 비디오와 캔버스 ref는 CameraView에서 관리되므로 별도 처리 필요 없음

  // 자동 모드 변경 시 처리
  // 자동 모드 꺼질 때 정지하지 않음 (스캔은 계속 유지)
  // 자동 모드 여부는 useVerificationMachine의 autoMode 옵션으로 이미 전달됨

  const handleStopVerification = useCallback(() => {
    machine.stop();
  }, [machine]);

  // Computed values (before early return to satisfy hooks rules)
  const todaySuccessCount = useMemo(
    () => accessLogs.filter(l => l.status === 'success').length,
    [accessLogs]
  );
  const todayFailCount = useMemo(
    () => accessLogs.filter(l => l.status === 'failed').length,
    [accessLogs]
  );

  // 결과 데이터
  const verifyResult = machine.result;

  // 디스플레이 크기 계산
  const { displayWidth, displayHeight } = useMemo(() => {
    const displaySize = RESOLUTION_MAP[resolution];
    return {
      displayWidth: orientation === 'landscape' ? displaySize.width : displaySize.height,
      displayHeight: orientation === 'landscape' ? displaySize.height : displaySize.width,
    };
  }, [resolution, orientation]);

  const handleSettingsChange = useCallback((changes: {
    isAutoMode?: boolean;
    resolution?: Resolution;
    orientation?: Orientation;
  }) => {
    if (changes.isAutoMode !== undefined) setIsAutoMode(changes.isAutoMode);
    if (changes.resolution !== undefined) setResolution(changes.resolution);
    if (changes.orientation !== undefined) setOrientation(changes.orientation);
  }, []);

  // SettingsPanel props (useMemo로 재생성 방지)
  const settingsPanelModalProps = useMemo(() => ({
    isOpen: showSettings,
    onClose: () => setShowSettings(false),
    variant: 'modal' as const,
  }), [showSettings]);

  const settingsPanelSettingsProps = useMemo(() => ({
    current: {
      isAutoMode,
      resolution,
      orientation,
    },
    onChange: handleSettingsChange,
  }), [isAutoMode, resolution, orientation, handleSettingsChange]);

  const settingsPanelContextProps = useMemo(() => ({
    stats: {
      usersCount: users.length,
      todaySuccessCount,
      todayFailCount,
    },
    modelStatus,
  }), [users.length, todaySuccessCount, todayFailCount, modelStatus]);

  if (!isHydrated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <LoadingSpinner size="lg" text="시스템 초기화 중..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen relative overflow-hidden flex items-center justify-center p-8">
      {/* Animated Gradient Mesh Background */}
      <div className="absolute inset-0 gradient-mesh"></div>
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/20 via-purple-500/20 to-pink-500/20"></div>

      {/* Main Container */}
      <div className="relative z-10 w-full max-w-[95vw] max-h-[95vh]">
      <div
        className="glass rounded-3xl overflow-hidden relative animate-scaleIn"
        style={{
          width: `${displayWidth}px`,
          height: `${displayHeight}px`,
        }}
      >
        <div className="w-full h-full bg-black overflow-hidden relative">
          <CameraView
            resolution={resolution}
            orientation={orientation}
            onVideoReady={handleVideoReady}
            onVideoStop={handleStopVerification}
            autoStart
            showControls={false}
            fullScreen
            className="absolute inset-0 w-full h-full"
          />

      {/* 상단 영역 */}
      <div className="absolute top-0 left-0 right-0 z-10 p-4 portrait:p-6">
        <div className="flex items-start justify-between animate-fadeIn">
          <TimeDisplay />

          <div className="flex items-center gap-2 portrait:gap-3">
            <div className={`glass-light flex items-center gap-2 px-3 py-2 portrait:px-4 portrait:py-2.5 rounded-full ${
              modelStatus === 'loaded'
                ? 'text-emerald-400'
                : 'text-amber-400'
            }`}>
              <span className={`w-2 h-2 portrait:w-2.5 portrait:h-2.5 rounded-full ${
                modelStatus === 'loaded' ? 'bg-green-400' : 'bg-yellow-400 animate-pulse'
              }`} />
              <span className="text-xs portrait:text-sm font-medium">
                {modelStatus === 'loaded' ? '준비' : '로딩'}
              </span>
            </div>

            <button
              onClick={() => setShowSettings(true)}
              className="w-10 h-10 portrait:w-12 portrait:h-12 rounded-full glass-dark hover:bg-white/20 flex items-center justify-center text-white transition-all transform hover:scale-110"
            >
              <svg className="w-5 h-5 portrait:w-6 portrait:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </button>
          </div>
        </div>
      </div>


      {/* 하단 컨트롤 바 */}
      <div className="absolute bottom-0 left-0 right-0 z-10">
        <div className="bg-gradient-to-t from-black/60 to-transparent pb-6 pt-20 portrait:pb-8 portrait:pt-24">
          <div className="px-4 portrait:px-6">
            <div className="grid grid-cols-3 items-center glass-dark rounded-3xl p-4 portrait:p-5 animate-fadeIn">
              <div className="flex justify-start">
                <button
                  onClick={() => setIsAutoMode(!isAutoMode)}
                  disabled={modelStatus !== 'loaded' || users.length === 0}
                  className="flex items-center gap-2 portrait:gap-3 px-3 py-2 portrait:px-4 portrait:py-3 rounded-xl glass-light hover:bg-white/20 transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <div className={`w-10 h-6 portrait:w-12 portrait:h-7 rounded-full relative transition-colors ${
                    isAutoMode ? 'bg-blue-600' : 'bg-gray-600'
                  }`}>
                    <div className={`absolute top-1 w-4 h-4 portrait:w-5 portrait:h-5 bg-white rounded-full transition-transform ${
                      isAutoMode ? 'translate-x-5 portrait:translate-x-6' : 'translate-x-1'
                    }`} />
                  </div>
                  <span className="text-white text-sm portrait:text-base font-medium">
                    {isAutoMode ? '자동' : '수동'}
                  </span>
                </button>
              </div>

              <div className="flex justify-center">
                {!isAutoMode ? (
                  <button
                    onClick={() => machine.requestVerify()}
                    disabled={modelStatus !== 'loaded' || users.length === 0 || !machine.canVerify || machine.isShowingResult}
                    className="flex items-center gap-2 portrait:gap-3 px-6 py-3 portrait:px-8 portrait:py-4 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 disabled:from-gray-700 disabled:to-gray-600 disabled:opacity-50 text-white rounded-2xl shadow-lg shadow-emerald-500/30 transition-all transform hover:scale-105 active:scale-95"
                  >
                    <svg className="w-5 h-5 portrait:w-6 portrait:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                    <span className="text-lg portrait:text-xl font-bold">인증</span>
                  </button>
                ) : (
                  <div className="flex items-center gap-2 px-4 py-3 portrait:px-6 portrait:py-4 glass-light border-2 border-blue-400/50 rounded-2xl">
                    <span className="w-2.5 h-2.5 portrait:w-3 portrait:h-3 bg-blue-400 rounded-full animate-pulse shadow-lg shadow-blue-400/50" />
                    <span className="text-blue-200 text-base portrait:text-lg font-semibold">자동 인증 중</span>
                  </div>
                )}
              </div>

              <div className="flex justify-end items-center gap-4 portrait:gap-6">
                <div className="text-center">
                  <p className="text-green-400 text-lg portrait:text-xl font-bold">{todaySuccessCount}</p>
                  <p className="text-gray-500 text-[10px] portrait:text-xs">승인</p>
                </div>
                <div className="text-center">
                  <p className="text-red-400 text-lg portrait:text-xl font-bold">{todayFailCount}</p>
                  <p className="text-gray-500 text-[10px] portrait:text-xs">거부</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 결과 오버레이 */}
      {machine.isShowingResult && verifyResult && (
        <ResultOverlay
          type={verifyResult.isVerified ? 'success' : 'failed'}
          userName={verifyResult.userName ?? undefined}
          confidence={verifyResult.confidence}
          message="등록되지 않은 사용자입니다"
          onClose={() => {}}
        />
      )}
      </div>
      </div>
      </div>

      {/* 설정 패널 - ISP 적용된 그룹화 Props */}
      <SettingsPanel
        modal={settingsPanelModalProps}
        settings={settingsPanelSettingsProps}
        context={settingsPanelContextProps}
      />

      <style jsx global>{`
        @keyframes scale-in {
          0% { transform: scale(0); opacity: 0; }
          50% { transform: scale(1.05); }
          100% { transform: scale(1); opacity: 1; }
        }
        @keyframes scale-out {
          0% { transform: scale(1); opacity: 1; }
          100% { transform: scale(0.8); opacity: 0; }
        }
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes shrink-width {
          from { width: 100%; }
          to { width: 0%; }
        }
        @keyframes scan-line {
          0% { top: 10%; opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { top: 90%; opacity: 0; }
        }
        .animate-scale-in {
          animation: scale-in 0.4s ease-out;
        }
        .animate-scale-out {
          animation: scale-out 0.3s ease-in forwards;
        }
        .animate-fade-in {
          animation: fade-in 0.5s ease-out;
        }
        .animate-fade-in-delay {
          animation: fade-in 0.5s ease-out 0.2s both;
        }
        .animate-shrink-width {
          animation: shrink-width 5s linear;
        }
        .animate-scan-line {
          animation: scan-line 2s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}
