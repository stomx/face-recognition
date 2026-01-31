'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAccessLogRepository, useHydration } from '@/entities/user';
import { UserFormModal } from '@/widgets/user-management';
import { useFaceDetection } from '@/features/face-detection';
import { ResultOverlay } from '@/shared/ui';
import { RESOLUTION_MAP } from '@/shared/types';
import type { User } from '@/shared/types';

// Hooks
import { useDashboardCamera, useDashboardAuth, useDashboardStats } from './hooks';

// Layouts
import { PortraitLayout, LandscapeLayout } from './layouts';

/**
 * Dashboard 메인 페이지 (리팩터링 완료)
 *
 * 책임: 오케스트레이션만 담당
 * - Hook 조합
 * - Layout 선택
 * - Modal 관리
 *
 * 이전: 676줄 (12개 useState, 6가지 책임)
 * 현재: ~100줄 (오케스트레이션만)
 */
export function DashboardPage() {
  const router = useRouter();
  const accessLogRepo = useAccessLogRepository();
  const { isHydrated, hydrate } = useHydration();
  const { modelStatus, initializeModels } = useFaceDetection();

  // 분리된 Hook들
  const camera = useDashboardCamera();
  const auth = useDashboardAuth(camera.videoRef, camera.canvasRef, modelStatus);
  const stats = useDashboardStats();

  // 사용자 관리 모달
  const [showUserModal, setShowUserModal] = useState(false);
  const [editingUser, setEditingUser] = useState<User | undefined>(undefined);

  // 초기화
  useEffect(() => {
    if (!isHydrated) hydrate();
    initializeModels();
  }, [isHydrated, hydrate, initializeModels]);

  // 사용자 관리 핸들러
  const handleAddUser = () => {
    setEditingUser(undefined);
    setShowUserModal(true);
  };

  const handleUserSaveSuccess = () => {
    setShowUserModal(false);
    setEditingUser(undefined);
  };

  // Layout Props 구성 (ISP 원칙 적용 - 5개 그룹)
  const layoutProps = {
    camera: {
      resolution: camera.resolution,
      orientation: camera.orientation,
      isCameraOn: camera.isCameraOn,
      onVideoReady: camera.handleVideoReady,
      onVideoStop: camera.handleVideoStop,
      onCameraToggle: camera.handleCameraToggle,
      onResolutionChange: camera.handleResolutionChange,
      onOrientationChange: camera.handleOrientationChange,
    },

    authentication: {
      isAuthenticating: auth.isAuthenticating,
      onManualAuth: auth.handleManualAuth,
    },

    stats: {
      usersCount: stats.usersCount,
      todaySuccessCount: stats.todaySuccessCount,
      todayFailCount: stats.todayFailCount,
    },

    system: {
      modelStatus,
      onAddUser: handleAddUser,
      onNavigateHome: () => router.push('/'),
    },

    data: {
      accessLogs: accessLogRepo.getAll(),
    },
  };

  // 디스플레이 크기 계산
  const displaySize = RESOLUTION_MAP[camera.resolution];
  const displayWidth = camera.orientation === 'landscape' ? displaySize.width : displaySize.height;
  const displayHeight = camera.orientation === 'landscape' ? displaySize.height : displaySize.width;

  // Layout 선택 (OCP 원칙)
  const LayoutComponent = camera.orientation === 'portrait' ? PortraitLayout : LandscapeLayout;

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
        {/* 동적 레이아웃 */}
        <LayoutComponent {...layoutProps} />

        {/* 결과 오버레이 */}
        {auth.result && (
          <ResultOverlay
            type={auth.result.type}
            userName={auth.result.userName}
            confidence={auth.result.confidence}
            message={auth.result.message}
            onClose={auth.clearResult}
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
