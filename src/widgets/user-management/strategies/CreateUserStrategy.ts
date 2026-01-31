import type { IUserFormStrategy } from './IUserFormStrategy';
import type { IUserRepository } from '@/shared/types/repository';

/**
 * 사용자 생성 전략
 * - 새 사용자 등록
 * - 동일 이름 사용자가 있으면 얼굴 추가
 */
export class CreateUserStrategy implements IUserFormStrategy {
  constructor(
    private userRepo: IUserRepository,
    private registerFaceWithData: (
      name: string,
      descriptor: Float32Array,
      imageData: string
    ) => boolean,
    private addFaceToUserWithData: (
      userId: string,
      descriptor: Float32Array,
      imageData: string
    ) => boolean
  ) {}

  submit({ name, descriptor, imageData }: { name: string; descriptor: Float32Array; imageData: string }): boolean {
    // 동일 이름 사용자 확인
    const existingUser = this.userRepo.getByName(name);

    if (existingUser) {
      // 동일 이름 사용자가 있으면 얼굴 추가
      return this.addFaceToUserWithData(existingUser.id, descriptor, imageData);
    } else {
      // 없으면 새 사용자로 등록
      return this.registerFaceWithData(name, descriptor, imageData);
    }
  }

  getTitle(): string {
    return '사용자 등록';
  }

  getButtonLabel(): string {
    return '등록';
  }
}
