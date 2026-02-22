/**
 * DNA | Sprint 11 - Bookmark Button
 *
 * Toggle bookmark icon for all card types.
 * Visual confirmation (filled vs outline icon).
 * Optimistic update with Supabase sync.
 */

import React, { useCallback } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Bookmark } from 'lucide-react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

// ============================================================
// TYPES
// ============================================================

interface BookmarkButtonProps {
  contentType: string;
  contentId: string;
  currentUserId: string;
  variant?: 'default' | 'compact';
  className?: string;
}

// ============================================================
// COMPONENT
// ============================================================

export const BookmarkButton: React.FC<BookmarkButtonProps> = ({
  contentType,
  contentId,
  currentUserId,
  variant = 'default',
  className,
}) => {
  const queryClient = useQueryClient();

  // Check if bookmarked
  const { data: isBookmarked = false } = useQuery({
    queryKey: ['feed-bookmark', contentType, contentId, currentUserId],
    queryFn: async () => {
      if (!currentUserId) return false;
      const { data } = await supabase
        .from('feed_bookmarks')
        .select('id')
        .eq('content_type', contentType)
        .eq('content_id', contentId)
        .eq('user_id', currentUserId)
        .maybeSingle();
      return !!data;
    },
    enabled: !!currentUserId,
  });

  // Toggle bookmark mutation
  const toggleMutation = useMutation({
    mutationFn: async () => {
      if (!currentUserId) throw new Error('Not authenticated');

      if (isBookmarked) {
        const { error } = await supabase
          .from('feed_bookmarks')
          .delete()
          .eq('content_type', contentType)
          .eq('content_id', contentId)
          .eq('user_id', currentUserId);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('feed_bookmarks').insert({
          user_id: currentUserId,
          content_type: contentType,
          content_id: contentId,
        });
        if (error) {
          const errMsg = (error as unknown as Record<string, string>).message || '';
          if (!errMsg.includes('duplicate key')) throw error;
        }
      }
    },
    onMutate: async () => {
      await queryClient.cancelQueries({
        queryKey: ['feed-bookmark', contentType, contentId, currentUserId],
      });
      const prev = queryClient.getQueryData<boolean>([
        'feed-bookmark', contentType, contentId, currentUserId,
      ]);
      queryClient.setQueryData(
        ['feed-bookmark', contentType, contentId, currentUserId],
        !isBookmarked
      );
      return { prev };
    },
    onError: (_err, _vars, context) => {
      if (context?.prev !== undefined) {
        queryClient.setQueryData(
          ['feed-bookmark', contentType, contentId, currentUserId],
          context.prev
        );
      }
      toast.error('Could not update bookmark');
    },
    onSuccess: () => {
      toast.success(isBookmarked ? 'Removed from saved' : 'Saved');
    },
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: ['feed-bookmark', contentType, contentId, currentUserId],
      });
      queryClient.invalidateQueries({
        queryKey: ['feed-bookmarks-list'],
      });
    },
  });

  const handleClick = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      if (currentUserId) {
        toggleMutation.mutate();
      } else {
        toast.error('Please sign in to save content');
      }
    },
    [currentUserId, toggleMutation]
  );

  if (variant === 'compact') {
    return (
      <button
        onClick={handleClick}
        className={cn(
          'p-1.5 rounded-full transition-colors',
          isBookmarked
            ? 'text-amber-500 bg-amber-50 dark:bg-amber-950/30'
            : 'text-muted-foreground hover:text-foreground hover:bg-accent',
          className
        )}
        aria-label={isBookmarked ? 'Remove bookmark' : 'Bookmark'}
      >
        <Bookmark
          className={cn('h-4 w-4', isBookmarked && 'fill-current')}
        />
      </button>
    );
  }

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={handleClick}
      className={cn(
        'h-9 px-3',
        isBookmarked && 'text-amber-500',
        className
      )}
      aria-label={isBookmarked ? 'Remove bookmark' : 'Bookmark'}
    >
      <Bookmark
        className={cn('h-[18px] w-[18px]', isBookmarked && 'fill-current')}
      />
    </Button>
  );
};
