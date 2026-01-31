// 사용자 타입
export interface User {
  id: string;
  name: string;
  faceDescriptors: Float32Array[]; // 여러 얼굴 등록 지원
  faceImages: string[]; // 각 얼굴의 이미지 (Base64)
  registeredAt: Date;
  imageData?: string; // Base64 encoded face image (대표 이미지 - 호환성용)
}

// 인증 로그 타입
export interface AccessLog {
  id: string;
  userId: string | null;
  userName: string | null;
  timestamp: Date;
  status: 'success' | 'failed' | 'unknown';
  confidence?: number;
}

// 얼굴 감지 결과 타입
export interface FaceDetectionResult {
  isDetected: boolean;
  descriptor: Float32Array | null;
  box: {
    x: number;
    y: number;
    width: number;
    height: number;
  } | null;
}

// 모델 로딩 상태
export type ModelLoadingStatus = 'idle' | 'loading' | 'loaded' | 'error';

// 앱 모드
export type AppMode = 'register' | 'verify';

// 카메라 관련
export type { Resolution, Orientation, ResolutionKey } from './camera';
export { RESOLUTION_MAP, RESOLUTION_LABELS } from './camera';
