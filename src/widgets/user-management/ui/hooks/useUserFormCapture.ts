import { useState, RefObject } from 'react';
import { useFaceRegistration } from '@/features/face-registration';
import type { User } from '@/shared/types';
import { debug } from '@/shared/lib/debug';

const log = debug.scope('UserFormCapture');

/**
 * UserFormModal 캡처 로직 Hook
 *
 * 책임:
 * - 얼굴 캡처 실행
 * - 중복 체크 처리
 * - 캡처된 이미지/Descriptor 관리
 * - 에러 상태 관리
 */
export function useUserFormCapture(
  videoRef: RefObject<HTMLVideoElement | null>,
  canvasRef: RefObject<HTMLCanvasElement | null>,
  modelStatus: 'idle' | 'loading' | 'loaded' | 'error',
  user?: User
) {
  const { registrationError, checkForDuplicates } = useFaceRegistration();

  const [isCapturing, setIsCapturing] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(user?.imageData || null);
  const [capturedDescriptor, setCapturedDescriptor] = useState<Float32Array | null>(null);
  const [error, setError] = useState<string | null>(null);

  // 중복 체크 관련 상태
  const [showDuplicateModal, setShowDuplicateModal] = useState(false);
  const [duplicateUser, setDuplicateUser] = useState<User | null>(null);
  const [duplicateConfidence, setDuplicateConfidence] = useState(0);
  const [pendingDescriptor, setPendingDescriptor] = useState<Float32Array | null>(null);
  const [pendingImageData, setPendingImageData] = useState<string | null>(null);

  const handleCapture = async (): Promise<void> => {
    if (!videoRef.current || !canvasRef.current || modelStatus !== 'loaded') {
      setError('카메라가 준비되지 않았습니다');
      return;
    }

    setIsCapturing(true);
    setError(null);

    try {
      if (user) {
        // 기존 사용자 수정 - 중복 확인 안함
        const { detectFace } = await import('@/shared/lib/face-api');
        const detection = await detectFace(videoRef.current);

        if (!detection) {
          setError('얼굴이 감지되지 않았습니다. 다시 시도해주세요.');
          setIsCapturing(false);
          return;
        }

        // 캡처된 이미지 저장
        const canvas = document.createElement('canvas');
        canvas.width = videoRef.current.videoWidth;
        canvas.height = videoRef.current.videoHeight;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(videoRef.current, 0, 0);
          const imageData = canvas.toDataURL('image/jpeg', 0.8);
          setCapturedImage(imageData);
          setCapturedDescriptor(detection.descriptor);
        }
      } else {
        // 새 사용자 등록 - 중복 확인
        const result = await checkForDuplicates(videoRef.current, canvasRef.current);

        if (!result.detection || !result.imageData) {
          setError(registrationError || '얼굴 감지에 실패했습니다');
          setIsCapturing(false);
          return;
        }

        if (result.hasDuplicate && result.duplicateUser) {
          // 중복 발견 - 모달 표시
          setPendingDescriptor(result.detection.descriptor);
          setPendingImageData(result.imageData);
          setDuplicateUser(result.duplicateUser);
          setDuplicateConfidence(result.confidence);
          setShowDuplicateModal(true);
        } else {
          // 중복 없음 - 캡처 완료
          setCapturedImage(result.imageData);
          setCapturedDescriptor(result.detection.descriptor);
        }
      }
    } catch (err) {
      log.error('Capture failed', 'handleCapture', undefined, err);
      setError('캡처 중 오류가 발생했습니다');
    } finally {
      setIsCapturing(false);
    }
  };

  const handleRetake = () => {
    setCapturedImage(null);
    setCapturedDescriptor(null);
    setError(null);
  };

  const closeDuplicateModal = () => {
    setShowDuplicateModal(false);
    setDuplicateUser(null);
    setPendingDescriptor(null);
    setPendingImageData(null);
  };

  return {
    // 캡처 상태
    isCapturing,
    capturedImage,
    capturedDescriptor,
    error,

    // 중복 체크 상태
    showDuplicateModal,
    duplicateUser,
    duplicateConfidence,
    pendingDescriptor,
    pendingImageData,

    // 액션
    handleCapture,
    handleRetake,
    closeDuplicateModal,
    setCapturedImage,
    setCapturedDescriptor,
  };
}
