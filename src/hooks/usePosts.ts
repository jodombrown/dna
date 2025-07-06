import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Tables } from '@/integrations/supabase/types';

type Post = Tables<'posts'> & {
  author?: {
    full_name: string | null;
    avatar_url: string | null;
    location: string | null;
    profession: string | null;
    display_name: string | null;
  };
};

export const usePosts = (pillarFilter?: 'connect' | 'collaborate' | 'contribute') => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchPosts = async () => {
    try {
      setLoading(true);
      setError(null);

      // First get posts, then manually join with profiles
      let query = supabase
        .from('posts')
        .select('*')
        .eq('visibility', 'public')
        .order('created_at', { ascending: false });

      // Apply pillar filter if specified
      if (pillarFilter) {
        query = query.eq('pillar', pillarFilter);
      }

      const { data: postsData, error: postsError } = await query;

      if (postsError) {
        throw postsError;
      }

      // Get unique author IDs
      const authorIds = [...new Set(postsData?.map(post => post.author_id).filter(Boolean) || [])];
      
      // Fetch author profiles
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id, full_name, avatar_url, location, profession, display_name')
        .in('id', authorIds);

      if (profilesError) {
        console.warn('Error fetching author profiles:', profilesError);
      }

      // Create a map of profiles by ID
      const profileMap = new Map(profiles?.map(profile => [profile.id, profile]) || []);

      // Combine posts with author data
      const postsWithAuthors = postsData?.map(post => ({
        ...post,
        author: post.author_id ? profileMap.get(post.author_id) : null
      })) || [];

      setPosts(postsWithAuthors);
    } catch (err) {
      console.error('Error fetching posts:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to load posts';
      setError(errorMessage);
      toast({
        title: "Error Loading Posts",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const refreshPosts = () => {
    fetchPosts();
  };

  useEffect(() => {
    fetchPosts();
  }, [pillarFilter]);

  return {
    posts,
    loading,
    error,
    refreshPosts
  };
};