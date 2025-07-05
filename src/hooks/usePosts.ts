import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Tables } from '@/integrations/supabase/types';

type Post = Tables<'posts'>;

export const usePosts = (pillarFilter?: 'connect' | 'collaborate' | 'contribute') => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchPosts = async () => {
    try {
      setLoading(true);
      setError(null);

      let query = supabase
        .from('posts')
        .select('*')
        .eq('visibility', 'public')
        .order('created_at', { ascending: false });

      // Apply pillar filter if specified
      if (pillarFilter) {
        query = query.eq('pillar', pillarFilter);
      }

      const { data, error } = await query;

      if (error) {
        throw error;
      }

      setPosts(data || []);
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