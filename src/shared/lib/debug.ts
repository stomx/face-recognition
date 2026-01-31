/**
 * Debug Utility - Development-only logging with context
 *
 * Features:
 * - Dev-only output (no logs in production builds)
 * - Contextual prefixes for easy filtering
 * - Type guards for face detection
 * - Improved error messages with state context
 */

type LogLevel = 'log' | 'warn' | 'error' | 'info';

interface DebugContext {
  component?: string;
  action?: string;
  state?: Record<string, unknown>;
}

const isDev = process.env.NODE_ENV !== 'production';

/**
 * Format context into a readable prefix
 */
function formatPrefix(context?: DebugContext): string {
  if (!context) return '';

  const parts: string[] = [];
  if (context.component) parts.push(context.component);
  if (context.action) parts.push(context.action);

  return parts.length > 0 ? `[${parts.join(':')}]` : '';
}

/**
 * Format state object for debug output
 */
function formatState(state?: Record<string, unknown>): string {
  if (!state || Object.keys(state).length === 0) return '';
  return ` | state: ${JSON.stringify(state)}`;
}

/**
 * Core logging function
 */
function log(level: LogLevel, message: string, context?: DebugContext, ...args: unknown[]): void {
  if (!isDev) return;

  const prefix = formatPrefix(context);
  const stateStr = formatState(context?.state);
  const fullMessage = `${prefix} ${message}${stateStr}`;

  switch (level) {
    case 'log':
      console.log(fullMessage, ...args);
      break;
    case 'warn':
      console.warn(fullMessage, ...args);
      break;
    case 'error':
      console.error(fullMessage, ...args);
      break;
    case 'info':
      console.info(fullMessage, ...args);
      break;
  }
}

/**
 * Debug namespace with logging methods
 */
export const debug = {
  /**
   * General debug log (dev only)
   */
  log(message: string, context?: DebugContext, ...args: unknown[]): void {
    log('log', message, context, ...args);
  },

  /**
   * Warning log (dev only)
   */
  warn(message: string, context?: DebugContext, ...args: unknown[]): void {
    log('warn', message, context, ...args);
  },

  /**
   * Error log with context (dev only for debug, production for real errors)
   * Use debug.error for debugging, console.error for production errors
   */
  error(message: string, context?: DebugContext, ...args: unknown[]): void {
    log('error', message, context, ...args);
  },

  /**
   * Info log (dev only)
   */
  info(message: string, context?: DebugContext, ...args: unknown[]): void {
    log('info', message, context, ...args);
  },

  /**
   * Create a scoped debugger for a specific component
   */
  scope(component: string) {
    return {
      log: (message: string, action?: string, state?: Record<string, unknown>, ...args: unknown[]) =>
        debug.log(message, { component, action, state }, ...args),
      warn: (message: string, action?: string, state?: Record<string, unknown>, ...args: unknown[]) =>
        debug.warn(message, { component, action, state }, ...args),
      error: (message: string, action?: string, state?: Record<string, unknown>, ...args: unknown[]) =>
        debug.error(message, { component, action, state }, ...args),
      info: (message: string, action?: string, state?: Record<string, unknown>, ...args: unknown[]) =>
        debug.info(message, { component, action, state }, ...args),
    };
  },
};

// ============================================
// Type Guards for Face Detection
// ============================================

import type * as faceapi from '@vladmandic/face-api';

/**
 * Type guard: Check if value is a valid Float32Array descriptor
 */
export function isValidDescriptor(value: unknown): value is Float32Array {
  return (
    value instanceof Float32Array &&
    value.length === 128 && // face-api descriptors are 128-dimensional
    value.every((v) => !Number.isNaN(v))
  );
}

/**
 * Type guard: Check if detection result has valid face box
 */
export function hasValidFaceBox(
  detection: faceapi.WithFaceDescriptor<
    faceapi.WithFaceLandmarks<{ detection: faceapi.FaceDetection }>
  > | null
): detection is faceapi.WithFaceDescriptor<
  faceapi.WithFaceLandmarks<{ detection: faceapi.FaceDetection }>
> {
  if (!detection) return false;

  const box = detection.detection?.box;
  if (!box) return false;

  return (
    typeof box.x === 'number' &&
    typeof box.y === 'number' &&
    typeof box.width === 'number' &&
    typeof box.height === 'number' &&
    box.width > 0 &&
    box.height > 0
  );
}

/**
 * Type guard: Check if detection has valid landmarks
 */
export function hasValidLandmarks(
  detection: faceapi.WithFaceDescriptor<
    faceapi.WithFaceLandmarks<{ detection: faceapi.FaceDetection }>
  > | null
): boolean {
  if (!detection) return false;

  const landmarks = detection.landmarks;
  if (!landmarks) return false;

  const positions = landmarks.positions;
  return Array.isArray(positions) && positions.length === 68;
}

/**
 * Validate face detection result with detailed error context
 */
export function validateFaceDetection(
  detection: faceapi.WithFaceDescriptor<
    faceapi.WithFaceLandmarks<{ detection: faceapi.FaceDetection }>
  > | null,
  context?: string
): { valid: boolean; reason?: string } {
  const prefix = context ? `[${context}] ` : '';

  if (!detection) {
    return { valid: false, reason: `${prefix}No detection result` };
  }

  if (!detection.detection) {
    return { valid: false, reason: `${prefix}Missing detection object` };
  }

  if (!hasValidFaceBox(detection)) {
    return { valid: false, reason: `${prefix}Invalid or missing face box` };
  }

  if (!detection.descriptor) {
    return { valid: false, reason: `${prefix}Missing face descriptor` };
  }

  if (!isValidDescriptor(detection.descriptor)) {
    return { valid: false, reason: `${prefix}Invalid descriptor (expected 128-dim Float32Array)` };
  }

  return { valid: true };
}

export default debug;
