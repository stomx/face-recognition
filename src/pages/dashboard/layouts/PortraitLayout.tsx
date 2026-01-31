import { CameraView } from '@/widgets/camera-view';
import { IconButton } from '@/shared/ui';
import { RESOLUTION_LABELS } from '@/shared/types';
import type { DashboardLayoutProps } from './types';

/**
 * Dashboard 세로 모드 레이아웃
 */
export function PortraitLayout(props: DashboardLayoutProps) {
  const {
    resolution,
    orientation,
    isCameraOn,
    onVideoReady,
    onVideoStop,
    onCameraToggle,
    onResolutionChange,
    onOrientationChange,
    isAuthenticating,
    onManualAuth,
    usersCount,
    todaySuccessCount,
    todayFailCount,
    modelStatus,
    onNavigateHome,
    accessLogs,
  } = props;

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
            <div className="text-xl font-bold text-blue-600">{usersCount}</div>
            <div className="text-[9px] text-blue-600 font-semibold mt-0.5">사용자</div>
          </div>
        </div>
      </div>

      {/* 카메라 영역 */}
      <div className="px-4 py-2 flex-shrink-0">
        <div className="bg-black rounded-2xl overflow-hidden border border-gray-200 shadow-lg aspect-video relative">
          <CameraView
            key={`${resolution}-${orientation}-${isCameraOn}`}
            onVideoReady={onVideoReady}
            onVideoStop={onVideoStop}
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
            {accessLogs.slice(0, 3).map((log) => (
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
            {accessLogs.length === 0 && (
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
          onClick={onManualAuth}
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
              onChange={(e) => onResolutionChange(e.target.value as any)}
              className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 text-xs font-medium focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all cursor-pointer"
            >
              <option value="hd">{RESOLUTION_LABELS.hd}</option>
              <option value="fhd">{RESOLUTION_LABELS.fhd}</option>
              <option value="qhd">{RESOLUTION_LABELS.qhd}</option>
            </select>
          </div>

          {/* 방향 */}
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => onOrientationChange('landscape')}
              className="px-3 py-2 rounded-lg border border-gray-300 bg-white text-gray-600 text-xs font-semibold hover:bg-gray-50 transition-all cursor-pointer"
            >
              가로
            </button>
            <button
              onClick={() => onOrientationChange('portrait')}
              className="px-3 py-2 rounded-lg border border-blue-500 bg-blue-500 text-white text-xs font-semibold transition-all cursor-pointer"
            >
              세로
            </button>
          </div>

          {/* 카메라 토글 */}
          <button
            onClick={onCameraToggle}
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
  );
}
