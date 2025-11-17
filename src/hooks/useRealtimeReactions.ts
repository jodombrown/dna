import { useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface RealtimeReactionPayload {
  post_id: string;
  user_id: string;
  emoji: string;
  id: string;
  created_at: string;
}

export interface RealtimeLikePayload {
  post_id: string;
  user_id: string;
  id: string;
  created_at: string;
}

interface UseRealtimeReactionsProps {
  onReactionUpdate?: (payload: RealtimeReactionPayload, event: 'INSERT' | 'DELETE') => void;
  onLikeUpdate?: (payload: RealtimeLikePayload, event: 'INSERT' | 'DELETE') => void;
}

export const useRealtimeReactions = ({ 
  onReactionUpdate, 
  onLikeUpdate 
}: UseRealtimeReactionsProps = {}) => {
  
  const handleReactionChange = useCallback((payload: any, event: 'INSERT' | 'DELETE') => {
    onReactionUpdate?.(payload.new || payload.old, event);
  }, [onReactionUpdate]);

  const handleLikeChange = useCallback((payload: any, event: 'INSERT' | 'DELETE') => {
    onLikeUpdate?.(payload.new || payload.old, event);
  }, [onLikeUpdate]);

  useEffect(() => {
    console.log('Setting up real-time reactions subscriptions...');
    
    // Create unique channel names to avoid conflicts with feed realtime
    const channelId = `reactions-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    // Subscribe to post reactions
    const reactionsChannel = supabase
      .channel(`realtime-reactions-${channelId}`)
      .on("postgres_changes", {
        event: "INSERT",
        schema: "public",
        table: "post_reactions"
      }, (payload) => {
        console.log('Real-time reaction INSERT:', payload);
        handleReactionChange(payload, 'INSERT');
      })
      .on("postgres_changes", {
        event: "DELETE", 
        schema: "public",
        table: "post_reactions"
      }, (payload) => {
        console.log('Real-time reaction DELETE:', payload);
        handleReactionChange(payload, 'DELETE');
      })
      .subscribe((status) => {
        console.log('Reactions channel status:', status);
      });

    // Subscribe to post likes
    const likesChannel = supabase
      .channel(`realtime-likes-${channelId}`)
      .on("postgres_changes", {
        event: "INSERT",
        schema: "public", 
        table: "post_likes"
      }, (payload) => {
        console.log('Real-time like INSERT:', payload);
        handleLikeChange(payload, 'INSERT');
      })
      .on("postgres_changes", {
        event: "DELETE",
        schema: "public",
        table: "post_likes" 
      }, (payload) => {
        console.log('Real-time like DELETE:', payload);
        handleLikeChange(payload, 'DELETE');
      })
      .subscribe((status) => {
        console.log('Likes channel status:', status);
      });

    return () => {
      console.log('Cleaning up reactions real-time subscriptions');
      supabase.removeChannel(reactionsChannel);
      supabase.removeChannel(likesChannel);
    };
  }, [handleReactionChange, handleLikeChange]);
};