'use client';

import type { User } from '@/shared/types';
import { Modal, Button } from '@/shared/ui';

interface FaceListModalProps {
  user: User;
  onClose: () => void;
  onDeleteFace: (faceIndex: number) => void;
}

export function FaceListModal({ user, onClose, onDeleteFace }: FaceListModalProps) {
  const handleDeleteFace = (index: number) => {
    if (user.faceDescriptors.length === 1) {
      alert('마지막 얼굴은 삭제할 수 없습니다. 사용자를 삭제하려면 사용자 삭제 버튼을 사용하세요.');
      return;
    }

    if (confirm('이 얼굴을 삭제하시겠습니까?')) {
      onDeleteFace(index);
    }
  };

  return (
    <Modal isOpen={true} onClose={onClose} title={`${user.name}의 등록된 얼굴`}>
      <div className="mb-4">
        <p className="text-sm text-gray-500">총 {user.faceDescriptors.length}개 등록됨</p>
      </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {user.faceDescriptors.map((_, index) => {
            const imageData = user.faceImages[index] || user.imageData;
            return (
              <div key={index} className="relative group">
                <div className="aspect-square rounded-xl overflow-hidden border-2 border-gray-200 bg-gray-100">
                  {imageData ? (
                    <img
                      src={imageData}
                      alt={`얼굴 ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <svg className="w-12 h-12 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </div>
                  )}
                </div>

              <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => handleDeleteFace(index)}
                  className="bg-red-500 hover:bg-red-600 text-white rounded-lg p-2 shadow-lg cursor-pointer"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>

                <div className="mt-2 text-center">
                  <span className="text-xs text-gray-500">얼굴 {index + 1}</span>
                </div>
              </div>
            );
          })}
        </div>

      <div className="mt-6 flex justify-end">
        <Button variant="secondary" onClick={onClose} className="cursor-pointer">
          닫기
        </Button>
      </div>
    </Modal>
  );
}
