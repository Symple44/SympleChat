// src/components/common/InfiniteScroll.jsx
import React, { useEffect, useRef, useCallback } from 'react';
import { performanceMonitor } from '../../services/performance/PerformanceMonitor';

const InfiniteScroll = ({ 
  children, 
  onLoadMore, 
  hasMore, 
  isLoading, 
  threshold = 250,
  className = '' 
}) => {
  const containerRef = useRef(null);
  const observer = useRef(null);

  const lastElementRef = useCallback(node => {
    if (isLoading) return;
    
    if (observer.current) {
      observer.current.disconnect();
    }

    observer.current = new IntersectionObserver(entries => {
      const perfMark = performanceMonitor.startMeasure('scroll_load');
      
      if (entries[0].isIntersecting && hasMore) {
        onLoadMore();
      }
      
      performanceMonitor.endMeasure(perfMark);
    }, {
      root: containerRef.current,
      rootMargin: `${threshold}px`
    });

    if (node) {
      observer.current.observe(node);
    }
  }, [isLoading, hasMore, onLoadMore, threshold]);

  useEffect(() => {
    return () => {
      if (observer.current) {
        observer.current.disconnect();
      }
    };
  }, []);

  return (
    <div 
      ref={containerRef}
      className={`relative overflow-auto ${className}`}
    >
      {children}
      <div ref={lastElementRef} className="h-1" />
      
      {isLoading && (
        <div className="flex justify-center py-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
        </div>
      )}
    </div>
  );
};

export default InfiniteScroll;
