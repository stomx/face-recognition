'use client';

import { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { useUserRepository, useHydration } from '@/entities/user';
import { useFaceDetection } from '@/features/face-detection';
import { useFaceRegistration, DuplicateCheckModal } from '@/features/face-registration';
import { CameraView } from '@/widgets/camera-view';
import { Card, CardHeader, CardBody, Button, Input, LoadingSpinner } from '@/shared/ui';

// Hooks & Components (SRP 적용)
import { useDuplicateCheck } from './hooks';
import { UserListSection } from './components';

/**
 * RegisterPage (SRP 리팩터링 완료)
 *
 * 책임: 등록 페이지 오케스트레이션
 * - Hook 조합
 * - 이벤트 핸들링
 *
 * 이전: 432줄, 10개 이상 useState
 * 현재: ~200줄, 4개 useState
 */
export function RegisterPage() {
  const userRepo = useUserRepository();
  const { isHydrated, hydrate } = useHydration();
  const users = userRepo.getAll();
  const { modelStatus, initializeModels, startContinuousDetection, stopContinuousDetection } =
    useFaceDetection();
  const {
    isRegistering,
    registrationError,
    addFaceToExistingUser,
    checkForDuplicates,
    registerFaceWithData,
    addFaceToUserWithData,
    clearError,
  } = useFaceRegistration();

  // 로컬 상태 (5개)
  const [name, setName] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);
  const [isAddingToExisting, setIsAddingToExisting] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<string>('');
  const [isVideoReady, setIsVideoReady] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // 중복 체크 Hook (SRP 적용 - 5개 상태 분리)
  const duplicateCheck = useDuplicateCheck();

  // 초기화
  useEffect(() => {
    hydrate();
    initializeModels();
  }, [hydrate, initializeModels]);

  const handleVideoReady = (video: HTMLVideoElement, canvas: HTMLCanvasElement) => {
    videoRef.current = video;
    canvasRef.current = canvas;
    setIsVideoReady(true);

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
    setIsVideoReady(false);
  };

  const handleRegister = async () => {
    if (!videoRef.current || !canvasRef.current) return;

    clearError();

    if (isAddingToExisting) {
      // 기존 사용자에게 얼굴 추가 (중복 체크 건너뛰기)
      const selectedUser = users.find((u) => u.id === selectedUserId);
      if (selectedUser) {
        const success = await addFaceToExistingUser(
          videoRef.current,
          canvasRef.current,
          selectedUser.name
        );
        if (success) {
          setSelectedUserId('');
          setShowSuccess(true);
          setTimeout(() => setShowSuccess(false), 3000);
        }
      }
    } else {
      // 새 사용자 등록 - 중복 체크 먼저 수행
      const result = await checkForDuplicates(videoRef.current, canvasRef.current);

      if (!result.detection || !result.imageData) {
        // 얼굴 감지 실패 (에러는 이미 useFaceRegistration에서 설정됨)
        return;
      }

      if (result.hasDuplicate && result.duplicateUser) {
        // 중복 발견 - 모달 표시 (Hook 사용)
        duplicateCheck.showModal(
          result.duplicateUser,
          result.confidence,
          result.detection.descriptor,
          result.imageData,
          name
        );
      } else {
        // 중복 없음 - 바로 등록
        const success = registerFaceWithData(name, result.detection.descriptor, result.imageData);
        if (success) {
          setName('');
          setShowSuccess(true);
          setTimeout(() => setShowSuccess(false), 3000);
        }
      }
    }
  };

  const handleConfirmSamePerson = () => {
    if (!duplicateCheck.duplicateUser || !duplicateCheck.pendingDescriptor || !duplicateCheck.pendingImageData) return;

    const success = addFaceToUserWithData(
      duplicateCheck.duplicateUser.id,
      duplicateCheck.pendingDescriptor,
      duplicateCheck.pendingImageData
    );
    if (success) {
      setName('');
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    }

    duplicateCheck.closeModal();
  };

  const handleConfirmDifferentPerson = () => {
    if (!duplicateCheck.pendingDescriptor || !duplicateCheck.pendingImageData || !duplicateCheck.pendingName) return;

    const success = registerFaceWithData(
      duplicateCheck.pendingName,
      duplicateCheck.pendingDescriptor,
      duplicateCheck.pendingImageData
    );
    if (success) {
      setName('');
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    }

    duplicateCheck.closeModal();
  };

  const handleDeleteUser = (id: string) => {
    if (window.confirm('정말로 이 사용자를 삭제하시겠습니까?')) {
      userRepo.remove(id);
    }
  };

  const handleDeleteFace = (userId: string, faceIndex: number) => {
    userRepo.removeFace(userId, faceIndex);
  };

  if (!isHydrated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" text="로딩 중..." />
      </div>
    );
  }

  return (
    <>
      {/* 중복 확인 모달 */}
      {duplicateCheck.showDuplicateModal && duplicateCheck.duplicateUser && duplicateCheck.pendingImageData && (
        <DuplicateCheckModal
          isOpen={duplicateCheck.showDuplicateModal}
          existingUser={duplicateCheck.duplicateUser}
          newFaceImage={duplicateCheck.pendingImageData}
          confidence={duplicateCheck.duplicateConfidence}
          onConfirmSamePerson={handleConfirmSamePerson}
          onConfirmDifferentPerson={handleConfirmDifferentPerson}
          onCancel={duplicateCheck.closeModal}
        />
      )}

      <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/30">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
              </svg>
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900">사용자 등록</h1>
              <p className="text-xs sm:text-sm text-gray-500">Face Recognition Registration</p>
            </div>
          </div>
          <Link href="/">
            <Button variant="secondary" size="sm" className="text-sm">
              <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              홈으로
            </Button>
          </Link>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
        <div className="grid gap-6 lg:grid-cols-2">
          {/* 왼쪽: 등록 폼 */}
          <div>
            <Card>
              <CardHeader className="p-3 portrait:p-4 xl:p-4 2xl:p-5 3xl:p-6">
                <h2 className="text-base portrait:text-lg xl:text-lg 2xl:text-xl 3xl:text-2xl font-semibold text-gray-900">
                  얼굴 등록
                </h2>
              </CardHeader>
              <CardBody className="p-3 portrait:p-4 xl:p-4 2xl:p-5 3xl:p-6 space-y-4 portrait:space-y-5 xl:space-y-5 2xl:space-y-6 3xl:space-y-7">
                {/* 카메라 뷰 */}
                <div>
                  <CameraView
                    onVideoReady={handleVideoReady}
                    onVideoStop={handleVideoStop}
                    showControls={false}
                    autoStart
                  />
                </div>

                {/* 등록 모드 선택 */}
                <div className="flex gap-2 portrait:gap-3 xl:gap-3 2xl:gap-4">
                  <button
                    onClick={() => setIsAddingToExisting(false)}
                    className={`flex-1 px-3 py-2 portrait:px-4 portrait:py-2.5 xl:px-4 xl:py-2.5 2xl:px-5 2xl:py-3 rounded-lg xl:rounded-xl text-xs portrait:text-sm xl:text-sm 2xl:text-base 3xl:text-lg font-medium transition-all cursor-pointer ${
                      !isAddingToExisting
                        ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    <svg className="w-4 h-4 portrait:w-5 portrait:h-5 xl:w-5 xl:h-5 2xl:w-6 2xl:h-6 inline-block mr-1.5 portrait:mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                    </svg>
                    새 사용자
                  </button>
                  <button
                    onClick={() => setIsAddingToExisting(true)}
                    className={`flex-1 px-3 py-2 portrait:px-4 portrait:py-2.5 xl:px-4 xl:py-2.5 2xl:px-5 2xl:py-3 rounded-lg xl:rounded-xl text-xs portrait:text-sm xl:text-sm 2xl:text-base 3xl:text-lg font-medium transition-all cursor-pointer ${
                      isAddingToExisting
                        ? 'bg-green-600 text-white shadow-lg shadow-green-500/30'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    <svg className="w-4 h-4 portrait:w-5 portrait:h-5 xl:w-5 xl:h-5 2xl:w-6 2xl:h-6 inline-block mr-1.5 portrait:mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    얼굴 추가
                  </button>
                </div>

                {/* 이름 입력 */}
                {!isAddingToExisting && (
                  <div className="space-y-2">
                    <label className="block text-xs portrait:text-sm xl:text-sm 2xl:text-base font-medium text-gray-700">
                      이름
                    </label>
                    <Input
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="이름을 입력하세요"
                      className="text-xs portrait:text-sm xl:text-sm 2xl:text-base"
                    />
                    {registrationError && !isAddingToExisting && (
                      <p className="text-xs portrait:text-sm text-red-600">{registrationError}</p>
                    )}
                  </div>
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
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs portrait:text-sm xl:text-sm 2xl:text-base focus:ring-2 focus:ring-blue-500 focus:border-transparent cursor-pointer"
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
                      !isVideoReady
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

          {/* 오른쪽: 등록된 사용자 목록 (SRP 적용 - 컴포넌트 분리) */}
          <UserListSection
            users={users}
            onDeleteUser={handleDeleteUser}
            onDeleteFace={handleDeleteFace}
          />
        </div>
      </main>
      </div>
    </>
  );
}
