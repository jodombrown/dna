import { useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { Post } from './PostList';

interface UseFeedRealtimeProps {
  onNewPost?: (post: any) => void;
  onPostUpdate?: (postId: string, updates: Partial<Post>) => void;
  onPostDelete?: (postId: string) => void;
}

export const useFeedRealtime = ({
  onNewPost,
  onPostUpdate,
  onPostDelete
}: UseFeedRealtimeProps = {}) => {
  
  const handlePostChange = useCallback((payload: any, event: 'INSERT' | 'UPDATE' | 'DELETE') => {
    switch (event) {
      case 'INSERT':
        onNewPost?.(payload.new);
        break;
      case 'UPDATE':
        onPostUpdate?.(payload.new.id, payload.new);
        break;
      case 'DELETE':
        onPostDelete?.(payload.old.id);
        break;
    }
  }, [onNewPost, onPostUpdate, onPostDelete]);

  const handleLikeChange = useCallback((payload: any, event: 'INSERT' | 'DELETE') => {
    // Handle like updates - this could trigger post stat updates
    // For now, individual PostCard components handle their own like state
    console.log('Like change:', event, payload);
  }, []);

  useEffect(() => {
    // Subscribe to post changes
    const postsChannel = supabase
      .channel('realtime-posts')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'posts'
      }, (payload) => handlePostChange(payload, 'INSERT'))
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'posts'
      }, (payload) => handlePostChange(payload, 'UPDATE'))
      .on('postgres_changes', {
        event: 'DELETE',
        schema: 'public',
        table: 'posts'
      }, (payload) => handlePostChange(payload, 'DELETE'))
      .subscribe();

    // Subscribe to post likes for real-time engagement updates
    const likesChannel = supabase
      .channel('realtime-likes')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'post_likes'
      }, (payload) => handleLikeChange(payload, 'INSERT'))
      .on('postgres_changes', {
        event: 'DELETE',
        schema: 'public',
        table: 'post_likes'
      }, (payload) => handleLikeChange(payload, 'DELETE'))
      .subscribe();

    // Cleanup subscriptions
    return () => {
      supabase.removeChannel(postsChannel);
      supabase.removeChannel(likesChannel);
    };
  }, [handlePostChange, handleLikeChange]);

  // Return channel status or controls if needed
  return {
    // Could expose channel status, manual refresh, etc.
  };
};