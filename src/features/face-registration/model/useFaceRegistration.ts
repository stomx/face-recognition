'use client';

import { useState, useCallback } from 'react';
import { useUserStore } from '@/entities/user';
import { detectFace, findBestMatch } from '@/shared/lib/face-api';
import { FACE_DETECTION_CONFIG } from '@/shared/config/constants';
import type { User } from '@/shared/types';
import * as faceapi from '@vladmandic/face-api';

interface DuplicateCheckResult {
  hasDuplicate: boolean;
  duplicateUser: User | null;
  confidence: number;
  detection: faceapi.WithFaceDescriptor<
    faceapi.WithFaceLandmarks<{ detection: faceapi.FaceDetection }>
  > | null;
  imageData: string | null;
}

export function useFaceRegistration() {
  const [isRegistering, setIsRegistering] = useState(false);
  const [registrationError, setRegistrationError] = useState<string | null>(null);
  const { addUser, addFaceToUser, getUserByName, users } = useUserStore();

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

  const addFaceToExistingUser = useCallback(
    async (
      video: HTMLVideoElement,
      canvas: HTMLCanvasElement,
      name: string
    ): Promise<boolean> => {
      if (!name.trim()) {
        setRegistrationError('이름을 입력해주세요.');
        return false;
      }

      const existingUser = getUserByName(name.trim());
      if (!existingUser) {
        setRegistrationError('해당 사용자를 찾을 수 없습니다.');
        return false;
      }

      setIsRegistering(true);
      setRegistrationError(null);

      try {
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

        // 기존 사용자에게 얼굴 추가
        addFaceToUser(existingUser.id, detection.descriptor, imageData);

        return true;
      } catch (err) {
        console.error('Face addition error:', err);
        setRegistrationError('얼굴 추가 중 오류가 발생했습니다. 다시 시도해주세요.');
        return false;
      } finally {
        setIsRegistering(false);
      }
    },
    [addFaceToUser, getUserByName]
  );

  const checkForDuplicates = useCallback(
    async (
      video: HTMLVideoElement,
      canvas: HTMLCanvasElement
    ): Promise<DuplicateCheckResult> => {
      setIsRegistering(true);
      setRegistrationError(null);

      try {
        // 얼굴 감지
        const detection = await detectFace(video);

        if (!detection) {
          setRegistrationError('얼굴을 감지할 수 없습니다. 카메라를 정면으로 바라봐주세요.');
          return {
            hasDuplicate: false,
            duplicateUser: null,
            confidence: 0,
            detection: null,
            imageData: null,
          };
        }

        // 얼굴 이미지 캡처
        const ctx = canvas.getContext('2d');
        if (ctx) {
          canvas.width = video.videoWidth;
          canvas.height = video.videoHeight;
          ctx.drawImage(video, 0, 0);
        }
        const imageData = canvas.toDataURL('image/jpeg', 0.8);

        // 기존 사용자가 없으면 중복 없음
        if (users.length === 0) {
          return {
            hasDuplicate: false,
            duplicateUser: null,
            confidence: 0,
            detection,
            imageData,
          };
        }

        // 기존 사용자들과 비교
        const labeledDescriptors = users.map(
          (user) =>
            new faceapi.LabeledFaceDescriptors(user.id, user.faceDescriptors)
        );

        const bestMatch = findBestMatch(detection.descriptor, labeledDescriptors);

        if (!bestMatch || bestMatch.label === 'unknown') {
          return {
            hasDuplicate: false,
            duplicateUser: null,
            confidence: 0,
            detection,
            imageData,
          };
        }

        const confidence = 1 - bestMatch.distance;

        // 0.75 이상 일치하면 중복으로 간주
        if (confidence >= (1 - FACE_DETECTION_CONFIG.MATCH_THRESHOLD)) {
          const duplicateUser = users.find((u) => u.id === bestMatch.label) || null;
          return {
            hasDuplicate: true,
            duplicateUser,
            confidence,
            detection,
            imageData,
          };
        }

        return {
          hasDuplicate: false,
          duplicateUser: null,
          confidence,
          detection,
          imageData,
        };
      } catch (err) {
        console.error('Duplicate check error:', err);
        setRegistrationError('중복 확인 중 오류가 발생했습니다. 다시 시도해주세요.');
        return {
          hasDuplicate: false,
          duplicateUser: null,
          confidence: 0,
          detection: null,
          imageData: null,
        };
      } finally {
        setIsRegistering(false);
      }
    },
    [users]
  );

  const registerFaceWithData = useCallback(
    (
      name: string,
      detection: faceapi.WithFaceDescriptor<
        faceapi.WithFaceLandmarks<{ detection: faceapi.FaceDetection }>
      >,
      imageData: string
    ): boolean => {
      if (!name.trim()) {
        setRegistrationError('이름을 입력해주세요.');
        return false;
      }

      try {
        addUser(name.trim(), detection.descriptor, imageData);
        return true;
      } catch (err) {
        console.error('Registration error:', err);
        setRegistrationError('등록 중 오류가 발생했습니다. 다시 시도해주세요.');
        return false;
      }
    },
    [addUser]
  );

  const addFaceToUserWithData = useCallback(
    (
      userId: string,
      detection: faceapi.WithFaceDescriptor<
        faceapi.WithFaceLandmarks<{ detection: faceapi.FaceDetection }>
      >,
      imageData: string
    ): boolean => {
      try {
        addFaceToUser(userId, detection.descriptor, imageData);
        return true;
      } catch (err) {
        console.error('Face addition error:', err);
        setRegistrationError('얼굴 추가 중 오류가 발생했습니다. 다시 시도해주세요.');
        return false;
      }
    },
    [addFaceToUser]
  );

  const clearError = useCallback(() => {
    setRegistrationError(null);
  }, []);

  return {
    isRegistering,
    registrationError,
    registerFace,
    addFaceToExistingUser,
    checkForDuplicates,
    registerFaceWithData,
    addFaceToUserWithData,
    clearError,
  };
}
