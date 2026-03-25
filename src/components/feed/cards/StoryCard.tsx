/**
 * Story Card for Universal Feed
 * 
 * Design System v1.0 Implementation:
 * - 6px Deep Teal bevel (#0D9488)
 * - Displays published stories with title, body preview
 * - Includes full engagement features
 */

import React, { useState } from 'react';
import { UniversalFeedItem } from '@/types/feed';
import { FeedCardBase } from './FeedCardBase';
import { linkifyContent } from '@/utils/linkifyContent';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Heart, MessageCircle, Bookmark, FileText, BookOpen } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { usePostLikes } from '@/hooks/usePostLikes';
import { usePostBookmarks } from '@/hooks/usePostBookmarks';
import { Badge } from '@/components/ui/badge';
import { LinkPreviewCard } from '@/components/feed/LinkPreviewCard';
import { ThreadedComments } from '@/components/posts/ThreadedComments';
import { PostMenuOwn } from '@/components/posts/PostMenuOwn';
import { PostMenuOthers } from '@/components/posts/PostMenuOthers';

interface StoryCardProps {
  item: UniversalFeedItem;
  currentUserId: string;
  onUpdate: () => void;
  showComments?: boolean;
  onCommentClick?: () => void;
}

export const StoryCard: React.FC<StoryCardProps> = ({ 
  item, 
  currentUserId, 
  onUpdate,
  showComments = false,
  onCommentClick,
}) => {
  const navigate = useNavigate();
  const [isExpanded, setIsExpanded] = useState(false);
  const [localShowComments, setLocalShowComments] = useState(showComments);

  const { likeCount, userHasLiked, toggleLike } = usePostLikes(item.post_id, currentUserId);
  const { bookmarkCount, userHasBookmarked, toggleBookmark } = usePostBookmarks(
    item.post_id,
    currentUserId
  );

  const isOwner = item.author_id === currentUserId;
  const bodyPreview = item.content.slice(0, 240);
  const needsExpansion = item.content.length > 240;

  const handleCommentClick = () => {
    if (onCommentClick) {
      onCommentClick();
    } else {
      setLocalShowComments(!localShowComments);
    }
  };

  const commentsVisible = showComments || localShowComments;

  return (
    <FeedCardBase bevelType="story">
      {/* Header */}
      <div className="flex items-start gap-3 mb-4">
        <Avatar
          className="h-10 w-10 cursor-pointer flex-shrink-0"
          onClick={() => navigate(`/dna/${item.author_username}`)}
        >
          <AvatarImage src={item.author_avatar_url || ''} />
          <AvatarFallback>{item.author_display_name?.[0] || 'U'}</AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span
              className="font-semibold text-sm hover:underline cursor-pointer"
              onClick={() => navigate(`/dna/${item.author_username}`)}
            >
              {item.author_display_name || item.author_username}
            </span>
            <Badge className="gap-1 bg-teal-500/10 text-teal-600 border-teal-200">
              <FileText className="h-3 w-3" />
              Story
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground">
            {formatDistanceToNow(new Date(item.created_at), { addSuffix: true })}
          </p>
        </div>
        
        {/* Post Menu - Own or Others */}
        {isOwner ? (
          <PostMenuOwn
            postId={item.post_id}
            authorId={item.author_id}
            currentUserId={currentUserId}
            content={item.content}
            onUpdate={onUpdate}
          />
        ) : (
          <PostMenuOthers
            postId={item.post_id}
            authorId={item.author_id}
            authorName={item.author_display_name || item.author_username || 'User'}
            currentUserId={currentUserId}
            onUpdate={onUpdate}
          />
        )}
      </div>

      {/* Story Content */}
      <div className="space-y-3">
        {/* Title - navigates to full story view */}
        <h3 
          className="text-lg md:text-xl font-semibold font-serif leading-tight cursor-pointer hover:text-teal-600 transition-colors"
          onClick={() => navigate(`/dna/story/${item.slug || item.post_id}`)}
        >
          {item.title || 'Featured Story'}
        </h3>

        {/* Subtitle */}
        {item.subtitle && (
          <p className="text-sm md:text-base text-muted-foreground leading-relaxed">
            {item.subtitle}
          </p>
        )}

        {/* Hero Image - navigates to full story view */}
        {item.media_url && (
          <div 
            className="w-full h-44 sm:h-48 rounded-lg overflow-hidden cursor-pointer"
            onClick={() => navigate(`/dna/story/${item.slug || item.post_id}`)}
          >
            <img
              src={item.media_url}
              alt={item.title || 'Story'}
              className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
            />
          </div>
        )}

        {/* Gallery Preview */}
        {item.gallery_urls && item.gallery_urls.length > 0 && (
          <div
            className="grid grid-cols-3 gap-1 rounded-lg overflow-hidden cursor-pointer"
            onClick={() => navigate(`/dna/story/${item.slug || item.post_id}`)}
          >
            {item.gallery_urls.slice(0, 3).map((url, idx) => (
              <div key={idx} className="relative aspect-square overflow-hidden bg-muted/30">
                <img
                  src={url}
                  alt={`Gallery ${idx + 1}`}
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                  loading="lazy"
                />
                {idx === 2 && item.gallery_urls && item.gallery_urls.length > 3 && (
                  <div className="absolute inset-0 bg-foreground/50 flex items-center justify-center">
                    <span className="text-background font-semibold text-lg">
                      +{item.gallery_urls.length - 3}
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Link Preview */}
        {item.link_url && (
          <LinkPreviewCard
            data={{
              url: item.link_url,
              title: item.link_title || undefined,
              description: item.link_description || undefined,
              provider_name: item.link_metadata?.provider_name,
              thumbnail_url: item.link_metadata?.thumbnail_url,
              type: item.link_metadata?.embed_type,
              is_video: item.link_metadata?.is_video,
            }}
            showRemoveButton={false}
            size="full"
          />
        )}

        {/* Body Preview */}
        <div className="prose prose-sm max-w-none">
          {isExpanded ? (
            <div className="text-sm md:text-base text-muted-foreground space-y-3">
              {item.content.split('\n\n').map((paragraph, idx) => (
                <p key={idx} className="whitespace-pre-line leading-relaxed">
                  {linkifyContent(paragraph)}
                </p>
              ))}
            </div>
          ) : (
            <p className="text-sm md:text-base text-muted-foreground line-clamp-4 whitespace-pre-line leading-relaxed">
              {linkifyContent(bodyPreview)}
              {needsExpansion && '...'}
            </p>
          )}
        </div>

        {/* Read Full Story Button */}
        {needsExpansion && !isExpanded && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(true)}
            className="text-teal-600"
          >
            Read Full Story
          </Button>
        )}
        {isExpanded && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(false)}
            className="text-teal-600"
          >
            Show Less
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
      <div className="flex items-center gap-3 md:gap-4 pt-3 mt-4 border-t">
        <Button
          variant="ghost"
          size="sm"
          className="flex items-center gap-2 text-xs sm:text-sm"
          onClick={() => toggleLike()}
        >
          <BookOpen
            className={cn(
              'h-4 w-4',
              userHasLiked ? 'fill-teal-500 text-teal-500' : 'text-muted-foreground'
            )}
          />
          <span className="hidden xs:inline">{likeCount > 0 ? likeCount : 'Appreciate'}</span>
          <span className="xs:hidden">{likeCount > 0 ? likeCount : ''}</span>
        </Button>
        <Button 
          variant="ghost" 
          size="sm" 
          className="flex items-center gap-2 text-xs sm:text-sm"
          onClick={handleCommentClick}
        >
          <MessageCircle className={cn('h-4 w-4', commentsVisible && 'text-teal-600')} />
          <span className="hidden xs:inline">{item.comment_count > 0 ? item.comment_count : 'Comment'}</span>
          <span className="xs:hidden">{item.comment_count > 0 ? item.comment_count : ''}</span>
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
              userHasBookmarked ? 'fill-current text-teal-600' : 'text-muted-foreground'
            )}
          />
        </Button>
      </div>

      {/* Threaded Comments Section */}
      {commentsVisible && (
        <ThreadedComments postId={item.post_id} currentUserId={currentUserId} />
      )}
    </FeedCardBase>
  );
};
