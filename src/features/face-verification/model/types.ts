/**
 * 얼굴 인식 타입 정의
 */

// 얼굴 박스 정보
export interface FaceBox {
  x: number;
  y: number;
  width: number;
  height: number;
}

// 스캔 결과 (얼굴 감지 + 매칭 결과)
export interface ScanResult {
  faceDetected: boolean;
  faceBox?: FaceBox;
  isVerified: boolean;
  userId: string | null;
  userName: string | null;
  confidence: number;
}

// 인증 결과 (기록용)
export interface VerificationResult {
  isVerified: boolean;
  userId: string | null;
  userName: string | null;
  confidence: number;
  timestamp: Date;
}

// 타이밍 상수
export const TIMING = {
  RESULT_DURATION: 5000,   // 결과 표시 시간 (5초)
  SCAN_INTERVAL: 500,      // 스캔 간격 (0.5초)
  MIN_FACE_HEIGHT: 80,     // 최소 얼굴 높이 (인증 가능 거리)
} as const;
