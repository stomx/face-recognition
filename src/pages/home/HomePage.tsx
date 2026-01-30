'use client';

import { useEffect, useState, useRef, memo } from 'react';
import Link from 'next/link';
import { useUserStore } from '@/entities/user';
import { useFaceDetection } from '@/features/face-detection';
import { useVerificationMachine } from '@/features/face-verification';
import { CameraView } from '@/widgets/camera-view';
import { TIMING } from '@/features/face-verification/model/types';

// ★ 시간 패널 분리 (1초 타이머가 부모 컴포넌트를 리렌더링하지 않도록)
const TimeDisplay = memo(function TimeDisplay() {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (date: Date) => date.toLocaleTimeString('ko-KR', {
    hour: '2-digit',
    minute: '2-digit',
  });

  const formatDate = (date: Date) => date.toLocaleDateString('ko-KR', {
    month: 'long',
    day: 'numeric',
    weekday: 'short',
  });

  return (
    <div className="bg-black/50 backdrop-blur-md rounded-2xl px-4 py-3 portrait:px-5 portrait:py-4">
      <div className="text-2xl portrait:text-3xl font-light tracking-wider text-white">
        {formatTime(currentTime)}
      </div>
      <div className="text-xs portrait:text-sm text-gray-400">
        {formatDate(currentTime)}
      </div>
    </div>
  );
});

// ★ 설정 패널 분리 (부모 리렌더링의 영향을 받지 않도록)
interface SettingsPanelProps {
  showSettings: boolean;
  onClose: () => void;
  isAutoMode: boolean;
  onAutoModeChange: (value: boolean) => void;
  resolution: Resolution;
  onResolutionChange: (value: Resolution) => void;
  orientation: Orientation;
  onOrientationChange: (value: Orientation) => void;
  usersCount: number;
  todaySuccessCount: number;
  todayFailCount: number;
  modelStatus: string;
}

const SettingsPanel = memo(function SettingsPanel({
  showSettings,
  onClose,
  isAutoMode,
  onAutoModeChange,
  resolution,
  onResolutionChange,
  orientation,
  onOrientationChange,
  usersCount,
  todaySuccessCount,
  todayFailCount,
  modelStatus,
}: SettingsPanelProps) {
  const settingsTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // 설정 패널 자동 숨김
  useEffect(() => {
    if (showSettings) {
      settingsTimeoutRef.current = setTimeout(() => {
        onClose();
      }, 10000);
    }
    return () => {
      if (settingsTimeoutRef.current) {
        clearTimeout(settingsTimeoutRef.current);
      }
    };
  }, [showSettings, onClose]);

  if (!showSettings) return null;

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/80 backdrop-blur-sm"
         onClick={onClose}>
      <div className="bg-gray-900 rounded-3xl p-8 max-w-lg w-full mx-4 shadow-2xl"
           onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold text-white">설정</h2>
          <button
            onClick={onClose}
            className="w-12 h-12 rounded-full bg-gray-800 flex items-center justify-center text-gray-400 hover:text-white hover:bg-gray-700 transition-colors cursor-pointer"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="mb-8">
          <label className="block text-gray-400 text-lg mb-4">인증 모드</label>
          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={() => onAutoModeChange(false)}
              className={`p-6 rounded-2xl text-center transition-all cursor-pointer ${
                !isAutoMode
                  ? 'bg-blue-600 text-white ring-4 ring-blue-400/50'
                  : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
              }`}
            >
              <svg className="w-10 h-10 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
              </svg>
              <span className="text-xl font-medium">수동</span>
              <p className="text-sm opacity-70 mt-1">버튼으로 인증</p>
            </button>
            <button
              onClick={() => onAutoModeChange(true)}
              disabled={usersCount === 0}
              className={`p-6 rounded-2xl text-center transition-all cursor-pointer ${
                isAutoMode
                  ? 'bg-blue-600 text-white ring-4 ring-blue-400/50'
                  : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
              } ${usersCount === 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <svg className="w-10 h-10 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              <span className="text-xl font-medium">자동</span>
              <p className="text-sm opacity-70 mt-1">연속 인증</p>
            </button>
          </div>
        </div>

        <div className="space-y-6 mb-6">
          {/* 해상도 선택 */}
          <div>
            <label className="block text-gray-400 text-lg mb-4">해상도</label>
            <select
              value={resolution}
              onChange={(e) => onResolutionChange(e.target.value as Resolution)}
              className="w-full px-4 py-3 bg-gray-800 text-white border border-gray-700 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all cursor-pointer"
            >
              <option value="hd">1280x720 (HD)</option>
              <option value="fhd">1920x1080 (FHD)</option>
              <option value="qhd">2560x1440 (QHD)</option>
            </select>
          </div>

          {/* 방향 선택 */}
          <div>
            <label className="block text-gray-400 text-lg mb-4">화면 방향</label>
            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => onOrientationChange('landscape')}
                className={`p-6 rounded-2xl text-center transition-all cursor-pointer ${
                  orientation === 'landscape'
                    ? 'bg-blue-600 text-white ring-4 ring-blue-400/50'
                    : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                }`}
              >
                <span className="text-xl font-medium">가로</span>
              </button>
              <button
                onClick={() => onOrientationChange('portrait')}
                className={`p-6 rounded-2xl text-center transition-all cursor-pointer ${
                  orientation === 'portrait'
                    ? 'bg-blue-600 text-white ring-4 ring-blue-400/50'
                    : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                }`}
              >
                <span className="text-xl font-medium">세로</span>
              </button>
            </div>
          </div>
        </div>

        <div className="bg-gray-800 rounded-2xl p-6 mb-6">
          <h3 className="text-gray-400 mb-4">오늘의 통계</h3>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-3xl font-bold text-white">{usersCount}</p>
              <p className="text-sm text-gray-500">등록 사용자</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-green-400">{todaySuccessCount}</p>
              <p className="text-sm text-gray-500">승인</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-red-400">{todayFailCount}</p>
              <p className="text-sm text-gray-500">거부</p>
            </div>
          </div>
        </div>

        <Link href="/register" className="block">
          <button className="w-full p-5 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl text-xl font-medium transition-colors flex items-center justify-center gap-3 cursor-pointer">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
            </svg>
            사용자 등록
          </button>
        </Link>
      </div>
    </div>
  );
});

type Resolution = 'hd' | 'fhd' | 'qhd';
type Orientation = 'landscape' | 'portrait';

const RESOLUTION_MAP = {
  hd: { width: 1280, height: 720 },
  fhd: { width: 1920, height: 1080 },
  qhd: { width: 2560, height: 1440 },
};

export function HomePage() {
  const { users, accessLogs, isHydrated, hydrate } = useUserStore();
  const { modelStatus, initializeModels } = useFaceDetection();

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
  const handleVideoReady = (video: HTMLVideoElement, canvas: HTMLCanvasElement) => {
    videoReadyRef.current = true;

    if (modelStatus === 'loaded' && users.length > 0) {
      machine.start(video, canvas);
    }
  };

  // 모델 로드 완료 시 스캔 시작
  useEffect(() => {
    if (modelStatus === 'loaded' && users.length > 0 && videoReadyRef.current && machine.isIdle) {
      // 비디오와 캔버스 ref는 CameraView에서 관리되므로 별도 처리 필요 없음
    }
  }, [modelStatus, users.length, machine.isIdle]);

  // 자동 모드 변경 시 처리
  useEffect(() => {
    // 자동 모드 꺼질 때 정지하지 않음 (스캔은 계속 유지)
    // 자동 모드 여부는 useVerificationMachine의 autoMode 옵션으로 이미 전달됨
  }, [isAutoMode]);

  const handleStopVerification = () => {
    machine.stop();
  };

  if (!isHydrated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="text-center">
          <div className="relative w-24 h-24 mx-auto mb-6">
            <div className="absolute inset-0 border-4 border-blue-500/30 rounded-full" />
            <div className="absolute inset-0 border-4 border-transparent border-t-blue-500 rounded-full animate-spin" />
          </div>
          <p className="text-gray-400 text-xl">시스템 초기화 중...</p>
        </div>
      </div>
    );
  }

  const todaySuccessCount = accessLogs.filter(l => l.status === 'success').length;
  const todayFailCount = accessLogs.filter(l => l.status === 'failed').length;

  // 파생 상태
  const faceDetected = machine.lastScan?.faceDetected || false;
  const faceBox = machine.lastScan?.faceBox;
  const isTooFar = faceBox && faceBox.height < TIMING.MIN_FACE_HEIGHT;
  const isGoodDistance = faceBox && faceBox.height >= TIMING.MIN_FACE_HEIGHT;

  // 결과 데이터 (인라인 렌더링용)
  const verifyResult = machine.result;

  // 디스플레이 크기 계산
  const displaySize = RESOLUTION_MAP[resolution];
  const displayWidth = orientation === 'landscape' ? displaySize.width : displaySize.height;
  const displayHeight = orientation === 'landscape' ? displaySize.height : displaySize.width;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-800 via-slate-900 to-slate-800 flex items-center justify-center p-8">
      <div
        className="shadow-2xl rounded-2xl overflow-hidden relative"
        style={{
          width: `${displayWidth}px`,
          height: `${displayHeight}px`,
          maxWidth: '95vw',
          maxHeight: '95vh'
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
        <div className="flex items-start justify-between">
          <TimeDisplay />

          <div className="flex items-center gap-2 portrait:gap-3">
            <div className={`flex items-center gap-2 px-3 py-2 portrait:px-4 portrait:py-2.5 rounded-full backdrop-blur-sm ${
              modelStatus === 'loaded'
                ? 'bg-green-500/30 text-green-400'
                : 'bg-yellow-500/30 text-yellow-400'
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
              className="w-10 h-10 portrait:w-12 portrait:h-12 rounded-full bg-black/30 backdrop-blur-sm hover:bg-black/50 flex items-center justify-center text-white transition-colors"
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
        <div className="bg-gradient-to-t from-black/90 to-transparent">
          <div className="px-4 pb-6 pt-8 portrait:px-6 portrait:pb-8 portrait:pt-12">
            <div className="grid grid-cols-3 items-center bg-black/40 backdrop-blur-md rounded-2xl p-3 portrait:p-4">
              <div className="flex justify-start">
                <button
                  onClick={() => setIsAutoMode(!isAutoMode)}
                  disabled={modelStatus !== 'loaded' || users.length === 0}
                  className="flex items-center gap-2 portrait:gap-3 px-3 py-2 portrait:px-4 portrait:py-3 rounded-xl hover:bg-white/10 transition-colors disabled:opacity-50"
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
                    className="flex items-center gap-2 portrait:gap-3 px-6 py-3 portrait:px-8 portrait:py-4 bg-green-500 hover:bg-green-400 disabled:bg-gray-700 disabled:opacity-50 text-white rounded-xl shadow-lg shadow-green-500/20 transition-all active:scale-[0.98]"
                  >
                    <svg className="w-5 h-5 portrait:w-6 portrait:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                    <span className="text-lg portrait:text-xl font-bold">인증</span>
                  </button>
                ) : (
                  <div className="flex items-center gap-2 px-4 py-3 portrait:px-6 portrait:py-4 bg-blue-600/30 border border-blue-500/40 rounded-xl">
                    <span className="w-2.5 h-2.5 portrait:w-3 portrait:h-3 bg-blue-400 rounded-full animate-pulse" />
                    <span className="text-blue-300 text-base portrait:text-lg font-medium">자동 인증</span>
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

      {/* 결과 오버레이 (인라인 - 1초 타이머로 인한 재마운트 방지) */}
      {machine.isShowingResult && verifyResult && (
        <div className={`fixed inset-0 z-50 flex items-center justify-center transition-all duration-300 ${
          machine.isClosing ? 'bg-black/0 backdrop-blur-none' : 'bg-black/50 backdrop-blur-sm'
        }`}>
          <div className={`relative max-w-md w-[90%] mx-4 rounded-3xl overflow-hidden ${
            machine.isClosing ? 'animate-scale-out' : 'animate-scale-in'
          } ${
            verifyResult.isVerified
              ? 'bg-green-500/20 border border-green-400/30'
              : 'bg-red-500/20 border border-red-400/30'
          } backdrop-blur-xl shadow-2xl`}>
            <div className={`h-2 ${verifyResult.isVerified ? 'bg-green-500' : 'bg-red-500'}`} />

            <div className="p-8 portrait:p-10 text-center text-white">
              <div className={`mx-auto mb-6 w-24 h-24 portrait:w-28 portrait:h-28 rounded-full flex items-center justify-center ${
                verifyResult.isVerified ? 'bg-green-500/30' : 'bg-red-500/30'
              }`}>
                {verifyResult.isVerified ? (
                  <svg className="w-14 h-14 portrait:w-16 portrait:h-16 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  <svg className="w-14 h-14 portrait:w-16 portrait:h-16 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                )}
              </div>

              <h1 className={`text-3xl portrait:text-4xl font-bold mb-3 ${
                verifyResult.isVerified ? 'text-green-400' : 'text-red-400'
              }`}>
                {verifyResult.isVerified ? '출입 승인' : '확인 필요'}
              </h1>

              {verifyResult.isVerified && verifyResult.userName ? (
                <p className="text-xl portrait:text-2xl text-white/90 mb-6">
                  환영합니다, <span className="font-bold">{verifyResult.userName}</span>님
                </p>
              ) : (
                <p className="text-lg portrait:text-xl text-white/80 mb-6">
                  등록되지 않은 사용자입니다
                </p>
              )}

              <div className="bg-white/10 rounded-2xl py-4 px-6 mb-6">
                <div className="text-3xl portrait:text-4xl font-light text-white mb-1">
                  {verifyResult.timestamp.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })}
                </div>
                <div className="text-sm portrait:text-base text-white/60">
                  {verifyResult.timestamp.toLocaleDateString('ko-KR', { month: 'long', day: 'numeric', weekday: 'short' })}
                </div>
              </div>

              <div className="max-w-xs mx-auto">
                <div className="flex justify-between text-sm mb-2 text-white/70">
                  <span>일치율</span>
                  <span className="font-bold">{(verifyResult.confidence * 100).toFixed(1)}%</span>
                </div>
                <div className="h-2 bg-white/20 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-1000 ${
                      verifyResult.isVerified ? 'bg-green-400' : 'bg-red-400'
                    }`}
                    style={{ width: `${verifyResult.confidence * 100}%` }}
                  />
                </div>
              </div>
            </div>

            <div className="h-1.5 bg-black/20">
              <div className={`h-full animate-shrink-width ${
                verifyResult.isVerified ? 'bg-green-400/70' : 'bg-red-400/70'
              }`} />
            </div>
          </div>
        </div>
      )}
        </div>
      </div>

      <SettingsPanel
        showSettings={showSettings}
        onClose={() => setShowSettings(false)}
        isAutoMode={isAutoMode}
        onAutoModeChange={setIsAutoMode}
        resolution={resolution}
        onResolutionChange={setResolution}
        orientation={orientation}
        onOrientationChange={setOrientation}
        usersCount={users.length}
        todaySuccessCount={todaySuccessCount}
        todayFailCount={todayFailCount}
        modelStatus={modelStatus}
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
