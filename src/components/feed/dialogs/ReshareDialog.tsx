/**
 * DNA | FEED - Reshare Dialog
 * 
 * Allows users to reshare posts with optional commentary.
 */

import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card } from '@/components/ui/card';
import { Loader2, Share2 } from 'lucide-react';
import { createResharePost } from '@/lib/feedWriter';
import { toast } from 'sonner';
import { UniversalFeedItem } from '@/types/feed';
import { formatDistanceToNow } from 'date-fns';

interface ReshareDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  post: UniversalFeedItem;
  currentUserId: string;
  onSuccess?: () => void;
}

export const ReshareDialog: React.FC<ReshareDialogProps> = ({
  open,
  onOpenChange,
  post,
  currentUserId,
  onSuccess,
}) => {
  const [commentary, setCommentary] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleReshare = async () => {
    try {
      setIsSubmitting(true);
      
      await createResharePost({
        originalPostId: post.post_id,
        authorId: currentUserId,
        commentary: commentary.trim() || undefined,
      });

      toast.success('Post reshared successfully!');
      onOpenChange(false);
      setCommentary('');
      onSuccess?.();
    } catch (error) {
      console.error('Error resharing post:', error);
      toast.error('Failed to reshare post');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Share this post</DialogTitle>
          <DialogDescription>
            Add your thoughts (optional) and share with your network
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          {/* Commentary Input */}
          <Textarea
            placeholder="What are your thoughts on this?"
            value={commentary}
            onChange={(e) => setCommentary(e.target.value)}
            className="min-h-[100px] resize-none"
            maxLength={500}
          />
          <p className="text-xs text-muted-foreground text-right">
            {commentary.length}/500
          </p>

          {/* Original Post Preview */}
          <Card className="p-4 bg-muted/50">
            <div className="flex gap-3 mb-3">
              <Avatar className="w-10 h-10">
                <AvatarImage src={post.author_avatar_url || undefined} />
                <AvatarFallback>{post.author_display_name[0]}</AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm truncate">
                  {post.author_display_name}
                </p>
                <p className="text-xs text-muted-foreground">
                  @{post.author_username} · {formatDistanceToNow(new Date(post.created_at))} ago
                </p>
              </div>
            </div>
            
            <p className="text-sm line-clamp-4">{post.content}</p>
            
            {post.media_url && (
              <img
                src={post.media_url}
                alt="Post media"
                className="mt-3 rounded-lg w-full max-h-[200px] object-cover"
              />
            )}
          </Card>

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-2">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              onClick={handleReshare}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Sharing...
                </>
              ) : (
                <>
                  <Share2 className="w-4 h-4 mr-2" />
                  Share
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
