import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export const useRealtimePosts = (onNewPost: (post: any) => void) => {
  useEffect(() => {
    console.log('Setting up realtime posts subscription...');
    
    const channel = supabase
      .channel("realtime-posts")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "posts" },
        (payload) => {
          console.log('New post received via realtime:', payload.new);
          onNewPost(payload.new);
        }
      )
      .subscribe((status) => {
        console.log('Realtime posts subscription status:', status);
      });

    return () => {
      console.log('Cleaning up realtime posts subscription');
      supabase.removeChannel(channel);
    };
  }, [onNewPost]);
};

export const useRealtimeComments = (onNewComment: (comment: any) => void) => {
  useEffect(() => {
    console.log('Setting up realtime comments subscription...');
    
    const channel = supabase
      .channel("realtime-comments")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "post_comments" },
        (payload) => {
          console.log('New comment received via realtime:', payload.new);
          onNewComment(payload.new);
        }
      )
      .subscribe((status) => {
        console.log('Realtime comments subscription status:', status);
      });

    return () => {
      console.log('Cleaning up realtime comments subscription');
      supabase.removeChannel(channel);
    };
  }, [onNewComment]);
};

export const useRealtimeReactions = (onNewReaction: (reaction: any) => void) => {
  useEffect(() => {
    const channel = supabase
      .channel("realtime-reactions")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "post_reactions" },
        (payload) => onNewReaction(payload.new)
      )
      .on(
        "postgres_changes",
        { event: "DELETE", schema: "public", table: "post_reactions" },
        (payload) => onNewReaction({ ...payload.old, _deleted: true })
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [onNewReaction]);
};