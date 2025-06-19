
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import PostCard from './PostCard';
import PostCreator from './PostCreator';

interface Post {
  id: string;
  content: string | null;
  created_at: string | null;
  updated_at: string | null;
  user_id: string | null;
  likes_count: number;
  comments_count: number;
  post_type: string;
  is_published: boolean;
  profiles: {
    full_name: string | null;
    avatar_url?: string | null;
    professional_role?: string | null;
    company?: string | null;
  } | null;
}

const SocialFeed = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchPosts = async () => {
    try {
      // Fetch posts with proper schema
      const { data: postsData, error: postsError } = await supabase
        .from('posts')
        .select('*')
        .eq('is_published', true)
        .order('created_at', { ascending: false });

      if (postsError) {
        console.error('Posts error:', postsError);
        setPosts([]);
        return;
      }

      // Get profiles for each post
      const postsWithProfiles: Post[] = [];
      
      for (const post of postsData || []) {
        const { data: profileData } = await supabase
          .from('profiles')
          .select('full_name, avatar_url, professional_role, company')
          .eq('id', post.user_id)
          .single();

        postsWithProfiles.push({
          ...post,
          likes_count: post.likes_count || 0,
          comments_count: post.comments_count || 0,
          profiles: profileData || {
            full_name: 'DNA Member',
            avatar_url: null,
            professional_role: null,
            company: null
          }
        });
      }

      setPosts(postsWithProfiles);
    } catch (error) {
      console.error('Error fetching posts:', error);
      setPosts([]);
    } finally {
      setLoading(false);
    }
  };

  const handlePostUpdate = (updatedPost: Post) => {
    setPosts(prev => prev.map(post => 
      post.id === updatedPost.id ? updatedPost : post
    ));
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
            <PostCard 
              key={post.id} 
              post={post} 
              onPostUpdate={handlePostUpdate}
            />
          ))
        )}
      </div>
    </div>
  );
};

export default SocialFeed;
