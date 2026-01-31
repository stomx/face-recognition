import type { IFaceMatchRepository } from './interface';
import { faceapi } from '@/shared/lib/face-api';
import { useUserStore } from '../model/store';

/**
 * FaceMatch Repository 구현체
 * 얼굴 인식을 위한 Labeled Descriptors 제공
 */
export class FaceMatchRepository implements IFaceMatchRepository {
  constructor(private store: ReturnType<typeof useUserStore.getState>) {}

  getLabeledDescriptors(): faceapi.LabeledFaceDescriptors[] {
    return this.store.getLabeledDescriptors();
  }
}
