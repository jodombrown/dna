/**
 * Personalized "For You" Feed Component
 * Shows ML-scored content tailored to the user's interests
 */

import { usePersonalizedFeed } from '@/hooks/usePersonalizedFeed';
import { PostCard } from './PostCard';
import { Loader2, Sparkles } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

export const PersonalizedFeed = () => {
  const { data: posts, isLoading, error } = usePersonalizedFeed(50);
  const navigate = useNavigate();

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
      {/* Personalized Posts */}
      {posts.map((post) => (
        <PostCard
          key={post.id}
          post={{
            id: post.id,
            author_id: post.author_id,
            content: post.content,
            created_at: post.created_at,
            updated_at: post.updated_at,
            post_type: post.post_type,
            visibility: post.privacy_level,
            media_urls: post.image_url ? [post.image_url] : null,
            title: post.title,
            subtitle: post.subtitle,
          }}
        />
      ))}
    </div>
  );
};
