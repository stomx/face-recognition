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
 * @deprecated 새 코드에서는 mode 기반 Props 사용 권장
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
