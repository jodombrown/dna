import React, { useEffect, useRef } from 'react';

interface LoadMoreTriggerProps {
  onLoadMore: () => void;
  hasMore: boolean;
  isLoading: boolean;
}

export const LoadMoreTrigger: React.FC<LoadMoreTriggerProps> = ({
  onLoadMore,
  hasMore,
  isLoading
}) => {
  const triggerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const triggerElement = triggerRef.current;
    if (!triggerElement || !hasMore || isLoading) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry.isIntersecting && hasMore && !isLoading) {
          onLoadMore();
        }
      },
      {
        root: null,
        rootMargin: '100px', // Trigger 100px before the element comes into view
        threshold: 0.1
      }
    );

    observer.observe(triggerElement);

    return () => {
      observer.unobserve(triggerElement);
    };
  }, [onLoadMore, hasMore, isLoading]);

  // Don't render anything if there's nothing more to load
  if (!hasMore) {
    return null;
  }

  return (
    <div 
      ref={triggerRef} 
      className="h-4 w-full flex justify-center items-center"
      aria-hidden="true"
    />
  );
};