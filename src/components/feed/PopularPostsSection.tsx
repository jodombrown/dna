import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, Loader2 } from 'lucide-react';
import { usePopularPosts } from '@/hooks/usePopularPosts';
import { UniversalFeedItemComponent } from './UniversalFeedItem';

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

      {popularPosts.map((item) => (
        <UniversalFeedItemComponent
          key={item.post_id}
          item={item}
          currentUserId=""
          onUpdate={() => {}}
        />
      ))}
    </div>
  );
};