import { CameraView } from '@/widgets/camera-view';
import { IconButton } from '@/shared/ui';
import { RESOLUTION_LABELS } from '@/shared/types';
import type { DashboardLayoutProps } from './types';

/**
 * Dashboard 가로 모드 레이아웃
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
                <div className="text-xs text-blue-700 font-bold">{usersCount}</div>
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
              onClick={onNavigateHome}
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
              onVideoReady={onVideoReady}
              onVideoStop={onVideoStop}
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

              {/* 설정 그리드 */}
              <div className="grid grid-cols-2 gap-2">
                {/* 해상도 */}
                <div className="col-span-2">
                  <label className="block text-[10px] text-gray-700 font-semibold mb-1.5">
                    해상도
                  </label>
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
                <button
                  onClick={() => onOrientationChange('landscape')}
                  className="px-3 py-2 rounded-lg border border-blue-500 bg-blue-500 text-white text-xs font-semibold transition-all cursor-pointer"
                >
                  가로
                </button>
                <button
                  onClick={() => onOrientationChange('portrait')}
                  className="px-3 py-2 rounded-lg border border-gray-300 bg-white text-gray-600 hover:bg-gray-50 text-xs font-semibold transition-all cursor-pointer"
                >
                  세로
                </button>
              </div>

              {/* 카메라 토글 */}
              <button
                onClick={onCameraToggle}
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
                onClick={onAddUser}
                className="w-full py-3 rounded-lg bg-gray-100 text-gray-700 border border-gray-200 font-semibold text-xs hover:bg-gray-200 transition-all cursor-pointer"
              >
                + 사용자 추가
              </button>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
