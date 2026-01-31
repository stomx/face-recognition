import type { IHydrationRepository } from './interface';
import { useUserStore } from '../model/store';

/**
 * Hydration Repository 구현체
 * 클라이언트 측 스토어 초기화 관리
 */
export class HydrationRepository implements IHydrationRepository {
  constructor(private store: ReturnType<typeof useUserStore.getState>) {}

  isHydrated(): boolean {
    return this.store.isHydrated;
  }

  hydrate(): void {
    this.store.hydrate();
  }
}
