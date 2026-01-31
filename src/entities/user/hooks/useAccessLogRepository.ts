import { useMemo } from 'react';
import { useUserStore } from '../model/store';
import type { IAccessLogRepository } from '../repository/interface';

/**
 * AccessLog Repository Hook
 * 출입 기록 관리
 *
 * @example
 * const accessLogRepo = useAccessLogRepository();
 * const logs = accessLogRepo.getAll();
 * accessLogRepo.add(userId, userName, 'success', 0.95);
 * accessLogRepo.clear();
 */
export function useAccessLogRepository(): IAccessLogRepository {
  const store = useUserStore();

  return useMemo(
    () => ({
      getAll: () => store.accessLogs,
      add: store.addAccessLog,
      clear: store.clearAccessLogs,
    }),
    [store]
  );
}
