'use client';

import { useState, useMemo, useCallback } from 'react';
import Image from 'next/image';
import { CameraView } from '@/widgets/camera-view';
import { PrimaryButton } from '@/shared/ui';
import { useFaceRegistration, DuplicateCheckModal } from '@/features/face-registration';
import { useUserRepository } from '@/entities/user';
import type { User } from '@/shared/types';
import type { IUserRepository } from '@/shared/types/repository';
import type { IUserFormStrategy } from '../strategies';
import { CreateUserStrategy, UpdateUserStrategy } from '../strategies';

// Hooks
import { useUserFormCamera, useUserFormCapture } from './hooks';

interface UserFormModalProps {
  user?: User;
  modelStatus: 'idle' | 'loading' | 'loaded' | 'error';
  onSuccess: () => void;
  onClose: () => void;
}

/**
 * 사용자 등록/수정 모달 (OCP 원칙 적용)
 *
 * 책임: UI 렌더링 및 이벤트 조율
 * - Hook 조합
 * - 전략 패턴으로 등록/수정 로직 분리 (OCP)
 *
 * 이전: 342줄 (8개 useState, 5가지 책임, if-else 분기)
 * 현재: ~150줄 (조율만, 전략 패턴)
 */
export function UserFormModal({ user, modelStatus, onSuccess, onClose }: UserFormModalProps) {
  const { registerFaceWithData, addFaceToUserWithData } = useFaceRegistration();
  const userRepo: IUserRepository = useUserRepository();

  const [name, setName] = useState(user?.name || '');

  // 전략 패턴: 등록/수정 모드에 따라 전략 선택 (OCP)
  const strategy: IUserFormStrategy = useMemo(() => {
    if (user) {
      return new UpdateUserStrategy(user.id, userRepo);
    }
    return new CreateUserStrategy(userRepo, registerFaceWithData, addFaceToUserWithData);
  }, [user, userRepo, registerFaceWithData, addFaceToUserWithData]);

  // 분리된 Hook들
  const camera = useUserFormCamera();
  const capture = useUserFormCapture(camera.videoRef, camera.canvasRef, modelStatus, user);

  // 중복 확인 - 같은 사람
  const handleConfirmSamePerson = useCallback(() => {
    if (!capture.duplicateUser || !capture.pendingDescriptor || !capture.pendingImageData) return;

    const success = addFaceToUserWithData(
      capture.duplicateUser.id,
      capture.pendingDescriptor,
      capture.pendingImageData
    );

    if (success) {
      capture.closeDuplicateModal();
      onSuccess();
      onClose();
    }
  }, [addFaceToUserWithData, capture, onSuccess, onClose]);

  // 중복 확인 - 다른 사람
  const handleConfirmDifferentPerson = useCallback(() => {
    if (!capture.pendingDescriptor || !capture.pendingImageData || !name.trim()) return;

    const success = registerFaceWithData(name.trim(), capture.pendingDescriptor, capture.pendingImageData);

    if (success) {
      capture.closeDuplicateModal();
      onSuccess();
      onClose();
    }
  }, [capture, name, registerFaceWithData, onSuccess, onClose]);

  // 캡처 후 카메라 종료
  const handleCaptureWithCameraOff = useCallback(async () => {
    await capture.handleCapture();
    if (capture.capturedImage) {
      camera.turnOffCamera();
    }
  }, [capture, camera]);

  // 재촬영
  const handleRetake = useCallback(() => {
    capture.handleRetake();
    camera.turnOnCamera();
  }, [capture, camera]);

  // 폼 제출 (전략 패턴 사용)
  const handleSubmit = useCallback(() => {
    if (!name.trim()) {
      return;
    }

    if (!capture.capturedDescriptor || !capture.capturedImage) {
      return;
    }

    // 전략 패턴: 등록/수정 로직을 전략에 위임 (OCP)
    const success = strategy.submit({
      name: name.trim(),
      descriptor: capture.capturedDescriptor,
      imageData: capture.capturedImage,
    });

    if (success) {
      onSuccess();
      onClose();
    }
  }, [name, capture.capturedDescriptor, capture.capturedImage, strategy, onSuccess, onClose]);

  return (
    <>
      {/* 중복 확인 모달 */}
      {capture.showDuplicateModal && capture.duplicateUser && capture.pendingImageData && (
        <DuplicateCheckModal
          isOpen={capture.showDuplicateModal}
          existingUser={capture.duplicateUser}
          newFaceImage={capture.pendingImageData}
          confidence={capture.duplicateConfidence}
          onConfirmSamePerson={handleConfirmSamePerson}
          onConfirmDifferentPerson={handleConfirmDifferentPerson}
          onCancel={capture.closeDuplicateModal}
        />
      )}

      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          {/* 헤더 */}
          <div className="p-6 border-b border-gray-200 flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900">{strategy.getTitle()}</h2>
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
                {capture.capturedImage && !camera.isCameraOn ? (
                  <div className="space-y-4">
                    <div className="rounded-lg overflow-hidden bg-black">
                      <Image src={capture.capturedImage} alt="캡처된 얼굴" width={400} height={300} className="w-full h-auto" />
                    </div>
                    <PrimaryButton onClick={handleRetake} variant="gray" className="w-full">
                      다시 촬영
                    </PrimaryButton>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="rounded-lg overflow-hidden bg-black">
                      <CameraView
                        onVideoReady={camera.handleVideoReady}
                        showControls={false}
                        autoStart={camera.isCameraOn}
                      />
                    </div>
                    <PrimaryButton
                      onClick={handleCaptureWithCameraOff}
                      disabled={modelStatus !== 'loaded' || capture.isCapturing}
                      variant="blue"
                      className="w-full"
                      icon={
                        capture.isCapturing ? (
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
                      {capture.isCapturing ? '캡처 중...' : '얼굴 캡처'}
                    </PrimaryButton>
                  </div>
                )}
              </div>
            </div>

            {/* 에러 메시지 */}
            {capture.error && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
                {capture.error}
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
              disabled={!name.trim() || !capture.capturedDescriptor}
            >
              {strategy.getButtonLabel()}
            </PrimaryButton>
          </div>
        </div>
      </div>
    </>
  );
}
