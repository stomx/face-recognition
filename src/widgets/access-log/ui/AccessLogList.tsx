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
        return <Badge variant="success" className="text-[10px] portrait:text-xs xl:text-xs 2xl:text-sm 3xl:text-base">인증 성공</Badge>;
      case 'failed':
        return <Badge variant="danger" className="text-[10px] portrait:text-xs xl:text-xs 2xl:text-sm 3xl:text-base">인증 실패</Badge>;
      default:
        return <Badge variant="warning" className="text-[10px] portrait:text-xs xl:text-xs 2xl:text-sm 3xl:text-base">알 수 없음</Badge>;
    }
  };

  return (
    <Card>
      <CardHeader className="flex items-center justify-between p-3 portrait:p-4 xl:p-4 2xl:p-5 3xl:p-6">
        <h2 className="text-base portrait:text-lg xl:text-lg 2xl:text-xl 3xl:text-2xl font-semibold text-gray-900">출입 기록</h2>
        {accessLogs.length > 0 && (
          <Button
            variant="secondary"
            size="sm"
            onClick={() => accessLogRepo.clear()}
            className="text-[10px] portrait:text-xs xl:text-xs 2xl:text-sm 3xl:text-base px-2 portrait:px-3 xl:px-3 2xl:px-4 3xl:px-5 py-1 portrait:py-1.5 xl:py-1.5 2xl:py-2 3xl:py-2.5"
          >
            기록 삭제
          </Button>
        )}
      </CardHeader>
      <CardBody className="max-h-60 portrait:max-h-80 xl:max-h-96 2xl:max-h-[480px] 3xl:max-h-[600px] overflow-y-auto p-3 portrait:p-4 xl:p-4 2xl:p-5 3xl:p-6">
        {accessLogs.length === 0 ? (
          <div className="text-center py-6 portrait:py-8 xl:py-8 2xl:py-10 3xl:py-12 text-gray-500">
            <svg
              className="w-10 h-10 portrait:w-12 portrait:h-12 xl:w-12 xl:h-12 2xl:w-14 2xl:h-14 3xl:w-16 3xl:h-16 mx-auto mb-2 portrait:mb-3 xl:mb-3 2xl:mb-4 opacity-50"
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
            <p className="text-xs portrait:text-sm xl:text-sm 2xl:text-base 3xl:text-lg">출입 기록이 없습니다</p>
          </div>
        ) : (
          <div className="space-y-2 portrait:space-y-3 xl:space-y-3 2xl:space-y-4 3xl:space-y-5">
            {accessLogs.map((log) => (
              <div
                key={log.id}
                className={`p-2.5 portrait:p-3 xl:p-3 2xl:p-4 3xl:p-5 rounded-lg xl:rounded-xl border ${
                  log.status === 'success'
                    ? 'bg-green-50 border-green-200'
                    : log.status === 'failed'
                    ? 'bg-red-50 border-red-200'
                    : 'bg-yellow-50 border-yellow-200'
                }`}
              >
                <div className="flex items-center justify-between mb-1 portrait:mb-1.5 xl:mb-1.5 2xl:mb-2">
                  <span className="font-medium text-gray-900 text-xs portrait:text-sm xl:text-sm 2xl:text-base 3xl:text-lg">
                    {log.userName || '미확인 사용자'}
                  </span>
                  {getStatusBadge(log.status)}
                </div>
                <div className="flex items-center justify-between text-[10px] portrait:text-xs xl:text-xs 2xl:text-sm 3xl:text-base text-gray-500">
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
