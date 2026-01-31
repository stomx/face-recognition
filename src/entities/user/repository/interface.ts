import type { User, AccessLog } from '@/shared/types';
import type { faceapi } from '@/shared/lib/face-api';

/**
 * User 도메인 Repository 인터페이스
 * DIP(의존성 역전 원칙)를 위한 추상화 레이어
 */
export interface IUserRepository {
  /**
   * 모든 사용자 목록 조회
   */
  getAll(): User[];

  /**
   * ID로 사용자 조회
   */
  getById(id: string): User | undefined;

  /**
   * 이름으로 사용자 조회
   */
  getByName(name: string): User | undefined;

  /**
   * 새 사용자 등록
   * @returns 생성된 사용자 객체
   */
  add(name: string, faceDescriptor: Float32Array, imageData?: string): User;

  /**
   * 사용자 정보 수정
   */
  update(id: string, name: string, faceDescriptor?: Float32Array, imageData?: string): void;

  /**
   * 사용자 삭제
   */
  remove(id: string): void;

  /**
   * 사용자에게 얼굴 추가 (다중 얼굴 등록)
   */
  addFace(userId: string, faceDescriptor: Float32Array, imageData: string): void;

  /**
   * 사용자의 특정 얼굴 삭제
   */
  removeFace(userId: string, faceIndex: number): void;
}

/**
 * AccessLog 도메인 Repository 인터페이스
 */
export interface IAccessLogRepository {
  /**
   * 모든 출입 기록 조회
   */
  getAll(): AccessLog[];

  /**
   * 새 출입 기록 추가
   */
  add(
    userId: string | null,
    userName: string | null,
    status: 'success' | 'failed' | 'unknown',
    confidence?: number
  ): void;

  /**
   * 모든 출입 기록 삭제
   */
  clear(): void;
}

/**
 * FaceMatch 도메인 Repository 인터페이스
 * 얼굴 인식을 위한 Labeled Descriptors 제공
 */
export interface IFaceMatchRepository {
  /**
   * 얼굴 매칭을 위한 Labeled Descriptors 조회
   */
  getLabeledDescriptors(): faceapi.LabeledFaceDescriptors[];
}

/**
 * Hydration Repository 인터페이스
 * 클라이언트 측 스토어 초기화 관리
 */
export interface IHydrationRepository {
  /**
   * 스토어가 초기화되었는지 확인
   */
  isHydrated(): boolean;

  /**
   * 스토어 초기화 (LocalStorage에서 데이터 로드)
   */
  hydrate(): void;
}
