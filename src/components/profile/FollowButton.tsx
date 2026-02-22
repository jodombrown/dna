/**
 * FollowButton - Sprint 12D.2
 *
 * Follow/Following toggle button for profile pages and member cards.
 * Supports optimistic updates via useFollow hook.
 */

import React from 'react';
import { UserPlus, UserCheck, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
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

  if (compact) {
    return (
      <Button
        variant={isFollowing ? 'outline' : 'default'}
        size="sm"
        onClick={(e) => {
          e.stopPropagation();
          e.preventDefault();
          toggleFollow();
        }}
        disabled={isToggling}
        className={cn(
          'h-7 px-3 text-xs',
          !isFollowing && 'bg-dna-emerald hover:bg-dna-emerald/90 text-white',
          className
        )}
      >
        {isToggling ? (
          <Loader2 className="h-3 w-3 animate-spin" />
        ) : isFollowing ? (
          'Following'
        ) : (
          'Follow'
        )}
      </Button>
    );
  }

  return (
    <Button
      variant={isFollowing ? 'outline' : 'default'}
      onClick={(e) => {
        e.stopPropagation();
        e.preventDefault();
        toggleFollow();
      }}
      disabled={isToggling}
      className={cn(
        'gap-2',
        !isFollowing && 'bg-dna-emerald hover:bg-dna-emerald/90 text-white',
        className
      )}
    >
      {isToggling ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : isFollowing ? (
        <>
          <UserCheck className="h-4 w-4" />
          Following
        </>
      ) : (
        <>
          <UserPlus className="h-4 w-4" />
          Follow
        </>
      )}
    </Button>
  );
}
