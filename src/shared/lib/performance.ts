/**
 * Performance monitoring utility for measuring execution times
 * Provides statistics: avg, min, max, p95
 */

interface PerformanceMetrics {
  count: number;
  total: number;
  min: number;
  max: number;
  measurements: number[];
}

interface PerformanceStats {
  count: number;
  avg: number;
  min: number;
  max: number;
  p95: number;
}

export class PerformanceMonitor {
  private metrics: Map<string, PerformanceMetrics> = new Map();
  private readonly maxMeasurements: number;

  constructor(maxMeasurements = 100) {
    this.maxMeasurements = maxMeasurements;
  }

  /**
   * Measure synchronous function execution time
   */
  measure<T>(label: string, fn: () => T): T {
    const start = performance.now();
    try {
      return fn();
    } finally {
      const duration = performance.now() - start;
      this.record(label, duration);
    }
  }

  /**
   * Measure asynchronous function execution time
   */
  async measureAsync<T>(label: string, fn: () => Promise<T>): Promise<T> {
    const start = performance.now();
    try {
      return await fn();
    } finally {
      const duration = performance.now() - start;
      this.record(label, duration);
    }
  }

  /**
   * Record a measurement manually
   */
  record(label: string, duration: number): void {
    let metric = this.metrics.get(label);

    if (!metric) {
      metric = {
        count: 0,
        total: 0,
        min: Infinity,
        max: -Infinity,
        measurements: [],
      };
      this.metrics.set(label, metric);
    }

    metric.count++;
    metric.total += duration;
    metric.min = Math.min(metric.min, duration);
    metric.max = Math.max(metric.max, duration);

    // Keep only the last N measurements for p95 calculation
    metric.measurements.push(duration);
    if (metric.measurements.length > this.maxMeasurements) {
      metric.measurements.splice(0, 1);
    }
  }

  /**
   * Get statistics for a specific label
   */
  getStats(label: string): PerformanceStats | null {
    const metric = this.metrics.get(label);
    if (!metric || metric.count === 0) {
      return null;
    }

    return {
      count: metric.count,
      avg: metric.total / metric.count,
      min: metric.min,
      max: metric.max,
      p95: this.calculateP95(metric.measurements),
    };
  }

  /**
   * Get all statistics
   */
  getAllStats(): Record<string, PerformanceStats> {
    const result: Record<string, PerformanceStats> = {};

    this.metrics.forEach((_, label) => {
      const stats = this.getStats(label);
      if (stats) {
        result[label] = stats;
      }
    });

    return result;
  }

  /**
   * Reset all metrics
   */
  reset(): void {
    this.metrics.clear();
  }

  /**
   * Reset metrics for a specific label
   */
  resetLabel(label: string): void {
    this.metrics.delete(label);
  }

  /**
   * Calculate 95th percentile
   */
  private calculateP95(measurements: number[]): number {
    if (measurements.length === 0) return 0;
    if (measurements.length === 1) return measurements[0];

    const sorted = [...measurements].sort((a, b) => a - b);
    const index = Math.ceil(sorted.length * 0.95) - 1;
    return sorted[Math.min(index, sorted.length - 1)];
  }
}

// Singleton instance for global performance monitoring
export const globalPerformanceMonitor = new PerformanceMonitor();
