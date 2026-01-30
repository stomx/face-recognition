'use client';

import { useState, useEffect } from 'react';
import { PrimaryButton } from '@/shared/ui';

type Resolution = 'hd' | 'fhd' | 'qhd';
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
  const [availableResolutions, setAvailableResolutions] = useState<Resolution[]>(['hd', 'fhd', 'qhd']);

  useEffect(() => {
    const screenWidth = window.screen.width;
    const screenHeight = window.screen.height;
    const maxResolution = Math.max(screenWidth, screenHeight);

    const resolutions: Resolution[] = [];
    if (maxResolution >= 1280) resolutions.push('hd');
    if (maxResolution >= 1920) resolutions.push('fhd');
    if (maxResolution >= 2560) resolutions.push('qhd');

    setAvailableResolutions(resolutions);
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-4">카메라 컨트롤</h2>
      </div>
      <div className="space-y-5">
        {/* 수동 인증 버튼 */}
        <PrimaryButton
          onClick={onManualAuth}
          disabled={!isCameraOn || isAuthenticating}
          variant="blue"
          size="lg"
          className="w-full"
          icon={
            isAuthenticating ? (
              <svg className="animate-spin h-6 w-6 text-white" fill="none" viewBox="0 0 24 24">
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
            ) : (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            )
          }
        >
          {isAuthenticating ? '인증 중...' : '수동 인증'}
        </PrimaryButton>

        {/* 해상도 선택 */}
        <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100">
          <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-3">
            해상도
          </label>
          <select
            value={resolution}
            onChange={(e) => onResolutionChange(e.target.value as Resolution)}
            className="w-full px-3 py-2.5 bg-white border border-gray-200 rounded-lg text-sm text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all font-medium"
          >
            {availableResolutions.map((res) => (
              <option key={res} value={res} className="bg-white">
                {res === 'hd' && '1280x720 (HD)'}
                {res === 'fhd' && '1920x1080 (FHD)'}
                {res === 'qhd' && '2560x1440 (QHD)'}
              </option>
            ))}
          </select>
        </div>

        {/* 방향 전환 */}
        <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100">
          <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-3">
            화면 방향
          </label>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => onOrientationChange('landscape')}
              className={`px-3 py-2.5 rounded-lg border-2 transition-all cursor-pointer ${
                orientation === 'landscape'
                  ? 'border-blue-500 bg-blue-500 text-white'
                  : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
              }`}
            >
              <svg
                className="w-5 h-5 mx-auto mb-1"
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
              <span className="text-xs font-semibold">가로</span>
            </button>
            <button
              onClick={() => onOrientationChange('portrait')}
              className={`px-3 py-2.5 rounded-lg border-2 transition-all cursor-pointer ${
                orientation === 'portrait'
                  ? 'border-blue-500 bg-blue-500 text-white'
                  : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
              }`}
            >
              <svg
                className="w-5 h-5 mx-auto mb-1"
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
              <span className="text-xs font-semibold">세로</span>
            </button>
          </div>
        </div>

        {/* 카메라 토글 */}
        <PrimaryButton
          onClick={onCameraToggle}
          variant={isCameraOn ? 'red' : 'green'}
          size="lg"
          className="w-full"
          icon={
            isCameraOn ? (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
            ) : (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                />
              </svg>
            )
          }
        >
          {isCameraOn ? '카메라 끄기' : '카메라 켜기'}
        </PrimaryButton>
      </div>
    </div>
  );
}
