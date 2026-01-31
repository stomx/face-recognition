'use client';

import { Modal, Button } from '@/shared/ui';
import type { User } from '@/shared/types';

interface DuplicateCheckModalProps {
  isOpen: boolean;
  existingUser: User;
  newFaceImage: string;
  confidence: number;
  onConfirmSamePerson: () => void;
  onConfirmDifferentPerson: () => void;
  onCancel: () => void;
}

export function DuplicateCheckModal({
  isOpen,
  existingUser,
  newFaceImage,
  confidence,
  onConfirmSamePerson,
  onConfirmDifferentPerson,
  onCancel,
}: DuplicateCheckModalProps) {
  return (
    <Modal isOpen={isOpen} onClose={onCancel} title="유사한 얼굴 발견">
      <div className="space-y-4">
        {/* 경고 메시지 */}
        <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <div className="flex items-start gap-3">
            <svg
              className="w-6 h-6 text-yellow-600 flex-shrink-0 mt-0.5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
            <div>
              <h4 className="font-semibold text-yellow-800 mb-1">
                이미 등록된 사용자와 {Math.round(confidence * 100)}% 일치합니다
              </h4>
              <p className="text-sm text-yellow-700">
                등록하려는 얼굴이 기존 사용자와 동일인물인지 확인해주세요.
              </p>
            </div>
          </div>
        </div>

        {/* 얼굴 비교 */}
        <div className="grid grid-cols-2 gap-4">
          {/* 기존 사용자 */}
          <div className="space-y-2">
            <h5 className="text-sm font-medium text-gray-700 text-center">
              기존 등록된 사용자
            </h5>
            <div className="border-2 border-blue-300 rounded-xl overflow-hidden bg-blue-50 p-2">
              <div className="aspect-square rounded-lg overflow-hidden bg-white">
                {existingUser.faceImages[0] || existingUser.imageData ? (
                  <img
                    src={existingUser.faceImages[0] || existingUser.imageData}
                    alt={existingUser.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <svg
                      className="w-16 h-16 text-gray-300"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                      />
                    </svg>
                  </div>
                )}
              </div>
              <div className="mt-2 text-center">
                <p className="font-semibold text-gray-900">{existingUser.name}</p>
                <p className="text-xs text-gray-500">
                  {existingUser.faceDescriptors.length}개 얼굴 등록됨
                </p>
              </div>
            </div>
          </div>

          {/* 새로 등록할 얼굴 */}
          <div className="space-y-2">
            <h5 className="text-sm font-medium text-gray-700 text-center">
              새로 등록할 얼굴
            </h5>
            <div className="border-2 border-green-300 rounded-xl overflow-hidden bg-green-50 p-2">
              <div className="aspect-square rounded-lg overflow-hidden bg-white">
                <img
                  src={newFaceImage}
                  alt="새 얼굴"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="mt-2 text-center">
                <p className="font-semibold text-gray-900">새 얼굴</p>
                <p className="text-xs text-green-600">
                  일치율 {Math.round(confidence * 100)}%
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* 선택 버튼 */}
        <div className="space-y-3 pt-2">
          <Button
            variant="primary"
            className="w-full cursor-pointer"
            onClick={onConfirmSamePerson}
          >
            <svg
              className="w-5 h-5 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            동일인물입니다 (기존 사용자에 얼굴 추가)
          </Button>

          <Button
            variant="secondary"
            className="w-full cursor-pointer"
            onClick={onConfirmDifferentPerson}
          >
            <svg
              className="w-5 h-5 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"
              />
            </svg>
            다른 사람입니다 (새 사용자로 등록)
          </Button>

          <Button variant="danger" className="w-full cursor-pointer" onClick={onCancel}>
            취소
          </Button>
        </div>
      </div>
    </Modal>
  );
}
