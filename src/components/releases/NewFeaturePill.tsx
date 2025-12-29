/**
 * NewFeaturePill Component
 * Header navigation element that shows count of new features (last 30 days)
 * with animated pulse effect when new features exist
 */

import React from 'react';
import { Link } from 'react-router-dom';
import { Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useFeaturedCount } from '@/hooks/useReleases';
import type { NewFeaturePillProps } from '@/types/releases';

export const NewFeaturePill: React.FC<NewFeaturePillProps> = ({ className }) => {
  const { data: count = 0, isLoading } = useFeaturedCount();

  // Don't render if no featured releases
  if (!isLoading && count === 0) {
    return null;
  }

  return (
    <Link
      to="/releases?filter=featured"
      className={cn(
        'group relative inline-flex items-center gap-1.5 px-3 py-1.5',
        'text-sm font-medium rounded-full',
        'bg-gradient-to-r from-amber-100 to-amber-50',
        'text-amber-800 border border-amber-200',
        'hover:from-amber-200 hover:to-amber-100',
        'hover:border-amber-300 hover:shadow-sm',
        'transition-all duration-200',
        'focus:outline-none focus:ring-2 focus:ring-amber-400 focus:ring-offset-2',
        className
      )}
    >
      {/* Animated pulse ring when there are new features */}
      {count > 0 && (
        <span className="absolute -inset-0.5 rounded-full bg-amber-400/20 animate-pulse" />
      )}

      <Sparkles
        className={cn(
          'w-4 h-4 relative',
          'text-amber-600 group-hover:text-amber-700',
          count > 0 && 'animate-bounce'
        )}
        style={{ animationDuration: '2s' }}
      />

      <span className="relative">What&apos;s New</span>

      {/* Count badge */}
      {!isLoading && count > 0 && (
        <span
          className={cn(
            'relative inline-flex items-center justify-center',
            'min-w-[20px] h-5 px-1.5',
            'text-xs font-bold rounded-full',
            'bg-amber-500 text-white',
            'shadow-sm'
          )}
        >
          {count > 99 ? '99+' : count}
        </span>
      )}

      {/* Loading state */}
      {isLoading && (
        <span className="relative w-5 h-5 flex items-center justify-center">
          <span className="w-3 h-3 rounded-full bg-amber-400 animate-ping" />
        </span>
      )}
    </Link>
  );
};

/**
 * Compact variant for mobile or space-constrained areas
 */
export const NewFeaturePillCompact: React.FC<NewFeaturePillProps> = ({
  className,
}) => {
  const { data: count = 0, isLoading } = useFeaturedCount();

  if (!isLoading && count === 0) {
    return null;
  }

  return (
    <Link
      to="/releases?filter=featured"
      className={cn(
        'relative inline-flex items-center justify-center',
        'w-8 h-8 rounded-full',
        'bg-amber-100 text-amber-700',
        'hover:bg-amber-200',
        'transition-colors',
        'focus:outline-none focus:ring-2 focus:ring-amber-400',
        className
      )}
      aria-label={`${count} new features`}
    >
      <Sparkles className="w-4 h-4" />

      {/* Count indicator */}
      {!isLoading && count > 0 && (
        <span
          className={cn(
            'absolute -top-0.5 -right-0.5',
            'min-w-[16px] h-4 px-1',
            'flex items-center justify-center',
            'text-[10px] font-bold rounded-full',
            'bg-amber-500 text-white',
            'border-2 border-white'
          )}
        >
          {count > 9 ? '9+' : count}
        </span>
      )}
    </Link>
  );
};

export default NewFeaturePill;
