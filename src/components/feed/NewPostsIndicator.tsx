/**
 * DNA | Sprint 11 - New Posts Indicator
 *
 * Floating pill at top of feed showing new post count.
 * "[N] new posts ↑"
 * Tapping scrolls to top and loads fresh content.
 */

import React from 'react';
import { cn } from '@/lib/utils';
import { ArrowUp } from 'lucide-react';

// ============================================================
// TYPES
// ============================================================

interface NewPostsIndicatorProps {
  count: number;
  onClick: () => void;
  className?: string;
}

// ============================================================
// COMPONENT
// ============================================================

export const NewPostsIndicator: React.FC<NewPostsIndicatorProps> = ({
  count,
  onClick,
  className,
}) => {
  if (count <= 0) return null;

  return (
    <button
      onClick={onClick}
      className={cn(
        'fixed top-20 left-1/2 -translate-x-1/2 z-40',
        'flex items-center gap-1.5',
        'bg-dna-emerald text-white',
        'px-4 py-2 rounded-full shadow-lg',
        'text-sm font-medium',
        'hover:bg-dna-emerald/90 active:scale-95',
        'transition-all duration-200',
        'animate-in fade-in slide-in-from-top-4 duration-300',
        className
      )}
    >
      <span>
        {count} new {count === 1 ? 'post' : 'posts'}
      </span>
      <ArrowUp className="h-3.5 w-3.5" />
    </button>
  );
};
