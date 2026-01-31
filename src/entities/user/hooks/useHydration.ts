import { useMemo } from 'react';
import { useUserStore } from '../model/store';

/**
 * Hydration Hook
 * 클라이언트 측 스토어 초기화 관리
 *
 * @example
 * const { isHydrated, hydrate } = useHydration();
 * useEffect(() => {
 *   if (!isHydrated) hydrate();
 * }, [isHydrated, hydrate]);
 */
/**
 * Hydration Hook 반환 타입
 * isHydrated는 값으로 제공
 */
interface HydrationHook {
  isHydrated: boolean;
  hydrate: () => void;
}

export function useHydration(): HydrationHook {
  const store = useUserStore();

  return useMemo(
    () => ({
      isHydrated: store.isHydrated,
      hydrate: store.hydrate,
    }),
    [store]
  );
}
