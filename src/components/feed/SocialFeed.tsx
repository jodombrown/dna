import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import PostCreator from './PostCreator';
import PostCard from './PostCard';
import { useToast } from '@/hooks/use-toast';

interface Post {
  id: string;
  user_id: string;
  content: string;
  post_type: string;
  media_urls?: string[];
  article_title?: string;
  article_summary?: string;
  likes_count: number;
  comments_count: number;
  shares_count: number;
  created_at: string;
  profiles?: {
    full_name: string;
    avatar_url?: string;
    professional_role?: string;
    company?: string;
  } | null;
}

const SocialFeed = () => {
  const { user } = useAuth();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      fetchFeed();
    }
  }, [user]);

  const fetchFeed = async () => {
    try {
      const { data, error } = await supabase
        .from('posts')
        .select(`
          *,
          profiles:user_id (
            full_name,
            avatar_url,
            professional_role,
            company
          )
        `)
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) throw error;
      setPosts(data || []);
    } catch (error: any) {
      console.error('Error loading feed:', error);
      toast({
        title: "Error loading feed",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleNewPost = (newPost: Post) => {
    setPosts([newPost, ...posts]);
  };

  const handlePostUpdate = (updatedPost: Post) => {
    setPosts(posts.map(post => 
      post.id === updatedPost.id ? updatedPost : post
    ));
  };

  if (loading) {
    return (
      <div className="space-y-6">
        {[1, 2, 3].map(i => (
          <div key={i} className="bg-white rounded-xl p-6 shadow-sm border animate-pulse">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
              <div className="flex-1">
                <div className="h-4 bg-gray-200 rounded w-1/3 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/4"></div>
              </div>
            </div>
            <div className="space-y-2">
              <div className="h-4 bg-gray-200 rounded"></div>
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PostCreator onPostCreated={handleNewPost} />
      
      <div className="space-y-6">
        {posts.map(post => (
          <PostCard 
            key={post.id} 
            post={post} 
            onPostUpdate={handlePostUpdate}
          />
        ))}
        
        {posts.length === 0 && (
          <div className="text-center py-12 bg-white rounded-xl border">
            <div className="text-dna-forest text-xl font-semibold mb-2">
              Welcome to your DNA Feed!
            </div>
            <p className="text-gray-600">
              Start by creating your first post or following other members to see their updates.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SocialFeed;
