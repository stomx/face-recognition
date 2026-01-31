'use client';

import { useState, useRef, useCallback } from 'react';
import { CameraView } from '@/widgets/camera-view';
import { PrimaryButton } from '@/shared/ui';
import { useFaceRegistration, DuplicateCheckModal } from '@/features/face-registration';
import { useUserRepository } from '@/entities/user';
import type { User } from '@/shared/types';
import * as faceapi from '@vladmandic/face-api';

interface UserFormModalProps {
  user?: User;
  modelStatus: 'idle' | 'loading' | 'loaded' | 'error';
  onSuccess: () => void; // 저장 성공 시 콜백
  onClose: () => void;
}

export function UserFormModal({ user, modelStatus, onSuccess, onClose }: UserFormModalProps) {
  const {
    isRegistering,
    registrationError,
    checkForDuplicates,
    registerFaceWithData,
    addFaceToUserWithData,
  } = useFaceRegistration();
  const userRepo = useUserRepository();

  const [name, setName] = useState(user?.name || '');
  const [isCameraOn, setIsCameraOn] = useState(true);
  const [isCapturing, setIsCapturing] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(user?.imageData || null);
  const [capturedDescriptor, setCapturedDescriptor] = useState<Float32Array | null>(null);
  const [error, setError] = useState<string | null>(null);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // 중복 체크 관련 상태
  const [showDuplicateModal, setShowDuplicateModal] = useState(false);
  const [duplicateUser, setDuplicateUser] = useState<User | null>(null);
  const [duplicateConfidence, setDuplicateConfidence] = useState(0);
  const [pendingDetection, setPendingDetection] = useState<faceapi.WithFaceDescriptor<
    faceapi.WithFaceLandmarks<{ detection: faceapi.FaceDetection }>
  > | null>(null);
  const [pendingImageData, setPendingImageData] = useState<string | null>(null);

  const handleVideoReady = useCallback((video: HTMLVideoElement, canvas: HTMLCanvasElement) => {
    videoRef.current = video;
    canvasRef.current = canvas;
  }, []);

  const handleCapture = async () => {
    if (!videoRef.current || !canvasRef.current || modelStatus !== 'loaded') {
      setError('카메라가 준비되지 않았습니다');
      return;
    }

    setIsCapturing(true);
    setError(null);

    try {
      // 편집 모드이거나 중복 확인 필요 없는 경우
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

        setIsCameraOn(false);
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
          setPendingDetection(result.detection);
          setPendingImageData(result.imageData);
          setDuplicateUser(result.duplicateUser);
          setDuplicateConfidence(result.confidence);
          setShowDuplicateModal(true);
          setIsCapturing(false);
        } else {
          // 중복 없음 - 캡처 완료
          setCapturedImage(result.imageData);
          setCapturedDescriptor(result.detection.descriptor);
          setIsCameraOn(false);
        }
      }
    } catch (err) {
      console.error('캡처 실패:', err);
      setError('캡처 중 오류가 발생했습니다');
    } finally {
      setIsCapturing(false);
    }
  };

  const handleRetake = () => {
    setCapturedImage(null);
    setCapturedDescriptor(null);
    setIsCameraOn(true);
    setError(null);
  };

  const handleConfirmSamePerson = () => {
    if (!duplicateUser || !pendingDetection || !pendingImageData) return;

    // 기존 사용자에 얼굴 추가
    const success = addFaceToUserWithData(duplicateUser.id, pendingDetection, pendingImageData);

    if (success) {
      // 모달 닫기 및 상태 초기화
      setShowDuplicateModal(false);
      setDuplicateUser(null);
      setPendingDetection(null);
      setPendingImageData(null);

      // 성공 알림 후 모달 닫기
      onSuccess();
      onClose();
    }
  };

  const handleConfirmDifferentPerson = () => {
    if (!pendingDetection || !pendingImageData || !name.trim()) return;

    // 새 사용자로 등록
    const success = registerFaceWithData(name.trim(), pendingDetection, pendingImageData);

    if (success) {
      // 모달 닫기 및 상태 초기화
      setShowDuplicateModal(false);
      setDuplicateUser(null);
      setPendingDetection(null);
      setPendingImageData(null);

      // 성공 알림 후 모달 닫기
      onSuccess();
      onClose();
    }
  };

  const handleCancelDuplicate = () => {
    setShowDuplicateModal(false);
    setDuplicateUser(null);
    setPendingDetection(null);
    setPendingImageData(null);
  };

  const handleSubmit = () => {
    if (!name.trim()) {
      setError('이름을 입력해주세요');
      return;
    }

    if (!capturedDescriptor) {
      setError('얼굴을 캡처해주세요');
      return;
    }

    if (!capturedImage) {
      setError('이미지가 없습니다');
      return;
    }

    let success = false;

    if (user) {
      // 기존 사용자 수정
      userRepo.update(user.id, name.trim(), capturedDescriptor, capturedImage);
      success = true;
    } else {
      // 새 사용자 등록 - 동일 이름 확인
      const existingUser = userRepo.getByName(name.trim());
      if (existingUser) {
        // 동일 이름 사용자가 있으면 얼굴 추가
        const detection = {
          descriptor: capturedDescriptor,
        } as faceapi.WithFaceDescriptor<
          faceapi.WithFaceLandmarks<{ detection: faceapi.FaceDetection }>
        >;
        success = addFaceToUserWithData(existingUser.id, detection, capturedImage);
      } else {
        // 없으면 새 사용자로 등록
        const detection = {
          descriptor: capturedDescriptor,
        } as faceapi.WithFaceDescriptor<
          faceapi.WithFaceLandmarks<{ detection: faceapi.FaceDetection }>
        >;
        success = registerFaceWithData(name.trim(), detection, capturedImage);
      }
    }

    if (success) {
      onSuccess();
      onClose();
    }
  };

  return (
    <>
      {/* 중복 확인 모달 */}
      {showDuplicateModal && duplicateUser && pendingImageData && (
        <DuplicateCheckModal
          isOpen={showDuplicateModal}
          existingUser={duplicateUser}
          newFaceImage={pendingImageData}
          confidence={duplicateConfidence}
          onConfirmSamePerson={handleConfirmSamePerson}
          onConfirmDifferentPerson={handleConfirmDifferentPerson}
          onCancel={handleCancelDuplicate}
        />
      )}

      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* 헤더 */}
        <div className="p-6 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">
            {user ? '사용자 수정' : '사용자 등록'}
          </h2>
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-full hover:bg-gray-100 flex items-center justify-center text-gray-500 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* 본문 */}
        <div className="p-6 space-y-6">
          {/* 이름 입력 */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">이름</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="이름을 입력하세요"
              className="w-full px-4 py-3 border border-gray-200 rounded-xl text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            />
          </div>

          {/* 카메라/이미지 */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">얼굴 사진</label>
            <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
              {capturedImage && !isCameraOn ? (
                <div className="space-y-4">
                  <div className="rounded-lg overflow-hidden bg-black">
                    <img src={capturedImage} alt="캡처된 얼굴" className="w-full h-auto" />
                  </div>
                  <PrimaryButton onClick={handleRetake} variant="gray" className="w-full">
                    다시 촬영
                  </PrimaryButton>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="rounded-lg overflow-hidden bg-black">
                    <CameraView
                      onVideoReady={handleVideoReady}
                      showControls={false}
                      autoStart={isCameraOn}
                    />
                  </div>
                  <PrimaryButton
                    onClick={handleCapture}
                    disabled={modelStatus !== 'loaded' || isCapturing}
                    variant="blue"
                    className="w-full"
                    icon={
                      isCapturing ? (
                        <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                      ) : (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                      )
                    }
                  >
                    {isCapturing ? '캡처 중...' : '얼굴 캡처'}
                  </PrimaryButton>
                </div>
              )}
            </div>
          </div>

          {/* 에러 메시지 */}
          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
              {error}
            </div>
          )}
        </div>

        {/* 푸터 */}
        <div className="p-6 border-t border-gray-200 flex gap-3">
          <PrimaryButton onClick={onClose} variant="gray" className="flex-1">
            취소
          </PrimaryButton>
          <PrimaryButton
            onClick={handleSubmit}
            variant="blue"
            className="flex-1"
            disabled={!name.trim() || !capturedDescriptor}
          >
            {user ? '수정' : '등록'}
          </PrimaryButton>
        </div>
      </div>
      </div>
    </>
  );
}
