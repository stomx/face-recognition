import { UserCard } from '@/entities/user';
import { Card, CardHeader, CardBody, Badge, EmptyState } from '@/shared/ui';
import type { User } from '@/shared/types';

interface UserListSectionProps {
  users: User[];
  onDeleteUser: (id: string) => void;
  onDeleteFace: (userId: string, faceIndex: number) => void;
}

/**
 * RegisterPage 사용자 목록 섹션 (SRP 적용)
 *
 * 책임: 등록된 사용자 목록 렌더링
 */
export function UserListSection({
  users,
  onDeleteUser,
  onDeleteFace,
}: UserListSectionProps) {
  return (
    <div>
      <Card>
        <CardHeader className="p-3 portrait:p-4 xl:p-4 2xl:p-5 3xl:p-6">
          <div className="flex items-center justify-between">
            <h2 className="text-base portrait:text-lg xl:text-lg 2xl:text-xl 3xl:text-2xl font-semibold text-gray-900">
              등록된 사용자
            </h2>
            <Badge variant="info" className="text-xs portrait:text-sm xl:text-sm 2xl:text-base 3xl:text-lg">
              {users.length}명
            </Badge>
          </div>
        </CardHeader>
        <CardBody className="max-h-[300px] portrait:max-h-[400px] xl:max-h-[500px] 2xl:max-h-[600px] 3xl:max-h-[700px] overflow-y-auto p-3 portrait:p-4 xl:p-4 2xl:p-5 3xl:p-6">
          {users.length === 0 ? (
            <EmptyState
              icon={
                <svg
                  className="w-full h-full"
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
              }
              title="아직 등록된 사용자가 없습니다"
              description="위에서 첫 번째 사용자를 등록해보세요!"
              className="py-6 portrait:py-8 xl:py-8 2xl:py-10 3xl:py-12 text-gray-500"
            />
          ) : (
            <div className="space-y-2 portrait:space-y-3 xl:space-y-3 2xl:space-y-4 3xl:space-y-5">
              {users.map((user) => (
                <UserCard
                  key={user.id}
                  user={user}
                  onDelete={onDeleteUser}
                  onDeleteFace={onDeleteFace}
                />
              ))}
            </div>
          )}
        </CardBody>
      </Card>
    </div>
  );
}
