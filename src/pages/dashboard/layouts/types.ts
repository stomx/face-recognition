import type { Resolution, Orientation, User } from '@/shared/types';

/**
 * Dashboard 레이아웃 공통 Props
 */
export interface DashboardLayoutProps {
  // 카메라
  resolution: Resolution;
  orientation: Orientation;
  isCameraOn: boolean;
  onVideoReady: (video: HTMLVideoElement, canvas: HTMLCanvasElement) => void;
  onVideoStop: () => void;
  onCameraToggle: () => void;
  onResolutionChange: (resolution: Resolution) => void;
  onOrientationChange: (orientation: Orientation) => void;

  // 인증
  isAuthenticating: boolean;
  onManualAuth: () => void;

  // 통계
  usersCount: number;
  todaySuccessCount: number;
  todayFailCount: number;

  // 시스템
  modelStatus: 'idle' | 'loading' | 'loaded' | 'error';

  // 사용자 관리
  onAddUser: () => void;
  onNavigateHome: () => void;

  // 출입 기록
  accessLogs: Array<{
    id: string;
    userId: string | null;
    userName: string | null;
    timestamp: Date;
    status: 'success' | 'failed' | 'unknown';
    confidence?: number;
  }>;
}
