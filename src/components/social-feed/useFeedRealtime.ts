import { useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { Post } from './PostList';

interface UseFeedRealtimeProps {
  onNewPost?: (post: any) => void;
  onPostUpdate?: (postId: string, updates: Partial<Post>) => void;
  onPostDelete?: (postId: string) => void;
  onNewComment?: (comment: any) => void;
}

export const useFeedRealtime = ({
  onNewPost,
  onPostUpdate,
  onPostDelete,
  onNewComment
}: UseFeedRealtimeProps = {}) => {
  
  const channelsRef = useRef<any[]>([]);
  const isSubscribedRef = useRef(false);
  
  const handlePostChange = useCallback((payload: any, event: 'INSERT' | 'UPDATE' | 'DELETE') => {
    console.log('Real-time post change:', event, payload);
    switch (event) {
      case 'INSERT':
        // Fetch complete post data with profiles for new posts
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

  const handleCommentChange = useCallback((payload: any, event: 'INSERT' | 'DELETE') => {
    console.log('Real-time comment change:', event, payload);
    if (event === 'INSERT') {
      onNewComment?.(payload.new);
    }
  }, [onNewComment]);

  useEffect(() => {
    // Prevent multiple subscriptions
    if (isSubscribedRef.current) {
      return;
    }

    isSubscribedRef.current = true;
    console.log('Setting up real-time feed subscriptions...');

    // Create unique channel names to avoid conflicts
    const channelId = `feed-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    // Subscribe to post changes
    const postsChannel = supabase
      .channel(`realtime-posts-${channelId}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'posts',
        filter: 'visibility=eq.public'
      }, (payload) => handlePostChange(payload, 'INSERT'))
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'posts',
        filter: 'visibility=eq.public'
      }, (payload) => handlePostChange(payload, 'UPDATE'))
      .on('postgres_changes', {
        event: 'DELETE',
        schema: 'public',
        table: 'posts'
      }, (payload) => handlePostChange(payload, 'DELETE'))
      .subscribe((status) => {
        console.log('Posts channel status:', status);
      });

    // Subscribe to comment changes 
    const commentsChannel = supabase
      .channel(`realtime-comments-${channelId}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'post_comments'
      }, (payload) => handleCommentChange(payload, 'INSERT'))
      .on('postgres_changes', {
        event: 'DELETE',
        schema: 'public',
        table: 'post_comments'
      }, (payload) => handleCommentChange(payload, 'DELETE'))
      .subscribe((status) => {
        console.log('Comments channel status:', status);
      });

    // Store channels for cleanup
    channelsRef.current = [postsChannel, commentsChannel];

    // Cleanup subscriptions
    return () => {
      console.log('Cleaning up feed real-time subscriptions');
      isSubscribedRef.current = false;
      channelsRef.current.forEach(channel => {
        supabase.removeChannel(channel);
      });
      channelsRef.current = [];
    };
  }, [handlePostChange, handleCommentChange]);

  // Return channel status or controls if needed
  return {
    isConnected: channelsRef.current.length > 0,
    channelCount: channelsRef.current.length
  };
};