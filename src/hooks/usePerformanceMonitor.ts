
import { useEffect, useRef } from 'react';

interface PerformanceMetrics {
  componentName: string;
  renderTime: number;
  timestamp: number;
}

export const usePerformanceMonitor = (componentName: string) => {
  const renderStartTime = useRef<number>(0);
  const mountTime = useRef<number>(0);

  useEffect(() => {
    mountTime.current = performance.now();
    
    return () => {
      const unmountTime = performance.now();
      const totalLifetime = unmountTime - mountTime.current;
      
      // Log component lifetime in development
      if (process.env.NODE_ENV === 'development') {
        console.log(`Component ${componentName} lifetime: ${totalLifetime.toFixed(2)}ms`);
      }
    };
  }, [componentName]);

  const startRender = () => {
    renderStartTime.current = performance.now();
  };

  const endRender = () => {
    const renderTime = performance.now() - renderStartTime.current;
    
    const metrics: PerformanceMetrics = {
      componentName,
      renderTime,
      timestamp: Date.now()
    };

    // Log slow renders
    if (renderTime > 16) { // 16ms is 60fps threshold
      console.warn(`Slow render detected in ${componentName}: ${renderTime.toFixed(2)}ms`);
    }

    // In production, send to monitoring service
    if (process.env.NODE_ENV === 'production' && renderTime > 100) {
      // Send to monitoring service
      logPerformanceIssue(metrics);
    }

    return metrics;
  };

  return { startRender, endRender };
};

const logPerformanceIssue = (metrics: PerformanceMetrics) => {
  // In production, send to monitoring service
  console.error('Performance Issue:', metrics);
};

// Web Vitals monitoring
export const initializeWebVitals = () => {
  if (typeof window !== 'undefined' && 'performance' in window) {
    // Monitor Cumulative Layout Shift
    let cls = 0;
    new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (!entry.hadRecentInput) {
          cls += (entry as any).value;
        }
      }
      
      if (cls > 0.1) {
        console.warn('High Cumulative Layout Shift detected:', cls);
      }
    }).observe({ type: 'layout-shift', buffered: true });

    // Monitor Largest Contentful Paint
    new PerformanceObserver((list) => {
      const entries = list.getEntries();
      const lastEntry = entries[entries.length - 1];
      const lcp = lastEntry.startTime;
      
      if (lcp > 2500) {
        console.warn('Slow Largest Contentful Paint:', lcp);
      }
    }).observe({ type: 'largest-contentful-paint', buffered: true });
  }
};
