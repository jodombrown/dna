import { useEffect, useRef } from 'react';

interface UseAutoRefreshProps {
  enabled: boolean;
  interval: number;
  onRefresh: () => Promise<void> | void;
}

export const useAutoRefresh = ({ enabled, interval, onRefresh }: UseAutoRefreshProps) => {
  const intervalRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    if (!enabled) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      return;
    }

    intervalRef.current = setInterval(async () => {
      try {
        await onRefresh();
      } catch (error) {
        console.error('Auto-refresh failed:', error);
        // Graceful degradation - continue with interval
      }
    }, interval);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [enabled, interval, onRefresh]);

  return {
    stop: () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }
  };
};