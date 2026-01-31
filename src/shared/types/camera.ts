/**
 * 카메라 관련 타입 및 상수
 */

export type Resolution = 'hd' | 'fhd' | 'qhd';
export type Orientation = 'landscape' | 'portrait';

export const RESOLUTION_MAP = {
  hd: { width: 1280, height: 720 },
  fhd: { width: 1920, height: 1080 },
  qhd: { width: 2560, height: 1440 },
} as const;

export const RESOLUTION_LABELS = {
  hd: '1280×720 HD',
  fhd: '1920×1080 FHD',
  qhd: '2560×1440 QHD',
} as const;

export type ResolutionKey = keyof typeof RESOLUTION_MAP;
