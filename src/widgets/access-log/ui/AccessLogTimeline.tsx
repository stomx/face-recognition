'use client';

import { useState, useMemo } from 'react';
import { useUserStore } from '@/entities/user';

type StatusFilter = 'all' | 'success' | 'failed';

export function AccessLogTimeline() {
  const { accessLogs } = useUserStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');

  const filteredLogs = useMemo(() => {
    return accessLogs.filter((log) => {
      if (statusFilter !== 'all' && log.status !== statusFilter) {
        return false;
      }

      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const userName = (log.userName || '미확인 사용자').toLowerCase();
        return userName.includes(query);
      }

      return true;
    });
  }, [accessLogs, searchQuery, statusFilter]);

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
    <div className="bg-black/40 backdrop-blur-md rounded-3xl overflow-hidden shadow-2xl border border-white/10">
      <div className="p-5 border-b border-white/10">
        <h2 className="text-lg font-semibold text-white mb-4">출입 기록 타임라인</h2>

        {/* 검색 및 필터 */}
        <div className="space-y-3">
          {/* 검색 입력 */}
          <div className="relative">
            <svg
              className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            <input
              type="text"
              placeholder="사용자명 검색..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            />
          </div>

          {/* 상태 필터 버튼 */}
          <div className="flex gap-2">
            <button
              onClick={() => setStatusFilter('all')}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                statusFilter === 'all'
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20'
                  : 'bg-white/5 text-gray-400 hover:bg-white/10 border border-white/10'
              }`}
            >
              전체
            </button>
            <button
              onClick={() => setStatusFilter('success')}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                statusFilter === 'success'
                  ? 'bg-green-600 text-white shadow-lg shadow-green-500/20'
                  : 'bg-white/5 text-gray-400 hover:bg-white/10 border border-white/10'
              }`}
            >
              성공
            </button>
            <button
              onClick={() => setStatusFilter('failed')}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                statusFilter === 'failed'
                  ? 'bg-red-600 text-white shadow-lg shadow-red-500/20'
                  : 'bg-white/5 text-gray-400 hover:bg-white/10 border border-white/10'
              }`}
            >
              실패
            </button>
          </div>
        </div>
      </div>

      <div className="p-5 max-h-96 overflow-y-auto">
        {filteredLogs.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <svg
              className="w-16 h-16 mx-auto mb-4 opacity-30"
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
            <p className="text-lg">
              {searchQuery || statusFilter !== 'all'
                ? '검색 결과가 없습니다'
                : '출입 기록이 없습니다'}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredLogs.map((log) => (
              <div
                key={log.id}
                className={`p-4 rounded-2xl border-l-4 transition-all ${
                  log.status === 'success'
                    ? 'bg-green-500/10 border-green-500 hover:bg-green-500/15'
                    : log.status === 'failed'
                    ? 'bg-red-500/10 border-red-500 hover:bg-red-500/15'
                    : 'bg-yellow-500/10 border-yellow-500 hover:bg-yellow-500/15'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="font-semibold text-white text-lg">
                        {log.userName || '미확인 사용자'}
                      </span>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${
                          log.status === 'success'
                            ? 'bg-green-500/20 text-green-400'
                            : log.status === 'failed'
                            ? 'bg-red-500/20 text-red-400'
                            : 'bg-yellow-500/20 text-yellow-400'
                        }`}
                      >
                        {log.status === 'success' ? '인증 성공' : log.status === 'failed' ? '인증 실패' : '알 수 없음'}
                      </span>
                    </div>
                    <div className="text-sm text-gray-400">
                      {formatDate(log.timestamp)} {formatTime(log.timestamp)}
                    </div>
                  </div>
                  {log.confidence !== undefined && (
                    <div className="text-right ml-4">
                      <div className="text-xl font-bold text-white">
                        {(log.confidence * 100).toFixed(1)}%
                      </div>
                      <div className="text-xs text-gray-500">일치율</div>
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
