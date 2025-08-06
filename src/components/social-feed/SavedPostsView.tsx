import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Bookmark, Loader2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { PostCard } from './PostCard';
import type { Post } from './PostList';

export const SavedPostsView: React.FC = () => {
  const [savedPosts, setSavedPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchSavedPosts = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('saved_posts')
        .select(`
          post_id,
          posts!inner (
            id,
            content,
            media_url,
            type,
            pillar,
            created_at,
            author_id,
            embed_metadata,
            profiles!author_id (
              id,
              full_name,
              avatar_url,
              location,
              profession
            )
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Transform the data to match Post interface
      const posts = data?.map((item: any) => ({
        ...item.posts,
        user_has_saved: true
      })).filter(Boolean) as Post[];

      setSavedPosts(posts || []);
    } catch (error) {
      console.error('Error fetching saved posts:', error);
      toast({
        title: "Error",
        description: "Failed to load saved posts.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSavedPosts();
  }, [user]);

  const handleUnsave = (postId: string) => {
    // Remove post from saved list when unsaved
    setSavedPosts(prev => prev.filter(post => post.id !== postId));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin" />
        <span className="ml-2 text-muted-foreground">Loading saved posts...</span>
      </div>
    );
  }

  if (savedPosts.length === 0) {
    return (
      <Card>
        <CardContent className="py-8 text-center">
          <Bookmark className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground">No saved posts yet.</p>
          <p className="text-sm text-muted-foreground mt-2">Save posts you want to read later!</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <CardHeader className="px-0 pb-4">
        <CardTitle className="text-xl">Saved Posts ({savedPosts.length})</CardTitle>
      </CardHeader>

      {savedPosts.map((post) => (
        <PostCard
          key={post.id}
          post={post}
          onComment={() => {}}
        />
      ))}
    </div>
  );
};