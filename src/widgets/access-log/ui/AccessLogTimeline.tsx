'use client';

import { useState, useMemo } from 'react';
import { useUserStore } from '@/entities/user';
import { Card, CardHeader, CardBody, Badge } from '@/shared/ui';

type StatusFilter = 'all' | 'success' | 'failed';

export function AccessLogTimeline() {
  const { accessLogs } = useUserStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');

  // 필터링된 로그
  const filteredLogs = useMemo(() => {
    return accessLogs.filter((log) => {
      // 상태 필터
      if (statusFilter !== 'all' && log.status !== statusFilter) {
        return false;
      }

      // 검색 필터
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

  const getStatusBadge = (status: 'success' | 'failed' | 'unknown') => {
    switch (status) {
      case 'success':
        return <Badge variant="success">인증 성공</Badge>;
      case 'failed':
        return <Badge variant="danger">인증 실패</Badge>;
      default:
        return <Badge variant="warning">알 수 없음</Badge>;
    }
  };

  return (
    <Card>
      <CardHeader>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">출입 기록 타임라인</h2>

        {/* 검색 및 필터 */}
        <div className="space-y-3">
          {/* 검색 입력 */}
          <div className="relative">
            <svg
              className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400"
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
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* 상태 필터 버튼 */}
          <div className="flex gap-2">
            <button
              onClick={() => setStatusFilter('all')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                statusFilter === 'all'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              전체
            </button>
            <button
              onClick={() => setStatusFilter('success')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                statusFilter === 'success'
                  ? 'bg-green-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              성공
            </button>
            <button
              onClick={() => setStatusFilter('failed')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                statusFilter === 'failed'
                  ? 'bg-red-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              실패
            </button>
          </div>
        </div>
      </CardHeader>

      <CardBody className="max-h-96 overflow-y-auto">
        {filteredLogs.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <svg
              className="w-12 h-12 mx-auto mb-3 opacity-50"
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
            <p>
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
                className={`p-4 rounded-lg border-l-4 ${
                  log.status === 'success'
                    ? 'bg-green-50 border-green-500'
                    : log.status === 'failed'
                    ? 'bg-red-50 border-red-500'
                    : 'bg-yellow-50 border-yellow-500'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold text-gray-900">
                        {log.userName || '미확인 사용자'}
                      </span>
                      {getStatusBadge(log.status)}
                    </div>
                    <div className="text-sm text-gray-600">
                      {formatDate(log.timestamp)} {formatTime(log.timestamp)}
                    </div>
                  </div>
                  {log.confidence !== undefined && (
                    <div className="text-right ml-4">
                      <div className="text-sm font-medium text-gray-900">
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
      </CardBody>
    </Card>
  );
}
