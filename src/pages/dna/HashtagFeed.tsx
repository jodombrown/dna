import { useParams, Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Loader2, Hash, TrendingUp, Users, Calendar, ArrowLeft, Share2 } from 'lucide-react';
import { useHashtag } from '@/hooks/useHashtag';
import { useTrendingHashtags } from '@/hooks/useTrendingHashtags';
import { UniversalFeedItemComponent } from '@/components/feed/UniversalFeedItem';
import { UniversalFeedItem } from '@/types/feed';
import { useAuth } from '@/contexts/AuthContext';
import { formatDistanceToNow } from 'date-fns';
import { useState } from 'react';
import { hashtagService } from '@/services/hashtagService';
import { useQuery } from '@tanstack/react-query';

export default function HashtagFeed() {
  const { hashtag: hashtagParam } = useParams<{ hashtag: string }>();
  const { user } = useAuth();
  const [sortMode, setSortMode] = useState<'recent' | 'top'>('recent');

  const {
    hashtag,
    posts,
    isLoading,
    isFollowing,
    toggleFollow,
    isTogglingFollow
  } = useHashtag(hashtagParam);

  const { data: trendingHashtags } = useTrendingHashtags(10);

  // Get top posts when in top mode
  const { data: topPosts } = useQuery({
    queryKey: ['hashtagPosts', hashtagParam, 'top'],
    queryFn: () => hashtagService.getPosts(hashtagParam!, 20, 0, 'top'),
    enabled: !!hashtagParam && sortMode === 'top',
    staleTime: 30000
  });

  const displayPosts = sortMode === 'top' ? topPosts : posts;

  if (!hashtagParam) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-muted-foreground">No hashtag specified</p>
      </div>
    );
  }

  if (isLoading) {
    return <HashtagPageSkeleton />;
  }

  // If hashtag doesn't exist yet in database but has been used
  const displayName = hashtag?.display_name || hashtagParam;

  return (
    <div className="container max-w-6xl mx-auto px-4 py-6 space-y-6">
      {/* Back button */}
      <Button variant="ghost" size="sm" className="mb-2" asChild>
        <Link to="/dna/feed">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Feed
        </Link>
      </Button>

      {/* Header Card */}
      <Card className="border-l-4 border-l-dna-copper">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="h-14 w-14 rounded-full bg-dna-copper/10 flex items-center justify-center">
                <Hash className="h-7 w-7 text-dna-copper" />
              </div>
              <div>
                <CardTitle className="text-2xl flex items-center gap-2">
                  #{displayName}
                  {hashtag?.is_verified && (
                    <Badge variant="outline" className="text-blue-500 border-blue-500">
                      Verified
                    </Badge>
                  )}
                </CardTitle>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant={hashtag?.type === 'personal' ? 'default' : 'secondary'}>
                    {hashtag?.type === 'personal' ? 'Personal' : 'Community'}
                  </Badge>
                </div>
              </div>
            </div>

            <div className="flex gap-2">
              {user && (
                <Button
                  variant={isFollowing ? 'outline' : 'default'}
                  onClick={toggleFollow}
                  disabled={isTogglingFollow}
                  className={isFollowing ? '' : 'bg-dna-copper hover:bg-dna-copper/90'}
                >
                  {isTogglingFollow ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : isFollowing ? (
                    'Following'
                  ) : (
                    'Follow'
                  )}
                </Button>
              )}
              <Button variant="outline" size="icon">
                <Share2 className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Owner info (for personal hashtags) */}
          {hashtag?.type === 'personal' && hashtag?.owner_id && (
            <div className="flex items-center gap-2 mt-4 p-3 bg-muted/50 rounded-lg">
              <span className="text-sm text-muted-foreground">Owned by</span>
              <Link
                to={`/dna/${hashtag.owner_username || hashtag.owner_id}`}
                className="flex items-center gap-2 hover:underline"
              >
                <Avatar className="h-6 w-6">
                  <AvatarImage src={hashtag.owner_avatar || undefined} />
                  <AvatarFallback>{hashtag.owner_name?.charAt(0)}</AvatarFallback>
                </Avatar>
                <span className="font-medium">{hashtag.owner_name}</span>
                {hashtag.owner_username && (
                  <span className="text-muted-foreground">@{hashtag.owner_username}</span>
                )}
              </Link>
            </div>
          )}

          {/* Description */}
          {hashtag?.description && (
            <p className="text-muted-foreground mt-4">{hashtag.description}</p>
          )}

          {/* Stats */}
          <div className="flex items-center gap-6 text-sm text-muted-foreground mt-4">
            <div className="flex items-center gap-1">
              <TrendingUp className="h-4 w-4" />
              <span>{(hashtag?.usage_count || posts?.length || 0).toLocaleString()} posts</span>
            </div>
            <div className="flex items-center gap-1">
              <Users className="h-4 w-4" />
              <span>{(hashtag?.follower_count || 0).toLocaleString()} followers</span>
            </div>
            {hashtag?.created_at && (
              <div className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                <span>Created {formatDistanceToNow(new Date(hashtag.created_at), { addSuffix: true })}</span>
              </div>
            )}
          </div>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main content */}
        <div className="lg:col-span-2 space-y-4">
          {/* Sort Tabs */}
          <Tabs value={sortMode} onValueChange={(v) => setSortMode(v as 'recent' | 'top')}>
            <TabsList>
              <TabsTrigger value="recent">Recent</TabsTrigger>
              <TabsTrigger value="top">Top</TabsTrigger>
            </TabsList>
          </Tabs>

          {/* Posts */}
          {!displayPosts || displayPosts.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Hash className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-lg font-semibold mb-2">No posts found</p>
                <p className="text-sm text-muted-foreground">
                  Be the first to post with #{displayName}!
                </p>
              </CardContent>
            </Card>
          ) : (
            displayPosts.map((post) => {
              // Map HashtagPost to UniversalFeedItem structure
              const feedItem: UniversalFeedItem = {
                post_id: post.post_id,
                post_type: 'post',
                author_id: post.author_id,
                author_display_name: post.author_name,
                author_username: post.author_username,
                author_avatar_url: post.author_avatar,
                content: post.content,
                title: null,
                subtitle: null,
                media_url: post.media_urls?.[0] || null,
                privacy_level: 'public',
                linked_entity_type: null,
                linked_entity_id: null,
                space_id: null,
                space_title: null,
                event_id: null,
                event_title: null,
                created_at: post.created_at,
                updated_at: post.created_at,
                like_count: post.like_count,
                comment_count: post.comment_count,
                share_count: 0,
                reshare_count: post.reshare_count,
                view_count: 0,
                bookmark_count: 0,
                has_liked: false,
                has_bookmarked: false,
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
              };

              return (
                <UniversalFeedItemComponent
                  key={post.post_id}
                  item={feedItem}
                  currentUserId={user?.id || ''}
                  onUpdate={() => {}}
                />
              );
            })
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
                  {trendingHashtags.map((trending, index) => {
                    const trendingName = (trending as any).tag || (trending as any).name || (trending as any).hashtag;
                    const recentCount = (trending as any).recent_usage_count || (trending as any).recent_uses || (trending as any).recent_post_count || 0;

                    return (
                      <Link
                        key={trendingName}
                        to={`/dna/hashtag/${trendingName}`}
                        className="block"
                      >
                        <div className="flex items-center justify-between p-3 rounded-lg hover:bg-accent/50 transition-colors">
                          <div className="flex items-center gap-3">
                            <Badge variant="outline" className="text-xs">
                              #{index + 1}
                            </Badge>
                            <div>
                              <p className="font-semibold text-sm">#{trendingName}</p>
                              <p className="text-xs text-muted-foreground">
                                {recentCount} post{recentCount !== 1 ? 's' : ''}
                              </p>
                            </div>
                          </div>
                          {trendingName?.toLowerCase() === hashtagParam?.toLowerCase() && (
                            <Badge className="bg-dna-copper text-white">
                              Current
                            </Badge>
                          )}
                        </div>
                      </Link>
                    );
                  })}
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

function HashtagPageSkeleton() {
  return (
    <div className="container max-w-6xl mx-auto px-4 py-6 space-y-6">
      <Skeleton className="h-8 w-32" />
      <Card className="border-l-4 border-l-dna-copper">
        <CardHeader>
          <div className="flex items-start gap-3">
            <Skeleton className="h-14 w-14 rounded-full" />
            <div className="space-y-2">
              <Skeleton className="h-8 w-48" />
              <Skeleton className="h-5 w-24" />
            </div>
          </div>
          <div className="flex gap-4 mt-4">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-4 w-32" />
          </div>
        </CardHeader>
      </Card>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <Skeleton className="h-10 w-48" />
          <Skeleton className="h-40 w-full" />
          <Skeleton className="h-40 w-full" />
        </div>
        <div>
          <Skeleton className="h-64 w-full" />
        </div>
      </div>
    </div>
  );
}
