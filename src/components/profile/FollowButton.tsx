/**
 * FollowButton - Sprint 12D.2
 *
 * Follow/Following toggle button for profile pages and member cards.
 * Visually distinct from Connect: Follow = stay updated on their content,
 * Connect = mutual professional relationship.
 */

import React from 'react';
import { Rss, UserCheck, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import { useFollow } from '@/hooks/useFollow';
import { useAuth } from '@/contexts/AuthContext';

interface FollowButtonProps {
  targetUserId: string;
  /** Compact mode for inline usage (e.g. in cards) */
  compact?: boolean;
  className?: string;
}

export function FollowButton({ targetUserId, compact = false, className }: FollowButtonProps) {
  const { user } = useAuth();
  const { isFollowing, isToggling, toggleFollow } = useFollow(targetUserId);

  // Don't show follow button for own profile or unauthenticated users
  if (!user || user.id === targetUserId) return null;

  const button = (
    <Button
      variant="outline"
      size={compact ? 'sm' : 'default'}
      onClick={(e) => {
        e.stopPropagation();
        e.preventDefault();
        toggleFollow();
      }}
      disabled={isToggling}
      className={cn(
        'gap-2',
        compact && 'h-7 px-3 text-xs',
        isFollowing
          ? 'border-primary/30 text-primary hover:bg-primary/5'
          : 'border-muted-foreground/30 hover:border-primary/50 hover:text-primary',
        className
      )}
    >
      {isToggling ? (
        <Loader2 className={cn('animate-spin', compact ? 'h-3 w-3' : 'h-4 w-4')} />
      ) : isFollowing ? (
        <>
          <UserCheck className={cn(compact ? 'h-3 w-3' : 'h-4 w-4')} />
          Following
        </>
      ) : (
        <>
          <Rss className={cn(compact ? 'h-3 w-3' : 'h-4 w-4')} />
          Follow
        </>
      )}
    </Button>
  );

  if (compact) return button;

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        {button}
      </TooltipTrigger>
      <TooltipContent side="bottom" className="max-w-[200px] text-center">
        <p className="text-xs">
          {isFollowing
            ? 'You are following this person. Their posts will appear in your feed.'
            : 'Follow to see their posts and updates in your feed. No request needed.'}
        </p>
      </TooltipContent>
    </Tooltip>
  );
}
