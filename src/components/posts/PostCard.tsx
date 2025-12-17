import { useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { PostWithAuthor } from '@/types/posts';
import { MessageCircle, Globe, Users, Repeat2, Heart, Bookmark } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { LinkPreviewCard } from '@/components/feed/LinkPreviewCard';
import { ReactionPicker } from './ReactionPicker';
import { ThreadedComments } from './ThreadedComments';
import { ReactionSummary } from './ReactionSummary';
import { RepostDialog } from './RepostDialog';
import { SharedPostCard } from './SharedPostCard';
import { ShareDialog } from './ShareDialog';
import { ReshareDialog } from '@/components/feed/dialogs/ReshareDialog';
import { PostMenuOwn } from './PostMenuOwn';
import { PostMenuOthers } from './PostMenuOthers';
import { usePostReactions } from '@/hooks/usePostReactions';
import { usePostBookmark } from '@/hooks/usePostBookmark';
import { usePostRepost } from '@/hooks/usePostRepost';
import { usePostShares } from '@/hooks/usePostShares';
import { ReactionEmoji, getEmojiLabel } from '@/types/reactions';
import { useAuth } from '@/contexts/AuthContext';
import { useProfile } from '@/hooks/useProfile';
import { usePostViewTracker } from '@/hooks/usePostViewTracker';
import { PostAnalytics } from './PostAnalytics';
import { feedAnalytics } from '@/lib/feedAnalytics';
import { MediaLightbox } from '@/components/feed/MediaLightbox';

interface PostCardProps {
  post: PostWithAuthor;
  currentUserId: string;
  onUpdate?: () => void;
  onCommentClick?: () => void;
  showComments?: boolean;
  feedItem?: any; // UniversalFeedItem for reshare support
  isReshare?: boolean;
}

export function PostCard({
  post,
  currentUserId,
  onUpdate,
  onCommentClick,
  showComments = false,
  feedItem,
  isReshare = false,
}: PostCardProps) {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const { data: profile } = useProfile();
  
  const [showRepostDialog, setShowRepostDialog] = useState(false);
  const [showShareDialog, setShowShareDialog] = useState(false);
  const [showReshareDialog, setShowReshareDialog] = useState(false);
  const [showMediaLightbox, setShowMediaLightbox] = useState(false);
  
  // Post reactions (emoji reactions)
  const {
    reactions,
    totalReactions,
    currentReaction,
    addReaction,
    removeReaction,
    isLoading: isReacting,
  } = usePostReactions(post.post_id, currentUserId);

  // Post bookmark
  const {
    isBookmarked,
    toggleBookmark,
    isLoading: isBookmarking,
  } = usePostBookmark(post.post_id, currentUserId);

  const { repost, isReposting } = usePostRepost();

  // Post shares
  const {
    shareCount,
    userHasShared,
    sharePost,
    isSharing,
  } = usePostShares(post.post_id, currentUserId);

  // Automatic view tracking
  const viewTrackerRef = usePostViewTracker(post.post_id);

  const isOwnPost = post.author_id === currentUserId;

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const timeAgo = formatDistanceToNow(new Date(post.created_at), { addSuffix: true });

  const getPostTypeDisplay = () => {
    const types = {
      update: { label: 'Update', icon: '📝', color: 'text-blue-600' },
      article: { label: 'Article', icon: '📄', color: 'text-purple-600' },
      question: { label: 'Question', icon: '❓', color: 'text-orange-600' },
      celebration: { label: 'Celebration', icon: '🎉', color: 'text-pink-600' },
    };
    return types[post.post_type] || types.update;
  };

  const postTypeDisplay = getPostTypeDisplay();

  const handleReactionSelect = async (reaction: ReactionEmoji) => {
    const userHasThisReaction = reactions.find((r) =>
      r.emoji === reaction && r.users.some((u) => u.user_id === currentUserId)
    );
    
    if (userHasThisReaction) {
      await removeReaction(reaction);
    } else {
      // Remove any existing reaction first
      if (currentReaction && currentReaction !== reaction) {
        await removeReaction(currentReaction);
      }
      await addReaction(reaction);
    }
  };

  const handleRepost = async (commentary?: string) => {
    if (!currentUserId) return;
    
    repost({
      postId: post.post_id,
      userId: currentUserId,
      commentary,
    });
  };

  const handleShare = async () => {
    const shareUrl = `${window.location.origin}/post/${post.post_id}`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Post by ${post.author_full_name}`,
          text: post.content.substring(0, 100) + '...',
          url: shareUrl,
        });
      } catch (error) {
        // User cancelled share
        console.log('Share cancelled');
      }
    } else {
      // Fallback: copy to clipboard
      await navigator.clipboard.writeText(shareUrl);
      toast({
        title: 'Link copied!',
        description: 'Post link copied to clipboard',
      });
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this post?')) return;

    try {
      const { error } = await supabase
        .from('posts')
        .update({ is_deleted: true })
        .eq('id', post.post_id);

      if (error) throw error;

      toast({
        title: 'Post deleted',
        description: 'Your post has been deleted',
      });

      onUpdate?.();
    } catch (error) {
      console.error('Error deleting post:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete post',
        variant: 'destructive',
      });
    }
  };

  const isRepost = !!post.original_post_id;

  return (
    <Card ref={viewTrackerRef} className="p-6 border-2 border-dna-emerald/40 rounded-xl shadow-[0_2px_12px_-2px_hsl(var(--dna-emerald)/0.15)]">
      {/* Repost indicator */}
      {isRepost && (
        <div className="flex items-center gap-2 mb-4 text-sm text-muted-foreground">
          <Repeat2 className="h-4 w-4" />
          <span>
            <span className="font-medium text-foreground">{post.author_full_name}</span> shared this
          </span>
        </div>
      )}

      {/* Header */}
      <div className="flex items-start gap-3 mb-4">
        <Avatar
          className="h-12 w-12 cursor-pointer"
          onClick={() => navigate(`/dna/${post.author_username}`)}
        >
          <AvatarImage src={post.author_avatar_url} alt={post.author_full_name} />
          <AvatarFallback className="bg-[hsl(151,75%,50%)] text-white">
            {getInitials(post.author_full_name)}
          </AvatarFallback>
        </Avatar>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3
              className="font-semibold cursor-pointer hover:text-[hsl(151,75%,50%)] transition-colors"
              onClick={() => navigate(`/dna/${post.author_username}`)}
            >
              {post.author_full_name}
            </h3>
            {post.is_connection && (
              <Badge variant="outline" className="text-xs">
                <Users className="h-3 w-3 mr-1" />
                Connection
              </Badge>
            )}
          </div>
          
          {post.author_headline && (
            <p className="text-sm text-muted-foreground line-clamp-1">
              {post.author_headline}
            </p>
          )}

          <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
            <span>{timeAgo}</span>
            <span>•</span>
            <span className={cn('flex items-center gap-1', postTypeDisplay.color)}>
              <span>{postTypeDisplay.icon}</span>
              <span>{postTypeDisplay.label}</span>
            </span>
            <span>•</span>
            {post.privacy_level === 'public' ? (
              <Globe className="h-3 w-3" />
            ) : (
              <Users className="h-3 w-3" />
            )}
          </div>
          
          {/* Analytics - only show on own posts */}
          {isOwnPost && (
            <PostAnalytics postId={post.post_id} className="mt-1" showEngagement />
          )}
        </div>

        {isOwnPost ? (
          <PostMenuOwn
            postId={post.post_id}
            authorId={post.author_id}
            currentUserId={currentUserId}
            content={post.content}
            isPinned={!!post.pinned_at}
            commentsDisabled={!!post.comments_disabled}
            onUpdate={onUpdate}
          />
        ) : (
          <PostMenuOthers
            postId={post.post_id}
            authorId={post.author_id}
            authorName={post.author_full_name}
            currentUserId={currentUserId}
            onUpdate={onUpdate}
          />
        )}
      </div>

      {/* Share Commentary (if this is a repost with commentary) */}
      {isRepost && post.share_commentary && (
        <div className="mb-4">
          <p className="whitespace-pre-wrap break-words">{post.share_commentary}</p>
        </div>
      )}

      {/* Original Post Content (if repost) */}
      {isRepost ? (
        <SharedPostCard post={post} />
      ) : (
        <>
          {/* Content */}
          <div className="mb-4">
            <p className="whitespace-pre-wrap break-words">{post.content}</p>
          </div>

          {/* Media Display - Image or Video - Clickable to open lightbox */}
          {post.image_url && (
            <div 
              className="mb-4 rounded-lg overflow-hidden border cursor-pointer hover:opacity-95 transition-opacity"
              onClick={() => setShowMediaLightbox(true)}
            >
              {/* Check if it's a video based on file extension */}
              {post.image_url.match(/\.(mp4|webm|mov|quicktime)$/i) ? (
                <video
                  src={post.image_url}
                  className="w-full h-auto max-h-[32rem] object-cover"
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowMediaLightbox(true);
                  }}
                >
                  Your browser does not support the video tag.
                </video>
              ) : (
                <img
                  src={post.image_url}
                  alt="Post media"
                  className="w-full h-auto object-cover max-h-[32rem]"
                />
              )}
            </div>
          )}

          {/* Link/Video Preview - Uses LinkPreviewCard which only shows play button for videos */}
          {post.link_url && (
            <div className="mb-4">
              <LinkPreviewCard
                data={{
                  url: post.link_url,
                  title: post.link_title,
                  description: post.link_description,
                  thumbnail_url: post.link_metadata?.thumbnail_url,
                  provider_name: post.link_metadata?.provider_name,
                  type: post.link_metadata?.embed_type,
                  is_video: post.link_metadata?.is_video,
                }}
                showRemoveButton={false}
                size="full"
              />
            </div>
          )}
        </>
      )}

      {/* Stats - LinkedIn-inspired engagement summary */}
      {(totalReactions > 0 || post.comments_count > 0 || shareCount > 0) && (
        <div className="flex items-center justify-between py-2 text-sm text-muted-foreground">
          {/* Reactions summary - clickable to show who reacted */}
          <div className="flex items-center gap-1">
            {totalReactions > 0 && (
              <ReactionSummary reactions={reactions} totalCount={totalReactions} />
            )}
          </div>
          
          {/* Comments and shares count */}
          <div className="flex items-center gap-3">
            {post.comments_count > 0 && (
              <button 
                onClick={onCommentClick}
                className="hover:text-foreground hover:underline transition-colors"
              >
                {post.comments_count} {post.comments_count === 1 ? 'comment' : 'comments'}
              </button>
            )}
            {shareCount > 0 && (
              <span>
                {shareCount} {shareCount === 1 ? 'repost' : 'reposts'}
              </span>
            )}
          </div>
        </div>
      )}

      {/* Actions - LinkedIn-inspired action bar */}
      <div className="flex items-center justify-between gap-1 pt-3 border-t">
        {/* Emoji Reaction Picker */}
        <ReactionPicker onReactionSelect={handleReactionSelect}>
          <Button
            variant="ghost"
            size="sm"
            disabled={isReacting}
            className={cn(
              'flex-1 gap-1.5 h-10',
              currentReaction && 'text-primary'
            )}
          >
            {currentReaction ? (
              <span className="text-lg">{currentReaction}</span>
            ) : (
              <Heart className="h-5 w-5" />
            )}
            <span className="hidden sm:inline text-sm font-medium">
              {currentReaction ? getEmojiLabel(currentReaction) : 'Like'}
            </span>
          </Button>
        </ReactionPicker>

        {/* Comment Button */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            if (onCommentClick) {
              onCommentClick();
            }
            feedAnalytics.comment({
              userId: currentUserId,
              postId: post.post_id,
              postType: post.post_type || 'post',
              context: { surface: 'home' },
            });
          }}
          className="flex-1 gap-1.5 h-10"
        >
          <MessageCircle className="h-5 w-5" />
          <span className="hidden sm:inline text-sm font-medium">Comment</span>
        </Button>

        {/* Repost Button - Re-enabled */}
        {feedItem && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowReshareDialog(true)}
            className="flex-1 gap-1.5 h-10"
          >
            <Repeat2 className="h-5 w-5" />
            <span className="hidden sm:inline text-sm font-medium">Repost</span>
          </Button>
        )}

        {/* Bookmark/Save Button */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => toggleBookmark()}
          disabled={isBookmarking}
          className={cn('flex-1 gap-1.5 h-10', isBookmarked && 'text-primary')}
        >
          <Bookmark className={cn('h-5 w-5', isBookmarked && 'fill-current')} />
          <span className="hidden sm:inline text-sm font-medium">{isBookmarked ? 'Saved' : 'Save'}</span>
        </Button>
      </div>

      {/* Threaded Comments Section */}
      {showComments && (
        <ThreadedComments postId={post.post_id} currentUserId={currentUserId} />
      )}

      {/* Reshare Dialog */}
      {feedItem && (
        <ReshareDialog
          open={showReshareDialog}
          onOpenChange={setShowReshareDialog}
          post={feedItem}
          currentUserId={currentUserId}
          onSuccess={onUpdate}
        />
      )}

      {/* Share Dialog */}
      {profile && (
        <ShareDialog
          isOpen={showShareDialog}
          onClose={() => setShowShareDialog(false)}
          post={post}
          onShare={sharePost}
          userProfile={{
            full_name: profile.full_name,
            avatar_url: profile.avatar_url,
          }}
        />
      )}

      {/* Media Lightbox */}
      {post.image_url && (
        <MediaLightbox
          open={showMediaLightbox}
          onOpenChange={setShowMediaLightbox}
          mediaUrl={post.image_url}
          alt={`Media from ${post.author_full_name}'s post`}
        />
      )}
    </Card>
  );
}
