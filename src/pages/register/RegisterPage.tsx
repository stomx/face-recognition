'use client';

import { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { useUserStore, UserCard } from '@/entities/user';
import { useFaceDetection } from '@/features/face-detection';
import { useFaceRegistration } from '@/features/face-registration';
import { CameraView } from '@/widgets/camera-view';
import { Card, CardHeader, CardBody, Button, Input, Badge, LoadingSpinner, EmptyState } from '@/shared/ui';

export function RegisterPage() {
  const { users, isHydrated, hydrate, removeUser, removeFaceFromUser } = useUserStore();
  const { modelStatus, initializeModels, startContinuousDetection, stopContinuousDetection } =
    useFaceDetection();
  const { isRegistering, registrationError, registerFace, addFaceToExistingUser, clearError } =
    useFaceRegistration();

  const [name, setName] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);
  const [isAddingToExisting, setIsAddingToExisting] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<string>('');
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // 초기화
  useEffect(() => {
    hydrate();
    initializeModels();
  }, [hydrate, initializeModels]);

  const handleVideoReady = (video: HTMLVideoElement, canvas: HTMLCanvasElement) => {
    videoRef.current = video;
    canvasRef.current = canvas;

    if (modelStatus === 'loaded') {
      startContinuousDetection(video, canvas);
    }
  };

  // 모델 로드 완료 시 감지 시작
  useEffect(() => {
    if (modelStatus === 'loaded' && videoRef.current && canvasRef.current) {
      startContinuousDetection(videoRef.current, canvasRef.current);
    }
  }, [modelStatus, startContinuousDetection]);

  const handleVideoStop = () => {
    stopContinuousDetection();
  };

  const handleRegister = async () => {
    if (!videoRef.current || !canvasRef.current) return;

    clearError();
    let success = false;

    if (isAddingToExisting) {
      // 기존 사용자에게 얼굴 추가
      const selectedUser = users.find(u => u.id === selectedUserId);
      if (selectedUser) {
        success = await addFaceToExistingUser(videoRef.current, canvasRef.current, selectedUser.name);
      }
    } else {
      // 새 사용자 등록
      success = await registerFace(videoRef.current, canvasRef.current, name);
    }

    if (success) {
      setName('');
      setSelectedUserId('');
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    }
  };

  const handleDeleteUser = (id: string) => {
    if (window.confirm('정말로 이 사용자를 삭제하시겠습니까?')) {
      removeUser(id);
    }
  };

  const handleDeleteFace = (userId: string, faceIndex: number) => {
    removeFaceFromUser(userId, faceIndex);
  };

  if (!isHydrated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" text="로딩 중..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* 헤더 - 적응형 (가로/세로) */}
      <header className="bg-white shadow-sm">
        <div className="max-w-[1200px] xl:max-w-[1400px] 2xl:max-w-[1800px] 3xl:max-w-[2200px] mx-auto px-4 portrait:px-5 py-3 portrait:py-4 xl:py-4 2xl:py-5 3xl:py-6 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 portrait:gap-3 xl:gap-3 2xl:gap-4 3xl:gap-5">
              <Link href="/" className="text-gray-500 hover:text-gray-700">
                <svg
                  className="w-5 h-5 portrait:w-6 portrait:h-6 xl:w-6 xl:h-6 2xl:w-7 2xl:h-7 3xl:w-8 3xl:h-8"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M10 19l-7-7m0 0l7-7m-7 7h18"
                  />
                </svg>
              </Link>
              <div>
                <h1 className="text-lg portrait:text-xl xl:text-xl 2xl:text-2xl 3xl:text-3xl font-bold text-gray-900">사용자 등록</h1>
                <p className="text-xs portrait:text-sm xl:text-sm 2xl:text-base 3xl:text-lg text-gray-500">새로운 사용자의 얼굴을 등록합니다</p>
              </div>
            </div>

            <Badge
              variant={
                modelStatus === 'loaded'
                  ? 'success'
                  : modelStatus === 'loading'
                  ? 'warning'
                  : 'default'
              }
              className="text-xs portrait:text-sm xl:text-sm 2xl:text-base 3xl:text-lg"
            >
              {modelStatus === 'loaded'
                ? '모델 준비 완료'
                : modelStatus === 'loading'
                ? '모델 로딩 중...'
                : '대기 중'}
            </Badge>
          </div>
        </div>
      </header>

      {/* 메인 콘텐츠 - 적응형 (가로/세로) */}
      <main className="max-w-[1200px] xl:max-w-[1400px] 2xl:max-w-[1800px] 3xl:max-w-[2200px] mx-auto px-4 portrait:px-5 py-4 portrait:py-5 xl:py-6 2xl:py-8 3xl:py-10 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 portrait:grid-cols-1 lg:grid-cols-2 gap-4 portrait:gap-5 xl:gap-6 2xl:gap-8 3xl:gap-10">
          {/* 카메라 및 등록 폼 */}
          <div className="space-y-3 portrait:space-y-4 xl:space-y-4 2xl:space-y-6 3xl:space-y-8">
            <CameraView
              onVideoReady={handleVideoReady}
              onVideoStop={handleVideoStop}
              autoStart
              showControls={false}
            />

            <Card>
              <CardHeader className="p-3 portrait:p-4 xl:p-4 2xl:p-5 3xl:p-6">
                <h2 className="text-base portrait:text-lg xl:text-lg 2xl:text-xl 3xl:text-2xl font-semibold text-gray-900">얼굴 등록</h2>
              </CardHeader>
              <CardBody className="space-y-3 portrait:space-y-4 xl:space-y-4 2xl:space-y-5 3xl:space-y-6 p-3 portrait:p-4 xl:p-4 2xl:p-5 3xl:p-6">
                {/* 등록 모드 선택 */}
                <div className="flex items-center gap-4 p-3 portrait:p-4 bg-gray-50 rounded-lg">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      checked={!isAddingToExisting}
                      onChange={() => {
                        setIsAddingToExisting(false);
                        setSelectedUserId('');
                      }}
                      className="w-4 h-4 text-blue-600"
                    />
                    <span className="text-xs portrait:text-sm xl:text-sm 2xl:text-base font-medium">새 사용자</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      checked={isAddingToExisting}
                      onChange={() => setIsAddingToExisting(true)}
                      className="w-4 h-4 text-blue-600"
                      disabled={users.length === 0}
                    />
                    <span className="text-xs portrait:text-sm xl:text-sm 2xl:text-base font-medium">기존 사용자에 추가</span>
                  </label>
                </div>

                {/* 새 사용자 입력 */}
                {!isAddingToExisting && (
                  <Input
                    label="이름"
                    placeholder="등록할 사용자의 이름을 입력하세요"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    error={registrationError || undefined}
                    className="text-sm portrait:text-base xl:text-base 2xl:text-lg 3xl:text-xl"
                  />
                )}

                {/* 기존 사용자 선택 */}
                {isAddingToExisting && (
                  <div className="space-y-2">
                    <label className="block text-xs portrait:text-sm xl:text-sm 2xl:text-base font-medium text-gray-700">
                      사용자 선택
                    </label>
                    <select
                      value={selectedUserId}
                      onChange={(e) => setSelectedUserId(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs portrait:text-sm xl:text-sm 2xl:text-base focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">사용자를 선택하세요</option>
                      {users.map((user) => (
                        <option key={user.id} value={user.id}>
                          {user.name} ({user.faceDescriptors.length}개 얼굴 등록됨)
                        </option>
                      ))}
                    </select>
                    {registrationError && (
                      <p className="text-xs portrait:text-sm text-red-600">{registrationError}</p>
                    )}
                  </div>
                )}

                <div className="flex gap-2 portrait:gap-3 xl:gap-3 2xl:gap-4">
                  <Button
                    variant="primary"
                    className="flex-1 text-xs portrait:text-sm xl:text-sm 2xl:text-base 3xl:text-lg py-2 portrait:py-2.5 xl:py-2.5 2xl:py-3 3xl:py-3.5"
                    onClick={handleRegister}
                    disabled={
                      modelStatus !== 'loaded' ||
                      isRegistering ||
                      (!isAddingToExisting && !name.trim()) ||
                      (isAddingToExisting && !selectedUserId) ||
                      !videoRef.current
                    }
                    isLoading={isRegistering}
                  >
                    {isRegistering ? '등록 중...' : (isAddingToExisting ? '얼굴 추가' : '얼굴 등록')}
                  </Button>
                </div>

                {/* 성공 메시지 */}
                {showSuccess && (
                  <div className="p-3 portrait:p-4 xl:p-4 2xl:p-5 bg-green-50 border border-green-200 rounded-lg xl:rounded-xl">
                    <div className="flex items-center gap-2 portrait:gap-3 text-green-800">
                      <svg
                        className="w-4 h-4 portrait:w-5 portrait:h-5 xl:w-5 xl:h-5 2xl:w-6 2xl:h-6 3xl:w-7 3xl:h-7"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                      <span className="font-medium text-xs portrait:text-sm xl:text-sm 2xl:text-base 3xl:text-lg">등록이 완료되었습니다!</span>
                    </div>
                  </div>
                )}

                {/* 안내 메시지 */}
                <div className="p-3 portrait:p-4 xl:p-4 2xl:p-5 bg-blue-50 border border-blue-200 rounded-lg xl:rounded-xl">
                  <h4 className="font-medium text-blue-800 mb-1.5 portrait:mb-2 xl:mb-2 2xl:mb-3 text-xs portrait:text-sm xl:text-sm 2xl:text-base 3xl:text-lg">등록 팁</h4>
                  <ul className="text-[10px] portrait:text-xs xl:text-xs 2xl:text-sm 3xl:text-base text-blue-700 space-y-0.5 portrait:space-y-1 xl:space-y-1 2xl:space-y-1.5">
                    <li>• 카메라를 정면으로 바라봐주세요</li>
                    <li>• 얼굴이 초록색 박스 안에 들어오도록 해주세요</li>
                    <li>• 밝은 조명 아래에서 등록하면 더 정확합니다</li>
                  </ul>
                </div>
              </CardBody>
            </Card>
          </div>

          {/* 등록된 사용자 목록 */}
          <div>
            <Card>
              <CardHeader className="p-3 portrait:p-4 xl:p-4 2xl:p-5 3xl:p-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-base portrait:text-lg xl:text-lg 2xl:text-xl 3xl:text-2xl font-semibold text-gray-900">
                    등록된 사용자
                  </h2>
                  <Badge variant="info" className="text-xs portrait:text-sm xl:text-sm 2xl:text-base 3xl:text-lg">{users.length}명</Badge>
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
                        onDelete={handleDeleteUser}
                        onDeleteFace={handleDeleteFace}
                      />
                    ))}
                  </div>
                )}
              </CardBody>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
