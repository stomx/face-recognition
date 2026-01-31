import { CameraView } from '@/widgets/camera-view';
import { IconButton } from '@/shared/ui';
import type { DashboardLayoutProps } from './types';
import { AccessLogSection, ControlSection } from '../components';

/**
 * Dashboard 세로 모드 레이아웃 (SRP 리팩터링 완료)
 *
 * 책임: 세로 모드 레이아웃 구성
 * - 컴포넌트 조합만 담당
 *
 * 이전: 232줄
 * 현재: ~120줄 (레이아웃 구성만)
 */
export function PortraitLayout({
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

  const { modelStatus, onNavigateHome } = system;

  const { accessLogs } = data;

  return (
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
          onClick={onNavigateHome}
          icon={
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
          }
        />
      </div>

      {/* 시스템 상태 & 통계 */}
      <div className="px-4 py-2 bg-gray-50 border-b border-gray-200 flex items-center justify-between">
        <div className="flex items-center gap-2 px-2 py-1 rounded-lg bg-white border border-gray-200">
          <div className={`w-2 h-2 rounded-full ${modelStatus === 'loaded' ? 'bg-green-500 animate-pulse' : 'bg-yellow-500'}`} />
          <span className="text-xs font-semibold text-gray-700">
            {modelStatus === 'loaded' ? '시스템 준비' : '로딩 중...'}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-green-50 border border-green-200">
            <svg className="w-3 h-3 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
            </svg>
            <span className="text-xs text-green-700 font-bold">{todaySuccessCount}</span>
          </div>
          <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-red-50 border border-red-200">
            <svg className="w-3 h-3 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
            </svg>
            <span className="text-xs text-red-700 font-bold">{todayFailCount}</span>
          </div>
          <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-blue-50 border border-blue-200">
            <svg className="w-3 h-3 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
            <span className="text-xs text-blue-700 font-bold">{usersCount}</span>
          </div>
        </div>
      </div>

      {/* 메인 콘텐츠 */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* 카메라 */}
        <div className="flex-shrink-0 bg-gray-900 p-3">
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

        {/* 출입 기록 (SRP 적용) */}
        <AccessLogSection accessLogs={accessLogs} />
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
        onAddUser={system.onAddUser}
      />

      {/* 애니메이션 */}
      <style jsx>{`
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}
