'use client';

import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
      <div className="max-w-4xl w-full">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            얼굴 인식 출입 통제 시스템
          </h1>
          <p className="text-lg text-gray-600">
            사용 모드를 선택하세요
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* 실제 사용 모드 */}
          <Link href="/kiosk">
            <div className="bg-white rounded-xl shadow-md hover:shadow-xl transition-shadow duration-300 p-8 cursor-pointer border-2 border-transparent hover:border-blue-500 group">
              <div className="flex flex-col items-center text-center">
                <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mb-6 group-hover:bg-blue-200 transition-colors">
                  <svg
                    className="w-10 h-10 text-blue-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                    />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-3">
                  실제 사용 모드
                </h2>
                <p className="text-gray-600 leading-relaxed">
                  출입 통제를 위한 실제 사용 화면입니다.
                  <br />
                  카메라를 통한 얼굴 인식 및 출입 기록을 확인할 수 있습니다.
                </p>
              </div>
            </div>
          </Link>

          {/* 대시보드 테스트 모드 */}
          <Link href="/dashboard">
            <div className="bg-white rounded-xl shadow-md hover:shadow-xl transition-shadow duration-300 p-8 cursor-pointer border-2 border-transparent hover:border-purple-500 group">
              <div className="flex flex-col items-center text-center">
                <div className="w-20 h-20 bg-purple-100 rounded-full flex items-center justify-center mb-6 group-hover:bg-purple-200 transition-colors">
                  <svg
                    className="w-10 h-10 text-purple-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                    />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-3">
                  대시보드 테스트
                </h2>
                <p className="text-gray-600 leading-relaxed">
                  관리자용 대시보드 화면입니다.
                  <br />
                  카메라 제어, 사용자 관리, 출입 기록 분석 등 다양한 기능을 테스트할 수 있습니다.
                </p>
              </div>
            </div>
          </Link>
        </div>

        <div className="mt-8 text-center">
          <Link href="/register">
            <button className="text-blue-600 hover:text-blue-700 font-medium">
              사용자 등록 →
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}
