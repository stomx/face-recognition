'use client';

import dynamic from 'next/dynamic';
import { LoadingSpinner } from '@/shared/ui';

// SSR 비활성화 - face-api.js는 브라우저에서만 동작
const DashboardPage = dynamic(
  () => import('@/pages/dashboard').then((mod) => mod.DashboardPage),
  {
    ssr: false,
    loading: () => (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <LoadingSpinner size="md" text="대시보드 로딩 중..." />
      </div>
    ),
  }
);

export default function Dashboard() {
  return <DashboardPage />;
}
