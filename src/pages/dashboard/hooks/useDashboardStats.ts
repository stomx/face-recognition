import { useMemo } from 'react';
import { useUserRepository, useAccessLogRepository } from '@/entities/user';

/**
 * DashboardPage 통계 계산 Hook
 *
 * 책임:
 * - 사용자 수 계산
 * - 오늘의 승인/거부 건수 계산
 */
export function useDashboardStats() {
  const userRepo = useUserRepository();
  const accessLogRepo = useAccessLogRepository();

  const users = userRepo.getAll();
  const accessLogs = accessLogRepo.getAll();

  const stats = useMemo(() => ({
    usersCount: users.length,
    todaySuccessCount: accessLogs.filter(l => l.status === 'success').length,
    todayFailCount: accessLogs.filter(l => l.status === 'failed').length,
  }), [users.length, accessLogs]);

  return stats;
}
