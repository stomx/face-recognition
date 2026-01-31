import { useState } from 'react';
import type { User } from '@/shared/types';
import * as faceapi from '@vladmandic/face-api';

/**
 * RegisterPage 중복 확인 Hook (SRP 적용)
 *
 * 책임:
 * - 중복 확인 모달 상태 관리
 * - Pending 데이터 관리 (detection, imageData, name)
 * - 모달 핸들러 (확인/취소)
 */
export function useDuplicateCheck() {
  const [showDuplicateModal, setShowDuplicateModal] = useState(false);
  const [duplicateUser, setDuplicateUser] = useState<User | null>(null);
  const [duplicateConfidence, setDuplicateConfidence] = useState(0);
  const [pendingDetection, setPendingDetection] = useState<faceapi.WithFaceDescriptor<
    faceapi.WithFaceLandmarks<{ detection: faceapi.FaceDetection }>
  > | null>(null);
  const [pendingImageData, setPendingImageData] = useState<string | null>(null);
  const [pendingName, setPendingName] = useState('');

  /**
   * 중복 발견 시 모달 표시
   */
  const showModal = (
    user: User,
    confidence: number,
    detection: faceapi.WithFaceDescriptor<
      faceapi.WithFaceLandmarks<{ detection: faceapi.FaceDetection }>
    >,
    imageData: string,
    name: string
  ) => {
    setDuplicateUser(user);
    setDuplicateConfidence(confidence);
    setPendingDetection(detection);
    setPendingImageData(imageData);
    setPendingName(name);
    setShowDuplicateModal(true);
  };

  /**
   * 모달 닫기 및 상태 초기화
   */
  const closeModal = () => {
    setShowDuplicateModal(false);
    setDuplicateUser(null);
    setDuplicateConfidence(0);
    setPendingDetection(null);
    setPendingImageData(null);
    setPendingName('');
  };

  return {
    // 상태
    showDuplicateModal,
    duplicateUser,
    duplicateConfidence,
    pendingDetection,
    pendingImageData,
    pendingName,

    // 액션
    showModal,
    closeModal,
  };
}
