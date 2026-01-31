import type { AccessLog } from '@/shared/types';

interface AccessLogSectionProps {
  accessLogs: AccessLog[];
}

/**
 * Dashboard 출입 기록 섹션 (SRP 적용)
 *
 * 책임: 출입 기록 타임라인 렌더링
 */
export function AccessLogSection({ accessLogs }: AccessLogSectionProps) {
  const recentLogs = accessLogs.slice(0, 10);

  return (
    <div className="flex-1 overflow-hidden flex flex-col bg-gray-50 border-t border-gray-200">
      <div className="p-4 border-b border-gray-200 bg-white flex-shrink-0">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-gray-900">출입 기록</h2>
          <span className="text-xs text-gray-500">{accessLogs.length}건</span>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto p-4">
        {recentLogs.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-400">
            <svg className="w-12 h-12 mb-2 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            <p className="text-xs">아직 출입 기록이 없습니다</p>
          </div>
        ) : (
          <div className="space-y-2">
            {recentLogs.map((log, idx) => (
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
  );
}
