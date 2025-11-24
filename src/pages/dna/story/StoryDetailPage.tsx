/**
 * DNA | CONVEY - Story Detail Page
 * 
 * Full-page view for reading stories with comments and engagement
 */

import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { UniversalFeedItem } from '@/types/feed';
import { Card } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowLeft, Heart, MessageCircle, Bookmark, Share2, FileText } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { usePostLikes } from '@/hooks/usePostLikes';
import { usePostBookmarks } from '@/hooks/usePostBookmarks';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';
import { toast } from '@/hooks/use-toast';

export default function StoryDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const { data: story, isLoading, error } = useQuery<UniversalFeedItem>({
    queryKey: ['story-detail', id],
    enabled: !!id,
    queryFn: async () => {
      const { data, error } = await supabase.rpc('get_universal_feed', {
        p_viewer_id: user?.id || '',
        p_tab: 'all',
        p_author_id: null,
        p_space_id: null,
        p_event_id: null,
        p_limit: 1,
        p_offset: 0,
        p_ranking_mode: 'latest',
      });

      if (error) throw error;

      // Find the story by post_id
      const storyItem = (data as UniversalFeedItem[]).find(item => item.post_id === id);
      if (!storyItem) throw new Error('Story not found');
      if (storyItem.post_type !== 'story') throw new Error('Not a story');

      return storyItem;
    },
  });

  const { likeCount, userHasLiked, toggleLike } = usePostLikes(
    story?.post_id || '',
    user?.id || ''
  );

  const { bookmarkCount, userHasBookmarked, toggleBookmark } = usePostBookmarks(
    story?.post_id || '',
    user?.id || ''
  );

  const handleCopyLink = async () => {
    const url = window.location.href;
    await navigator.clipboard.writeText(url);
    toast({ description: 'Story link copied to clipboard' });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Skeleton className="h-8 w-24 mb-6" />
          <Card className="p-8">
            <Skeleton className="h-12 w-3/4 mb-4" />
            <Skeleton className="h-4 w-full mb-2" />
            <Skeleton className="h-4 w-full mb-2" />
            <Skeleton className="h-4 w-2/3" />
          </Card>
        </div>
      </div>
    );
  }

  if (error || !story) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="p-8 text-center max-w-md">
          <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">Story Not Available</h2>
          <p className="text-muted-foreground mb-6">
            This story may have been removed or you don't have access to it.
          </p>
          <Button onClick={() => navigate('/dna/feed')}>
            Back to Feed
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate(-1)}
          className="mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>

        {/* Story Content */}
        <Card className="p-8 sm:p-12">
          {/* Story Badge */}
          <Badge variant="secondary" className="gap-1 mb-4">
            <FileText className="h-3 w-3" />
            Story
          </Badge>

          {/* Hero Image */}
          {story.media_url && (
            <img
              src={story.media_url}
              alt={story.title || 'Story image'}
              className="w-full h-64 sm:h-80 object-cover rounded-lg mb-6"
            />
          )}

          {/* Title */}
          <h1 className="text-4xl font-bold mb-4 leading-tight">
            {story.title || 'Untitled Story'}
          </h1>

          {/* Subtitle */}
          {story.summary && (
            <p className="text-xl text-muted-foreground mb-6">
              {story.summary}
            </p>
          )}

          {/* Author & Meta */}
          <div className="flex items-center gap-3 mb-8 pb-8 border-b">
            <Avatar
              className="h-12 w-12 cursor-pointer"
              onClick={() => navigate(`/dna/${story.author_username}`)}
            >
              <AvatarImage src={story.author_avatar_url || ''} />
              <AvatarFallback>
                {story.author_display_name?.[0] || 'U'}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <p
                className="font-semibold hover:underline cursor-pointer"
                onClick={() => navigate(`/dna/${story.author_username}`)}
              >
                {story.author_display_name || story.author_username}
              </p>
              <p className="text-sm text-muted-foreground">
                {formatDistanceToNow(new Date(story.created_at), {
                  addSuffix: true,
                })}
              </p>
            </div>
          </div>

          {/* Context Badge */}
          {(story.space_id || story.event_id) && (
            <div className="mb-6">
              {story.space_title && (
                <Badge variant="outline" className="gap-1.5">
                  Posted in {story.space_title}
                </Badge>
              )}
              {story.event_title && (
                <Badge variant="outline" className="gap-1.5">
                  Shared at {story.event_title}
                </Badge>
              )}
            </div>
          )}

          {/* Story Body */}
          <div className="prose prose-lg max-w-none mb-8">
            <div className="whitespace-pre-wrap text-foreground leading-relaxed">
              {story.content}
            </div>
          </div>

          {/* Engagement Footer */}
          <div className="flex items-center gap-4 pt-6 border-t">
            <Button
              variant="ghost"
              size="sm"
              className="flex items-center gap-2"
              onClick={() => toggleLike()}
            >
              <Heart
                className={cn(
                  'h-5 w-5',
                  userHasLiked
                    ? 'fill-dna-amber text-dna-amber'
                    : 'text-muted-foreground'
                )}
              />
              <span>{likeCount > 0 ? likeCount : 'Like'}</span>
            </Button>

            <Button variant="ghost" size="sm" className="flex items-center gap-2">
              <MessageCircle className="h-5 w-5" />
              <span>{story.comment_count > 0 ? story.comment_count : 'Comment'}</span>
            </Button>

            <Button
              variant="ghost"
              size="sm"
              className="ml-auto"
              onClick={() => toggleBookmark()}
            >
              <Bookmark
                className={cn(
                  'h-5 w-5',
                  userHasBookmarked
                    ? 'fill-current text-primary'
                    : 'text-muted-foreground'
                )}
              />
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={handleCopyLink}
            >
              <Share2 className="h-5 w-5" />
            </Button>
          </div>
        </Card>

        {/* Comments Section (Future) */}
        <Card className="p-6 mt-6">
          <h3 className="text-lg font-semibold mb-4">Comments</h3>
          <p className="text-muted-foreground text-sm text-center py-8">
            Comments coming soon
          </p>
        </Card>
      </div>
    </div>
  );
}
