/**
 * Story Card for Universal Feed
 * 
 * Displays published stories in the feed with title, body preview, and read-more expansion.
 */

import React, { useState } from 'react';
import { UniversalFeedItem } from '@/types/feed';
import { Card } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Heart, MessageCircle, Bookmark, MoreVertical, FileText } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { usePostLikes } from '@/hooks/usePostLikes';
import { usePostBookmarks } from '@/hooks/usePostBookmarks';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { supabase } from '@/integrations/supabase/client';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from '@/hooks/use-toast';

interface StoryCardProps {
  item: UniversalFeedItem;
  currentUserId: string;
  onUpdate: () => void;
}

export const StoryCard: React.FC<StoryCardProps> = ({ item, currentUserId, onUpdate }) => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [isExpanded, setIsExpanded] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const { likeCount, userHasLiked, toggleLike } = usePostLikes(item.post_id, currentUserId);
  const { bookmarkCount, userHasBookmarked, toggleBookmark } = usePostBookmarks(
    item.post_id,
    currentUserId
  );

  const isOwner = item.author_id === currentUserId;
  const bodyPreview = item.content.slice(0, 240);
  const needsExpansion = item.content.length > 240;

  const handleDelete = async () => {
    if (!confirm('Delete this story? This action cannot be undone.')) return;

    setIsDeleting(true);
    try {
      const { error } = await supabase
        .from('posts')
        .update({ is_deleted: true })
        .eq('id', item.post_id);

      if (error) throw error;

      // Invalidate feed queries to remove the post
      queryClient.invalidateQueries({ queryKey: ['universal-feed'] });
      queryClient.invalidateQueries({ queryKey: ['universal-feed-infinite'] });

      toast({ description: 'Story deleted' });
    } catch (error) {
      console.error('Error deleting story:', error);
      toast({ variant: 'destructive', description: 'Could not delete story' });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Card className="p-6 hover:border-primary/20 transition-colors bg-gradient-to-br from-background via-background to-muted/10">
      {/* Header */}
      <div className="flex items-start gap-3 mb-4">
        <Avatar
          className="h-10 w-10 cursor-pointer"
          onClick={() => navigate(`/dna/${item.author_username}`)}
        >
          <AvatarImage src={item.author_avatar_url || ''} />
          <AvatarFallback>{item.author_display_name?.[0] || 'U'}</AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span
              className="font-semibold hover:underline cursor-pointer"
              onClick={() => navigate(`/dna/${item.author_username}`)}
            >
              {item.author_display_name || item.author_username}
            </span>
            <Badge variant="secondary" className="gap-1">
              <FileText className="h-3 w-3" />
              Story
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground">
            {formatDistanceToNow(new Date(item.created_at), { addSuffix: true })}
          </p>
        </div>
        {isOwner && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={handleDelete} disabled={isDeleting} className="text-destructive">
                {isDeleting ? 'Deleting...' : 'Delete Story'}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>

      {/* Story Content */}
      <div className="space-y-4">
        {/* Hero Image */}
        {item.media_url && (
          <img
            src={item.media_url}
            alt={item.title || 'Story image'}
            className="w-full h-64 object-cover rounded-lg cursor-pointer"
            onClick={() => navigate(`/dna/story/${item.post_id}`)}
          />
        )}

        {/* Title */}
        <h3
          className="text-2xl font-bold leading-tight hover:underline cursor-pointer"
          onClick={() => navigate(`/dna/story/${item.post_id}`)}
        >
          {item.title || 'Untitled Story'}
        </h3>


        {/* Subtitle/Summary */}
        {item.summary && (
          <p className="text-lg text-muted-foreground italic">
            {item.summary}
          </p>
        )}

        {/* Body Preview */}
        <div className="prose prose-sm max-w-none">
          <p className={cn('text-muted-foreground', !isExpanded && 'line-clamp-4')}>
            {isExpanded ? item.content : bodyPreview}
            {needsExpansion && !isExpanded && '...'}
          </p>
        </div>

        {/* Read More Button */}
        {needsExpansion && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-primary"
          >
            {isExpanded ? 'Show Less' : 'Read More'}
          </Button>
        )}

        {/* Context Badge */}
        {(item.space_id || item.event_id) && (
          <div className="flex items-center gap-2">
            {item.space_title && (
              <Badge variant="outline" className="gap-1.5">
                Posted in {item.space_title}
              </Badge>
            )}
            {item.event_title && (
              <Badge variant="outline" className="gap-1.5">
                Shared at {item.event_title}
              </Badge>
            )}
          </div>
        )}
      </div>

      {/* Engagement Footer */}
      <div className="flex items-center gap-4 pt-4 mt-4 border-t">
        <Button
          variant="ghost"
          size="sm"
          className="flex items-center gap-2"
          onClick={() => toggleLike()}
        >
          <Heart
            className={cn(
              'h-4 w-4',
              userHasLiked ? 'fill-dna-amber text-dna-amber' : 'text-muted-foreground'
            )}
          />
          <span>{likeCount > 0 ? likeCount : 'Like'}</span>
        </Button>
        <Button variant="ghost" size="sm" className="flex items-center gap-2">
          <MessageCircle className="h-4 w-4" />
          <span>{item.comment_count > 0 ? item.comment_count : 'Comment'}</span>
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="ml-auto"
          onClick={() => toggleBookmark()}
        >
          <Bookmark
            className={cn(
              'h-4 w-4',
              userHasBookmarked ? 'fill-current text-primary' : 'text-muted-foreground'
            )}
          />
        </Button>
      </div>
    </Card>
  );
};
