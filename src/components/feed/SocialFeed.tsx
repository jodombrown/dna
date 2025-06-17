
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import PostCard from './PostCard';
import PostCreator from './PostCreator';

interface Post {
  id: string;
  content: string;
  created_at: string;
  likes_count: number;
  comments_count: number;
  is_published: boolean;
  post_type: string;
  media_urls: string[];
  article_title: string | null;
  article_summary: string | null;
  profiles: {
    full_name: string;
    avatar_url?: string;
    professional_role?: string;
    company?: string;
  };
}

const SocialFeed = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchPosts = async () => {
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
        .eq('is_published', true)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Transform the data to match our Post interface
      const transformedPosts: Post[] = (data || []).map(post => ({
        ...post,
        profiles: post.profiles || {
          full_name: 'Anonymous User',
          avatar_url: null,
          professional_role: null,
          company: null
        }
      }));

      setPosts(transformedPosts);
    } catch (error) {
      console.error('Error fetching posts:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  if (loading) {
    return <div className="text-center py-8">Loading feed...</div>;
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <PostCreator onPostCreated={fetchPosts} />
      
      <div className="space-y-6">
        {posts.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            No posts yet. Be the first to share something!
          </div>
        ) : (
          posts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))
        )}
      </div>
    </div>
  );
};

export default SocialFeed;
