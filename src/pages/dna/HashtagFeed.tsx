import { useParams } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, Hash, TrendingUp } from 'lucide-react';
import { useHashtagPosts, useTrendingHashtags } from '@/hooks/useHashtags';
import { UniversalFeedItem } from '@/components/feed/UniversalFeedItem';
import { useAuth } from '@/contexts/AuthContext';
import { Link } from 'react-router-dom';

export default function HashtagFeed() {
  const { hashtag } = useParams<{ hashtag: string }>();
  const { user } = useAuth();
  const { data: posts, isLoading } = useHashtagPosts(hashtag || '', 50);
  const { data: trendingHashtags } = useTrendingHashtags(10);

  if (!hashtag) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-muted-foreground">No hashtag specified</p>
      </div>
    );
  }

  return (
    <div className="container max-w-6xl mx-auto px-4 py-6 space-y-6">
      {/* Header */}
      <Card className="border-l-4 border-l-dna-copper">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-dna-copper/10 rounded-lg">
              <Hash className="h-6 w-6 text-dna-copper" />
            </div>
            <div>
              <CardTitle className="text-2xl">#{hashtag}</CardTitle>
              <CardDescription>
                {posts ? `${posts.length} post${posts.length !== 1 ? 's' : ''}` : 'Loading...'}
              </CardDescription>
            </div>
          </div>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main content */}
        <div className="lg:col-span-2 space-y-4">
          {isLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-dna-copper" />
            </div>
          ) : !posts || posts.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Hash className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-lg font-semibold mb-2">No posts found</p>
                <p className="text-sm text-muted-foreground">
                  Be the first to post with #{hashtag}!
                </p>
              </CardContent>
            </Card>
          ) : (
            posts.map((post) => (
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
                  linked_entity_type: null,
                  linked_entity_id: null,
                  space_id: null,
                  event_id: null,
                  created_at: post.created_at,
                  like_count: post.like_count,
                  comment_count: post.comment_count,
                  share_count: post.share_count,
                  bookmark_count: post.bookmark_count,
                  user_has_liked: post.user_has_liked,
                  user_has_bookmarked: post.user_has_bookmarked,
                }}
              />
            ))
          )}
        </div>

        {/* Sidebar - Trending hashtags */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <TrendingUp className="h-5 w-5 text-dna-copper" />
                Trending Hashtags
              </CardTitle>
              <CardDescription>Popular topics this week</CardDescription>
            </CardHeader>
            <CardContent>
              {trendingHashtags && trendingHashtags.length > 0 ? (
                <div className="space-y-3">
                  {trendingHashtags.map((trending, index) => (
                    <Link
                      key={trending.hashtag}
                      to={`/dna/hashtag/${trending.hashtag}`}
                      className="block"
                    >
                      <div className="flex items-center justify-between p-3 rounded-lg hover:bg-accent/50 transition-colors">
                        <div className="flex items-center gap-3">
                          <Badge variant="outline" className="text-xs">
                            #{index + 1}
                          </Badge>
                          <div>
                            <p className="font-semibold text-sm">#{trending.hashtag}</p>
                            <p className="text-xs text-muted-foreground">
                              {trending.recent_post_count} post{trending.recent_post_count !== 1 ? 's' : ''}
                            </p>
                          </div>
                        </div>
                        {trending.hashtag.toLowerCase() === hashtag.toLowerCase() && (
                          <Badge className="bg-dna-copper text-white">
                            Current
                          </Badge>
                        )}
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No trending hashtags yet</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
