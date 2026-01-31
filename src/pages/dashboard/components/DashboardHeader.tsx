import { IconButton } from '@/shared/ui';

interface DashboardHeaderProps {
  modelStatus: 'idle' | 'loading' | 'loaded' | 'error';
  usersCount: number;
  todaySuccessCount: number;
  todayFailCount: number;
  onNavigateHome: () => void;
}

/**
 * Dashboard 헤더 섹션 (SRP 적용)
 *
 * 책임: 헤더바 렌더링
 * - 로고 및 시스템 상태
 * - 실시간 통계 표시
 * - 시간 표시 및 네비게이션
 */
export function DashboardHeader({
  modelStatus,
  usersCount,
  todaySuccessCount,
  todayFailCount,
  onNavigateHome,
}: DashboardHeaderProps) {
  return (
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
          />
        </div>
      </div>
    </header>
  );
}
