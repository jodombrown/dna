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
  
  const handleReactionChange = useCallback((payload: { new?: RealtimeReactionPayload; old?: RealtimeReactionPayload }, event: 'INSERT' | 'DELETE') => {
    const data = payload.new || payload.old;
    if (data) onReactionUpdate?.(data, event);
  }, [onReactionUpdate]);

  const handleLikeChange = useCallback((payload: { new?: RealtimeLikePayload; old?: RealtimeLikePayload }, event: 'INSERT' | 'DELETE') => {
    const data = payload.new || payload.old;
    if (data) onLikeUpdate?.(data, event);
  }, [onLikeUpdate]);

  useEffect(() => {
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
        handleReactionChange(payload, 'INSERT');
      })
      .on("postgres_changes", {
        event: "DELETE",
        schema: "public",
        table: "post_reactions"
      }, (payload) => {
        handleReactionChange(payload, 'DELETE');
      })
      .subscribe();

    // Subscribe to post likes
    const likesChannel = supabase
      .channel(`realtime-likes-${channelId}`)
      .on("postgres_changes", {
        event: "INSERT",
        schema: "public",
        table: "post_likes"
      }, (payload) => {
        handleLikeChange(payload, 'INSERT');
      })
      .on("postgres_changes", {
        event: "DELETE",
        schema: "public",
        table: "post_likes"
      }, (payload) => {
        handleLikeChange(payload, 'DELETE');
      })
      .subscribe();

    return () => {
      supabase.removeChannel(reactionsChannel);
      supabase.removeChannel(likesChannel);
    };
  }, [handleReactionChange, handleLikeChange]);
};