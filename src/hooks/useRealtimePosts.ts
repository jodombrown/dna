import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export const useRealtimePosts = (onNewPost: (post: any) => void) => {
  useEffect(() => {
    const channel = supabase
      .channel("realtime-posts")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "posts" },
        (payload) => onNewPost(payload.new)
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [onNewPost]);
};

export const useRealtimeComments = (onNewComment: (comment: any) => void) => {
  useEffect(() => {
    const channel = supabase
      .channel("realtime-comments")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "post_comments" },
        (payload) => onNewComment(payload.new)
      )
      .subscribe();

    return () => {
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