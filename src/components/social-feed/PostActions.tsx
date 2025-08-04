import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Heart, MessageCircle, Share } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface PostActionsProps {
  postId: string;
  initialLikeCount: number;
  initialCommentCount: number;
  initialIsLiked: boolean;
  onComment?: (postId: string) => void;
}

export const PostActions: React.FC<PostActionsProps> = ({
  postId,
  initialLikeCount,
  initialCommentCount,
  initialIsLiked,
  onComment
}) => {
  const [isLiked, setIsLiked] = useState(initialIsLiked);
  const [likeCount, setLikeCount] = useState(initialLikeCount);
  const [isLiking, setIsLiking] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  const handleLike = async () => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please log in to like posts",
        variant: "destructive",
      });
      return;
    }

    if (isLiking) return;
    setIsLiking(true);

    // Optimistic update
    const newIsLiked = !isLiked;
    setIsLiked(newIsLiked);
    setLikeCount(prev => newIsLiked ? prev + 1 : Math.max(0, prev - 1));

    try {
      if (newIsLiked) {
        // Add like
        await supabase
          .from('post_likes')
          .insert({
            post_id: postId,
            user_id: user.id
          });
      } else {
        // Remove like
        await supabase
          .from('post_likes')
          .delete()
          .eq('post_id', postId)
          .eq('user_id', user.id);
      }
    } catch (error) {
      // Revert optimistic update on error
      setIsLiked(!newIsLiked);
      setLikeCount(prev => newIsLiked ? Math.max(0, prev - 1) : prev + 1);
      
      console.error('Error toggling like:', error);
      toast({
        title: "Error",
        description: "Failed to update like. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLiking(false);
    }
  };

  const handleComment = () => {
    onComment?.(postId);
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: 'DNA Platform Post',
        text: 'Check out this post on DNA Platform',
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast({
        title: "Link copied!",
        description: "Post link copied to clipboard.",
      });
    }
  };

  return (
    <div className="flex items-center justify-between pt-2 border-t">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={handleLike}
          disabled={isLiking}
          className={`gap-2 transition-colors ${
            isLiked 
              ? 'text-red-500 hover:text-red-600' 
              : 'text-muted-foreground hover:text-red-500'
          }`}
          aria-label={`${isLiked ? 'Unlike' : 'Like'} this post. ${likeCount} likes`}
        >
          <Heart className={`h-4 w-4 transition-transform ${isLiked ? 'fill-current scale-110' : ''}`} />
          <span>{likeCount}</span>
        </Button>

        <Button
          variant="ghost"
          size="sm"
          onClick={handleComment}
          className="gap-2 text-muted-foreground hover:text-foreground transition-colors"
          aria-label={`Comment on this post. ${initialCommentCount} comments`}
        >
          <MessageCircle className="h-4 w-4" />
          <span>{initialCommentCount}</span>
        </Button>
      </div>

      <Button
        variant="ghost"
        size="sm"
        onClick={handleShare}
        className="gap-2 text-muted-foreground hover:text-foreground transition-colors"
        aria-label="Share this post"
      >
        <Share className="h-4 w-4" />
        Share
      </Button>
    </div>
  );
};