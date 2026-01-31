import type { AccessLog } from '@/shared/types';
import type { IAccessLogRepository } from './interface';
import { useUserStore } from '../model/store';

/**
 * AccessLog Repository 구현체
 * 출입 기록 관리
 */
export class AccessLogRepository implements IAccessLogRepository {
  constructor(private store: ReturnType<typeof useUserStore.getState>) {}

  getAll(): AccessLog[] {
    return this.store.accessLogs;
  }

  add(
    userId: string | null,
    userName: string | null,
    status: 'success' | 'failed' | 'unknown',
    confidence?: number
  ): void {
    this.store.addAccessLog(userId, userName, status, confidence);
  }

  clear(): void {
    this.store.clearAccessLogs();
  }
}
