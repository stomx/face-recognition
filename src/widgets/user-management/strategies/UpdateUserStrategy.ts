import type { IUserFormStrategy } from './IUserFormStrategy';
import type { IUserRepository } from '@/shared/types/repository';
import { debug } from '@/shared/lib/debug';

const log = debug.scope('UpdateUserStrategy');

/**
 * 사용자 수정 전략
 * - 기존 사용자 정보 업데이트
 */
export class UpdateUserStrategy implements IUserFormStrategy {
  constructor(private userId: string, private userRepo: IUserRepository) {}

  submit({ name, descriptor, imageData }: { name: string; descriptor: Float32Array; imageData: string }): boolean {
    try {
      this.userRepo.update(this.userId, name, descriptor, imageData);
      return true;
    } catch (err) {
      log.error('User update failed', 'submit', { userId: this.userId, name }, err);
      return false;
    }
  }

  getTitle(): string {
    return '사용자 수정';
  }

  getButtonLabel(): string {
    return '수정';
  }
}
