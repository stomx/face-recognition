import { useMemo } from 'react';
import { useUserStore } from '../model/store';
import type { IFaceMatchRepository } from '../repository/interface';

/**
 * FaceMatch Repository Hook
 * 얼굴 인식을 위한 Labeled Descriptors 제공
 *
 * @example
 * const faceMatchRepo = useFaceMatchRepository();
 * const labeledDescriptors = faceMatchRepo.getLabeledDescriptors();
 * const matcher = new faceapi.FaceMatcher(labeledDescriptors);
 */
export function useFaceMatchRepository(): IFaceMatchRepository {
  const store = useUserStore();

  return useMemo(
    () => ({
      getLabeledDescriptors: store.getLabeledDescriptors,
    }),
    [store]
  );
}
