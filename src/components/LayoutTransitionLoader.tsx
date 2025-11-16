import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';

interface LayoutTransitionLoaderProps {
  message?: string;
}

/**
 * LayoutTransitionLoader - Loading state during view state / layout transitions
 * Part of ADA v2 (Adaptive Dashboard Architecture)
 * 
 * Provides smooth feedback when switching between layouts to avoid jarring jumps
 */
export const LayoutTransitionLoader: React.FC<LayoutTransitionLoaderProps> = ({ 
  message = 'Loading...' 
}) => {
  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <div className="flex flex-col items-center gap-4 p-8">
        <div className="flex gap-2">
          <Skeleton className="h-12 w-12 rounded-full" />
          <div className="flex flex-col gap-2">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-3 w-24" />
          </div>
        </div>
        <p className="text-sm text-muted-foreground animate-pulse">{message}</p>
      </div>
    </div>
  );
};

/**
 * Inline content loader for smoother transitions
 */
export const InlineTransitionLoader: React.FC = () => {
  return (
    <div className="flex items-center justify-center p-8">
      <div className="flex gap-2 items-center">
        <div className="h-2 w-2 bg-primary rounded-full animate-bounce [animation-delay:-0.3s]" />
        <div className="h-2 w-2 bg-primary rounded-full animate-bounce [animation-delay:-0.15s]" />
        <div className="h-2 w-2 bg-primary rounded-full animate-bounce" />
      </div>
    </div>
  );
};
