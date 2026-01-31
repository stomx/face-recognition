'use client';

import * as faceapi from '@vladmandic/face-api';
import { FACE_DETECTION_CONFIG } from '../config/constants';
import { debug } from './debug';

const log = debug.scope('FaceAPI');

let modelsLoaded = false;
let modelsLoading = false;

// 모델 로드
export async function loadModels(): Promise<void> {
  if (modelsLoaded) return;
  if (modelsLoading) {
    // 이미 로딩 중이면 완료될 때까지 대기
    while (modelsLoading) {
      await new Promise((resolve) => setTimeout(resolve, 100));
    }
    return;
  }

  modelsLoading = true;
  const MODEL_URL = FACE_DETECTION_CONFIG.MODELS_PATH;

  try {
    await Promise.all([
      faceapi.nets.ssdMobilenetv1.loadFromUri(MODEL_URL),
      faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
      faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL),
    ]);
    modelsLoaded = true;
    log.log('Models loaded successfully', 'loadModels');
  } finally {
    modelsLoading = false;
  }
}

// 모델 로드 상태 확인
export function isModelsLoaded(): boolean {
  return modelsLoaded;
}

// 얼굴 감지 및 디스크립터 추출
export async function detectFace(
  video: HTMLVideoElement
): Promise<faceapi.WithFaceDescriptor<faceapi.WithFaceLandmarks<{ detection: faceapi.FaceDetection }>> | null> {
  if (!modelsLoaded) {
    log.warn('Models not loaded yet, skipping detection', 'detectFace');
    return null;
  }

  // 비디오 유효성 체크
  if (!video || video.videoWidth === 0 || video.videoHeight === 0) {
    log.warn('Video not ready for detection', 'detectFace', {
      hasVideo: !!video,
      width: video?.videoWidth,
      height: video?.videoHeight
    });
    return null;
  }

  try {
    const detection = await faceapi
      .detectSingleFace(video)
      .withFaceLandmarks()
      .withFaceDescriptor();

    return detection || null;
  } catch (err) {
    log.error('Face detection failed', 'detectFace', undefined, err);
    return null;
  }
}

// 두 얼굴 디스크립터 비교
export function compareFaces(
  descriptor1: Float32Array,
  descriptor2: Float32Array
): number {
  return faceapi.euclideanDistance(descriptor1, descriptor2);
}

// 가장 유사한 사용자 찾기
export function findBestMatch(
  queryDescriptor: Float32Array,
  labeledDescriptors: faceapi.LabeledFaceDescriptors[]
): faceapi.FaceMatch | null {
  if (labeledDescriptors.length === 0) return null;

  const faceMatcher = new faceapi.FaceMatcher(
    labeledDescriptors,
    FACE_DETECTION_CONFIG.MATCH_THRESHOLD
  );

  return faceMatcher.findBestMatch(queryDescriptor);
}

// LabeledFaceDescriptors 생성 헬퍼
export function createLabeledDescriptor(
  label: string,
  descriptors: Float32Array | Float32Array[]
): faceapi.LabeledFaceDescriptors {
  const descriptorArray = Array.isArray(descriptors) ? descriptors : [descriptors];
  return new faceapi.LabeledFaceDescriptors(label, descriptorArray);
}

// faceapi 인스턴스 export
export { faceapi };
