'use client';

import { STORAGE_KEYS } from '../config/constants';
import type { User, AccessLog } from '../types';

// Float32Array를 일반 배열로 변환 (JSON 직렬화용)
function float32ArrayToArray(arr: Float32Array): number[] {
  return Array.from(arr);
}

// 일반 배열을 Float32Array로 변환
function arrayToFloat32Array(arr: number[]): Float32Array {
  return new Float32Array(arr);
}

// 사용자 저장
export function saveUsers(users: User[]): void {
  if (typeof window === 'undefined') return;

  const serialized = users.map((user) => ({
    ...user,
    faceDescriptors: user.faceDescriptors.map(float32ArrayToArray),
    faceImages: user.faceImages,
    registeredAt: user.registeredAt.toISOString(),
  }));

  localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(serialized));
}

// 사용자 불러오기
export function loadUsers(): User[] {
  if (typeof window === 'undefined') return [];

  const data = localStorage.getItem(STORAGE_KEYS.USERS);
  if (!data) return [];

  try {
    const parsed = JSON.parse(data);
    return parsed.map((user: {
      id: string;
      name: string;
      faceDescriptors?: number[][];
      faceDescriptor?: number[]; // 기존 데이터 호환성
      faceImages?: string[];
      registeredAt: string;
      imageData?: string;
    }) => ({
      ...user,
      // 기존 faceDescriptor가 있으면 배열로 변환, 없으면 faceDescriptors 사용
      faceDescriptors: user.faceDescriptors
        ? user.faceDescriptors.map(arrayToFloat32Array)
        : user.faceDescriptor
        ? [arrayToFloat32Array(user.faceDescriptor)]
        : [],
      // 기존 imageData를 faceImages로 변환
      faceImages: user.faceImages || (user.imageData ? [user.imageData] : []),
      registeredAt: new Date(user.registeredAt),
    }));
  } catch {
    return [];
  }
}

// 출입 기록 저장
export function saveAccessLogs(logs: AccessLog[]): void {
  if (typeof window === 'undefined') return;

  const serialized = logs.map((log) => ({
    ...log,
    timestamp: log.timestamp.toISOString(),
  }));

  localStorage.setItem(STORAGE_KEYS.ACCESS_LOGS, JSON.stringify(serialized));
}

// 출입 기록 불러오기
export function loadAccessLogs(): AccessLog[] {
  if (typeof window === 'undefined') return [];

  const data = localStorage.getItem(STORAGE_KEYS.ACCESS_LOGS);
  if (!data) return [];

  try {
    const parsed = JSON.parse(data);
    return parsed.map((log: {
      id: string;
      userId: string | null;
      userName: string | null;
      timestamp: string;
      status: 'success' | 'failed' | 'unknown';
      confidence?: number;
    }) => ({
      ...log,
      timestamp: new Date(log.timestamp),
    }));
  } catch {
    return [];
  }
}
