import { IconButton } from '@/shared/ui';
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
              onChange={(e) => onResolutionChange(e.target.value as Resolution)}
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
            className={`px-3 py-2 rounded-lg border text-xs font-semibold transition-all cursor-pointer ${
              orientation === 'landscape'
                ? 'border-blue-500 bg-blue-500 text-white'
                : 'border-gray-300 bg-white text-gray-600 hover:bg-gray-50'
            }`}
          >
            가로
          </button>
          <button
            onClick={() => onOrientationChange('portrait')}
            className={`px-3 py-2 rounded-lg border text-xs font-semibold transition-all cursor-pointer ${
              orientation === 'portrait'
                ? 'border-blue-500 bg-blue-500 text-white'
                : 'border-gray-300 bg-white text-gray-600 hover:bg-gray-50'
            }`}
          >
            세로
          </button>

          {/* 카메라 토글 */}
          <button
            onClick={onCameraToggle}
            className={`col-span-2 px-3 py-2.5 rounded-lg border text-xs font-semibold transition-all cursor-pointer ${
              isCameraOn
                ? 'border-red-500 bg-red-500 text-white hover:bg-red-600'
                : 'border-green-500 bg-green-500 text-white hover:bg-green-600'
            }`}
          >
            {isCameraOn ? '카메라 끄기' : '카메라 켜기'}
          </button>

          {/* 사용자 추가 */}
          <button
            onClick={onAddUser}
            className="col-span-2 px-3 py-2.5 rounded-lg border border-gray-700 bg-gray-700 text-white hover:bg-gray-800 text-xs font-semibold transition-all cursor-pointer flex items-center justify-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
            </svg>
            사용자 추가
          </button>
        </div>
      </div>
    </div>
  );
}
