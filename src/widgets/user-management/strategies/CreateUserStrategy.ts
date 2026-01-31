import type { IUserFormStrategy } from './IUserFormStrategy';
import type { IUserRepository } from '@/shared/types/repository';
import * as faceapi from '@vladmandic/face-api';

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
      detection: faceapi.WithFaceDescriptor<
        faceapi.WithFaceLandmarks<{ detection: faceapi.FaceDetection }>
      >,
      imageData: string
    ) => boolean,
    private addFaceToUserWithData: (
      userId: string,
      detection: faceapi.WithFaceDescriptor<
        faceapi.WithFaceLandmarks<{ detection: faceapi.FaceDetection }>
      >,
      imageData: string
    ) => boolean
  ) {}

  submit({ name, descriptor, imageData }: { name: string; descriptor: Float32Array; imageData: string }): boolean {
    // 동일 이름 사용자 확인
    const existingUser = this.userRepo.getByName(name);

    // Detection 객체 생성
    const detection = {
      descriptor,
    } as faceapi.WithFaceDescriptor<faceapi.WithFaceLandmarks<{ detection: faceapi.FaceDetection }>>;

    if (existingUser) {
      // 동일 이름 사용자가 있으면 얼굴 추가
      return this.addFaceToUserWithData(existingUser.id, detection, imageData);
    } else {
      // 없으면 새 사용자로 등록
      return this.registerFaceWithData(name, detection, imageData);
    }
  }

  getTitle(): string {
    return '사용자 등록';
  }

  getButtonLabel(): string {
    return '등록';
  }
}
