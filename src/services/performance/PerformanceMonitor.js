// src/services/performance/PerformanceMonitor.js
class PerformanceMonitor {
  constructor() {
    this.measurements = new Map();
    this.thresholds = {
      messageSend: 1000, // 1 second
      messageLoad: 500,  // 500ms
      sessionSwitch: 300 // 300ms
    };
  }

  startMeasure(actionId, category) {
    this.measurements.set(actionId, {
      startTime: performance.now(),
      category
    });
  }

  endMeasure(actionId) {
    const measurement = this.measurements.get(actionId);
    if (!measurement) return null;

    const duration = performance.now() - measurement.startTime;
    this.measurements.delete(actionId);

    // Vérifier les seuils
    const threshold = this.thresholds[measurement.category];
    if (threshold && duration > threshold) {
      console.warn(`Performance warning: ${measurement.category} took ${duration}ms (threshold: ${threshold}ms)`);
      analytics.trackEvent('performance_warning', measurement.category, {
        duration,
        threshold
      });
    }

    return {
      duration,
      category: measurement.category
    };
  }

  async measureAsync(category, promise) {
    const actionId = `${category}_${Date.now()}`;
    this.startMeasure(actionId, category);
    
    try {
      const result = await promise;
      const measurement = this.endMeasure(actionId);
      
      analytics.trackPerformance(category, measurement.duration);
      
      return result;
    } catch (error) {
      this.measurements.delete(actionId);
      throw error;
    }
  }
}

export const performanceMonitor = new PerformanceMonitor();