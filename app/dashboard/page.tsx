'use client';

import dynamic from 'next/dynamic';

// SSR 비활성화 - face-api.js는 브라우저에서만 동작
const DashboardPage = dynamic(
  () => import('@/pages/dashboard').then((mod) => mod.DashboardPage),
  {
    ssr: false,
    loading: () => (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">대시보드 로딩 중...</p>
        </div>
      </div>
    ),
  }
);

export default function Dashboard() {
  return <DashboardPage />;
}
