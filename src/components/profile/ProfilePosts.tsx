import { useQuery } from '@tanstack/react-query';
import { PostCard } from '@/components/posts/PostCard';
import { PostComments } from '@/components/posts/PostComments';
import { PostWithAuthor } from '@/types/posts';
import { supabase } from '@/integrations/supabase/client';
import { useState } from 'react';
import { Newspaper } from 'lucide-react';

interface ProfilePostsProps {
  profileUserId: string;
  currentUserId: string;
}

export function ProfilePosts({ profileUserId, currentUserId }: ProfilePostsProps) {
  const [expandedPostId, setExpandedPostId] = useState<string | null>(null);

  const { data: posts, refetch, isLoading } = useQuery({
    queryKey: ['profile-posts', profileUserId],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('get_feed_posts', {
        p_user_id: currentUserId,
        p_feed_type: 'my_posts',
        p_hashtag: null,
        p_limit: 50,
        p_offset: 0,
      });

      if (error) throw error;
      
      // Filter to only show this profile's posts
      return ((data || []) as PostWithAuthor[]).filter(
        (post) => post.author_id === profileUserId
      );
    },
  });

  const handleCommentClick = (postId: string) => {
    setExpandedPostId(expandedPostId === postId ? null : postId);
  };

  if (isLoading) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        Loading posts...
      </div>
    );
  }

  if (!posts || posts.length === 0) {
    return (
      <div className="text-center py-12">
        <Newspaper className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
        <h3 className="text-lg font-semibold mb-2">No posts yet</h3>
        <p className="text-muted-foreground">
          {profileUserId === currentUserId
            ? "You haven't shared anything yet"
            : "This user hasn't posted anything yet"}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {posts.map((post) => (
        <div key={post.post_id}>
          <PostCard
            post={post}
            currentUserId={currentUserId}
            onUpdate={refetch}
            onCommentClick={() => handleCommentClick(post.post_id)}
            showComments={expandedPostId === post.post_id}
          />
          {expandedPostId === post.post_id && (
            <PostComments postId={post.post_id} currentUserId={currentUserId} />
          )}
        </div>
      ))}
    </div>
  );
}
