import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, Loader2 } from 'lucide-react';
import { usePopularPosts } from '@/hooks/usePopularPosts';
import { UniversalFeedItem } from './UniversalFeedItem';

export const PopularPostsSection = () => {
  const { data: popularPosts, isLoading, error } = usePopularPosts(10);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-dna-copper" />
            Trending in the Diaspora
          </CardTitle>
        </CardHeader>
        <CardContent className="flex justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-dna-copper" />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return null; // Silently fail - popular posts are nice to have, not critical
  }

  if (!popularPosts || popularPosts.length === 0) {
    return null; // No popular posts to show
  }

  return (
    <div className="space-y-4">
      <Card className="border-dna-copper/30">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <TrendingUp className="h-5 w-5 text-dna-copper" />
            Trending in the Diaspora
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Popular posts from the community to help you get started
          </p>
        </CardHeader>
      </Card>

      {popularPosts.map((post) => (
        <UniversalFeedItem
          key={post.id}
          item={{
            id: post.id,
            post_type: post.post_type as any,
            author_id: post.author_id,
            author_name: post.author_name,
            author_username: post.author_username,
            author_avatar: post.author_avatar,
            author_headline: post.author_headline,
            content: post.content,
            media_url: post.media_url,
            privacy_level: post.privacy_level as 'public' | 'connections',
            linked_entity_type: post.linked_entity_type,
            linked_entity_id: post.linked_entity_id,
            space_id: post.space_id,
            event_id: post.event_id,
            created_at: post.created_at,
            like_count: post.like_count,
            comment_count: post.comment_count,
            share_count: post.share_count,
            bookmark_count: post.bookmark_count,
            user_has_liked: post.user_has_liked,
            user_has_bookmarked: post.user_has_bookmarked,
          }}
        />
      ))}
    </div>
  );
};
