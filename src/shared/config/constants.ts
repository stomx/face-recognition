// 얼굴 인식 설정
export const FACE_DETECTION_CONFIG = {
  // 얼굴 매칭 임계값 (낮을수록 엄격)
  MATCH_THRESHOLD: 0.25,
  // 얼굴 감지 최소 신뢰도
  MIN_CONFIDENCE: 0.5,
  // 모델 경로
  MODELS_PATH: '/models',
} as const;

// 로컬 스토리지 키
export const STORAGE_KEYS = {
  USERS: 'face-access-users',
  ACCESS_LOGS: 'face-access-logs',
} as const;

// 카메라 설정
export const CAMERA_CONFIG = {
  WIDTH: 640,
  HEIGHT: 480,
  FACING_MODE: 'user' as const,
} as const;
