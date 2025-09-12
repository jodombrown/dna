import { useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export const usePostAnalytics = () => {
  const { user } = useAuth();

  const logPostEvent = useCallback(async (
    postId: string,
    eventType: 'view' | 'like' | 'comment' | 'share',
    metadata?: Record<string, any>
  ) => {
    if (!user) return;

    try {
      await supabase.rpc('log_post_event', {
        p_post_id: postId,
        p_event_type: eventType,
        p_metadata: metadata || {}
      });
    } catch (error) {
      console.error('Error logging post event:', error);
    }
  }, [user]);

  const logPostView = useCallback(async (postId: string) => {
    await logPostEvent(postId, 'view');
  }, [logPostEvent]);

  const logPostLike = useCallback(async (postId: string) => {
    await logPostEvent(postId, 'like');
  }, [logPostEvent]);

  const logPostComment = useCallback(async (postId: string) => {
    await logPostEvent(postId, 'comment');
  }, [logPostEvent]);

  const logPostShare = useCallback(async (postId: string, platform?: string) => {
    await logPostEvent(postId, 'share', platform ? { platform } : {});
  }, [logPostEvent]);

  return {
    logPostView,
    logPostLike,
    logPostComment,
    logPostShare
  };
};