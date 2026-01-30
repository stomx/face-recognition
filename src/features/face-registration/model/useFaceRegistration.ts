'use client';

import { useState, useCallback } from 'react';
import { useUserStore } from '@/entities/user';
import { detectFace } from '@/shared/lib/face-api';

export function useFaceRegistration() {
  const [isRegistering, setIsRegistering] = useState(false);
  const [registrationError, setRegistrationError] = useState<string | null>(null);
  const { addUser } = useUserStore();

  const registerFace = useCallback(
    async (
      video: HTMLVideoElement,
      canvas: HTMLCanvasElement,
      name: string
    ): Promise<boolean> => {
      if (!name.trim()) {
        setRegistrationError('이름을 입력해주세요.');
        return false;
      }

      setIsRegistering(true);
      setRegistrationError(null);

      try {
        // 직접 detectFace 호출 (별도 hook 인스턴스 생성 방지)
        const detection = await detectFace(video);

        if (!detection) {
          setRegistrationError('얼굴을 감지할 수 없습니다. 카메라를 정면으로 바라봐주세요.');
          return false;
        }

        // 얼굴 이미지 캡처
        const ctx = canvas.getContext('2d');
        if (ctx) {
          canvas.width = video.videoWidth;
          canvas.height = video.videoHeight;
          ctx.drawImage(video, 0, 0);
        }
        const imageData = canvas.toDataURL('image/jpeg', 0.8);

        // 사용자 등록
        addUser(name.trim(), detection.descriptor, imageData);

        return true;
      } catch (err) {
        console.error('Registration error:', err);
        setRegistrationError('등록 중 오류가 발생했습니다. 다시 시도해주세요.');
        return false;
      } finally {
        setIsRegistering(false);
      }
    },
    [addUser]
  );

  const clearError = useCallback(() => {
    setRegistrationError(null);
  }, []);

  return {
    isRegistering,
    registrationError,
    registerFace,
    clearError,
  };
}
