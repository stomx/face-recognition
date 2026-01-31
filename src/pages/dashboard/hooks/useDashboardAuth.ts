import { useState, useCallback, RefObject } from 'react';
import { useUserRepository, useAccessLogRepository, useFaceMatchRepository } from '@/entities/user';
import { verifyFace } from '@/features/face-verification';

interface ResultState {
  type: 'success' | 'failed';
  userName?: string;
  confidence?: number;
  message: string;
}

/**
 * DashboardPage 인증 로직 Hook
 *
 * 책임:
 * - 수동 인증 실행
 * - 인증 결과 관리
 * - 출입 기록 저장
 */
export function useDashboardAuth(
  videoRef: RefObject<HTMLVideoElement | null>,
  canvasRef: RefObject<HTMLCanvasElement | null>,
  modelStatus: 'idle' | 'loading' | 'loaded' | 'error'
) {
  const userRepo = useUserRepository();
  const accessLogRepo = useAccessLogRepository();
  const faceMatchRepo = useFaceMatchRepository();

  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [result, setResult] = useState<ResultState | null>(null);

  const users = userRepo.getAll();

  // 수동 인증
  const handleManualAuth = useCallback(async () => {
    if (!videoRef.current || !canvasRef.current || modelStatus !== 'loaded' || users.length === 0) {
      return;
    }

    setIsAuthenticating(true);

    try {
      const labeledDescriptors = faceMatchRepo.getLabeledDescriptors();
      const verifyResult = await verifyFace(videoRef.current, labeledDescriptors, userRepo.getById);

      if (!verifyResult.detection) {
        // 얼굴 감지 실패
        accessLogRepo.add(null, null, 'failed');
        setResult({
          type: 'failed',
          message: '얼굴이 감지되지 않았습니다',
        });
        return;
      }

      if (verifyResult.success) {
        // 인증 성공
        accessLogRepo.add(verifyResult.userId!, verifyResult.userName!, 'success', verifyResult.confidence);
        setResult({
          type: 'success',
          userName: verifyResult.userName!,
          confidence: verifyResult.confidence,
          message: '인증 성공',
        });
      } else {
        // 인증 실패
        accessLogRepo.add(null, '미확인 사용자', 'failed', verifyResult.confidence);
        setResult({
          type: 'failed',
          confidence: verifyResult.confidence,
          message: verifyResult.confidence > 0
            ? `일치율 부족 (${Math.round(verifyResult.confidence * 100)}%)`
            : '등록되지 않은 얼굴입니다',
        });
      }
    } catch (error) {
      console.error('인증 실패:', error);
      accessLogRepo.add(null, null, 'failed');
      setResult({
        type: 'failed',
        message: '인증 중 오류가 발생했습니다',
      });
    } finally {
      setIsAuthenticating(false);
    }
  }, [videoRef, canvasRef, modelStatus, users.length, faceMatchRepo, userRepo, accessLogRepo]);

  const clearResult = useCallback(() => {
    setResult(null);
  }, []);

  return {
    isAuthenticating,
    result,
    handleManualAuth,
    clearResult,
  };
}
