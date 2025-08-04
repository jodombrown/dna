import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export interface Comment {
  id: string;
  post_id: string;
  user_id: string;
  parent_id?: string;
  content: string;
  created_at: string;
  updated_at: string;
  profiles: {
    id: string;
    full_name: string;
    avatar_url?: string;
    professional_role?: string;
  };
  replies?: Comment[];
}

interface UsePostCommentsProps {
  postId: string;
  enabled?: boolean;
}

interface UsePostCommentsReturn {
  comments: Comment[];
  loading: boolean;
  addComment: (content: string, parentId?: string) => Promise<void>;
  deleteComment: (commentId: string) => Promise<void>;
  refresh: () => Promise<void>;
  error: string | null;
}

export const usePostComments = ({ 
  postId, 
  enabled = true 
}: UsePostCommentsProps): UsePostCommentsReturn => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchComments = useCallback(async () => {
    if (!enabled || !postId) return;

    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('post_comments')
        .select(`
          id,
          post_id,
          user_id,
          parent_id,
          content,
          created_at,
          updated_at,
          profiles!post_comments_user_id_fkey (
            id,
            full_name,
            avatar_url,
            professional_role
          )
        `)
        .eq('post_id', postId)
        .order('created_at', { ascending: true });

      if (fetchError) throw fetchError;

      // Structure comments into threaded format
      const structuredComments = structureComments(data || []);
      setComments(structuredComments);

    } catch (error) {
      console.error('Error fetching comments:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to load comments';
      setError(errorMessage);
      toast({
        title: "Error loading comments",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [postId, enabled, toast]);

  const structureComments = (flatComments: any[]): Comment[] => {
    const commentMap = new Map<string, Comment>();
    const rootComments: Comment[] = [];

    // First pass: create comment objects
    flatComments.forEach(comment => {
      commentMap.set(comment.id, {
        ...comment,
        replies: []
      });
    });

    // Second pass: build the tree structure
    flatComments.forEach(comment => {
      const commentObj = commentMap.get(comment.id)!;
      
      if (comment.parent_id) {
        // This is a reply
        const parent = commentMap.get(comment.parent_id);
        if (parent) {
          parent.replies = parent.replies || [];
          parent.replies.push(commentObj);
        }
      } else {
        // This is a root comment
        rootComments.push(commentObj);
      }
    });

    return rootComments;
  };

  const addComment = useCallback(async (content: string, parentId?: string) => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please log in to comment",
        variant: "destructive",
      });
      return;
    }

    if (!content.trim()) {
      toast({
        title: "Content required",
        description: "Please write something before posting",
        variant: "destructive",
      });
      return;
    }

    try {
      const { error: insertError } = await supabase
        .from('post_comments')
        .insert({
          post_id: postId,
          user_id: user.id,
          parent_id: parentId || null,
          content: content.trim()
        });

      if (insertError) throw insertError;

      toast({
        title: "Comment posted!",
        description: "Your comment has been added.",
      });

      // Refresh comments to show the new one
      await fetchComments();

    } catch (error) {
      console.error('Error adding comment:', error);
      toast({
        title: "Error posting comment",
        description: "Failed to post comment. Please try again.",
        variant: "destructive",
      });
    }
  }, [user, postId, fetchComments, toast]);

  const deleteComment = useCallback(async (commentId: string) => {
    if (!user) return;

    try {
      const { error: deleteError } = await supabase
        .from('post_comments')
        .delete()
        .eq('id', commentId)
        .eq('user_id', user.id); // Extra safety check

      if (deleteError) throw deleteError;

      toast({
        title: "Comment deleted",
        description: "Your comment has been removed.",
      });

      // Refresh comments
      await fetchComments();

    } catch (error) {
      console.error('Error deleting comment:', error);
      toast({
        title: "Error deleting comment",
        description: "Failed to delete comment. Please try again.",
        variant: "destructive",
      });
    }
  }, [user, fetchComments, toast]);

  const refresh = useCallback(() => {
    return fetchComments();
  }, [fetchComments]);

  // Initial load
  useEffect(() => {
    fetchComments();
  }, [fetchComments]);

  // Set up real-time subscription for comments
  useEffect(() => {
    if (!enabled || !postId) return;

    const channel = supabase
      .channel(`comments-${postId}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'post_comments',
        filter: `post_id=eq.${postId}`
      }, () => {
        fetchComments();
      })
      .on('postgres_changes', {
        event: 'DELETE',
        schema: 'public',
        table: 'post_comments',
        filter: `post_id=eq.${postId}`
      }, () => {
        fetchComments();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [postId, enabled, fetchComments]);

  return {
    comments,
    loading,
    addComment,
    deleteComment,
    refresh,
    error
  };
};