'use client';

import { useUserStore } from '@/entities/user';
import { EmptyState } from '@/shared/ui';
import type { Resolution } from '@/shared/types';

interface AccessLogTimelineProps {
  resolution?: Resolution;
}

export function AccessLogTimeline({ resolution = 'fhd' }: AccessLogTimelineProps) {
  const { accessLogs } = useUserStore();
  const isHD = resolution === 'hd';

  const formatTime = (date: Date) => {
    return new Intl.DateTimeFormat('ko-KR', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    }).format(date);
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('ko-KR', {
      month: 'short',
      day: 'numeric',
    }).format(date);
  };

  return (
    <div className="bg-white rounded-3xl overflow-hidden shadow-sm border border-gray-200 h-full flex flex-col">
      <div className={`${isHD ? 'p-3' : 'p-5'} border-b border-gray-100 flex-shrink-0`}>
        <div className="flex items-center justify-between">
          <h2 className={`${isHD ? 'text-base' : 'text-lg'} font-semibold text-gray-900`}>최근 출입 기록</h2>
          <span className={`${isHD ? 'text-[10px] px-1.5 py-0.5' : 'text-xs px-2.5 py-1'} bg-blue-50 text-blue-600 rounded-full font-semibold`}>
            {accessLogs.length}건
          </span>
        </div>
      </div>

      <div className={`${isHD ? 'p-3' : 'p-5'} flex-1 overflow-y-auto min-h-0`}>
        {accessLogs.length === 0 ? (
          <EmptyState
            icon={
              <svg
                className="w-full h-full"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                />
              </svg>
            }
            title="출입 기록이 없습니다"
            className="py-12 text-gray-400 text-lg"
          />
        ) : (
          <div className={`${isHD ? 'space-y-1.5' : 'space-y-2'}`}>
            {accessLogs.map((log) => (
              <div
                key={log.id}
                className={`${isHD ? 'p-2' : 'p-3.5'} rounded-xl border-l-[3px] transition-all ${
                  log.status === 'success'
                    ? 'bg-green-50 border-green-500 hover:bg-green-100'
                    : log.status === 'failed'
                    ? 'bg-red-50 border-red-500 hover:bg-red-100'
                    : 'bg-yellow-50 border-yellow-500 hover:bg-yellow-100'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className={`flex items-center gap-2 ${isHD ? 'mb-0.5' : 'mb-1'}`}>
                      <span className={`font-semibold text-gray-900 ${isHD ? 'text-sm' : 'text-base'}`}>
                        {log.userName || '미확인 사용자'}
                      </span>
                      <span
                        className={`${isHD ? 'px-1.5 py-0' : 'px-2 py-0.5'} rounded-md text-[10px] font-bold uppercase ${
                          log.status === 'success'
                            ? 'bg-green-500 text-white'
                            : log.status === 'failed'
                            ? 'bg-red-500 text-white'
                            : 'bg-yellow-500 text-white'
                        }`}
                      >
                        {log.status === 'success' ? '승인' : log.status === 'failed' ? '거부' : '?'}
                      </span>
                    </div>
                    <div className={`${isHD ? 'text-[10px]' : 'text-xs'} text-gray-500 font-medium`}>
                      {formatDate(log.timestamp)} {formatTime(log.timestamp)}
                    </div>
                  </div>
                  {log.confidence !== undefined && (
                    <div className={`text-right ${isHD ? 'ml-2' : 'ml-4'}`}>
                      <div className={`${isHD ? 'text-base' : 'text-lg'} font-bold text-gray-900`}>
                        {(log.confidence * 100).toFixed(1)}%
                      </div>
                      <div className="text-[10px] text-gray-500 font-medium">일치율</div>
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
