import { CameraView } from '@/widgets/camera-view';
import type { DashboardLayoutProps } from './types';
import { DashboardHeader, AccessLogSection, ControlSection } from '../components';

/**
 * Dashboard 가로 모드 레이아웃 (SRP 리팩터링 완료)
 *
 * 책임: 가로 모드 레이아웃 구성
 * - 컴포넌트 조합만 담당
 *
 * 이전: 307줄 (헤더, 카메라, 컨트롤, 출입기록 모두 포함)
 * 현재: ~80줄 (레이아웃 구성만)
 */
export function LandscapeLayout({
  camera,
  authentication,
  stats,
  system,
  data,
}: DashboardLayoutProps) {
  // Props 그룹 destructuring
  const {
    resolution,
    orientation,
    isCameraOn,
    onVideoReady,
    onVideoStop,
    onCameraToggle,
    onResolutionChange,
    onOrientationChange,
  } = camera;

  const { isAuthenticating, onManualAuth } = authentication;

  const { usersCount, todaySuccessCount, todayFailCount } = stats;

  const { modelStatus, onAddUser, onNavigateHome } = system;

  const { accessLogs } = data;

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* 헤더 섹션 (SRP 적용) */}
      <DashboardHeader
        modelStatus={modelStatus}
        usersCount={usersCount}
        todaySuccessCount={todaySuccessCount}
        todayFailCount={todayFailCount}
        onNavigateHome={onNavigateHome}
      />

      {/* 메인 콘텐츠 */}
      <div className="flex-1 flex overflow-hidden">
        {/* 좌측: 카메라 */}
        <div className="flex-1 bg-gray-900 flex items-center justify-center p-3 hd-l:p-3.5 fhd-l:p-4 qhd-l:p-6">
          <div className="w-full h-full max-w-3xl hd-l:max-w-3xl fhd-l:max-w-4xl qhd-l:max-w-6xl">
            <CameraView
              onVideoReady={onVideoReady}
              onVideoStop={onVideoStop}
              showControls={false}
              autoStart
              fullScreen
              resolution={resolution}
              orientation={orientation}
            />
          </div>
        </div>

        {/* 우측: 출입 기록 */}
        <div className="w-80 hd-l:w-96 fhd-l:w-96 qhd-l:w-[28rem] flex flex-col">
          <AccessLogSection accessLogs={accessLogs} />
        </div>
      </div>

      {/* 컨트롤 섹션 (SRP 적용) */}
      <ControlSection
        isAuthenticating={isAuthenticating}
        onManualAuth={onManualAuth}
        isCameraOn={isCameraOn}
        resolution={resolution}
        orientation={orientation}
        onResolutionChange={onResolutionChange}
        onOrientationChange={onOrientationChange}
        onCameraToggle={onCameraToggle}
        onAddUser={onAddUser}
      />

      {/* 애니메이션 */}
      <style jsx>{`
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateX(20px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
      `}</style>
    </div>
  );
}
