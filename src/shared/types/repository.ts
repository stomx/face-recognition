/**
 * Repository 인터페이스 재export
 * DIP(의존성 역전 원칙)를 위한 추상화 레이어
 *
 * Feature Layer는 이 인터페이스에만 의존해야 하며,
 * 구현체(UserRepository 등)에 직접 의존해서는 안 됩니다.
 */
export type {
  IUserRepository,
  IAccessLogRepository,
  IFaceMatchRepository,
  IHydrationRepository,
} from '@/entities/user/repository/interface';
