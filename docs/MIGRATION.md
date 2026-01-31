# Migration Guide

This document guides you through breaking changes and deprecations across major versions.

## CameraView Props Migration (v2.0 → v3.0)

Legacy props are deprecated in v2.0 and will be removed in v3.0 (June 2026).

### Before (Legacy)

```typescript
<CameraView showControls resolution="fhd" />
```

### After (Mode-based)

```typescript
<CameraView
  mode="controlled"
  showControls={true}
  resolution="fhd"
  orientation="landscape"
/>
```

### Migration Steps

1. **Identify all CameraView usages** in your codebase:
   ```bash
   grep -r "CameraView" src/ --include="*.tsx"
   ```

2. **Add the `mode` prop** to each instance:
   - Use `"controlled"` if you manage camera state externally
   - Use `"automatic"` if you want the component to manage its own state

3. **Update prop names** if using legacy boolean flags:
   - `showControls` → `showControls={true}` (syntax unchanged, type now explicit)
   - `showPreview` → `showPreview={true}`

4. **Specify orientation** for better camera stream handling:
   ```typescript
   // For portrait mode
   <CameraView mode="controlled" orientation="portrait" />

   // For landscape mode
   <CameraView mode="controlled" orientation="landscape" />
   ```

### Deprecation Timeline

| Version | Status | Action Required |
|---------|--------|-----------------|
| v2.0 (Jan 2026) | Deprecated | Start using new props, warnings appear in console |
| v2.5 (Apr 2026) | Soft warnings | Migration should be complete |
| v3.0 (Jun 2026) | Removed | Legacy props no longer work |

## Debug Utility Usage

Replace all console calls with the debug utility for better development experience.

### Before (Legacy)

```typescript
console.log('Detection started');
console.error('Error:', err);
console.warn('Performance issue detected');
```

### After (Debug Utility)

```typescript
import { debug } from '@/shared/lib/debug';

const log = debug.scope('ComponentName');

log.log('Detection started');
log.error('Error occurred', 'detection-phase', { error: err });
log.warn('Performance issue detected', 'performance-check', { duration: 150 });
```

### Why Migrate?

1. **Dev-only logging**: Debug output automatically disabled in production
2. **Structured context**: Include error details and contextual information
3. **Namespace isolation**: Group logs by component or feature
4. **Consistent formatting**: Standardized across the codebase

### Migration Steps

1. **Create a debug logger** in your component:
   ```typescript
   import { debug } from '@/shared/lib/debug';

   const log = debug.scope('MyComponent');
   ```

2. **Replace console.log calls**:
   ```typescript
   // Before
   console.log('User registered:', user);

   // After
   log.log('User registered', 'registration', { userId: user.id, email: user.email });
   ```

3. **Replace console.error calls** with context:
   ```typescript
   // Before
   console.error('Registration failed', error);

   // After
   log.error('Registration failed', 'form-submission', {
     error: error,
     userInput: { email }
   });
   ```

4. **Debug output is automatically enabled in development** and disabled in production builds:
   ```typescript
   // Development environment
   const log = debug.scope('MyComponent');
   log.log('This appears in console during development');

   // Production environment
   const log = debug.scope('MyComponent');
   log.log('This is automatically suppressed in production');
   ```

## Performance Monitoring Migration

The new `src/shared/lib/performance.ts` utility replaces manual performance tracking.

### Before (Manual Timing)

```typescript
const start = performance.now();
// do work
const end = performance.now();
console.log(`Took ${end - start}ms`);
```

### After (Performance Utility)

```typescript
import { measurePerformance } from '@/shared/lib/performance';

const result = await measurePerformance('face-detection', async () => {
  // do work
});

console.log(`Took ${result.duration}ms`);
```

### Features

- Automatic timing measurement
- Structured performance data
- Development-only profiling (disabled in production)
- Memory usage tracking
- Performance warnings for slow operations

## Error Handling Improvements

All errors now include comprehensive context for better debugging.

### Before

```typescript
throw new Error('Face detection failed');
```

### After

```typescript
throw new Error('Face detection failed', {
  cause: originalError,
  context: {
    imageWidth: 640,
    imageHeight: 480,
    detectionModel: 'facemesh',
    timestamp: new Date().toISOString()
  }
});
```

## Type Guards

New type guards validate face detection results before use.

### Available Guards

```typescript
import {
  isFaceDetectionResult,
  isValidCoordinate,
  hasConfidenceScore
} from '@/shared/lib/type-guards';

const result = await detectFace(image);

// Safely check before using
if (isFaceDetectionResult(result)) {
  log.log('Detection successful', { faces: result.faces });
} else {
  log.error('Invalid detection result', { result });
}

// Validate individual coordinates
if (isValidCoordinate(point)) {
  const { x, y } = point;
  // safe to use x, y
}

// Check confidence scores
if (hasConfidenceScore(face) && face.confidence > 0.8) {
  log.log('High-confidence face detected');
}
```

## Summary of Changes

| Feature | Old Approach | New Approach | Migration Effort |
|---------|------------|-------------|-----------------|
| Camera props | Legacy boolean flags | Mode-based interface | Low |
| Logging | console.log/error | Debug utility | Medium |
| Performance tracking | Manual timing | Utility functions | Low |
| Error context | Basic messages | Structured context | Medium |
| Type safety | Runtime checks | Type guards | Low |

## Getting Help

If you encounter migration issues:

1. Check the [API Reference](./API.md) for detailed component documentation
2. Review [examples](../src/examples) for usage patterns
3. File an issue with your use case and error message
