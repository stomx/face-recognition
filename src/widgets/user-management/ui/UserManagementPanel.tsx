'use client';

import { useState } from 'react';
import Image from 'next/image';
import { useUserRepository } from '@/entities/user';
import { ConfirmDialog, PrimaryButton } from '@/shared/ui';
import Link from 'next/link';

export function UserManagementPanel() {
  const userRepo = useUserRepository();
  const users = userRepo.getAll();
  const [deleteConfirm, setDeleteConfirm] = useState<{ id: string; name: string } | null>(null);

  const handleDeleteClick = (id: string, name: string) => {
    setDeleteConfirm({ id, name });
  };

  const handleConfirmDelete = () => {
    if (deleteConfirm) {
      userRepo.remove(deleteConfirm.id);
      setDeleteConfirm(null);
    }
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('ko-KR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    }).format(date);
  };

  return (
    <>
      <div className="bg-white rounded-3xl overflow-hidden shadow-lg border border-gray-200">
        <div className="p-4 hd-p:p-5 fhd-p:p-5 qhd-p:p-7 hd-l:p-5 fhd-l:p-5 qhd-l:p-8 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-base hd-p:text-lg fhd-p:text-lg qhd-p:text-xl hd-l:text-lg fhd-l:text-lg qhd-l:text-2xl font-semibold text-gray-900">등록된 사용자</h2>
          <Link href="/register">
            <PrimaryButton
              onClick={() => {}}
              variant="blue"
              size="sm"
              icon={
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 4v16m8-8H4"
                  />
                </svg>
              }
            >
              사용자 등록
            </PrimaryButton>
          </Link>
        </div>
        <div className="p-4 hd-p:p-5 fhd-p:p-5 qhd-p:p-7 hd-l:p-5 fhd-l:p-5 qhd-l:p-8 max-h-80 hd-p:max-h-96 fhd-p:max-h-96 qhd-p:max-h-[32rem] hd-l:max-h-96 fhd-l:max-h-96 qhd-l:max-h-[40rem] overflow-y-auto">
          {users.length === 0 ? (
            <div className="text-center py-10 hd-p:py-12 fhd-p:py-12 qhd-p:py-16 hd-l:py-12 fhd-l:py-12 qhd-l:py-20 text-gray-500">
              <svg
                className="w-12 h-12 hd-p:w-16 hd-p:h-16 fhd-p:w-16 fhd-p:h-16 qhd-p:w-20 qhd-p:h-20 hd-l:w-16 hd-l:h-16 fhd-l:w-16 fhd-l:h-16 qhd-l:w-24 qhd-l:h-24 mx-auto mb-3 hd-p:mb-4 fhd-p:mb-4 qhd-p:mb-6 hd-l:mb-4 fhd-l:mb-4 qhd-l:mb-8 opacity-30"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                />
              </svg>
              <p className="text-base hd-p:text-lg fhd-p:text-lg qhd-p:text-xl hd-l:text-lg fhd-l:text-lg qhd-l:text-2xl mb-3 hd-p:mb-4 fhd-p:mb-4 qhd-p:mb-6 hd-l:mb-4 fhd-l:mb-4 qhd-l:mb-8">등록된 사용자가 없습니다</p>
              <Link href="/register">
                <PrimaryButton onClick={() => {}} variant="blue" size="md">
                  첫 번째 사용자 등록하기
                </PrimaryButton>
              </Link>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 hd-p:gap-4 fhd-p:gap-4 qhd-p:gap-6 hd-l:gap-4 fhd-l:gap-4 qhd-l:gap-8">
                {users.map((user) => (
                  <div
                    key={user.id}
                    className="bg-gray-50 border border-gray-200 rounded-2xl p-3 hd-p:p-4 fhd-p:p-4 qhd-p:p-6 hd-l:p-4 fhd-l:p-4 qhd-l:p-8 hover:bg-gray-100 transition-all group"
                  >
                    <div className="flex items-start justify-between mb-2 hd-p:mb-3 fhd-p:mb-3 qhd-p:mb-4 hd-l:mb-3 fhd-l:mb-3 qhd-l:mb-6">
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 text-base hd-p:text-lg fhd-p:text-lg qhd-p:text-xl hd-l:text-lg fhd-l:text-lg qhd-l:text-2xl mb-0.5 hd-p:mb-1 fhd-p:mb-1 qhd-p:mb-1.5 hd-l:mb-1 fhd-l:mb-1 qhd-l:mb-2">
                          {user.name}
                        </h3>
                        <p className="text-[10px] hd-p:text-xs fhd-p:text-xs qhd-p:text-sm hd-l:text-xs fhd-l:text-xs qhd-l:text-base text-gray-500">
                          등록일: {formatDate(user.registeredAt)}
                        </p>
                      </div>
                      <button
                        onClick={() => handleDeleteClick(user.id, user.name)}
                        className="opacity-0 group-hover:opacity-100 transition-opacity text-red-400 hover:text-red-300 p-1.5 hd-p:p-2 fhd-p:p-2 qhd-p:p-3 hd-l:p-2 fhd-l:p-2 qhd-l:p-4 rounded-lg hover:bg-red-500/10"
                        title="삭제"
                      >
                        <svg
                          className="w-4 h-4 hd-p:w-5 hd-p:h-5 fhd-p:w-5 fhd-p:h-5 qhd-p:w-6 qhd-p:h-6 hd-l:w-5 hd-l:h-5 fhd-l:w-5 fhd-l:h-5 qhd-l:w-7 qhd-l:h-7"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                          />
                        </svg>
                      </button>
                    </div>

                    {user.imageData && (
                      <div className="aspect-square rounded-xl overflow-hidden bg-gray-200 border border-gray-300">
                        <Image
                          src={user.imageData}
                          alt={user.name}
                          width={300}
                          height={300}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}

                    {!user.imageData && (
                      <div className="aspect-square rounded-xl bg-gray-200 border border-gray-300 flex items-center justify-center">
                        <svg
                          className="w-12 h-12 hd-p:w-16 hd-p:h-16 fhd-p:w-16 fhd-p:h-16 qhd-p:w-20 qhd-p:h-20 hd-l:w-16 hd-l:h-16 fhd-l:w-16 fhd-l:h-16 qhd-l:w-24 qhd-l:h-24 text-gray-700"
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
                ))}
              </div>

              <div className="mt-4 hd-p:mt-6 fhd-p:mt-6 qhd-p:mt-8 hd-l:mt-6 fhd-l:mt-6 qhd-l:mt-10 pt-4 hd-p:pt-5 fhd-p:pt-5 qhd-p:pt-7 hd-l:pt-5 fhd-l:pt-5 qhd-l:pt-8 border-t border-gray-200 text-center">
                <p className="text-xs hd-p:text-sm fhd-p:text-sm qhd-p:text-base hd-l:text-sm fhd-l:text-sm qhd-l:text-lg text-gray-600">
                  총 <span className="text-blue-600 font-bold">{users.length}</span>명의 사용자가 등록되어 있습니다
                </p>
              </div>
            </>
          )}
        </div>
      </div>

      {/* 삭제 확인 다이얼로그 */}
      {deleteConfirm && (
        <ConfirmDialog
          title="사용자 삭제"
          message={`"${deleteConfirm.name}" 사용자를 삭제하시겠습니까?`}
          confirmText="삭제"
          cancelText="취소"
          onConfirm={handleConfirmDelete}
          onCancel={() => setDeleteConfirm(null)}
        />
      )}
    </>
  );
}
