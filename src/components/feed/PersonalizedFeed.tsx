/**
 * Personalized "For You" Feed Component
 * Shows ML-scored content tailored to the user's interests
 */

import { usePersonalizedFeed } from '@/hooks/usePersonalizedFeed';
import { PostCard } from '@/components/posts/PostCard';
import { Loader2, Sparkles } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

export const PersonalizedFeed = () => {
  const { data: posts, isLoading, error } = usePersonalizedFeed(50);
  const navigate = useNavigate();
  const { user } = useAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <Card className="p-6 text-center">
        <p className="text-muted-foreground">Failed to load personalized feed</p>
      </Card>
    );
  }

  if (!posts || posts.length === 0) {
    return (
      <Card className="p-8 text-center space-y-4">
        <Sparkles className="h-12 w-12 mx-auto text-dna-copper opacity-50" />
        <div>
          <h3 className="text-lg font-semibold mb-2">Your personalized feed is being prepared</h3>
          <p className="text-muted-foreground text-sm max-w-md mx-auto">
            Connect with more members and engage with posts to help us understand your interests
          </p>
        </div>
        <div className="flex gap-3 justify-center pt-2">
          <Button
            onClick={() => navigate('/dna/connect/discover')}
            className="bg-dna-copper hover:bg-dna-copper/90"
          >
            Find Connections
          </Button>
          <Button
            variant="outline"
            onClick={() => navigate('/dna/feed?tab=all')}
          >
            Browse All Posts
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Personalized Posts - using same PostCard as other tabs */}
      {posts.map((post: any) => (
        <PostCard
          key={post.post_id || post.id}
          post={{
            post_id: post.post_id || post.id,
            author_id: post.author_id,
            author_username: post.author_username || 'unknown',
            author_full_name: post.author_full_name || 'Unknown User',
            author_avatar_url: post.author_avatar_url || undefined,
            author_headline: post.author_headline || undefined,
            content: post.content || '',
            post_type: 'update',
            privacy_level: post.privacy_level || 'public',
            image_url: post.media_url || post.image_url || undefined,
            created_at: post.created_at,
            likes_count: post.likes_count || 0,
            comments_count: post.comments_count || 0,
            user_has_liked: post.user_has_liked || false,
            is_connection: false,
          }}
          currentUserId={user?.id || ''}
          onUpdate={() => {}}
        />
      ))}
    </div>
  );
};
