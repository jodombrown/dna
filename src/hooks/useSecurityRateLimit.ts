import { useState, useCallback, useRef } from 'react';
import { createRateLimiter } from '@/utils/securityEnhancements';
import { useAuth } from '@/contexts/CleanAuthContext';

interface RateLimitOptions {
  maxAttempts: number;
  windowMs: number;
  penaltyMultiplier?: number;
}

export const useSecurityRateLimit = (action: string, options: RateLimitOptions) => {
  const { user } = useAuth();
  const rateLimiter = useRef(createRateLimiter(options));
  const [isLimited, setIsLimited] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(0);

  const checkLimit = useCallback((identifier?: string): boolean => {
    const id = identifier || user?.id || 'anonymous';
    const limited = rateLimiter.current.isLimited(id);
    setIsLimited(limited);
    
    if (limited) {
      // Calculate time remaining (approximation)
      const remaining = options.windowMs;
      setTimeRemaining(remaining);
      
      // Update countdown
      const interval = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1000) {
            clearInterval(interval);
            setIsLimited(false);
            return 0;
          }
          return prev - 1000;
        });
      }, 1000);
    }
    
    return limited;
  }, [user?.id, options.windowMs]);

  const recordAttempt = useCallback((identifier?: string): void => {
    const id = identifier || user?.id || 'anonymous';
    rateLimiter.current.recordAttempt(id);
  }, [user?.id]);

  const reset = useCallback((identifier?: string): void => {
    const id = identifier || user?.id || 'anonymous';
    rateLimiter.current.reset(id);
    setIsLimited(false);
    setTimeRemaining(0);
  }, [user?.id]);

  return {
    isLimited,
    timeRemaining: Math.ceil(timeRemaining / 1000), // Convert to seconds
    checkLimit,
    recordAttempt,
    reset
  };
};