'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import Link from 'next/link';
import { useUserStore } from '@/entities/user';
import { useFaceDetection } from '@/features/face-detection';
import { useFaceVerification } from '@/features/face-verification';
import { CameraView } from '@/widgets/camera-view';
import { AccessLogList } from '@/widgets/access-log';
import { Card, CardHeader, CardBody, Button, Badge } from '@/shared/ui';

interface VerificationOverlay {
  show: boolean;
  isSuccess: boolean;
  userName: string | null;
  confidence: number;
  timestamp: Date;
}

export function HomePage() {
  const { users, accessLogs, isHydrated, hydrate } = useUserStore();
  const { modelStatus, initializeModels } = useFaceDetection();
  const {
    isVerifying,
    lastResult,
    startContinuousVerification,
    stopContinuousVerification,
    logAccess,
  } = useFaceVerification();

  const [mode, setMode] = useState<'idle' | 'verifying'>('idle');
  const [overlay, setOverlay] = useState<VerificationOverlay | null>(null);
  const [isAutoMode, setIsAutoMode] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const lastLoggedRef = useRef<string | null>(null);
  const overlayTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const autoStartedRef = useRef(false);

  // 초기화
  useEffect(() => {
    hydrate();
    initializeModels();
  }, [hydrate, initializeModels]);

  // 오버레이 표시 함수 (인식 중지 포함)
  const showResultOverlay = useCallback((result: typeof lastResult, shouldRestart: boolean = false) => {
    if (!result || !result.faceDetected) return;

    // 이전 타임아웃 클리어
    if (overlayTimeoutRef.current) {
      clearTimeout(overlayTimeoutRef.current);
    }

    // 인식 중지
    stopContinuousVerification();

    setOverlay({
      show: true,
      isSuccess: result.isVerified,
      userName: result.userName,
      confidence: result.confidence,
      timestamp: new Date(),
    });

    // 3초 후 오버레이 닫기
    overlayTimeoutRef.current = setTimeout(() => {
      setOverlay(null);

      // 자동 모드일 때만 인식 재시작
      if (shouldRestart && videoRef.current && canvasRef.current) {
        setMode('verifying');
        setTimeout(() => {
          console.log('Restarting verification after overlay (auto mode)...');
          startContinuousVerification(videoRef.current!, canvasRef.current!, undefined, { showOverlay: false });
        }, 500);
      } else {
        // 수동 모드: 종료
        setMode('idle');
      }
    }, 3000);
  }, [stopContinuousVerification, startContinuousVerification]);

  // 인증 결과 처리 - 얼굴이 감지된 경우에만
  useEffect(() => {
    if (!lastResult) return;

    // 디버깅 로그
    if (mode === 'verifying') {
      console.log('Verification result:', {
        faceDetected: lastResult.faceDetected,
        confidence: (lastResult.confidence * 100).toFixed(1) + '%',
        isVerified: lastResult.isVerified,
        userName: lastResult.userName,
        overlayShown: overlay?.show,
      });
    }

    if (lastResult.faceDetected && mode === 'verifying' && !overlay?.show) {
      // 얼굴이 감지되면 결과 처리 (confidence가 너무 낮으면 노이즈일 수 있으므로 최소 임계값 적용)
      const minConfidenceThreshold = 0.1; // 매우 낮은 임계값으로 거의 모든 감지된 얼굴 처리
      if (lastResult.confidence >= minConfidenceThreshold || lastResult.isVerified) {
        const resultKey = `${lastResult.userId}-${lastResult.isVerified}-${Math.floor(Date.now() / 3000)}`;

        // 중복 방지
        if (lastLoggedRef.current !== resultKey) {
          console.log('Processing verification result:', lastResult);
          logAccess(lastResult);
          lastLoggedRef.current = resultKey;
          // 자동 모드일 때만 재시작 (수동 모드는 1회 인식 후 종료)
          showResultOverlay(lastResult, isAutoMode);
        }
      }
    }
  }, [lastResult, mode, overlay?.show, logAccess, showResultOverlay, isAutoMode]);

  const handleVideoReady = (video: HTMLVideoElement, canvas: HTMLCanvasElement) => {
    videoRef.current = video;
    canvasRef.current = canvas;

    // 자동 모드일 때 자동 시작 (showOverlay: false)
    if (isAutoMode && modelStatus === 'loaded' && users.length > 0 && !autoStartedRef.current) {
      autoStartedRef.current = true;
      setMode('verifying');
      startContinuousVerification(video, canvas, undefined, { showOverlay: false });
    }
  };

  // 자동 모드 변경 시 처리
  const prevAutoModeRef = useRef(isAutoMode);
  useEffect(() => {
    const wasAutoMode = prevAutoModeRef.current;
    prevAutoModeRef.current = isAutoMode;

    if (isAutoMode && modelStatus === 'loaded' && users.length > 0 && videoRef.current && canvasRef.current && mode === 'idle') {
      // 자동 모드 켜짐 - 인증 시작
      autoStartedRef.current = true;
      setMode('verifying');
      startContinuousVerification(videoRef.current, canvasRef.current, undefined, { showOverlay: false });
    } else if (wasAutoMode && !isAutoMode) {
      // 자동 모드에서 수동 모드로 전환 시에만 중지
      autoStartedRef.current = false;
      setMode('idle');
      stopContinuousVerification();
      lastLoggedRef.current = null;
      setOverlay(null);
      if (overlayTimeoutRef.current) {
        clearTimeout(overlayTimeoutRef.current);
      }
    }
  }, [isAutoMode, modelStatus, users.length, mode, startContinuousVerification, stopContinuousVerification]);

  const handleStartVerification = () => {
    console.log('Start verification clicked', {
      hasVideo: !!videoRef.current,
      hasCanvas: !!canvasRef.current,
      modelStatus,
      usersCount: users.length,
    });

    if (videoRef.current && canvasRef.current && modelStatus === 'loaded') {
      console.log('Starting verification...');
      setMode('verifying');
      lastLoggedRef.current = null; // 이전 로그 초기화
      startContinuousVerification(videoRef.current, canvasRef.current, undefined, { showOverlay: false });
    } else {
      console.warn('Cannot start verification:', {
        videoReady: !!videoRef.current,
        canvasReady: !!canvasRef.current,
        modelStatus,
      });
    }
  };

  const handleStopVerification = () => {
    setMode('idle');
    stopContinuousVerification();
    lastLoggedRef.current = null;
    autoStartedRef.current = false;
    setOverlay(null);
    if (overlayTimeoutRef.current) {
      clearTimeout(overlayTimeoutRef.current);
    }
  };

  // 클린업
  useEffect(() => {
    return () => {
      if (overlayTimeoutRef.current) {
        clearTimeout(overlayTimeoutRef.current);
      }
    };
  }, []);

  if (!isHydrated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 xl:h-16 xl:w-16 3xl:h-20 3xl:w-20 border-b-2 border-blue-600 mx-auto mb-4" />
          <p className="text-gray-600 text-base xl:text-lg 3xl:text-xl">로딩 중...</p>
        </div>
      </div>
    );
  }

  // 날짜/시간 포맷
  const formatDateTime = (date: Date) => {
    return {
      date: date.toLocaleDateString('ko-KR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        weekday: 'long',
      }),
      time: date.toLocaleTimeString('ko-KR', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      }),
    };
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* 헤더 - 적응형 (가로/세로) */}
      <header className="bg-white shadow-sm">
        <div className="max-w-[1200px] xl:max-w-[1400px] 2xl:max-w-[1800px] 3xl:max-w-[2200px] mx-auto px-3 portrait:px-4 py-2 portrait:py-3 xl:py-4 2xl:py-5 3xl:py-6 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 portrait:gap-3 xl:gap-4 3xl:gap-5">
              <div className="w-8 h-8 portrait:w-10 portrait:h-10 xl:w-12 xl:h-12 2xl:w-14 2xl:h-14 3xl:w-16 3xl:h-16 bg-blue-600 rounded-lg xl:rounded-xl flex items-center justify-center">
                <svg
                  className="w-5 h-5 portrait:w-6 portrait:h-6 xl:w-7 xl:h-7 2xl:w-8 2xl:h-8 3xl:w-10 3xl:h-10 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                  />
                </svg>
              </div>
              <div>
                <h1 className="text-base portrait:text-lg xl:text-xl 2xl:text-2xl 3xl:text-3xl font-bold text-gray-900">
                  얼굴 인식 출입 통제
                </h1>
                <p className="text-[10px] portrait:text-xs xl:text-sm 2xl:text-base 3xl:text-lg text-gray-500 hidden portrait:block sm:block">Face Recognition Access Control</p>
              </div>
            </div>

            <nav className="flex items-center gap-2 portrait:gap-4">
              <Link href="/register">
                <Button variant="primary" className="text-xs portrait:text-sm xl:text-base 2xl:text-lg 3xl:text-xl px-2 portrait:px-3 xl:px-4 2xl:px-6 3xl:px-8 py-1.5 portrait:py-2 xl:py-2.5 2xl:py-3 3xl:py-4">
                  <svg
                    className="w-3 h-3 portrait:w-4 portrait:h-4 xl:w-5 xl:h-5 2xl:w-6 2xl:h-6 3xl:w-7 3xl:h-7 mr-1 portrait:mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"
                    />
                  </svg>
                  <span className="hidden portrait:inline sm:inline">사용자 </span>등록
                </Button>
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* 메인 콘텐츠 - 적응형 (가로/세로) */}
      <main className="max-w-[1200px] xl:max-w-[1400px] 2xl:max-w-[1800px] 3xl:max-w-[2200px] mx-auto px-3 portrait:px-4 py-3 portrait:py-4 xl:py-6 2xl:py-8 3xl:py-10 sm:px-6 lg:px-8">
        {/* 상태 표시 카드 - 적응형 (가로/세로) */}
        <div className="grid grid-cols-3 portrait:grid-cols-1 md:grid-cols-3 gap-2 portrait:gap-3 xl:gap-4 2xl:gap-6 3xl:gap-8 mb-3 portrait:mb-4 xl:mb-6 2xl:mb-8 3xl:mb-10">
          <Card>
            <CardBody className="flex items-center gap-2 portrait:gap-3 xl:gap-4 2xl:gap-5 3xl:gap-6 p-2 portrait:p-3 xl:p-4 2xl:p-5 3xl:p-6">
              <div className="w-8 h-8 portrait:w-10 portrait:h-10 xl:w-12 xl:h-12 2xl:w-14 2xl:h-14 3xl:w-16 3xl:h-16 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                <svg
                  className="w-4 h-4 portrait:w-5 portrait:h-5 xl:w-6 xl:h-6 2xl:w-7 2xl:h-7 3xl:w-8 3xl:h-8 text-blue-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                  />
                </svg>
              </div>
              <div className="min-w-0">
                <p className="text-[10px] portrait:text-xs xl:text-sm 2xl:text-base 3xl:text-lg text-gray-500 truncate">등록된 사용자</p>
                <p className="text-lg portrait:text-xl xl:text-2xl 2xl:text-3xl 3xl:text-4xl font-bold text-gray-900">{users.length}명</p>
              </div>
            </CardBody>
          </Card>

          <Card>
            <CardBody className="flex items-center gap-2 portrait:gap-3 xl:gap-4 2xl:gap-5 3xl:gap-6 p-2 portrait:p-3 xl:p-4 2xl:p-5 3xl:p-6">
              <div className="w-8 h-8 portrait:w-10 portrait:h-10 xl:w-12 xl:h-12 2xl:w-14 2xl:h-14 3xl:w-16 3xl:h-16 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                <svg
                  className="w-4 h-4 portrait:w-5 portrait:h-5 xl:w-6 xl:h-6 2xl:w-7 2xl:h-7 3xl:w-8 3xl:h-8 text-green-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <div className="min-w-0">
                <p className="text-[10px] portrait:text-xs xl:text-sm 2xl:text-base 3xl:text-lg text-gray-500 truncate">인증 성공</p>
                <p className="text-lg portrait:text-xl xl:text-2xl 2xl:text-3xl 3xl:text-4xl font-bold text-gray-900">
                  {accessLogs.filter((l) => l.status === 'success').length}회
                </p>
              </div>
            </CardBody>
          </Card>

          <Card>
            <CardBody className="flex items-center gap-2 portrait:gap-3 xl:gap-4 2xl:gap-5 3xl:gap-6 p-2 portrait:p-3 xl:p-4 2xl:p-5 3xl:p-6">
              <div className="w-8 h-8 portrait:w-10 portrait:h-10 xl:w-12 xl:h-12 2xl:w-14 2xl:h-14 3xl:w-16 3xl:h-16 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                <svg
                  className="w-4 h-4 portrait:w-5 portrait:h-5 xl:w-6 xl:h-6 2xl:w-7 2xl:h-7 3xl:w-8 3xl:h-8 text-purple-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                  />
                </svg>
              </div>
              <div className="min-w-0">
                <p className="text-[10px] portrait:text-xs xl:text-sm 2xl:text-base 3xl:text-lg text-gray-500 truncate">모델 상태</p>
                <Badge
                  variant={
                    modelStatus === 'loaded'
                      ? 'success'
                      : modelStatus === 'loading'
                      ? 'warning'
                      : modelStatus === 'error'
                      ? 'danger'
                      : 'default'
                  }
                  className="text-[10px] portrait:text-xs xl:text-sm 2xl:text-base 3xl:text-lg"
                >
                  {modelStatus === 'loaded'
                    ? '준비 완료'
                    : modelStatus === 'loading'
                    ? '로딩 중...'
                    : modelStatus === 'error'
                    ? '오류'
                    : '대기 중'}
                </Badge>
              </div>
            </CardBody>
          </Card>
        </div>

        {/* 메인 그리드 - 적응형 (가로/세로) */}
        <div className="grid grid-cols-1 portrait:grid-cols-1 lg:grid-cols-3 gap-3 portrait:gap-4 xl:gap-6 2xl:gap-8 3xl:gap-10">
          {/* 카메라 뷰 */}
          <div className="portrait:order-1 lg:col-span-2 space-y-2 portrait:space-y-3 xl:space-y-4 2xl:space-y-6 3xl:space-y-8">
            {/* 카메라 컨테이너 (오버레이 포함) */}
            <div className="relative">
              <CameraView
                onVideoReady={handleVideoReady}
                onVideoStop={handleStopVerification}
                autoStart
                showControls={false}
              />

              {/* 결과 오버레이 - 적응형 (가로/세로) */}
              {overlay?.show && (
                <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/70 backdrop-blur-sm rounded-lg">
                  <div
                    className={`w-full max-w-[240px] portrait:max-w-[280px] xl:max-w-[360px] 2xl:max-w-[440px] 3xl:max-w-[520px] mx-3 portrait:mx-4 rounded-xl xl:rounded-2xl 2xl:rounded-3xl shadow-2xl overflow-hidden ${
                      overlay.isSuccess ? 'bg-green-600' : 'bg-red-600'
                    }`}
                  >
                    {/* 아이콘 */}
                    <div className="pt-3 portrait:pt-4 xl:pt-6 2xl:pt-8 3xl:pt-10 pb-1.5 portrait:pb-2 xl:pb-3 2xl:pb-4 3xl:pb-5 flex justify-center">
                      {overlay.isSuccess ? (
                        <div className="w-12 h-12 portrait:w-14 portrait:h-14 xl:w-20 xl:h-20 2xl:w-24 2xl:h-24 3xl:w-28 3xl:h-28 bg-white/20 rounded-full flex items-center justify-center">
                          <svg className="w-7 h-7 portrait:w-8 portrait:h-8 xl:w-12 xl:h-12 2xl:w-14 2xl:h-14 3xl:w-16 3xl:h-16 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                      ) : (
                        <div className="w-12 h-12 portrait:w-14 portrait:h-14 xl:w-20 xl:h-20 2xl:w-24 2xl:h-24 3xl:w-28 3xl:h-28 bg-white/20 rounded-full flex items-center justify-center">
                          <svg className="w-7 h-7 portrait:w-8 portrait:h-8 xl:w-12 xl:h-12 2xl:w-14 2xl:h-14 3xl:w-16 3xl:h-16 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </div>
                      )}
                    </div>

                    {/* 상태 텍스트 */}
                    <div className="text-center text-white px-2 portrait:px-3 xl:px-4 2xl:px-6 3xl:px-8 pb-1.5 portrait:pb-2 xl:pb-3 2xl:pb-4 3xl:pb-5">
                      <h2 className="text-lg portrait:text-xl xl:text-2xl 2xl:text-3xl 3xl:text-4xl font-bold mb-0.5 portrait:mb-1">
                        {overlay.isSuccess ? '출입 승인' : '확인 필요'}
                      </h2>
                      {overlay.isSuccess && overlay.userName && (
                        <p className="text-sm portrait:text-base xl:text-lg 2xl:text-xl 3xl:text-2xl opacity-90">환영합니다, {overlay.userName}님!</p>
                      )}
                      {!overlay.isSuccess && (
                        <p className="text-sm portrait:text-base xl:text-lg 2xl:text-xl 3xl:text-2xl opacity-90">등록 정보를 확인해주세요</p>
                      )}
                    </div>

                    {/* 상세 정보 */}
                    <div className="bg-white p-2 portrait:p-3 xl:p-4 2xl:p-5 3xl:p-6">
                      <div className="grid grid-cols-2 gap-1.5 portrait:gap-2 xl:gap-3 2xl:gap-4 3xl:gap-5 text-center">
                        <div>
                          <p className="text-[9px] portrait:text-[10px] xl:text-xs 2xl:text-sm 3xl:text-base text-gray-500 mb-0.5">날짜</p>
                          <p className="font-semibold text-gray-900 text-[10px] portrait:text-xs xl:text-sm 2xl:text-base 3xl:text-lg">
                            {formatDateTime(overlay.timestamp).date}
                          </p>
                        </div>
                        <div>
                          <p className="text-[9px] portrait:text-[10px] xl:text-xs 2xl:text-sm 3xl:text-base text-gray-500 mb-0.5">시간</p>
                          <p className="font-semibold text-gray-900 text-sm portrait:text-base xl:text-lg 2xl:text-xl 3xl:text-2xl">
                            {formatDateTime(overlay.timestamp).time}
                          </p>
                        </div>
                      </div>

                      <div className="mt-1.5 portrait:mt-2 xl:mt-3 2xl:mt-4 3xl:mt-5 pt-1.5 portrait:pt-2 xl:pt-3 2xl:pt-4 3xl:pt-5 border-t border-gray-200">
                        <div className="flex justify-between items-center">
                          <span className="text-[9px] portrait:text-[10px] xl:text-xs 2xl:text-sm 3xl:text-base text-gray-500">일치율</span>
                          <span className={`text-xs portrait:text-sm xl:text-base 2xl:text-lg 3xl:text-xl font-bold ${overlay.isSuccess ? 'text-green-600' : 'text-red-600'}`}>
                            {(overlay.confidence * 100).toFixed(1)}%
                          </span>
                        </div>
                        <div className="mt-1 xl:mt-2 h-1 portrait:h-1.5 xl:h-2 2xl:h-2.5 3xl:h-3 bg-gray-200 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all ${
                              overlay.isSuccess ? 'bg-green-500' : 'bg-red-500'
                            }`}
                            style={{ width: `${overlay.confidence * 100}%` }}
                          />
                        </div>
                      </div>

                      {/* 3초 카운트다운 */}
                      <div className="mt-1.5 portrait:mt-2 xl:mt-3 2xl:mt-4 text-center">
                        <p className="text-[9px] portrait:text-[10px] xl:text-xs 2xl:text-sm 3xl:text-base text-gray-400">3초 후 자동으로 닫힙니다</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* 인증 컨트롤 - 적응형 (가로/세로) */}
            <Card>
              <CardBody className="p-2 portrait:p-3 xl:p-4 2xl:p-5 3xl:p-6">
                <div className="flex items-center justify-between gap-2">
                  <div className="min-w-0">
                    <h3 className="font-semibold text-gray-900 text-xs portrait:text-sm xl:text-base 2xl:text-lg 3xl:text-xl">출입 인증</h3>
                    <p className="text-[10px] portrait:text-xs xl:text-sm 2xl:text-base 3xl:text-lg text-gray-500 truncate">
                      {overlay?.show
                        ? '결과 표시 중...'
                        : mode === 'verifying'
                        ? isAutoMode ? '연속 인증 진행 중...' : '1회 인증 진행 중...'
                        : isAutoMode
                        ? '자동 모드 대기 중...'
                        : '버튼을 눌러 1회 인증'}
                    </p>
                  </div>

                  <div className="flex items-center gap-1.5 portrait:gap-2 xl:gap-3 2xl:gap-4 3xl:gap-5 flex-shrink-0">
                    {/* 자동/수동 모드 토글 - 적응형 (가로/세로) */}
                    <div className="flex items-center gap-1 portrait:gap-1.5 xl:gap-2 2xl:gap-3 3xl:gap-4">
                      <span className={`text-[9px] portrait:text-[10px] xl:text-xs 2xl:text-sm 3xl:text-base font-medium ${!isAutoMode ? 'text-gray-900' : 'text-gray-400'}`}>
                        수동
                      </span>
                      <button
                        type="button"
                        onClick={() => setIsAutoMode(!isAutoMode)}
                        className={`relative inline-flex h-4 w-7 portrait:h-5 portrait:w-9 xl:h-6 xl:w-11 2xl:h-7 2xl:w-14 3xl:h-8 3xl:w-16 items-center rounded-full transition-colors ${
                          isAutoMode ? 'bg-blue-600' : 'bg-gray-300'
                        }`}
                        disabled={modelStatus !== 'loaded' || users.length === 0}
                      >
                        <span
                          className={`inline-block h-3 w-3 portrait:h-3.5 portrait:w-3.5 xl:h-4 xl:w-4 2xl:h-5 2xl:w-5 3xl:h-6 3xl:w-6 transform rounded-full bg-white transition-transform ${
                            isAutoMode ? 'translate-x-3.5 portrait:translate-x-4 xl:translate-x-6 2xl:translate-x-8 3xl:translate-x-9' : 'translate-x-0.5 portrait:translate-x-1'
                          }`}
                        />
                      </button>
                      <span className={`text-[9px] portrait:text-[10px] xl:text-xs 2xl:text-sm 3xl:text-base font-medium ${isAutoMode ? 'text-blue-600' : 'text-gray-400'}`}>
                        자동
                      </span>
                    </div>

                    {/* 수동 모드일 때만 버튼 표시 */}
                    {!isAutoMode && (
                      mode === 'idle' ? (
                        <Button
                          variant="success"
                          onClick={handleStartVerification}
                          disabled={modelStatus !== 'loaded' || users.length === 0}
                          className="text-[10px] portrait:text-xs xl:text-sm 2xl:text-base 3xl:text-lg px-1.5 portrait:px-2 xl:px-3 2xl:px-4 3xl:px-6 py-1 portrait:py-1.5 xl:py-2 2xl:py-2.5 3xl:py-3"
                        >
                          시작
                        </Button>
                      ) : (
                        <Button
                          variant="danger"
                          onClick={handleStopVerification}
                          className="text-[10px] portrait:text-xs xl:text-sm 2xl:text-base 3xl:text-lg px-1.5 portrait:px-2 xl:px-3 2xl:px-4 3xl:px-6 py-1 portrait:py-1.5 xl:py-2 2xl:py-2.5 3xl:py-3"
                        >
                          중지
                        </Button>
                      )
                    )}
                  </div>
                </div>

                {users.length === 0 && (
                  <div className="mt-2 portrait:mt-3 xl:mt-4 2xl:mt-5 p-2 portrait:p-3 xl:p-4 2xl:p-5 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <p className="text-yellow-800 text-[10px] portrait:text-xs xl:text-sm 2xl:text-base 3xl:text-lg">
                      등록된 사용자가 없습니다.{' '}
                      <Link href="/register" className="underline font-medium">
                        먼저 사용자를 등록해주세요.
                      </Link>
                    </p>
                  </div>
                )}
              </CardBody>
            </Card>
          </div>

          {/* 출입 기록 */}
          <div className="portrait:order-2">
            <AccessLogList />
          </div>
        </div>
      </main>
    </div>
  );
}
