/**
 * DNA | FEED v1.1 - Reshare Card Component
 * 
 * Displays a reshared post with optional commentary from the resharer.
 */

import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { UniversalFeedItem } from '@/types/feed';
import { Heart, MessageCircle, Share2, Bookmark, MoreHorizontal } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { useBookmarkPost } from '@/hooks/useBookmarkPost';
import { ReshareDialog } from '../ReshareDialog';
import { createResharePost } from '@/lib/feedWriter';
import { toast } from 'sonner';
import { useFeedTracking } from '@/hooks/useFeedTracking';

interface ReshareCardProps {
  item: UniversalFeedItem;
  currentUserId: string;
  onUpdate: () => void;
  surface?: 'home' | 'profile' | 'space' | 'event' | 'mobile';
}

export const ReshareCard: React.FC<ReshareCardProps> = ({
  item,
  currentUserId,
  onUpdate,
  surface = 'home',
}) => {
  const [showReshareDialog, setShowReshareDialog] = useState(false);
  const { bookmarkPost, unbookmarkPost } = useBookmarkPost();
  const { trackFeedEvent } = useFeedTracking();

  const handleBookmark = () => {
    if (item.has_bookmarked) {
      unbookmarkPost({ postId: item.post_id, userId: currentUserId });
    } else {
      bookmarkPost({ postId: item.post_id, userId: currentUserId });
    }
    
    trackFeedEvent({
      postId: item.post_id,
      postType: item.post_type,
      action: item.has_bookmarked ? 'unbookmark' : 'bookmark',
      surface,
    });
  };

  const handleReshare = async (commentary: string) => {
    try {
      await createResharePost({
        originalPostId: item.post_id,
        authorId: currentUserId,
        commentary,
      });
      toast.success('Post reshared!');
      onUpdate();
      
      trackFeedEvent({
        postId: item.post_id,
        postType: item.post_type,
        action: 'reshare',
        surface,
      });
    } catch (error) {
      console.error('Reshare error:', error);
      toast.error('Failed to reshare post');
    }
  };

  return (
    <>
      <Card className="p-6">
        {/* Resharer info */}
        <div className="flex items-start gap-3 mb-4">
          <Avatar className="h-10 w-10">
            <AvatarImage src={item.author_avatar_url || ''} />
            <AvatarFallback>{item.author_display_name?.[0] || 'U'}</AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <p className="font-semibold">{item.author_display_name}</p>
            <p className="text-sm text-muted-foreground">
              Shared • {formatDistanceToNow(new Date(item.created_at), { addSuffix: true })}
            </p>
          </div>
          <Button variant="ghost" size="icon">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </div>

        {/* Optional reshare commentary */}
        {item.content && (
          <p className="mb-4 text-foreground">{item.content}</p>
        )}

        {/* Original post preview - simplified */}
        <Card className="p-4 bg-muted/30 border-l-4 border-l-primary">
          <p className="text-sm text-muted-foreground mb-2">Shared post</p>
          <p className="text-sm">
            {item.linked_entity_id ? 'Original post content...' : 'Content unavailable'}
          </p>
        </Card>

        {/* Engagement bar */}
        <div className="flex items-center gap-4 mt-4 pt-4 border-t">
          <Button variant="ghost" size="sm" className="gap-2">
            <Heart className={`h-4 w-4 ${item.has_liked ? 'fill-current text-red-500' : ''}`} />
            <span>{item.like_count}</span>
          </Button>
          <Button variant="ghost" size="sm" className="gap-2">
            <MessageCircle className="h-4 w-4" />
            <span>{item.comment_count}</span>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="gap-2"
            onClick={() => setShowReshareDialog(true)}
          >
            <Share2 className="h-4 w-4" />
            <span>{item.share_count}</span>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleBookmark}
          >
            <Bookmark className={`h-4 w-4 ${item.has_bookmarked ? 'fill-current' : ''}`} />
          </Button>
        </div>
      </Card>

      <ReshareDialog
        isOpen={showReshareDialog}
        onClose={() => setShowReshareDialog(false)}
        originalPost={item}
        onReshare={handleReshare}
      />
    </>
  );
};
