import { detectFace, findBestMatch, faceapi } from '@/shared/lib/face-api';
import { FACE_DETECTION_CONFIG } from '@/shared/config/constants';

export interface FaceVerificationResult {
  success: boolean;
  userId: string | null;
  userName: string | null;
  confidence: number;
  detection: faceapi.WithFaceDescriptor<
    faceapi.WithFaceLandmarks<{ detection: faceapi.FaceDetection }>
  > | null;
}

/**
 * 얼굴 인증 공통 함수
 * - 얼굴 감지
 * - 등록된 사용자와 비교
 * - MATCH_THRESHOLD 체크 (75% 이상만 성공)
 */
export async function verifyFace(
  video: HTMLVideoElement,
  labeledDescriptors: faceapi.LabeledFaceDescriptors[],
  getUserById: (id: string) => { name: string } | undefined
): Promise<FaceVerificationResult> {
  // 1. 얼굴 감지
  const detection = await detectFace(video);

  if (!detection) {
    return {
      success: false,
      userId: null,
      userName: null,
      confidence: 0,
      detection: null,
    };
  }

  // 2. 등록된 사용자가 없으면 실패
  if (labeledDescriptors.length === 0) {
    return {
      success: false,
      userId: null,
      userName: null,
      confidence: 0,
      detection,
    };
  }

  // 3. 가장 유사한 사용자 찾기
  const bestMatch = findBestMatch(detection.descriptor, labeledDescriptors);

  // 4. 일치율 계산
  const confidence = bestMatch ? 1 - bestMatch.distance : 0;
  const isMatch = bestMatch != null && bestMatch.label !== 'unknown';

  // 5. MATCH_THRESHOLD 체크 (75% 이상만 성공)
  const isVerified = isMatch && confidence >= (1 - FACE_DETECTION_CONFIG.MATCH_THRESHOLD);

  if (!isVerified) {
    return {
      success: false,
      userId: null,
      userName: null,
      confidence,
      detection,
    };
  }

  // 6. 인증 성공
  const user = getUserById(bestMatch!.label);
  return {
    success: true,
    userId: bestMatch!.label,
    userName: user?.name || null,
    confidence,
    detection,
  };
}
