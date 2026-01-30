'use client';

import { useUserStore } from '@/entities/user';
import { Card, CardHeader, CardBody, Button } from '@/shared/ui';
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
    <Card>
      <CardHeader className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900">등록된 사용자</h2>
        <Link href="/register">
          <Button variant="primary" size="sm">
            <svg
              className="w-4 h-4 mr-1.5"
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
          </Button>
        </Link>
      </CardHeader>
      <CardBody className="max-h-96 overflow-y-auto">
        {users.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <svg
              className="w-12 h-12 mx-auto mb-3 opacity-50"
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
            <p className="mb-3">등록된 사용자가 없습니다</p>
            <Link href="/register">
              <Button variant="primary" size="sm">
                첫 번째 사용자 등록하기
              </Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {users.map((user) => (
              <div
                key={user.id}
                className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 mb-1">
                      {user.name}
                    </h3>
                    <p className="text-xs text-gray-500">
                      등록일: {formatDate(user.registeredAt)}
                    </p>
                  </div>
                  <button
                    onClick={() => handleDelete(user.id, user.name)}
                    className="text-red-600 hover:text-red-700 p-1 rounded hover:bg-red-50"
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
                  <div className="aspect-square rounded-lg overflow-hidden bg-gray-100">
                    <img
                      src={user.imageData}
                      alt={user.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}

                {!user.imageData && (
                  <div className="aspect-square rounded-lg bg-gray-100 flex items-center justify-center">
                    <svg
                      className="w-12 h-12 text-gray-400"
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
        )}

        {users.length > 0 && (
          <div className="mt-4 pt-4 border-t text-center text-sm text-gray-600">
            총 {users.length}명의 사용자가 등록되어 있습니다
          </div>
        )}
      </CardBody>
    </Card>
  );
}
