'use client';

import { useState, useCallback } from 'react';
import { useUserRepository } from '@/entities/user'; // DIP: 인터페이스 의존
import { detectFace, findBestMatch } from '@/shared/lib/face-api';
import { FACE_DETECTION_CONFIG } from '@/shared/config/constants';
import type { User } from '@/shared/types';
import type { IUserRepository } from '@/shared/types/repository'; // DIP: 인터페이스 타입
import * as faceapi from '@vladmandic/face-api';
import { useFaceImageCapture } from '../lib/useFaceImageCapture';
import { debug } from '@/shared/lib/debug';

const log = debug.scope('FaceRegistration');

interface DuplicateCheckResult {
  hasDuplicate: boolean;
  duplicateUser: User | null;
  confidence: number;
  detection: faceapi.WithFaceDescriptor<
    faceapi.WithFaceLandmarks<{ detection: faceapi.FaceDetection }>
  > | null;
  imageData: string | null;
}

/**
 * 얼굴 등록 Hook
 * DIP 원칙 준수: IUserRepository 인터페이스에 의존
 */
export function useFaceRegistration() {
  const [isRegistering, setIsRegistering] = useState(false);
  const [registrationError, setRegistrationError] = useState<string | null>(null);
  const userRepo: IUserRepository = useUserRepository(); // DIP: 인터페이스 타입 명시
  const users = userRepo.getAll();
  const { captureImage } = useFaceImageCapture();

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
        const imageData = captureImage(video, canvas);
        if (!imageData) {
          setRegistrationError('이미지 캡처에 실패했습니다.');
          return false;
        }

        // 사용자 등록
        userRepo.add(name.trim(), detection.descriptor, imageData);

        return true;
      } catch (err) {
        log.error('Registration failed', 'registerFace', undefined, err);
        setRegistrationError('등록 중 오류가 발생했습니다. 다시 시도해주세요.');
        return false;
      } finally {
        setIsRegistering(false);
      }
    },
    [userRepo, captureImage]
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

      const existingUser = userRepo.getByName(name.trim());
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
        const imageData = captureImage(video, canvas);
        if (!imageData) {
          setRegistrationError('이미지 캡처에 실패했습니다.');
          return false;
        }

        // 기존 사용자에게 얼굴 추가
        userRepo.addFace(existingUser.id, detection.descriptor, imageData);

        return true;
      } catch (err) {
        log.error('Face addition failed', 'addFaceToExistingUser', undefined, err);
        setRegistrationError('얼굴 추가 중 오류가 발생했습니다. 다시 시도해주세요.');
        return false;
      } finally {
        setIsRegistering(false);
      }
    },
    [userRepo, captureImage]
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
        const imageData = captureImage(video, canvas);
        if (!imageData) {
          setRegistrationError('이미지 캡처에 실패했습니다.');
          return {
            hasDuplicate: false,
            duplicateUser: null,
            confidence: 0,
            detection: null,
            imageData: null,
          };
        }

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
        log.error('Duplicate check failed', 'checkForDuplicates', undefined, err);
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
    [captureImage, users]
  );

  const registerFaceWithData = useCallback(
    (name: string, descriptor: Float32Array, imageData: string): boolean => {
      if (!name.trim()) {
        setRegistrationError('이름을 입력해주세요.');
        return false;
      }

      try {
        userRepo.add(name.trim(), descriptor, imageData);
        return true;
      } catch (err) {
        log.error('Registration with data failed', 'registerFaceWithData', undefined, err);
        setRegistrationError('등록 중 오류가 발생했습니다. 다시 시도해주세요.');
        return false;
      }
    },
    [userRepo]
  );

  const addFaceToUserWithData = useCallback(
    (userId: string, descriptor: Float32Array, imageData: string): boolean => {
      try {
        userRepo.addFace(userId, descriptor, imageData);
        return true;
      } catch (err) {
        log.error('Face addition with data failed', 'addFaceToUserWithData', { userId }, err);
        setRegistrationError('얼굴 추가 중 오류가 발생했습니다. 다시 시도해주세요.');
        return false;
      }
    },
    [userRepo]
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
