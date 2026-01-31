'use client';

import { useAccessLogRepository } from '@/entities/user';
import { Card, CardHeader, CardBody, Badge, Button } from '@/shared/ui';

export function AccessLogList() {
  const accessLogRepo = useAccessLogRepository();
  const accessLogs = accessLogRepo.getAll();

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
        return <Badge variant="success" className="text-[10px] hd-p:text-xs fhd-p:text-xs qhd-p:text-sm hd-l:text-xs fhd-l:text-xs qhd-l:text-base">인증 성공</Badge>;
      case 'failed':
        return <Badge variant="danger" className="text-[10px] hd-p:text-xs fhd-p:text-xs qhd-p:text-sm hd-l:text-xs fhd-l:text-xs qhd-l:text-base">인증 실패</Badge>;
      default:
        return <Badge variant="warning" className="text-[10px] hd-p:text-xs fhd-p:text-xs qhd-p:text-sm hd-l:text-xs fhd-l:text-xs qhd-l:text-base">알 수 없음</Badge>;
    }
  };

  return (
    <Card>
      <CardHeader className="flex items-center justify-between p-3 hd-p:p-4 fhd-p:p-4 qhd-p:p-5 hd-l:p-4 fhd-l:p-4 qhd-l:p-6">
        <h2 className="text-base hd-p:text-lg fhd-p:text-lg qhd-p:text-xl hd-l:text-lg fhd-l:text-lg qhd-l:text-2xl font-semibold text-gray-900">출입 기록</h2>
        {accessLogs.length > 0 && (
          <Button
            variant="secondary"
            size="sm"
            onClick={() => accessLogRepo.clear()}
            className="text-[10px] hd-p:text-xs fhd-p:text-xs qhd-p:text-sm hd-l:text-xs fhd-l:text-xs qhd-l:text-base px-2 hd-p:px-3 fhd-p:px-3 qhd-p:px-4 hd-l:px-3 fhd-l:px-3 qhd-l:px-5 py-1 hd-p:py-1.5 fhd-p:py-1.5 qhd-p:py-2 hd-l:py-1.5 fhd-l:py-1.5 qhd-l:py-2.5"
          >
            기록 삭제
          </Button>
        )}
      </CardHeader>
      <CardBody className="max-h-60 hd-p:max-h-80 fhd-p:max-h-96 qhd-p:max-h-[480px] hd-l:max-h-96 fhd-l:max-h-96 qhd-l:max-h-[600px] overflow-y-auto p-3 hd-p:p-4 fhd-p:p-4 qhd-p:p-5 hd-l:p-4 fhd-l:p-4 qhd-l:p-6">
        {accessLogs.length === 0 ? (
          <div className="text-center py-6 hd-p:py-8 fhd-p:py-8 qhd-p:py-10 hd-l:py-8 fhd-l:py-8 qhd-l:py-12 text-gray-500">
            <svg
              className="w-10 h-10 hd-p:w-12 hd-p:h-12 fhd-p:w-12 fhd-p:h-12 qhd-p:w-14 qhd-p:h-14 hd-l:w-12 hd-l:h-12 fhd-l:w-12 fhd-l:h-12 qhd-l:w-16 qhd-l:h-16 mx-auto mb-2 hd-p:mb-3 fhd-p:mb-3 qhd-p:mb-4 hd-l:mb-3 fhd-l:mb-3 qhd-l:mb-4 opacity-50"
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
            <p className="text-xs hd-p:text-sm fhd-p:text-sm qhd-p:text-base hd-l:text-sm fhd-l:text-sm qhd-l:text-lg">출입 기록이 없습니다</p>
          </div>
        ) : (
          <div className="space-y-2 hd-p:space-y-3 fhd-p:space-y-3 qhd-p:space-y-4 hd-l:space-y-3 fhd-l:space-y-3 qhd-l:space-y-5">
            {accessLogs.map((log) => (
              <div
                key={log.id}
                className={`p-2.5 hd-p:p-3 fhd-p:p-3 qhd-p:p-4 hd-l:p-3 fhd-l:p-3 qhd-l:p-5 rounded-lg hd-l:rounded-xl fhd-l:rounded-xl qhd-l:rounded-xl border ${
                  log.status === 'success'
                    ? 'bg-green-50 border-green-200'
                    : log.status === 'failed'
                    ? 'bg-red-50 border-red-200'
                    : 'bg-yellow-50 border-yellow-200'
                }`}
              >
                <div className="flex items-center justify-between mb-1 hd-p:mb-1.5 fhd-p:mb-1.5 qhd-p:mb-2 hd-l:mb-1.5 fhd-l:mb-1.5 qhd-l:mb-2">
                  <span className="font-medium text-gray-900 text-xs hd-p:text-sm fhd-p:text-sm qhd-p:text-base hd-l:text-sm fhd-l:text-sm qhd-l:text-lg">
                    {log.userName || '미확인 사용자'}
                  </span>
                  {getStatusBadge(log.status)}
                </div>
                <div className="flex items-center justify-between text-[10px] hd-p:text-xs fhd-p:text-xs qhd-p:text-sm hd-l:text-xs fhd-l:text-xs qhd-l:text-base text-gray-500">
                  <span>
                    {formatDate(log.timestamp)} {formatTime(log.timestamp)}
                  </span>
                  {log.confidence !== undefined && (
                    <span>일치율: {(log.confidence * 100).toFixed(1)}%</span>
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
