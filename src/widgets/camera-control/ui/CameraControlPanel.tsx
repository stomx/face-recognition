'use client';

import { useState, useEffect } from 'react';

type Resolution = '480p' | '720p' | '1080p';
type Orientation = 'landscape' | 'portrait';

interface CameraControlPanelProps {
  resolution: Resolution;
  orientation: Orientation;
  isCameraOn: boolean;
  onResolutionChange: (resolution: Resolution) => void;
  onOrientationChange: (orientation: Orientation) => void;
  onCameraToggle: () => void;
  onManualAuth: () => void;
  isAuthenticating?: boolean;
}

export function CameraControlPanel({
  resolution,
  orientation,
  isCameraOn,
  onResolutionChange,
  onOrientationChange,
  onCameraToggle,
  onManualAuth,
  isAuthenticating = false,
}: CameraControlPanelProps) {
  const [availableResolutions, setAvailableResolutions] = useState<Resolution[]>(['480p', '720p', '1080p']);

  useEffect(() => {
    const screenWidth = window.screen.width;
    const screenHeight = window.screen.height;
    const maxResolution = Math.max(screenWidth, screenHeight);

    const resolutions: Resolution[] = [];
    if (maxResolution >= 640) resolutions.push('480p');
    if (maxResolution >= 1280) resolutions.push('720p');
    if (maxResolution >= 1920) resolutions.push('1080p');

    setAvailableResolutions(resolutions);
  }, []);

  return (
    <div className="bg-black/40 backdrop-blur-md rounded-3xl overflow-hidden shadow-2xl border border-white/10">
      <div className="p-4 border-b border-white/10">
        <h2 className="text-lg font-semibold text-white">카메라 컨트롤</h2>
      </div>
      <div className="p-6 space-y-5">
        {/* 수동 인증 버튼 */}
        <button
          onClick={onManualAuth}
          disabled={!isCameraOn || isAuthenticating}
          className={`w-full px-6 py-4 rounded-2xl font-semibold text-lg transition-all shadow-lg ${
            isAuthenticating
              ? 'bg-blue-600/50 text-white cursor-wait'
              : isCameraOn
              ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-500/20 hover:shadow-blue-500/40 active:scale-[0.98]'
              : 'bg-gray-800 text-gray-500 cursor-not-allowed'
          }`}
        >
          {isAuthenticating ? (
            <span className="flex items-center justify-center gap-3">
              <svg
                className="animate-spin h-6 w-6 text-white"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
              인증 중...
            </span>
          ) : (
            <span className="flex items-center justify-center gap-3">
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              수동 인증
            </span>
          )}
        </button>

        {/* 해상도 선택 */}
        <div>
          <label className="block text-sm font-medium text-gray-400 mb-3">
            해상도
          </label>
          <select
            value={resolution}
            onChange={(e) => onResolutionChange(e.target.value as Resolution)}
            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
          >
            {availableResolutions.map((res) => (
              <option key={res} value={res} className="bg-gray-900">
                {res === '480p' && '640x480 (480p)'}
                {res === '720p' && '1280x720 (720p)'}
                {res === '1080p' && '1920x1080 (1080p)'}
              </option>
            ))}
          </select>
        </div>

        {/* 방향 전환 */}
        <div>
          <label className="block text-sm font-medium text-gray-400 mb-3">
            방향
          </label>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => onOrientationChange('landscape')}
              className={`px-4 py-3 rounded-xl border-2 transition-all ${
                orientation === 'landscape'
                  ? 'border-blue-500 bg-blue-500/20 text-blue-400'
                  : 'border-white/10 bg-white/5 text-gray-400 hover:border-white/20'
              }`}
            >
              <svg
                className="w-6 h-6 mx-auto mb-1"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 18h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                  transform="rotate(90 12 12)"
                />
              </svg>
              <span className="text-sm font-medium">가로</span>
            </button>
            <button
              onClick={() => onOrientationChange('portrait')}
              className={`px-4 py-3 rounded-xl border-2 transition-all ${
                orientation === 'portrait'
                  ? 'border-blue-500 bg-blue-500/20 text-blue-400'
                  : 'border-white/10 bg-white/5 text-gray-400 hover:border-white/20'
              }`}
            >
              <svg
                className="w-6 h-6 mx-auto mb-1"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z"
                />
              </svg>
              <span className="text-sm font-medium">세로</span>
            </button>
          </div>
        </div>

        {/* 카메라 토글 */}
        <button
          onClick={onCameraToggle}
          className={`w-full px-6 py-4 rounded-2xl font-semibold transition-all shadow-lg flex items-center justify-center gap-3 ${
            isCameraOn
              ? 'bg-red-600 hover:bg-red-700 text-white shadow-red-500/20 hover:shadow-red-500/40'
              : 'bg-green-600 hover:bg-green-700 text-white shadow-green-500/20 hover:shadow-green-500/40'
          }`}
        >
          {isCameraOn ? (
            <>
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 10a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z"
                />
              </svg>
              카메라 끄기
            </>
          ) : (
            <>
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                />
              </svg>
              카메라 켜기
            </>
          )}
        </button>
      </div>
    </div>
  );
}
