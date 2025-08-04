import { useEffect, useCallback, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export interface RealtimeFeedPost {
  id: string;
  content: string;
  media_url?: string;
  type: string;
  pillar: string;
  created_at: string;
  author_id: string;
  user_id: string;
  visibility: string;
}

export interface RealtimeFeedOptions {
  pillar?: string;
  onPostUpdate?: (post: RealtimeFeedPost, event: 'INSERT' | 'UPDATE' | 'DELETE') => void;
  onLikeUpdate?: (like: any, event: 'INSERT' | 'DELETE') => void;
  onCommentUpdate?: (comment: any, event: 'INSERT' | 'UPDATE' | 'DELETE') => void;
}

export const useRealtimeFeed = ({
  pillar,
  onPostUpdate,
  onLikeUpdate,
  onCommentUpdate
}: RealtimeFeedOptions = {}) => {
  const { user } = useAuth();
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'error'>('connecting');

  const handlePostChange = useCallback((payload: any, event: 'INSERT' | 'UPDATE' | 'DELETE') => {
    const postData = payload.new || payload.old;
    
    // Filter by pillar if specified
    if (pillar && pillar !== 'feed' && postData.pillar !== pillar) {
      return;
    }
    
    // Only process public posts or user's own posts
    if (postData.visibility === 'public' || postData.author_id === user?.id) {
      console.log(`Post ${event}:`, postData);
      onPostUpdate?.(postData, event);
    }
  }, [pillar, user?.id, onPostUpdate]);

  const handleLikeChange = useCallback((payload: any, event: 'INSERT' | 'DELETE') => {
    const likeData = payload.new || payload.old;
    console.log(`Like ${event}:`, likeData);
    onLikeUpdate?.(likeData, event);
  }, [onLikeUpdate]);

  const handleCommentChange = useCallback((payload: any, event: 'INSERT' | 'UPDATE' | 'DELETE') => {
    const commentData = payload.new || payload.old;
    console.log(`Comment ${event}:`, commentData);
    onCommentUpdate?.(commentData, event);
  }, [onCommentUpdate]);

  useEffect(() => {
    if (!user) {
      console.log('No user authenticated, skipping realtime setup');
      return;
    }

    console.log('Setting up comprehensive realtime feed subscription for user:', user.id);
    setConnectionStatus('connecting');

    // Create a single channel for all feed-related subscriptions
    const channel = supabase
      .channel(`feed-${user.id}`)
      .on("postgres_changes", {
        event: "*",
        schema: "public",
        table: "posts"
      }, (payload) => handlePostChange(payload, payload.eventType as any))
      .on("postgres_changes", {
        event: "*",
        schema: "public",
        table: "post_likes"
      }, (payload) => handleLikeChange(payload, payload.eventType as any))
      .on("postgres_changes", {
        event: "*",
        schema: "public",
        table: "post_comments"
      }, (payload) => handleCommentChange(payload, payload.eventType as any))
      .subscribe((status) => {
        console.log('Realtime feed subscription status:', status);
        if (status === 'SUBSCRIBED') {
          setConnectionStatus('connected');
        } else if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
          setConnectionStatus('error');
        }
      });

    return () => {
      console.log('Cleaning up realtime feed subscription');
      supabase.removeChannel(channel);
      setConnectionStatus('connecting');
    };
  }, [user?.id, handlePostChange, handleLikeChange, handleCommentChange]);

  return { connectionStatus };
};