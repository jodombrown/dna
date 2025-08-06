import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Heart, MessageCircle, Share, Bookmark, Trash2, Edit, MoreHorizontal } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface PostActionsProps {
  postId: string;
  authorId: string;
  initialLikeCount: number;
  initialCommentCount: number;
  initialIsLiked: boolean;
  initialIsSaved?: boolean;
  onComment?: (postId: string) => void;
  onEdit?: (postId: string) => void;
  onDelete?: (postId: string) => void;
}

export const PostActions: React.FC<PostActionsProps> = ({
  postId,
  authorId,
  initialLikeCount,
  initialCommentCount,
  initialIsLiked,
  initialIsSaved = false,
  onComment,
  onEdit,
  onDelete
}) => {
  const [isLiked, setIsLiked] = useState(initialIsLiked);
  const [isSaved, setIsSaved] = useState(initialIsSaved);
  const [likeCount, setLikeCount] = useState(initialLikeCount);
  const [isLiking, setIsLiking] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  const isAuthor = user?.id === authorId;

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

  const handleSave = async () => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please log in to save posts",
        variant: "destructive",
      });
      return;
    }

    if (isSaving) return;
    setIsSaving(true);

    // Optimistic update
    const newIsSaved = !isSaved;
    setIsSaved(newIsSaved);

    try {
      if (newIsSaved) {
        // Save post
        await supabase
          .from('saved_posts')
          .insert({
            post_id: postId,
            user_id: user.id
          });
      } else {
        // Unsave post
        await supabase
          .from('saved_posts')
          .delete()
          .eq('post_id', postId)
          .eq('user_id', user.id);
      }

      toast({
        title: newIsSaved ? "Post saved!" : "Post unsaved",
        description: newIsSaved ? "Added to your saved posts" : "Removed from saved posts",
      });
    } catch (error) {
      // Revert optimistic update on error
      setIsSaved(!newIsSaved);
      
      console.error('Error toggling save:', error);
      toast({
        title: "Error",
        description: "Failed to save post. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!user || !isAuthor) return;

    if (isDeleting) return;
    setIsDeleting(true);

    try {
      const { error } = await supabase
        .from('posts')
        .delete()
        .eq('id', postId)
        .eq('user_id', user.id);

      if (error) throw error;

      toast({
        title: "Post deleted",
        description: "Your post has been successfully deleted.",
      });

      onDelete?.(postId);
    } catch (error) {
      console.error('Error deleting post:', error);
      toast({
        title: "Error",
        description: "Failed to delete post. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
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

        <Button
          variant="ghost"
          size="sm"
          onClick={handleSave}
          disabled={isSaving}
          className={`gap-2 transition-colors ${
            isSaved 
              ? 'text-dna-gold hover:text-dna-gold/80' 
              : 'text-muted-foreground hover:text-dna-gold'
          }`}
          aria-label={`${isSaved ? 'Unsave' : 'Save'} this post`}
        >
          <Bookmark className={`h-4 w-4 transition-transform ${isSaved ? 'fill-current scale-110' : ''}`} />
        </Button>
      </div>

      <div className="flex items-center gap-2">
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

        {isAuthor && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="text-muted-foreground hover:text-foreground transition-colors"
                aria-label="More options"
              >
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onEdit?.(postId)}>
                <Edit className="h-4 w-4 mr-2" />
                Edit Post
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={handleDelete}
                disabled={isDeleting}
                className="text-destructive focus:text-destructive"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                {isDeleting ? 'Deleting...' : 'Delete Post'}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
    </div>
  );
};