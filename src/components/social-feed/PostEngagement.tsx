import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Heart, MessageCircle, Share2, Bookmark, MoreHorizontal } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useSocialFeed } from '@/contexts/SocialFeedContext';

interface PostEngagementProps {
  postId: string;
  likeCount: number;
  commentCount: number;
  userHasLiked: boolean;
  userHasSaved?: boolean;
  onCommentToggle?: () => void;
  className?: string;
}

export const PostEngagement: React.FC<PostEngagementProps> = ({
  postId,
  likeCount,
  commentCount,
  userHasLiked,
  userHasSaved = false,
  onCommentToggle,
  className = ""
}) => {
  const [isLiking, setIsLiking] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isSharing, setIsSharing] = useState(false);
  const { toast } = useToast();
  const { updatePostLike } = useSocialFeed();

  const handleLike = async () => {
    if (isLiking) return;
    
    setIsLiking(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Optimistic update
      updatePostLike(postId, !userHasLiked, user.id);

      if (userHasLiked) {
        const { error } = await supabase
          .from('post_likes')
          .delete()
          .eq('post_id', postId)
          .eq('user_id', user.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('post_likes')
          .insert({ post_id: postId, user_id: user.id });

        if (error) throw error;
      }
    } catch (error) {
      console.error('Like error:', error);
      // Revert optimistic update
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        updatePostLike(postId, userHasLiked, user.id);
      }
      
      toast({
        title: "Error",
        description: "Failed to update like. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLiking(false);
    }
  };

  const handleSave = async () => {
    if (isSaving) return;
    
    setIsSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      if (userHasSaved) {
        const { error } = await supabase
          .from('saved_posts')
          .delete()
          .eq('post_id', postId)
          .eq('user_id', user.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('saved_posts')
          .insert({ post_id: postId, user_id: user.id });

        if (error) throw error;
      }

      toast({
        title: userHasSaved ? "Post unsaved" : "Post saved",
        description: userHasSaved ? "Removed from your saved posts" : "Added to your saved posts",
      });
    } catch (error) {
      console.error('Save error:', error);
      toast({
        title: "Error",
        description: "Failed to save post. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleShare = async () => {
    if (isSharing) return;
    
    setIsSharing(true);
    try {
      const url = `${window.location.origin}/post/${postId}`;
      
      if (navigator.share) {
        await navigator.share({
          title: 'Check out this post',
          url: url,
        });
      } else {
        await navigator.clipboard.writeText(url);
        toast({
          title: "Link copied",
          description: "Post link copied to clipboard",
        });
      }
    } catch (error) {
      if (error instanceof Error && error.name !== 'AbortError') {
        console.error('Share error:', error);
        toast({
          title: "Error",
          description: "Failed to share post. Please try again.",
          variant: "destructive",
        });
      }
    } finally {
      setIsSharing(false);
    }
  };

  return (
    <div className={`flex items-center justify-between ${className}`}>
      <div className="flex items-center space-x-1">
        <Button
          variant="ghost"
          size="sm"
          onClick={handleLike}
          disabled={isLiking}
          className={`${userHasLiked ? 'text-red-500 hover:text-red-600' : 'text-muted-foreground hover:text-foreground'}`}
        >
          <Heart className={`h-4 w-4 mr-1 ${userHasLiked ? 'fill-current' : ''}`} />
          {likeCount}
        </Button>

        <Button
          variant="ghost"
          size="sm"
          onClick={onCommentToggle}
          className="text-muted-foreground hover:text-foreground"
        >
          <MessageCircle className="h-4 w-4 mr-1" />
          {commentCount}
        </Button>

        <Button
          variant="ghost"
          size="sm"
          onClick={handleShare}
          disabled={isSharing}
          className="text-muted-foreground hover:text-foreground"
        >
          <Share2 className="h-4 w-4" />
        </Button>
      </div>

      <Button
        variant="ghost"
        size="sm"
        onClick={handleSave}
        disabled={isSaving}
        className={`${userHasSaved ? 'text-primary' : 'text-muted-foreground hover:text-foreground'}`}
      >
        <Bookmark className={`h-4 w-4 ${userHasSaved ? 'fill-current' : ''}`} />
      </Button>
    </div>
  );
};