
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
  user_id: string;
  profiles: {
    full_name: string;
    avatar_url?: string;
    professional_role?: string;
    company?: string;
  } | null;
}

const SocialFeed = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchPosts = async () => {
    try {
      // Use direct SQL query since posts table exists but isn't in types
      const { data: postsData, error: postsError } = await supabase
        .rpc('get_posts_with_profiles')
        .select('*');

      if (postsError) {
        console.error('Posts error:', postsError);
        // Fallback: try to get posts without profiles
        const { data: basicPosts, error: basicError } = await supabase
          .from('posts' as any)
          .select('*')
          .eq('is_published', true)
          .order('created_at', { ascending: false });

        if (basicError) {
          console.error('Basic posts error:', basicError);
          setPosts([]);
          return;
        }

        // Get profiles for each post
        const postsWithProfiles: Post[] = [];
        
        for (const post of basicPosts || []) {
          const { data: profileData } = await supabase
            .from('profiles')
            .select('full_name, avatar_url, professional_role, company')
            .eq('id', post.user_id)
            .single();

          postsWithProfiles.push({
            ...post,
            profiles: profileData || {
              full_name: 'DNA Member',
              avatar_url: null,
              professional_role: null,
              company: null
            }
          });
        }

        setPosts(postsWithProfiles);
        return;
      }

      setPosts(postsData || []);
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
