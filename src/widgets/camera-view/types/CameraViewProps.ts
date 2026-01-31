import type { Resolution, Orientation } from '@/shared/types';

/**
 * 기본 카메라 Props
 */
interface BaseCameraProps {
  className?: string;
}

/**
 * 제어 가능한 카메라 모드
 * - 사용자가 직접 시작/중지 버튼을 제어
 * - resolution과 orientation 설정 필수
 */
export interface ControlledCameraProps extends BaseCameraProps {
  mode: 'controlled';
  showControls: true;
  resolution: Resolution;
  orientation: Orientation;
  onVideoReady?: (video: HTMLVideoElement, canvas: HTMLCanvasElement) => void;
  onVideoStop?: () => void;
  autoStart?: boolean;
}

/**
 * 임베디드 카메라 모드
 * - 콜백을 통해 외부에서 제어
 * - onVideoReady 콜백 필수
 */
export interface EmbeddedCameraProps extends BaseCameraProps {
  mode: 'embedded';
  onVideoReady: (video: HTMLVideoElement, canvas: HTMLCanvasElement) => void;
  onVideoStop?: () => void;
  autoStart?: boolean;
  resolution?: Resolution;
  orientation?: Orientation;
}

/**
 * 전체 화면 카메라 모드
 * - fullScreen 모드로 화면 전체를 차지
 * - onVideoReady 콜백 필수
 */
export interface FullScreenCameraProps extends BaseCameraProps {
  mode: 'fullscreen';
  fullScreen: true;
  onVideoReady: (video: HTMLVideoElement, canvas: HTMLCanvasElement) => void;
  onVideoStop?: () => void;
  autoStart?: boolean;
  resolution?: Resolution;
  orientation?: Orientation;
}

/**
 * 레거시 Props (기존 코드와의 호환성)
 *
 * @deprecated v2.0.0부터 deprecated. v3.0.0에서 제거 예정
 *
 * **마이그레이션 가이드:**
 *
 * 1. **제어 가능한 카메라 (showControls: true):**
 * ```ts
 * // Before (레거시)
 * <CameraView
 *   showControls={true}
 *   resolution="HD"
 *   orientation="landscape"
 *   onVideoReady={handleReady}
 * />
 *
 * // After (권장)
 * <CameraView
 *   mode="controlled"
 *   showControls={true}
 *   resolution="HD"
 *   orientation="landscape"
 *   onVideoReady={handleReady}
 * />
 * ```
 *
 * 2. **임베디드 카메라 (외부 제어):**
 * ```ts
 * // Before (레거시)
 * <CameraView
 *   onVideoReady={handleReady}
 *   autoStart={true}
 * />
 *
 * // After (권장)
 * <CameraView
 *   mode="embedded"
 *   onVideoReady={handleReady}
 *   autoStart={true}
 * />
 * ```
 *
 * 3. **전체화면 카메라 (fullScreen: true):**
 * ```ts
 * // Before (레거시)
 * <CameraView
 *   fullScreen={true}
 *   onVideoReady={handleReady}
 * />
 *
 * // After (권장)
 * <CameraView
 *   mode="fullscreen"
 *   fullScreen={true}
 *   onVideoReady={handleReady}
 * />
 * ```
 *
 * **제거 예정일:** 2026년 6월 (v3.0.0 릴리스)
 */
export interface LegacyCameraViewProps extends BaseCameraProps {
  onVideoReady?: (video: HTMLVideoElement, canvas: HTMLCanvasElement) => void;
  onVideoStop?: () => void;
  showControls?: boolean;
  autoStart?: boolean;
  fullScreen?: boolean;
  resolution?: Resolution;
  orientation?: Orientation;
}

/**
 * CameraView Props 타입
 * - 모드별로 명확한 타입 분리 (ISP 원칙)
 * - 레거시 호환성 유지
 */
export type CameraViewProps =
  | ControlledCameraProps
  | EmbeddedCameraProps
  | FullScreenCameraProps
  | LegacyCameraViewProps;
