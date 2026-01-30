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
  updateUser: (id: string, name: string, faceDescriptor?: Float32Array, imageData?: string) => void;
  removeUser: (id: string) => void;
  getUserById: (id: string) => User | undefined;
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
      faceDescriptor,
      registeredAt: new Date(),
      imageData,
    };

    const updatedUsers = [...get().users, newUser];
    set({ users: updatedUsers });
    saveUsers(updatedUsers);

    return newUser;
  },

  updateUser: (id, name, faceDescriptor, imageData) => {
    const updatedUsers = get().users.map((user) =>
      user.id === id
        ? {
            ...user,
            name,
            ...(faceDescriptor && { faceDescriptor }),
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

  getLabeledDescriptors: () => {
    return get().users.map((user) =>
      createLabeledDescriptor(user.id, user.faceDescriptor)
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
