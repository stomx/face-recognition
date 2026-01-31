import type { User } from '@/shared/types';
import type { IUserRepository } from './interface';
import { useUserStore } from '../model/store';

/**
 * User Repository 구현체
 * Zustand Store를 래핑하여 DIP 준수
 */
export class UserRepository implements IUserRepository {
  constructor(private store: ReturnType<typeof useUserStore.getState>) {}

  getAll(): User[] {
    return this.store.users;
  }

  getById(id: string): User | undefined {
    return this.store.getUserById(id);
  }

  getByName(name: string): User | undefined {
    return this.store.getUserByName(name);
  }

  add(name: string, faceDescriptor: Float32Array, imageData?: string): User {
    return this.store.addUser(name, faceDescriptor, imageData);
  }

  update(id: string, name: string, faceDescriptor?: Float32Array, imageData?: string): void {
    this.store.updateUser(id, name, faceDescriptor, imageData);
  }

  remove(id: string): void {
    this.store.removeUser(id);
  }

  addFace(userId: string, faceDescriptor: Float32Array, imageData: string): void {
    this.store.addFaceToUser(userId, faceDescriptor, imageData);
  }

  removeFace(userId: string, faceIndex: number): void {
    this.store.removeFaceFromUser(userId, faceIndex);
  }
}
