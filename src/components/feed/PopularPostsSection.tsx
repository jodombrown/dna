import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, Loader2 } from 'lucide-react';
import { usePopularPosts } from '@/hooks/usePopularPosts';
import { UniversalFeedItemComponent } from './UniversalFeedItem';
import { UniversalFeedItem } from '@/types/feed';

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

      {popularPosts.map((post) => {
        // Map PopularPost to UniversalFeedItem structure
        const feedItem: UniversalFeedItem = {
          post_id: post.id,
          post_type: (post.post_type || 'post') as any,
          story_type: null,
          author_id: post.author_id,
          author_display_name: post.author_name,
          author_username: post.author_username,
          author_avatar_url: post.author_avatar,
          content: post.content,
          title: null,
          subtitle: null,
          media_url: post.media_url,
          privacy_level: post.privacy_level || 'public',
          linked_entity_type: (post.linked_entity_type as any) || null,
          linked_entity_id: post.linked_entity_id,
          space_id: post.space_id,
          space_title: null,
          event_id: post.event_id,
          event_title: null,
          created_at: post.created_at,
          updated_at: post.created_at,
          like_count: post.like_count,
          comment_count: post.comment_count,
          share_count: post.share_count,
          reshare_count: 0,
          view_count: 0,
          bookmark_count: post.bookmark_count,
          has_liked: post.user_has_liked,
          has_bookmarked: post.user_has_bookmarked,
          has_reshared: false,
          pinned_at: null,
          comments_disabled: false,
          link_url: null,
          link_title: null,
          link_description: null,
          link_metadata: null,
          original_post_id: null,
          original_author_id: null,
          original_author_username: null,
          original_author_full_name: null,
          original_author_avatar_url: null,
          original_author_headline: null,
          original_content: null,
          original_image_url: null,
          original_created_at: null,
          slug: null,
        };

        return (
          <UniversalFeedItemComponent
            key={post.id}
            item={feedItem}
            currentUserId=""
            onUpdate={() => {}}
          />
        );
      })}
    </div>
  );
};