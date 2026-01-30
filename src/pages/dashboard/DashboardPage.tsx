'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useUserStore } from '@/entities/user';
import { CameraView } from '@/widgets/camera-view';
import { CameraControlPanel } from '@/widgets/camera-control';
import { AccessLogTimeline } from '@/widgets/access-log';
import { UserManagementPanel, UserFormModal } from '@/widgets/user-management';
import { useFaceDetection } from '@/features/face-detection';
import { loadModels, detectFace, findBestMatch, faceapi } from '@/shared/lib/face-api';
import { ResultOverlay, StatusBadge, IconButton, StatCounter, PrimaryButton } from '@/shared/ui';
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
  const { users, addUser, updateUser, removeUser, addAccessLog, hydrate, isHydrated, getLabeledDescriptors, getUserById } = useUserStore();
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
      const detection = await detectFace(videoRef.current);

      if (!detection) {
        addAccessLog(null, null, 'failed');
        setResult({
          type: 'failed',
          message: '얼굴이 감지되지 않았습니다',
        });
        return;
      }

      const labeledDescriptors = getLabeledDescriptors();
      const bestMatch = findBestMatch(detection.descriptor, labeledDescriptors);

      if (!bestMatch || bestMatch.label === 'unknown') {
        addAccessLog(null, '미확인 사용자', 'failed');
        setResult({
          type: 'failed',
          message: '등록되지 않은 얼굴입니다',
        });
      } else {
        const user = getUserById(bestMatch.label);
        const userName = user?.name || '알 수 없음';
        const confidence = 1 - bestMatch.distance;
        addAccessLog(bestMatch.label, userName, 'success', confidence);
        setResult({
          type: 'success',
          userName,
          confidence,
          message: '인증 성공',
        });
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

  const handleSaveUser = (name: string, faceDescriptor: Float32Array, imageData: string) => {
    if (editingUser) {
      updateUser(editingUser.id, name, faceDescriptor, imageData);
    } else {
      addUser(name, faceDescriptor, imageData);
    }
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
    <div className="min-h-screen bg-gradient-to-br from-slate-800 via-slate-900 to-slate-800 flex items-center justify-center p-8">
      {/* 키오스크 디스플레이 프레임 */}
      <div
        className="shadow-2xl rounded-2xl overflow-hidden bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50"
        style={{
          width: `${displayWidth}px`,
          height: `${displayHeight}px`,
          maxWidth: '95vw',
          maxHeight: '95vh'
        }}
      >
        {/* 메인 레이아웃 - 방향에 따라 완전히 다른 UI */}
        {orientation === 'portrait' ? (
          /* 세로 모드 - 키오스크 전용 UI */
          <div className="flex flex-col h-full relative bg-white">
            {/* 상단 헤더 */}
            <div className="px-4 py-3 flex items-center justify-between bg-white border-b border-gray-200">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-sm">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                </div>
                <div>
                  <h1 className="text-gray-900 font-bold text-lg tracking-tight">관리 대시보드</h1>
                  <p className="text-gray-500 text-xs">Access Control System</p>
                </div>
              </div>
              <IconButton
                onClick={() => router.push('/')}
                icon={
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                  </svg>
                }
                className="bg-gray-50 hover:bg-gray-100 border-0 shadow-none text-gray-700"
              />
            </div>

            {/* 실시간 통계 - 컴팩트 */}
            <div className="px-4 py-2 grid grid-cols-3 gap-2">
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-3 border border-green-100">
                <div className="text-2xl font-bold text-green-700">{todaySuccessCount}</div>
                <div className="text-[10px] text-green-600 font-semibold uppercase">승인</div>
              </div>
              <div className="bg-gradient-to-br from-red-50 to-rose-50 rounded-2xl p-3 border border-red-100">
                <div className="text-2xl font-bold text-red-700">{todayFailCount}</div>
                <div className="text-[10px] text-red-600 font-semibold uppercase">거부</div>
              </div>
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-3 border border-blue-100">
                <div className="text-2xl font-bold text-blue-700">{users.length}</div>
                <div className="text-[10px] text-blue-600 font-semibold uppercase">사용자</div>
              </div>
            </div>

            {/* 카메라 영역 - 중심 */}
            <div className="px-4 py-2 flex-shrink-0">
              <div className="bg-black rounded-2xl overflow-hidden border border-gray-200 shadow-sm aspect-video">
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

            {/* 출입 기록 미리보기 */}
            <div className="flex-1 px-4 py-2 min-h-0 overflow-y-auto">
              <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4">
                <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-3">최근 출입 기록</h3>
                <div className="space-y-2">
                  {useUserStore.getState().accessLogs.slice(0, 3).map((log) => (
                    <div
                      key={log.id}
                      className={`p-2.5 rounded-lg border-l-[3px] ${
                        log.status === 'success'
                          ? 'bg-green-50 border-green-500'
                          : 'bg-red-50 border-red-500'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-gray-900 text-sm">
                              {log.userName || '미확인 사용자'}
                            </span>
                            <span
                              className={`px-1.5 py-0.5 rounded text-[10px] font-bold uppercase ${
                                log.status === 'success'
                                  ? 'bg-green-500 text-white'
                                  : 'bg-red-500 text-white'
                              }`}
                            >
                              {log.status === 'success' ? '승인' : '거부'}
                            </span>
                          </div>
                          <div className="text-xs text-gray-500 mt-0.5">
                            {new Intl.DateTimeFormat('ko-KR', {
                              hour: '2-digit',
                              minute: '2-digit',
                            }).format(log.timestamp)}
                          </div>
                        </div>
                        {log.confidence !== undefined && (
                          <div className="text-sm font-bold text-gray-900 ml-3">
                            {(log.confidence * 100).toFixed(0)}%
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                  {useUserStore.getState().accessLogs.length === 0 && (
                    <div className="text-center py-6 text-gray-400 text-sm">
                      출입 기록이 없습니다
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* 하단 컨트롤 - 큰 터치 영역 */}
            <div className="px-4 pb-4 space-y-2 flex-shrink-0">
              {/* 수동 인증 버튼 - 매우 크게 */}
              <PrimaryButton
                onClick={handleManualAuth}
                disabled={!isCameraOn || isAuthenticating}
                variant="blue"
                className="w-full py-4 text-lg font-bold"
                icon={
                  isAuthenticating ? (
                    <svg className="animate-spin h-7 w-7 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                  ) : (
                    <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )
                }
              >
                {isAuthenticating ? '인증 중...' : '수동 인증'}
              </PrimaryButton>

              {/* 설정 패널 */}
              <div className="bg-gray-50 rounded-2xl p-3 border border-gray-200 space-y-2">
                {/* 해상도 */}
                <div>
                  <label className="block text-gray-700 text-xs font-semibold uppercase tracking-wider mb-2">해상도</label>
                  <select
                    value={resolution}
                    onChange={(e) => handleResolutionChange(e.target.value as Resolution)}
                    className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-gray-900 font-medium focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  >
                    <option value="hd">1280x720 (HD)</option>
                    <option value="fhd">1920x1080 (FHD)</option>
                    <option value="qhd">2560x1440 (QHD)</option>
                  </select>
                </div>

                {/* 방향 */}
                <div>
                  <label className="block text-gray-700 text-xs font-semibold uppercase tracking-wider mb-2">화면 방향</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => handleOrientationChange('landscape')}
                      className="px-4 py-3 rounded-xl border-2 border-gray-200 bg-white text-gray-700 font-semibold transition-all hover:border-gray-300 cursor-pointer"
                    >
                      가로
                    </button>
                    <button
                      onClick={() => handleOrientationChange('portrait')}
                      className="px-4 py-3 rounded-xl border-2 border-blue-500 bg-blue-500 text-white font-semibold transition-all cursor-pointer"
                    >
                      세로
                    </button>
                  </div>
                </div>

                {/* 카메라 토글 */}
                <PrimaryButton
                  onClick={handleCameraToggle}
                  variant={isCameraOn ? 'red' : 'green'}
                  className="w-full py-3"
                  icon={
                    isCameraOn ? (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 10a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z" />
                      </svg>
                    ) : (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                    )
                  }
                >
                  {isCameraOn ? '카메라 끄기' : '카메라 켜기'}
                </PrimaryButton>
              </div>
            </div>
          </div>
        ) : (
          /* 가로 모드 - 기존 3단 레이아웃 */
          <div className="flex h-full overflow-hidden">

        {/* 좌측 사이드바 - 통계 & 빠른 액션 */}
        <aside className="w-80 bg-white border-r border-gray-200 flex flex-col overflow-hidden">
          {/* 헤더 */}
          <div className="p-6 border-b border-gray-100 flex-shrink-0">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className="text-xl font-bold text-gray-900 tracking-tight">
                  관리 대시보드
                </h1>
                <p className="text-xs text-gray-500 mt-0.5">
                  Access Control System
                </p>
              </div>
              <IconButton
                onClick={() => router.push('/')}
                icon={
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                  </svg>
                }
                className="bg-gray-50 hover:bg-gray-100 border-0 shadow-none text-gray-700"
              />
            </div>

            {/* 시스템 상태 */}
            <StatusBadge
              status={modelStatus === 'loaded' ? 'ready' : modelStatus === 'loading' ? 'loading' : 'error'}
            />
          </div>

          {/* 오늘의 통계 */}
          <div className="p-6 space-y-4 flex-shrink-0">
              <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">오늘의 활동</h2>

              <div className="grid grid-cols-2 gap-3">
              {/* 승인 카운터 */}
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-4 border border-green-100">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-8 h-8 rounded-lg bg-green-500 flex items-center justify-center">
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                </div>
                <div className="text-3xl font-bold text-green-700">{todaySuccessCount}</div>
                <div className="text-xs text-green-600 font-medium mt-1">출입 승인</div>
              </div>

              {/* 거부 카운터 */}
              <div className="bg-gradient-to-br from-red-50 to-rose-50 rounded-2xl p-4 border border-red-100">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-8 h-8 rounded-lg bg-red-500 flex items-center justify-center">
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </div>
                </div>
                <div className="text-3xl font-bold text-red-700">{todayFailCount}</div>
                <div className="text-xs text-red-600 font-medium mt-1">출입 거부</div>
              </div>
            </div>

            {/* 등록 사용자 수 */}
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-4 border border-blue-100">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold text-blue-700">{users.length}명</div>
                  <div className="text-xs text-blue-600 font-medium mt-1">등록된 사용자</div>
                </div>
                <div className="w-12 h-12 rounded-xl bg-blue-500 flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          {/* 사용자 관리 - 축약 버전 */}
          <div className="flex-1 p-6 pt-0 overflow-y-auto min-h-0">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">등록 사용자</h2>
              <button
                onClick={handleAddUser}
                className="w-8 h-8 rounded-lg bg-blue-500 hover:bg-blue-600 flex items-center justify-center text-white transition-colors cursor-pointer"
                title="사용자 추가"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              </button>
            </div>
            <div className="space-y-2">
              {users.map((user) => (
                <div key={user.id} className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-50 transition-colors group">
                  {user.imageData ? (
                    <img src={user.imageData} alt={user.name} className="w-10 h-10 rounded-lg object-cover border border-gray-200 flex-shrink-0" />
                  ) : (
                    <div className="w-10 h-10 rounded-lg bg-gray-100 border border-gray-200 flex items-center justify-center flex-shrink-0">
                      <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-gray-900 truncate">{user.name}</div>
                    <div className="text-xs text-gray-500">
                      {new Intl.DateTimeFormat('ko-KR', { month: 'short', day: 'numeric' }).format(user.registeredAt)}
                    </div>
                  </div>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => handleEditUser(user)}
                      className="w-7 h-7 rounded-md bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-600 transition-colors cursor-pointer"
                      title="수정"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>
                    <button
                      onClick={() => handleDeleteUser(user.id)}
                      className="w-7 h-7 rounded-md bg-red-100 hover:bg-red-200 flex items-center justify-center text-red-600 transition-colors cursor-pointer"
                      title="삭제"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
              ))}
              {users.length === 0 && (
                <div className="text-center py-8 text-gray-400 text-sm">
                  등록된 사용자가 없습니다
                </div>
              )}
            </div>
          </div>
        </aside>

        {/* 중앙 메인 영역 - 카메라 & 최근 기록 */}
        <main className="flex-1 overflow-y-auto min-w-0">
          <div className={`${resolution === 'hd' ? 'p-3 space-y-3' : 'p-6 space-y-6'} h-full flex flex-col`}>
            {/* 라이브 카메라 */}
            <div className="bg-black rounded-3xl overflow-hidden shadow-sm border border-gray-200 min-h-0" style={{ flex: '65' }}>
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

            {/* 최근 출입 기록 */}
            <div className="min-h-0" style={{ flex: '35' }}>
              <AccessLogTimeline resolution={resolution} />
            </div>
          </div>
        </main>

        {/* 우측 패널 - 카메라 컨트롤 */}
        <aside className="w-80 bg-white overflow-y-auto border-l border-gray-200 flex-shrink-0">
          <div className="p-6">
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
        </aside>
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
          onSave={handleSaveUser}
          onClose={() => {
            setShowUserModal(false);
            setEditingUser(undefined);
          }}
        />
      )}
    </div>
  );
}
