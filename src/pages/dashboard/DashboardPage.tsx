'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useUserStore } from '@/entities/user';
import { CameraView } from '@/widgets/camera-view';
import { CameraControlPanel } from '@/widgets/camera-control';
import { AccessLogTimeline } from '@/widgets/access-log';
import { UserManagementPanel, UserFormModal } from '@/widgets/user-management';
import { useFaceDetection } from '@/features/face-detection';
import { loadModels, faceapi } from '@/shared/lib/face-api';
import { verifyFace } from '@/features/face-verification';
import { ResultOverlay, StatusBadge, IconButton, StatCounter, PrimaryButton, StatsGrid, StatCard, EmptyState } from '@/shared/ui';
import type { User } from '@/shared/types';

type Resolution = 'hd' | 'fhd' | 'qhd';
type Orientation = 'landscape' | 'portrait';

interface ResultState {
  type: 'success' | 'failed';
  userName?: string;
  confidence?: number;
  message: string;
}

export function DashboardPage() {
  const router = useRouter();
  const { users, removeUser, addAccessLog, accessLogs, hydrate, isHydrated, getLabeledDescriptors, getUserById } = useUserStore();
  const { modelStatus, initializeModels } = useFaceDetection();

  const [resolution, setResolution] = useState<Resolution>('fhd');
  const [orientation, setOrientation] = useState<Orientation>('landscape');
  const [isCameraOn, setIsCameraOn] = useState(true);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [result, setResult] = useState<ResultState | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showUserModal, setShowUserModal] = useState(false);
  const [editingUser, setEditingUser] = useState<User | undefined>(undefined);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const cameraContainerRef = useRef<HTMLDivElement | null>(null);

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
      // ⭐ 공통 인증 함수 사용
      const labeledDescriptors = getLabeledDescriptors();
      const result = await verifyFace(videoRef.current, labeledDescriptors, getUserById);

      if (!result.detection) {
        // 얼굴 감지 실패
        addAccessLog(null, null, 'failed');
        setResult({
          type: 'failed',
          message: '얼굴이 감지되지 않았습니다',
        });
        return;
      }

      if (result.success) {
        // 인증 성공
        addAccessLog(result.userId!, result.userName!, 'success', result.confidence);
        setResult({
          type: 'success',
          userName: result.userName!,
          confidence: result.confidence,
          message: '인증 성공',
        });
      } else {
        // 인증 실패
        addAccessLog(null, '미확인 사용자', 'failed', result.confidence);
        setResult({
          type: 'failed',
          confidence: result.confidence,
          message: result.confidence > 0
            ? `일치율 부족 (${Math.round(result.confidence * 100)}%)`
            : '등록되지 않은 얼굴입니다',
        });
      }
    } catch (error) {
      console.error('인증 실패:', error);
      addAccessLog(null, null, 'failed');
      setResult({
        type: 'failed',
        message: '인증 중 오류가 발생했습니다',
      });
    } finally {
      setIsAuthenticating(false);
    }
  };

  const todaySuccessCount = users.length > 0 ? useUserStore.getState().accessLogs.filter(l => l.status === 'success').length : 0;
  const todayFailCount = users.length > 0 ? useUserStore.getState().accessLogs.filter(l => l.status === 'failed').length : 0;

  // 사용자 관리 핸들러
  const handleAddUser = () => {
    setEditingUser(undefined);
    setShowUserModal(true);
  };

  const handleEditUser = (user: User) => {
    setEditingUser(user);
    setShowUserModal(true);
  };

  const handleDeleteUser = (userId: string) => {
    if (confirm('정말 삭제하시겠습니까?')) {
      removeUser(userId);
    }
  };

  const handleUserSaveSuccess = () => {
    // 사용자 등록/수정 성공
    setShowUserModal(false);
    setEditingUser(undefined);
  };

  // 해상도 맵핑
  const RESOLUTION_MAP = {
    hd: { width: 1280, height: 720 },
    fhd: { width: 1920, height: 1080 },
    qhd: { width: 2560, height: 1440 },
  };

  const displaySize = RESOLUTION_MAP[resolution];
  const displayWidth = orientation === 'landscape' ? displaySize.width : displaySize.height;
  const displayHeight = orientation === 'landscape' ? displaySize.height : displaySize.width;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-gray-50 flex items-center justify-center p-4 lg:p-8">
      {/* 대시보드 프레임 */}
      <div
        className="shadow-2xl rounded-3xl overflow-hidden bg-white border border-gray-200"
        style={{
          width: `${displayWidth}px`,
          height: `${displayHeight}px`,
          maxWidth: '98vw',
          maxHeight: '98vh'
        }}
      >
        {/* 메인 레이아웃 - 방향에 따라 완전히 다른 UI */}
        {orientation === 'portrait' ? (
          /* 세로 모드 */
          <div className="flex flex-col h-full relative bg-white">
            {/* 상단 헤더 */}
            <div className="px-4 py-3 flex items-center justify-between bg-white border-b border-gray-200">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                </div>
                <div>
                  <h1 className="text-gray-900 font-bold text-base">얼굴 인식 관리</h1>
                  <p className="text-gray-500 text-[10px]">출입 통제 시스템</p>
                </div>
              </div>
              <IconButton
                onClick={() => router.push('/')}
                icon={
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                  </svg>
                }
                className="bg-gray-100 hover:bg-gray-200 border border-gray-200 hover:border-gray-300 shadow-none text-gray-600"
              />
            </div>

            {/* 실시간 통계 */}
            <div className="px-4 py-2">
              <div className="grid grid-cols-3 gap-2">
                <div className="bg-green-50 border border-green-200 rounded-xl p-2.5 text-center">
                  <div className="text-xl font-bold text-green-600">{todaySuccessCount}</div>
                  <div className="text-[9px] text-green-600 font-semibold mt-0.5">승인</div>
                </div>
                <div className="bg-red-50 border border-red-200 rounded-xl p-2.5 text-center">
                  <div className="text-xl font-bold text-red-600">{todayFailCount}</div>
                  <div className="text-[9px] text-red-600 font-semibold mt-0.5">거부</div>
                </div>
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-2.5 text-center">
                  <div className="text-xl font-bold text-blue-600">{users.length}</div>
                  <div className="text-[9px] text-blue-600 font-semibold mt-0.5">사용자</div>
                </div>
              </div>
            </div>

            {/* 카메라 영역 */}
            <div className="px-4 py-2 flex-shrink-0">
              <div className="bg-black rounded-2xl overflow-hidden border border-gray-200 shadow-lg aspect-video relative">
                <CameraView
                  key={`${resolution}-${orientation}-${isCameraOn}`}
                  onVideoReady={handleVideoReady}
                  onVideoStop={handleVideoStop}
                  showControls={false}
                  autoStart={isCameraOn}
                  resolution={resolution}
                  orientation={orientation}
                />
                {isCameraOn && (
                  <div className="absolute top-2 left-2 flex items-center gap-1.5 px-2 py-1 rounded-lg bg-black/60 backdrop-blur-sm border border-red-400">
                    <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse" />
                    <span className="text-white text-[9px] font-semibold">라이브</span>
                  </div>
                )}
              </div>
            </div>

            {/* 출입 기록 미리보기 */}
            <div className="flex-1 px-4 py-2 min-h-0 overflow-y-auto custom-scrollbar">
              <div className="bg-gray-50 rounded-2xl border border-gray-200 shadow-sm p-3">
                <h3 className="text-xs font-bold text-gray-700 mb-2.5">최근 활동</h3>
                <div className="space-y-1.5">
                  {useUserStore.getState().accessLogs.slice(0, 3).map((log) => (
                    <div
                      key={log.id}
                      className={`p-2 rounded-lg border ${
                        log.status === 'success'
                          ? 'bg-green-50 border-green-200'
                          : 'bg-red-50 border-red-200'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span className={`font-semibold text-xs truncate ${log.status === 'success' ? 'text-green-700' : 'text-red-700'}`}>
                              {log.userName || '미확인'}
                            </span>
                            <span
                              className={`px-1 py-0.5 rounded text-[8px] font-semibold ${
                                log.status === 'success'
                                  ? 'bg-green-500 text-white'
                                  : 'bg-red-500 text-white'
                              }`}
                            >
                              {log.status === 'success' ? '승인' : '거부'}
                            </span>
                          </div>
                          <div className="text-[9px] text-gray-500 mt-0.5">
                            {new Date(log.timestamp).toLocaleTimeString('ko-KR', {
                              hour: '2-digit',
                              minute: '2-digit',
                              hour12: false
                            })}
                          </div>
                        </div>
                        {log.confidence !== undefined && (
                          <div className={`text-xs font-semibold ml-2 ${log.status === 'success' ? 'text-green-600' : 'text-red-600'}`}>
                            {(log.confidence * 100).toFixed(0)}%
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                  {useUserStore.getState().accessLogs.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-6 text-center">
                      <svg className="w-10 h-10 text-gray-300 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      <p className="text-gray-400 text-[10px] font-semibold">활동 기록 없음</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* 하단 컨트롤 */}
            <div className="px-4 pb-4 space-y-2 flex-shrink-0">
              {/* 수동 인증 버튼 */}
              <button
                onClick={handleManualAuth}
                disabled={!isCameraOn || isAuthenticating}
                className={`w-full py-4 rounded-xl font-bold text-sm transition-all ${
                  !isCameraOn || isAuthenticating
                    ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    : 'bg-gradient-to-r from-blue-600 to-blue-500 text-white hover:from-blue-500 hover:to-blue-400 shadow-lg cursor-pointer'
                }`}
              >
                {isAuthenticating ? (
                  <div className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    <span>인증 중...</span>
                  </div>
                ) : (
                  '수동 인증'
                )}
              </button>

              {/* 설정 패널 */}
              <div className="bg-gray-50 rounded-2xl p-3 border border-gray-200 space-y-2">
                {/* 해상도 */}
                <div>
                  <label className="block text-gray-700 text-[10px] font-semibold mb-1.5">해상도</label>
                  <select
                    value={resolution}
                    onChange={(e) => handleResolutionChange(e.target.value as Resolution)}
                    className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 text-xs font-medium focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all cursor-pointer"
                  >
                    <option value="hd">1280×720 HD</option>
                    <option value="fhd">1920×1080 FHD</option>
                    <option value="qhd">2560×1440 QHD</option>
                  </select>
                </div>

                {/* 방향 */}
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => handleOrientationChange('landscape')}
                    className="px-3 py-2 rounded-lg border border-gray-300 bg-white text-gray-600 text-xs font-semibold hover:bg-gray-50 transition-all cursor-pointer"
                  >
                    가로
                  </button>
                  <button
                    onClick={() => handleOrientationChange('portrait')}
                    className="px-3 py-2 rounded-lg border border-blue-500 bg-blue-500 text-white text-xs font-semibold transition-all cursor-pointer"
                  >
                    세로
                  </button>
                </div>

                {/* 카메라 토글 */}
                <button
                  onClick={handleCameraToggle}
                  className={`w-full py-2.5 rounded-lg font-semibold text-xs transition-all cursor-pointer ${
                    isCameraOn
                      ? 'bg-red-50 text-red-600 border border-red-200 hover:bg-red-100'
                      : 'bg-green-50 text-green-600 border border-green-200 hover:bg-green-100'
                  }`}
                >
                  {isCameraOn ? '카메라 끄기' : '카메라 켜기'}
                </button>
              </div>
            </div>
          </div>
        ) : (
          /* 가로 모드 */
          <div className="flex flex-col h-full overflow-hidden">
            {/* 상단 헤더바 */}
            <header className="bg-white border-b border-gray-200 px-6 py-3 flex-shrink-0">
              <div className="flex items-center justify-between">
                {/* 좌측: 로고 & 시스템 상태 */}
                <div className="flex items-center gap-6">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/30">
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    </div>
                    <div>
                      <h1 className="text-gray-900 font-bold text-sm">
                        얼굴 인식 관리
                      </h1>
                      <p className="text-gray-500 text-[10px]">
                        출입 통제 시스템
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gray-100 border border-gray-200">
                    <div className={`w-2 h-2 rounded-full ${modelStatus === 'loaded' ? 'bg-green-500 animate-pulse' : 'bg-yellow-500'}`} />
                    <span className="text-xs font-semibold text-gray-700">
                      {modelStatus === 'loaded' ? '시스템 준비' : '로딩 중...'}
                    </span>
                  </div>
                </div>

                {/* 중앙: 실시간 통계 */}
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2 px-4 py-1.5 rounded-lg bg-green-50 border border-green-200">
                    <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                    </svg>
                    <div>
                      <div className="text-xs text-green-700 font-bold">{todaySuccessCount}</div>
                      <div className="text-[9px] text-green-600">승인</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 px-4 py-1.5 rounded-lg bg-red-50 border border-red-200">
                    <svg className="w-4 h-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                    <div>
                      <div className="text-xs text-red-700 font-bold">{todayFailCount}</div>
                      <div className="text-[9px] text-red-600">거부</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 px-4 py-1.5 rounded-lg bg-blue-50 border border-blue-200">
                    <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                    <div>
                      <div className="text-xs text-blue-700 font-bold">{users.length}</div>
                      <div className="text-[9px] text-blue-600">사용자</div>
                    </div>
                  </div>
                </div>

                {/* 우측: 시간 & 홈 버튼 */}
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <div className="text-gray-900 text-sm font-bold">
                      {new Date().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                    </div>
                    <div className="text-gray-500 text-[10px]">
                      {new Date().toLocaleDateString('ko-KR', { year: 'numeric', month: 'short', day: 'numeric' })}
                    </div>
                  </div>
                  <IconButton
                    onClick={() => router.push('/')}
                    icon={
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                      </svg>
                    }
                    className="bg-gray-100 hover:bg-gray-200 border border-gray-200 hover:border-gray-300 shadow-none text-gray-600"
                  />
                </div>
              </div>
            </header>

            {/* 메인 콘텐츠 영역 */}
            <div className="flex-1 flex overflow-hidden">
              {/* 좌측: 카메라 피드 */}
              <main className="flex-1 p-4 overflow-hidden min-w-0">
                <div className="h-full bg-black rounded-2xl overflow-hidden shadow-lg border border-gray-200 relative">
                  <CameraView
                    key={`${resolution}-${orientation}-${isCameraOn}`}
                    onVideoReady={handleVideoReady}
                    onVideoStop={handleVideoStop}
                    showControls={false}
                    autoStart={isCameraOn}
                    resolution={resolution}
                    orientation={orientation}
                  />

                  {/* 카메라 오버레이 정보 */}
                  {isCameraOn && (
                    <div className="absolute top-3 left-3 flex items-center gap-2 px-3 py-2 rounded-lg bg-black/60 backdrop-blur-sm border border-red-400">
                      <span className="w-2.5 h-2.5 bg-red-500 rounded-full animate-pulse" />
                      <span className="text-white text-xs font-semibold">
                        라이브
                      </span>
                    </div>
                  )}
                </div>
              </main>

              {/* 우측: 출입 기록 & 컨트롤 패널 */}
              <aside className="w-96 flex flex-col overflow-hidden border-l border-gray-200">
                {/* 출입 기록 스트림 */}
                <div className="flex-1 overflow-hidden bg-gray-50">
                  <div className="h-full flex flex-col">
                    <div className="px-4 py-3 border-b border-gray-200 flex-shrink-0">
                      <div className="flex items-center justify-between">
                        <h2 className="text-gray-900 text-xs font-bold">
                          출입 기록
                        </h2>
                        <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-[10px] font-semibold border border-blue-200">
                          {accessLogs.length}
                        </span>
                      </div>
                    </div>

                    <div className="flex-1 overflow-y-auto px-4 py-3 min-h-0 custom-scrollbar">
                      {accessLogs.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full text-center">
                          <svg className="w-12 h-12 text-gray-300 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                          </svg>
                          <p className="text-gray-400 text-xs font-semibold">
                            활동 기록 없음
                          </p>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          {accessLogs.map((log, idx) => (
                            <div
                              key={log.id}
                              className={`p-3 rounded-lg border transition-all ${
                                log.status === 'success'
                                  ? 'bg-green-50 border-green-200 hover:bg-green-100'
                                  : 'bg-red-50 border-red-200 hover:bg-red-100'
                              }`}
                              style={{
                                animation: `slideIn 0.3s ease-out ${idx * 0.05}s both`
                              }}
                            >
                              <div className="flex items-start justify-between gap-2">
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2 mb-1">
                                    <span className={`text-xs font-semibold truncate ${log.status === 'success' ? 'text-green-700' : 'text-red-700'}`}>
                                      {log.userName || '미확인 사용자'}
                                    </span>
                                    <span className={`px-1.5 py-0.5 rounded text-[9px] font-semibold ${
                                      log.status === 'success' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
                                    }`}>
                                      {log.status === 'success' ? '승인' : '거부'}
                                    </span>
                                  </div>
                                  <div className="text-[10px] text-gray-500">
                                    {new Date(log.timestamp).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false })}
                                  </div>
                                </div>
                                {log.confidence !== undefined && (
                                  <div className="text-right flex-shrink-0">
                                    <div className={`text-sm font-semibold ${log.status === 'success' ? 'text-green-600' : 'text-red-600'}`}>
                                      {(log.confidence * 100).toFixed(0)}%
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* 컨트롤 패널 */}
                <div className="bg-white border-t border-gray-200 p-4 flex-shrink-0">
                  <div className="space-y-3">
                    {/* 수동 인증 버튼 */}
                    <button
                      onClick={handleManualAuth}
                      disabled={!isCameraOn || isAuthenticating}
                      className={`w-full py-4 rounded-xl font-bold text-sm transition-all ${
                        !isCameraOn || isAuthenticating
                          ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                          : 'bg-gradient-to-r from-blue-600 to-blue-500 text-white hover:from-blue-500 hover:to-blue-400 shadow-lg cursor-pointer'
                      }`}
                    >
                      {isAuthenticating ? (
                        <div className="flex items-center justify-center gap-2">
                          <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                          </svg>
                          <span>인증 중...</span>
                        </div>
                      ) : (
                        '수동 인증'
                      )}
                    </button>

                    {/* 설정 그리드 */}
                    <div className="grid grid-cols-2 gap-2">
                      {/* 해상도 */}
                      <div className="col-span-2">
                        <label className="block text-[10px] text-gray-700 font-semibold mb-1.5">
                          해상도
                        </label>
                        <select
                          value={resolution}
                          onChange={(e) => handleResolutionChange(e.target.value as Resolution)}
                          className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 text-xs font-medium focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all cursor-pointer"
                        >
                          <option value="hd">1280×720 HD</option>
                          <option value="fhd">1920×1080 FHD</option>
                          <option value="qhd">2560×1440 QHD</option>
                        </select>
                      </div>

                      {/* 방향 */}
                      <button
                        onClick={() => handleOrientationChange('landscape')}
                        className="px-3 py-2 rounded-lg border border-blue-500 bg-blue-500 text-white text-xs font-semibold transition-all cursor-pointer"
                      >
                        가로
                      </button>
                      <button
                        onClick={() => handleOrientationChange('portrait')}
                        className="px-3 py-2 rounded-lg border border-gray-300 bg-white text-gray-600 hover:bg-gray-50 text-xs font-semibold transition-all cursor-pointer"
                      >
                        세로
                      </button>
                    </div>

                    {/* 카메라 토글 */}
                    <button
                      onClick={handleCameraToggle}
                      className={`w-full py-3 rounded-lg font-semibold text-xs transition-all cursor-pointer ${
                        isCameraOn
                          ? 'bg-red-50 text-red-600 border border-red-200 hover:bg-red-100'
                          : 'bg-green-50 text-green-600 border border-green-200 hover:bg-green-100'
                      }`}
                    >
                      {isCameraOn ? '카메라 끄기' : '카메라 켜기'}
                    </button>

                    {/* 사용자 관리 버튼 */}
                    <button
                      onClick={handleAddUser}
                      className="w-full py-3 rounded-lg bg-gray-100 text-gray-700 border border-gray-200 font-semibold text-xs hover:bg-gray-200 transition-all cursor-pointer"
                    >
                      + 사용자 추가
                    </button>
                  </div>
                </div>
              </aside>
            </div>
          </div>
        )}

        {/* 결과 오버레이 */}
        {result && (
          <ResultOverlay
            type={result.type}
            userName={result.userName}
            confidence={result.confidence}
            message={result.message}
            onClose={() => setResult(null)}
          />
        )}
      </div>

      {/* 사용자 등록/수정 모달 */}
      {showUserModal && (
        <UserFormModal
          user={editingUser}
          modelStatus={modelStatus}
          onSuccess={handleUserSaveSuccess}
          onClose={() => {
            setShowUserModal(false);
            setEditingUser(undefined);
          }}
        />
      )}
    </div>
  );
}
