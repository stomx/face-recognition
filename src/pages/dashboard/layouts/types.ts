import type { Resolution, Orientation, AccessLog } from '@/shared/types';

/**
 * Dashboard 레이아웃 공통 Props (ISP 원칙 적용)
 * 16개 Props → 5개 그룹으로 응집도 향상
 */
export interface DashboardLayoutProps {
  camera: {
    resolution: Resolution;
    orientation: Orientation;
    isCameraOn: boolean;
    onVideoReady: (video: HTMLVideoElement, canvas: HTMLCanvasElement) => void;
    onVideoStop: () => void;
    onCameraToggle: () => void;
    onResolutionChange: (resolution: Resolution) => void;
    onOrientationChange: (orientation: Orientation) => void;
  };

  authentication: {
    isAuthenticating: boolean;
    onManualAuth: () => void;
  };

  stats: {
    usersCount: number;
    todaySuccessCount: number;
    todayFailCount: number;
  };

  system: {
    modelStatus: 'idle' | 'loading' | 'loaded' | 'error';
    onAddUser: () => void;
    onNavigateHome: () => void;
  };

  data: {
    accessLogs: AccessLog[];
  };
}
