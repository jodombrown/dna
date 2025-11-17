import { useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { PostWithAuthor } from '@/types/posts';
import { MessageCircle, MoreHorizontal, Globe, Users, Repeat2, Share2, Heart, Bookmark } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { EmbedPreview } from '@/components/social-feed/EmbedPreview';
import { ReactionPicker } from './ReactionPicker';
import { ReactionSummary } from './ReactionSummary';
import { RepostDialog } from './RepostDialog';
import { SharedPostCard } from './SharedPostCard';
import { LikedByModal } from './LikedByModal';
import { ShareDialog } from './ShareDialog';
import { usePostReactions } from '@/hooks/usePostReactions';
import { usePostLikes } from '@/hooks/usePostLikes';
import { usePostBookmark } from '@/hooks/usePostBookmark';
import { usePostRepost } from '@/hooks/usePostRepost';
import { usePostShares } from '@/hooks/usePostShares';
import { ReactionEmoji, REACTION_EMOJIS, getEmojiLabel } from '@/types/reactions';
import { useAuth } from '@/contexts/AuthContext';
import { useProfile } from '@/hooks/useProfile';
import { usePostViewTracker } from '@/hooks/usePostViewTracker';
import { PostAnalytics } from './PostAnalytics';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface PostCardProps {
  post: PostWithAuthor;
  currentUserId: string;
  onUpdate?: () => void;
  onCommentClick?: () => void;
  showComments?: boolean;
}

export function PostCard({
  post,
  currentUserId,
  onUpdate,
  onCommentClick,
  showComments = false,
}: PostCardProps) {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const { data: profile } = useProfile();
  
  const [showRepostDialog, setShowRepostDialog] = useState(false);
  const [showShareDialog, setShowShareDialog] = useState(false);
  const [showLikedByModal, setShowLikedByModal] = useState(false);
  
  // Post reactions (emoji reactions)
  const {
    reactions,
    totalReactions,
    currentReaction,
    addReaction,
    removeReaction,
    isLoading: isReacting,
  } = usePostReactions(post.post_id, currentUserId);

  // Post likes (simple heart like)
  const {
    likeCount,
    userHasLiked,
    likedBy,
    toggleLike,
    isLoading: isLiking,
  } = usePostLikes(post.post_id, currentUserId);

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
    <Card ref={viewTrackerRef} className="p-6">
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

        {isOwnPost && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={handleDelete} className="text-destructive">
                Delete Post
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
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

          {/* Media Display - Image or Video */}
          {post.image_url && (
            <div className="mb-4 rounded-lg overflow-hidden border">
              {/* Check if it's a video based on file extension */}
              {post.image_url.match(/\.(mp4|webm|mov|quicktime)$/i) ? (
                <video
                  src={post.image_url}
                  controls
                  className="w-full h-auto max-h-[32rem] object-cover"
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

          {/* Link Preview - Enhanced with metadata */}
          {post.link_url && (
            <div className="mb-4">
              <EmbedPreview
                embedData={{
                  url: post.link_url,
                  version: '1.0',
                  type: 'link',
                  title: post.link_title,
                  thumbnail_url: post.link_description ? undefined : post.link_url,
                }}
                showRemoveButton={false}
              />
            </div>
          )}
        </>
      )}

      {/* Stats */}
      {(likeCount > 0 || totalReactions > 0 || post.comments_count > 0 || shareCount > 0) && (
        <div className="flex items-center justify-between pb-3 mb-3 border-b text-sm">
          <div className="flex items-center gap-3">
            {/* Like count - clickable */}
            {likeCount > 0 && (
              <button
                onClick={() => setShowLikedByModal(true)}
                className="flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors"
              >
                <Heart className="h-4 w-4 fill-red-500 text-red-500" />
                <span>{likeCount}</span>
              </button>
            )}
            
            {/* Emoji reactions summary */}
            {totalReactions > 0 && (
              <ReactionSummary reactions={reactions} totalCount={totalReactions} />
            )}
          </div>
          
          <div className="flex items-center gap-3 text-muted-foreground">
            {post.comments_count > 0 && (
              <span>
                {post.comments_count} {post.comments_count === 1 ? 'comment' : 'comments'}
              </span>
            )}
            {shareCount > 0 && (
              <span>
                {shareCount} {shareCount === 1 ? 'share' : 'shares'}
              </span>
            )}
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center justify-between gap-2 pt-3 border-t">
        {/* Simple Like Button */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => toggleLike()}
          disabled={isLiking}
          className={cn(
            'flex-1 gap-1.5 px-2',
            userHasLiked && 'text-red-500 hover:text-red-600'
          )}
        >
          <Heart className={cn('h-4 w-4', userHasLiked && 'fill-red-500')} />
          <span className="hidden sm:inline">{userHasLiked ? 'Liked' : 'Like'}</span>
          <span className="sm:hidden">{likeCount > 0 ? likeCount : ''}</span>
        </Button>

        {/* Emoji Reaction Picker */}
        <ReactionPicker onReactionSelect={handleReactionSelect}>
          <Button
            variant="ghost"
            size="sm"
            disabled={isReacting}
            className="flex-1 gap-1.5 px-2"
          >
            <span className="text-lg">{currentReaction || '😊'}</span>
            <span className="hidden sm:inline">{currentReaction ? getEmojiLabel(currentReaction) : 'React'}</span>
          </Button>
        </ReactionPicker>

        <Button
          variant="ghost"
          size="sm"
          onClick={onCommentClick}
          className="flex-1 gap-1.5 px-2"
        >
          <MessageCircle className="h-4 w-4" />
          <span className="hidden sm:inline">Comment</span>
          <span className="sm:hidden">{post.comments_count > 0 ? post.comments_count : ''}</span>
        </Button>

        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowShareDialog(true)}
          disabled={isSharing}
          className={cn(
            'flex-1 gap-1.5 px-2',
            userHasShared && 'text-green-600 hover:text-green-700'
          )}
          title="Share this post"
        >
          <Share2 className={cn('h-4 w-4', userHasShared && 'fill-green-600')} />
          <span className="hidden sm:inline">{userHasShared ? 'Shared' : 'Share'}</span>
        </Button>

        {/* Bookmark Button */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => toggleBookmark()}
          disabled={isBookmarking}
          className={cn(
            'flex-1 gap-1.5 px-2',
            isBookmarked && 'text-primary hover:text-primary/90'
          )}
          title={isBookmarked ? 'Remove bookmark' : 'Save post'}
        >
          <Bookmark className={cn('h-4 w-4', isBookmarked && 'fill-primary')} />
          <span className="hidden sm:inline">{isBookmarked ? 'Saved' : 'Save'}</span>
        </Button>
      </div>

      {/* Liked By Modal */}
      <LikedByModal
        isOpen={showLikedByModal}
        onClose={() => setShowLikedByModal(false)}
        likedBy={likedBy}
      />

      {/* Repost Dialog */}
      {profile && (
        <RepostDialog
          isOpen={showRepostDialog}
          onClose={() => setShowRepostDialog(false)}
          post={post}
          currentUserName={profile.full_name}
          currentUserAvatar={profile.avatar_url}
          onRepost={handleRepost}
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
    </Card>
  );
}
