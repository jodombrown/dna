import React, { useState, useRef, useCallback, useEffect } from 'react';
import { RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PullToRefreshProps {
  onRefresh: () => Promise<void>;
  children: React.ReactNode;
  threshold?: number; // Pull distance to trigger refresh (default: 80px)
  maxPull?: number; // Maximum pull distance (default: 120px)
  className?: string;
  disabled?: boolean;
}

type RefreshState = 'idle' | 'pulling' | 'ready' | 'refreshing';

export const PullToRefresh: React.FC<PullToRefreshProps> = ({
  onRefresh,
  children,
  threshold = 80,
  maxPull = 120,
  className,
  disabled = false,
}) => {
  const [state, setState] = useState<RefreshState>('idle');
  const [pullDistance, setPullDistance] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const startYRef = useRef(0);
  const isPullingRef = useRef(false);

  // Calculate progress (0 to 1)
  const progress = Math.min(pullDistance / threshold, 1);

  // Reset state
  const reset = useCallback(() => {
    setState('idle');
    setPullDistance(0);
    isPullingRef.current = false;
  }, []);

  // Handle touch start
  const handleTouchStart = useCallback(
    (e: React.TouchEvent) => {
      if (disabled) return;

      const container = containerRef.current;
      if (!container) return;

      // Only allow pull if scrolled to top
      if (container.scrollTop > 0) return;

      startYRef.current = e.touches[0].clientY;
      isPullingRef.current = true;
      setState('pulling');
    },
    [disabled]
  );

  // Handle touch move
  const handleTouchMove = useCallback(
    (e: React.TouchEvent) => {
      if (!isPullingRef.current || disabled) return;

      const container = containerRef.current;
      if (!container) return;

      // Only allow pull if scrolled to top
      if (container.scrollTop > 0) {
        reset();
        return;
      }

      const currentY = e.touches[0].clientY;
      const diff = currentY - startYRef.current;

      // Only handle downward pull
      if (diff <= 0) {
        reset();
        return;
      }

      // Apply resistance for overscroll effect
      const resistance = 0.5;
      const resistedPull = Math.min(diff * resistance, maxPull);

      setPullDistance(resistedPull);

      // Update state based on pull distance
      if (resistedPull >= threshold) {
        setState('ready');
      } else {
        setState('pulling');
      }

      // Prevent default scroll when pulling
      if (diff > 0) {
        e.preventDefault();
      }
    },
    [disabled, maxPull, threshold, reset]
  );

  // Handle touch end
  const handleTouchEnd = useCallback(async () => {
    if (!isPullingRef.current || disabled) return;

    if (state === 'ready' && pullDistance >= threshold) {
      setState('refreshing');
      try {
        await onRefresh();
      } catch (error) {
        // Error handling happens in onRefresh
      }
    }

    reset();
  }, [disabled, state, pullDistance, threshold, onRefresh, reset]);

  // Animate pull distance back to zero on refresh complete
  useEffect(() => {
    if (state === 'refreshing') {
      const timer = setTimeout(() => {
        reset();
      }, 1000); // Minimum refresh indicator time
      return () => clearTimeout(timer);
    }
  }, [state, reset]);

  // Get indicator transform
  const getIndicatorStyle = () => {
    if (state === 'refreshing') {
      return {
        transform: `translateY(${threshold / 2}px)`,
        opacity: 1,
      };
    }
    return {
      transform: `translateY(${pullDistance}px) scale(${0.5 + progress * 0.5})`,
      opacity: progress,
    };
  };

  // Get content transform
  const getContentStyle = () => {
    if (state === 'refreshing') {
      return {
        transform: `translateY(${threshold / 2}px)`,
      };
    }
    return {
      transform: `translateY(${pullDistance}px)`,
    };
  };

  return (
    <div
      ref={containerRef}
      className={cn('relative overflow-y-auto touch-pan-y', className)}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onTouchCancel={handleTouchEnd}
    >
      {/* Pull indicator */}
      <div
        className={cn(
          'absolute left-1/2 -translate-x-1/2 -top-10 z-10',
          'flex items-center justify-center',
          'w-10 h-10 rounded-full bg-background border shadow-md',
          'transition-transform duration-200 ease-out',
          state === 'idle' && 'opacity-0'
        )}
        style={getIndicatorStyle()}
      >
        <RefreshCw
          className={cn(
            'h-5 w-5 text-dna-emerald transition-transform duration-200',
            state === 'refreshing' && 'animate-spin',
            state === 'ready' && 'text-dna-copper'
          )}
          style={{
            transform: state === 'pulling' ? `rotate(${progress * 180}deg)` : undefined,
          }}
        />
      </div>

      {/* Content wrapper */}
      <div
        className={cn(
          'transition-transform duration-200 ease-out',
          state === 'idle' && 'transition-none'
        )}
        style={getContentStyle()}
      >
        {children}
      </div>

      {/* Pull hint text */}
      {state === 'pulling' && pullDistance > 20 && (
        <div
          className="absolute left-1/2 -translate-x-1/2 top-0 text-xs text-muted-foreground text-center pt-1"
          style={{
            transform: `translateY(${pullDistance - 20}px)`,
            opacity: progress,
          }}
        >
          {pullDistance >= threshold ? 'Release to refresh' : 'Pull to refresh'}
        </div>
      )}
    </div>
  );
};

// Simpler hook-based alternative for existing scroll containers
export const usePullToRefresh = (
  onRefresh: () => Promise<void>,
  options: { threshold?: number; disabled?: boolean } = {}
) => {
  const { threshold = 80, disabled = false } = options;
  const [isRefreshing, setIsRefreshing] = useState(false);
  const startYRef = useRef(0);

  const handleTouchStart = useCallback(
    (e: TouchEvent) => {
      if (disabled) return;
      startYRef.current = e.touches[0].clientY;
    },
    [disabled]
  );

  const handleTouchEnd = useCallback(
    async (e: TouchEvent) => {
      if (disabled || isRefreshing) return;

      const endY = e.changedTouches[0].clientY;
      const pullDistance = endY - startYRef.current;

      // Check if page is scrolled to top
      if (window.scrollY > 0) return;

      if (pullDistance >= threshold) {
        setIsRefreshing(true);
        try {
          await onRefresh();
        } finally {
          setIsRefreshing(false);
        }
      }
    },
    [disabled, isRefreshing, onRefresh, threshold]
  );

  useEffect(() => {
    window.addEventListener('touchstart', handleTouchStart, { passive: true });
    window.addEventListener('touchend', handleTouchEnd, { passive: true });

    return () => {
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchend', handleTouchEnd);
    };
  }, [handleTouchStart, handleTouchEnd]);

  return { isRefreshing };
};

export default PullToRefresh;
