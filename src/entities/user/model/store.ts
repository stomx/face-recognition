'use client';

import { create } from 'zustand';
import { v4 as uuidv4 } from 'uuid';
import type { User, AccessLog } from '@/shared/types';
import {
  saveUsers,
  loadUsers,
  saveAccessLogs,
  loadAccessLogs,
} from '@/shared/lib/storage';
import { createLabeledDescriptor, faceapi } from '@/shared/lib/face-api';

interface UserState {
  users: User[];
  accessLogs: AccessLog[];
  isHydrated: boolean;

  // Actions
  hydrate: () => void;
  addUser: (name: string, faceDescriptor: Float32Array, imageData?: string) => User;
  addFaceToUser: (userId: string, faceDescriptor: Float32Array, imageData: string) => void;
  removeFaceFromUser: (userId: string, faceIndex: number) => void;
  updateUser: (id: string, name: string, faceDescriptor?: Float32Array, imageData?: string) => void;
  removeUser: (id: string) => void;
  getUserById: (id: string) => User | undefined;
  getUserByName: (name: string) => User | undefined;
  getLabeledDescriptors: () => faceapi.LabeledFaceDescriptors[];
  addAccessLog: (
    userId: string | null,
    userName: string | null,
    status: 'success' | 'failed' | 'unknown',
    confidence?: number
  ) => void;
  clearAccessLogs: () => void;
}

export const useUserStore = create<UserState>((set, get) => ({
  users: [],
  accessLogs: [],
  isHydrated: false,

  hydrate: () => {
    const users = loadUsers();
    const accessLogs = loadAccessLogs();
    set({ users, accessLogs, isHydrated: true });
  },

  addUser: (name, faceDescriptor, imageData) => {
    const newUser: User = {
      id: uuidv4(),
      name,
      faceDescriptors: [faceDescriptor],
      faceImages: imageData ? [imageData] : [],
      registeredAt: new Date(),
      imageData, // 호환성용
    };

    const updatedUsers = [...get().users, newUser];
    set({ users: updatedUsers });
    saveUsers(updatedUsers);

    return newUser;
  },

  addFaceToUser: (userId, faceDescriptor, imageData) => {
    const updatedUsers = get().users.map((user) =>
      user.id === userId
        ? {
            ...user,
            faceDescriptors: [...user.faceDescriptors, faceDescriptor],
            faceImages: [...user.faceImages, imageData],
          }
        : user
    );
    set({ users: updatedUsers });
    saveUsers(updatedUsers);
  },

  removeFaceFromUser: (userId, faceIndex) => {
    const updatedUsers = get().users.map((user) => {
      if (user.id === userId) {
        const newDescriptors = user.faceDescriptors.filter((_, idx) => idx !== faceIndex);
        const newImages = user.faceImages.filter((_, idx) => idx !== faceIndex);

        // 모든 얼굴이 삭제되면 사용자도 삭제
        if (newDescriptors.length === 0) {
          return null;
        }

        return {
          ...user,
          faceDescriptors: newDescriptors,
          faceImages: newImages,
          imageData: newImages[0], // 첫 번째 이미지를 대표 이미지로
        };
      }
      return user;
    }).filter(Boolean) as User[];

    set({ users: updatedUsers });
    saveUsers(updatedUsers);
  },

  updateUser: (id, name, faceDescriptor, imageData) => {
    const updatedUsers = get().users.map((user) =>
      user.id === id
        ? {
            ...user,
            name,
            ...(faceDescriptor && { faceDescriptors: [faceDescriptor] }), // 단일 descriptor로 교체
            ...(imageData !== undefined && { imageData }),
          }
        : user
    );
    set({ users: updatedUsers });
    saveUsers(updatedUsers);
  },

  removeUser: (id) => {
    const updatedUsers = get().users.filter((user) => user.id !== id);
    set({ users: updatedUsers });
    saveUsers(updatedUsers);
  },

  getUserById: (id) => {
    return get().users.find((user) => user.id === id);
  },

  getUserByName: (name) => {
    return get().users.find((user) => user.name.toLowerCase() === name.toLowerCase());
  },

  getLabeledDescriptors: () => {
    // 각 사용자의 모든 얼굴 descriptors를 포함
    return get().users.map((user) =>
      createLabeledDescriptor(user.id, user.faceDescriptors)
    );
  },

  addAccessLog: (userId, userName, status, confidence) => {
    const newLog: AccessLog = {
      id: uuidv4(),
      userId,
      userName,
      timestamp: new Date(),
      status,
      confidence,
    };

    const updatedLogs = [newLog, ...get().accessLogs].slice(0, 100); // 최근 100개만 유지
    set({ accessLogs: updatedLogs });
    saveAccessLogs(updatedLogs);
  },

  clearAccessLogs: () => {
    set({ accessLogs: [] });
    saveAccessLogs([]);
  },
}));
