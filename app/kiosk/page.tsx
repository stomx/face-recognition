'use client';

import dynamic from 'next/dynamic';
import { LoadingSpinner } from '@/shared/ui';

// SSR 비활성화 - face-api.js는 브라우저에서만 동작
const HomePage = dynamic(
  () => import('@/pages/home').then((mod) => mod.HomePage),
  {
    ssr: false,
    loading: () => (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <LoadingSpinner size="md" text="로딩 중..." />
      </div>
    ),
  }
);

export default function KioskPage() {
  return <HomePage />;
}
