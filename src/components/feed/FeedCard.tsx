import React from 'react';
import { cn } from '@/lib/utils';
import { PostType, getPostTypeStyles } from '@/lib/dna/postTypeColors';

interface FeedCardProps {
  postType: PostType;
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}

export function FeedCard({ postType, children, className, onClick }: FeedCardProps) {
  const styles = getPostTypeStyles(postType);

  return (
    <article
      onClick={onClick}
      className={cn(
        // Base styles
        'bg-card',
        // Edge-to-edge on mobile, with margins on desktop
        'w-full md:mx-4 md:rounded-lg md:shadow-sm',
        // Bevel - left border based on post type
        'border-l-4',
        styles.border,
        // Bottom border for separation
        'border-b border-border md:border md:border-border',
        // Hover state
        onClick && 'cursor-pointer hover:bg-muted/50 transition-colors',
        className
      )}
    >
      {children}
    </article>
  );
}

// Sub-components for consistent card structure
export function FeedCardHeader({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn('px-4 pt-4 pb-2', className)}>
      {children}
    </div>
  );
}

export function FeedCardContent({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn('px-4 pb-2', className)}>
      {children}
    </div>
  );
}

export function FeedCardMedia({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn('w-full', className)}>
      {children}
    </div>
  );
}

export function FeedCardFooter({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn('px-4 py-3 border-t border-border', className)}>
      {children}
    </div>
  );
}
