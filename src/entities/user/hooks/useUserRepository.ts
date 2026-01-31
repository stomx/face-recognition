import { useMemo } from 'react';
import { useUserStore } from '../model/store';
import type { IUserRepository } from '../repository/interface';

/**
 * User Repository Hook
 * DIP 패턴을 따르는 User 도메인 접근
 *
 * @example
 * const userRepo = useUserRepository();
 * const users = userRepo.getAll();
 * const user = userRepo.getById('123');
 * userRepo.add('홍길동', descriptor, imageData);
 */
export function useUserRepository(): IUserRepository {
  const store = useUserStore();

  return useMemo(
    () => ({
      getAll: () => store.users,
      getById: store.getUserById,
      getByName: store.getUserByName,
      add: store.addUser,
      update: store.updateUser,
      remove: store.removeUser,
      addFace: store.addFaceToUser,
      removeFace: store.removeFaceFromUser,
    }),
    [store]
  );
}
