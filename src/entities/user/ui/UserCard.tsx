'use client';

import type { User } from '@/shared/types';
import { Card, CardBody, Button } from '@/shared/ui';

interface UserCardProps {
  user: User;
  onDelete?: (id: string) => void;
}

export function UserCard({ user, onDelete }: UserCardProps) {
  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  return (
    <Card variant="outlined" className="hover:shadow-md transition-shadow">
      <CardBody className="flex items-center gap-3 portrait:gap-4 xl:gap-4 2xl:gap-5 3xl:gap-6 p-2.5 portrait:p-3 xl:p-3 2xl:p-4 3xl:p-5">
        {user.imageData ? (
          <img
            src={user.imageData}
            alt={user.name}
            className="w-12 h-12 portrait:w-14 portrait:h-14 xl:w-16 xl:h-16 2xl:w-20 2xl:h-20 3xl:w-24 3xl:h-24 rounded-full object-cover border-2 border-gray-200"
          />
        ) : (
          <div className="w-12 h-12 portrait:w-14 portrait:h-14 xl:w-16 xl:h-16 2xl:w-20 2xl:h-20 3xl:w-24 3xl:h-24 rounded-full bg-gray-200 flex items-center justify-center">
            <span className="text-xl portrait:text-2xl xl:text-2xl 2xl:text-3xl 3xl:text-4xl text-gray-500">
              {user.name.charAt(0).toUpperCase()}
            </span>
          </div>
        )}

        <div className="flex-1 min-w-0">
          <h3 className="text-sm portrait:text-base xl:text-lg 2xl:text-xl 3xl:text-2xl font-semibold text-gray-900 truncate">
            {user.name}
          </h3>
          <p className="text-[10px] portrait:text-xs xl:text-sm 2xl:text-base 3xl:text-lg text-gray-500">
            등록일: {formatDate(user.registeredAt)}
          </p>
        </div>

        {onDelete && (
          <Button
            variant="danger"
            size="sm"
            onClick={() => onDelete(user.id)}
            className="text-[10px] portrait:text-xs xl:text-xs 2xl:text-sm 3xl:text-base px-2 portrait:px-2.5 xl:px-3 2xl:px-4 3xl:px-5 py-1 portrait:py-1.5 xl:py-1.5 2xl:py-2 3xl:py-2.5"
          >
            삭제
          </Button>
        )}
      </CardBody>
    </Card>
  );
}
