/**
 * DNA | FEED - Reshare Dialog
 * 
 * Allows users to reshare posts with optional commentary.
 */

import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card } from '@/components/ui/card';
import { Loader2, Share2 } from 'lucide-react';
import { UniversalFeedItem } from '@/types/feed';
import { createResharePost } from '@/lib/feedWriter';
import { toast } from 'sonner';
import { useQueryClient } from '@tanstack/react-query';

interface ReshareDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  originalPost: UniversalFeedItem;
  currentUserId: string;
}

export const ReshareDialog: React.FC<ReshareDialogProps> = ({
  open,
  onOpenChange,
  originalPost,
  currentUserId,
}) => {
  const [commentary, setCommentary] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const queryClient = useQueryClient();

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      await createResharePost({
        originalPostId: originalPost.post_id,
        authorId: currentUserId,
        commentary: commentary.trim() || undefined,
      });

      // Invalidate feed queries
      queryClient.invalidateQueries({ queryKey: ['universal-feed'] });

      toast.success('Post reshared successfully');
      onOpenChange(false);
      setCommentary('');
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
          <DialogTitle className="flex items-center gap-2">
            <Share2 className="w-5 h-5" />
            Reshare Post
          </DialogTitle>
          <DialogDescription>
            Add your thoughts to this post before sharing with your network.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Commentary textarea */}
          <Textarea
            placeholder="Add your commentary (optional)"
            value={commentary}
            onChange={(e) => setCommentary(e.target.value)}
            rows={3}
            maxLength={500}
            className="resize-none"
          />
          <div className="text-xs text-muted-foreground text-right">
            {commentary.length}/500
          </div>

          {/* Original post preview */}
          <Card className="p-4 bg-muted/50 border-l-4 border-primary">
            <div className="flex items-start gap-3">
              <Avatar className="h-8 w-8">
                <AvatarImage src={originalPost.author_avatar_url || ''} />
                <AvatarFallback>
                  {originalPost.author_display_name?.[0] || originalPost.author_username?.[0] || 'U'}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <div className="flex items-baseline gap-2">
                  <p className="font-semibold text-sm">
                    {originalPost.author_display_name || originalPost.author_username}
                  </p>
                  <span className="text-xs text-muted-foreground">
                    @{originalPost.author_username}
                  </span>
                </div>
                <p className="text-sm mt-1 line-clamp-3">
                  {originalPost.content}
                </p>
                {originalPost.media_url && (
                  <div className="mt-2 text-xs text-muted-foreground flex items-center gap-1">
                    📎 Has media attachment
                  </div>
                )}
              </div>
            </div>
          </Card>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
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
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
