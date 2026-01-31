'use client';

import { useEffect, useRef, memo } from 'react';
import Link from 'next/link';
import { ModeSelectionGrid, ModeOption } from './ModeSelectionGrid';
import { StatsGrid } from './stats/StatsGrid';
import type { Resolution, Orientation } from '@/shared/types';
import { RESOLUTION_LABELS } from '@/shared/types';

export interface Settings {
  isAutoMode: boolean;
  resolution: Resolution;
  orientation: Orientation;
}

/**
 * ISP (Interface Segregation Principle) 적용
 * 10개 Props → 4개 그룹으로 응집도 향상
 */
export interface SettingsPanelProps {
  modal: {
    isOpen: boolean;
    onClose: () => void;
    variant?: 'modal' | 'panel';
  };
  settings: {
    current: Settings;
    onChange: (settings: Partial<Settings>) => void;
  };
  context: {
    stats: {
      usersCount: number;
      todaySuccessCount: number;
      todayFailCount: number;
    };
    modelStatus: 'idle' | 'loading' | 'loaded' | 'error';
  };
  features?: {
    showAutoMode?: boolean;
    showRegisterLink?: boolean;
    registerPath?: string;
  };
}

export const SettingsPanel = memo(function SettingsPanel({
  modal,
  settings,
  context,
  features,
}: SettingsPanelProps) {
  const settingsTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // 기본값 설정
  const variant = modal.variant ?? 'modal';
  const showAutoMode = features?.showAutoMode ?? true;
  const showRegisterLink = features?.showRegisterLink ?? true;
  const registerPath = features?.registerPath ?? '/register';

  // 모달 variant에서만 10초 자동 닫기
  useEffect(() => {
    if (variant === 'modal' && modal.isOpen) {
      settingsTimeoutRef.current = setTimeout(() => {
        modal.onClose();
      }, 10000);
    }
    return () => {
      if (settingsTimeoutRef.current) {
        clearTimeout(settingsTimeoutRef.current);
      }
    };
  }, [variant, modal]);

  if (!modal.isOpen) return null;

  const modeOptions: ModeOption[] = [
    {
      value: 'manual',
      label: '수동',
      description: '버튼으로 인증',
      icon: (
        <svg className="w-full h-full" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
        </svg>
      ),
    },
    {
      value: 'auto',
      label: '자동',
      description: '연속 인증',
      icon: (
        <svg className="w-full h-full" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
        </svg>
      ),
    },
  ];

  const orientationOptions: ModeOption[] = [
    {
      value: 'landscape',
      label: '가로',
      icon: <></>,
    },
    {
      value: 'portrait',
      label: '세로',
      icon: <></>,
    },
  ];

  const content = (
    <>
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-2xl font-bold text-white">설정</h2>
        {variant === 'modal' && (
          <button
            onClick={modal.onClose}
            className="w-12 h-12 rounded-full bg-gray-800 flex items-center justify-center text-gray-400 hover:text-white hover:bg-gray-700 transition-colors cursor-pointer"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      {showAutoMode && (
        <div className="mb-8">
          <label className="block text-gray-400 text-lg mb-4">인증 모드</label>
          <ModeSelectionGrid
            options={modeOptions}
            value={settings.current.isAutoMode ? 'auto' : 'manual'}
            onChange={(value) => settings.onChange({ isAutoMode: value === 'auto' })}
            disabled={context.stats.usersCount === 0}
          />
        </div>
      )}

      <div className="space-y-6 mb-6">
        {/* 해상도 선택 */}
        <div>
          <label className="block text-gray-400 text-lg mb-4">해상도</label>
          <select
            value={settings.current.resolution}
            onChange={(e) => settings.onChange({ resolution: e.target.value as Resolution })}
            className="w-full px-4 py-3 bg-gray-800 text-white border border-gray-700 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all cursor-pointer"
          >
            <option value="hd">{RESOLUTION_LABELS.hd}</option>
            <option value="fhd">{RESOLUTION_LABELS.fhd}</option>
            <option value="qhd">{RESOLUTION_LABELS.qhd}</option>
          </select>
        </div>

        {/* 방향 선택 */}
        <div>
          <label className="block text-gray-400 text-lg mb-4">화면 방향</label>
          <ModeSelectionGrid
            options={orientationOptions}
            value={settings.current.orientation}
            onChange={(value) => settings.onChange({ orientation: value as Orientation })}
          />
        </div>
      </div>

      <div className="bg-gray-800 rounded-2xl p-6 mb-6">
        <h3 className="text-gray-400 mb-4">오늘의 통계</h3>
        <StatsGrid layout="grid-3">
          <div className="text-center">
            <p className="text-3xl font-bold text-white">{context.stats.usersCount}</p>
            <p className="text-sm text-gray-500">등록 사용자</p>
          </div>
          <div className="text-center">
            <p className="text-3xl font-bold text-green-400">{context.stats.todaySuccessCount}</p>
            <p className="text-sm text-gray-500">승인</p>
          </div>
          <div className="text-center">
            <p className="text-3xl font-bold text-red-400">{context.stats.todayFailCount}</p>
            <p className="text-sm text-gray-500">거부</p>
          </div>
        </StatsGrid>
      </div>

      {showRegisterLink && (
        <Link href={registerPath} className="block">
          <button className="w-full p-5 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl text-xl font-medium transition-colors flex items-center justify-center gap-3 cursor-pointer">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
            </svg>
            사용자 등록
          </button>
        </Link>
      )}
    </>
  );

  if (variant === 'modal') {
    return (
      <div
        className="fixed inset-0 z-40 flex items-center justify-center bg-black/80 backdrop-blur-sm"
        onClick={modal.onClose}
      >
        <div
          className="bg-gray-900 rounded-3xl p-8 max-w-lg w-full mx-4 shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          {content}
        </div>
      </div>
    );
  }

  // Panel variant
  return (
    <div className="bg-gray-50 rounded-2xl p-3 border border-gray-200">
      <div className="bg-white rounded-xl p-6">
        {content}
      </div>
    </div>
  );
});
