// 사용자 타입
export interface User {
  id: string;
  name: string;
  faceDescriptor: Float32Array;
  registeredAt: Date;
  imageData?: string; // Base64 encoded face image
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
