'use client';

import { useUserStore } from '@/entities/user';
import Link from 'next/link';

export function UserManagementPanel() {
  const { users, removeUser } = useUserStore();

  const handleDelete = (id: string, name: string) => {
    if (confirm(`"${name}" 사용자를 삭제하시겠습니까?`)) {
      removeUser(id);
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
    <div className="bg-black/40 backdrop-blur-md rounded-3xl overflow-hidden shadow-2xl border border-white/10">
      <div className="p-5 border-b border-white/10 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-white">등록된 사용자</h2>
        <Link href="/register">
          <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium transition-all shadow-lg shadow-blue-500/20 flex items-center gap-2">
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
            사용자 등록
          </button>
        </Link>
      </div>
      <div className="p-5 max-h-96 overflow-y-auto">
        {users.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <svg
              className="w-16 h-16 mx-auto mb-4 opacity-30"
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
            <p className="text-lg mb-4">등록된 사용자가 없습니다</p>
            <Link href="/register">
              <button className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium transition-all shadow-lg shadow-blue-500/20">
                첫 번째 사용자 등록하기
              </button>
            </Link>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {users.map((user) => (
                <div
                  key={user.id}
                  className="bg-white/5 border border-white/10 rounded-2xl p-4 hover:bg-white/10 transition-all group"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h3 className="font-semibold text-white text-lg mb-1">
                        {user.name}
                      </h3>
                      <p className="text-xs text-gray-500">
                        등록일: {formatDate(user.registeredAt)}
                      </p>
                    </div>
                    <button
                      onClick={() => handleDelete(user.id, user.name)}
                      className="opacity-0 group-hover:opacity-100 transition-opacity text-red-400 hover:text-red-300 p-2 rounded-lg hover:bg-red-500/10"
                      title="삭제"
                    >
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
                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                        />
                      </svg>
                    </button>
                  </div>

                  {user.imageData && (
                    <div className="aspect-square rounded-xl overflow-hidden bg-gray-900 border border-white/10">
                      <img
                        src={user.imageData}
                        alt={user.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}

                  {!user.imageData && (
                    <div className="aspect-square rounded-xl bg-gray-900 border border-white/10 flex items-center justify-center">
                      <svg
                        className="w-16 h-16 text-gray-700"
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

            <div className="mt-6 pt-5 border-t border-white/10 text-center">
              <p className="text-sm text-gray-500">
                총 <span className="text-blue-400 font-bold">{users.length}</span>명의 사용자가 등록되어 있습니다
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
