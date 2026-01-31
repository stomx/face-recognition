import type { Resolution, Orientation } from '@/shared/types';
import { RESOLUTION_LABELS } from '@/shared/types';

interface ControlSectionProps {
  // 인증
  isAuthenticating: boolean;
  onManualAuth: () => void;
  isCameraOn: boolean;

  // 카메라 설정
  resolution: Resolution;
  orientation: Orientation;
  onResolutionChange: (resolution: Resolution) => void;
  onOrientationChange: (orientation: Orientation) => void;
  onCameraToggle: () => void;

  // 사용자 관리
  onAddUser: () => void;
}

/**
 * Dashboard 컨트롤 섹션 (SRP 적용)
 *
 * 책임: 컨트롤 패널 렌더링
 * - 수동 인증 버튼
 * - 카메라 설정 (해상도, 방향, 토글)
 * - 사용자 추가 버튼
 */
export function ControlSection({
  isAuthenticating,
  onManualAuth,
  isCameraOn,
  resolution,
  orientation,
  onResolutionChange,
  onOrientationChange,
  onCameraToggle,
  onAddUser,
}: ControlSectionProps) {
  return (
    <div className="bg-gradient-to-b from-white to-gray-50 border-t border-gray-200 p-4 hd-l:p-5 fhd-l:p-6 qhd-l:p-8 flex-shrink-0 shadow-inner">
      <div className="max-w-7xl mx-auto space-y-4 hd-l:space-y-5 fhd-l:space-y-6 qhd-l:space-y-8">
        {/* 주요 액션: 수동 인증 */}
        <button
          onClick={onManualAuth}
          disabled={!isCameraOn || isAuthenticating}
          className={`w-full py-4 hd-l:py-5 fhd-l:py-6 qhd-l:py-7 rounded-2xl font-bold text-sm hd-l:text-base fhd-l:text-lg qhd-l:text-xl transition-all transform hover:scale-[1.02] active:scale-[0.98] ${
            !isCameraOn || isAuthenticating
              ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
              : 'bg-gradient-to-r from-blue-600 via-blue-500 to-blue-600 text-white hover:shadow-2xl hover:shadow-blue-500/50 cursor-pointer'
          }`}
        >
          {isAuthenticating ? (
            <div className="flex items-center justify-center gap-2 hd-l:gap-3 fhd-l:gap-3 qhd-l:gap-4">
              <svg className="animate-spin h-5 w-5 hd-l:h-6 hd-l:w-6 fhd-l:h-7 fhd-l:w-7 qhd-l:h-8 qhd-l:w-8" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              <span>인증 처리 중...</span>
            </div>
          ) : (
            <div className="flex items-center justify-center gap-2 hd-l:gap-3 fhd-l:gap-3 qhd-l:gap-4">
              <svg className="h-5 w-5 hd-l:h-6 hd-l:w-6 fhd-l:h-7 fhd-l:w-7 qhd-l:h-8 qhd-l:w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
              <span>얼굴 인증 시작</span>
            </div>
          )}
        </button>

        {/* 설정 그룹 */}
        <div className="grid grid-cols-3 gap-3 hd-l:gap-4 fhd-l:gap-5 qhd-l:gap-6">
          {/* 해상도 선택 */}
          <div className="bg-white rounded-xl border-2 border-gray-200 p-3 hd-l:p-4 fhd-l:p-4 qhd-l:p-5 hover:border-blue-300 transition-all">
            <label className="block text-[10px] hd-l:text-xs fhd-l:text-xs qhd-l:text-sm text-gray-600 font-bold mb-2 hd-l:mb-2.5 fhd-l:mb-3 qhd-l:mb-3 uppercase tracking-wide">
              해상도
            </label>
            <select
              value={resolution}
              onChange={(e) => onResolutionChange(e.target.value as Resolution)}
              className="w-full px-3 py-2 hd-l:px-3.5 hd-l:py-2.5 fhd-l:px-4 fhd-l:py-3 qhd-l:px-5 qhd-l:py-3.5 bg-gray-50 border-2 border-gray-200 rounded-lg text-gray-900 text-xs hd-l:text-sm fhd-l:text-sm qhd-l:text-base font-bold focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all cursor-pointer"
            >
              <option value="hd">{RESOLUTION_LABELS.hd}</option>
              <option value="fhd">{RESOLUTION_LABELS.fhd}</option>
              <option value="qhd">{RESOLUTION_LABELS.qhd}</option>
            </select>
          </div>

          {/* 방향 선택 */}
          <div className="bg-white rounded-xl border-2 border-gray-200 p-3 hd-l:p-4 fhd-l:p-4 qhd-l:p-5">
            <label className="block text-[10px] hd-l:text-xs fhd-l:text-xs qhd-l:text-sm text-gray-600 font-bold mb-2 hd-l:mb-2.5 fhd-l:mb-3 qhd-l:mb-3 uppercase tracking-wide">
              화면 방향
            </label>
            <div className="grid grid-cols-2 gap-1.5 hd-l:gap-2 fhd-l:gap-2 qhd-l:gap-2.5">
              <button
                onClick={() => onOrientationChange('landscape')}
                className={`px-2 py-2 hd-l:py-2.5 fhd-l:py-3 qhd-l:py-3.5 rounded-lg text-[10px] hd-l:text-xs fhd-l:text-xs qhd-l:text-sm font-bold transition-all cursor-pointer ${
                  orientation === 'landscape'
                    ? 'bg-blue-500 text-white shadow-md'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                가로
              </button>
              <button
                onClick={() => onOrientationChange('portrait')}
                className={`px-2 py-2 hd-l:py-2.5 fhd-l:py-3 qhd-l:py-3.5 rounded-lg text-[10px] hd-l:text-xs fhd-l:text-xs qhd-l:text-sm font-bold transition-all cursor-pointer ${
                  orientation === 'portrait'
                    ? 'bg-blue-500 text-white shadow-md'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                세로
              </button>
            </div>
          </div>

          {/* 카메라 토글 */}
          <div className="bg-white rounded-xl border-2 border-gray-200 p-3 hd-l:p-4 fhd-l:p-4 qhd-l:p-5">
            <label className="block text-[10px] hd-l:text-xs fhd-l:text-xs qhd-l:text-sm text-gray-600 font-bold mb-2 hd-l:mb-2.5 fhd-l:mb-3 qhd-l:mb-3 uppercase tracking-wide">
              카메라
            </label>
            <button
              onClick={onCameraToggle}
              className={`w-full px-3 py-2 hd-l:py-2.5 fhd-l:py-3 qhd-l:py-3.5 rounded-lg text-xs hd-l:text-sm fhd-l:text-sm qhd-l:text-base font-bold transition-all cursor-pointer flex items-center justify-center gap-2 ${
                isCameraOn
                  ? 'bg-red-500 text-white hover:bg-red-600 shadow-md'
                  : 'bg-green-500 text-white hover:bg-green-600 shadow-md'
              }`}
            >
              <svg className="w-4 h-4 hd-l:w-5 hd-l:h-5 fhd-l:w-5 fhd-l:h-5 qhd-l:w-6 qhd-l:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {isCameraOn ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                )}
              </svg>
              {isCameraOn ? 'OFF' : 'ON'}
            </button>
          </div>

          {/* 사용자 추가 */}
          <button
            onClick={onAddUser}
            className="col-span-3 bg-gradient-to-r from-gray-800 to-gray-700 text-white rounded-xl px-4 py-3 hd-l:py-3.5 fhd-l:py-4 qhd-l:py-5 text-xs hd-l:text-sm fhd-l:text-base qhd-l:text-lg font-bold hover:from-gray-700 hover:to-gray-600 transition-all cursor-pointer flex items-center justify-center gap-2 hd-l:gap-3 fhd-l:gap-3 qhd-l:gap-4 shadow-lg hover:shadow-xl"
          >
            <svg className="w-4 h-4 hd-l:w-5 hd-l:h-5 fhd-l:w-6 fhd-l:h-6 qhd-l:w-7 qhd-l:h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
            </svg>
            <span>새 사용자 등록</span>
          </button>
        </div>
      </div>
    </div>
  );
}
