import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Tables } from '@/integrations/supabase/types';

type Comment = Tables<'comments'> & {
  author?: {
    full_name: string | null;
    avatar_url: string | null;
    display_name: string | null;
  };
};

export const useComments = (postId: string) => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const { toast } = useToast();

  const fetchComments = async () => {
    try {
      setLoading(true);
      const { data: commentsData, error: commentsError } = await supabase
        .from('comments')
        .select('*')
        .eq('post_id', postId)
        .order('created_at', { ascending: true });

      if (commentsError) throw commentsError;

      // Get unique author IDs
      const authorIds = [...new Set(commentsData?.map(comment => comment.author_id).filter(Boolean) || [])];
      
      // Fetch author profiles
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id, full_name, avatar_url, display_name')
        .in('id', authorIds);

      if (profilesError) {
        console.warn('Error fetching comment author profiles:', profilesError);
      }

      // Create a map of profiles by ID
      const profileMap = new Map(profiles?.map(profile => [profile.id, profile]) || []);

      // Combine comments with author data
      const commentsWithAuthors = commentsData?.map(comment => ({
        ...comment,
        author: comment.author_id ? profileMap.get(comment.author_id) : null
      })) || [];

      setComments(commentsWithAuthors);
    } catch (error) {
      console.error('Error fetching comments:', error);
      toast({
        title: "Error",
        description: "Failed to load comments.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const addComment = async (content: string, parentId?: string) => {
    try {
      setSubmitting(true);
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast({
          title: "Authentication Required",
          description: "Please sign in to comment.",
          variant: "destructive"
        });
        return false;
      }

      const { error } = await supabase
        .from('comments')
        .insert({
          post_id: postId,
          author_id: user.id,
          content: content.trim(),
          parent_id: parentId || null
        });

      if (error) throw error;

      toast({
        title: "Comment Added",
        description: "Your comment has been posted."
      });

      await fetchComments();
      return true;
    } catch (error) {
      console.error('Error adding comment:', error);
      toast({
        title: "Error",
        description: "Failed to post comment.",
        variant: "destructive"
      });
      return false;
    } finally {
      setSubmitting(false);
    }
  };

  useEffect(() => {
    if (postId) {
      fetchComments();
    }
  }, [postId]);

  return {
    comments,
    loading,
    submitting,
    addComment,
    refreshComments: fetchComments
  };
};