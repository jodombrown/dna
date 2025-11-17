/**
 * DNA | FEED v1.1 - Reshare Dialog Component
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
import { UniversalFeedItem } from '@/types/feed';
import { Loader2 } from 'lucide-react';

interface ReshareDialogProps {
  isOpen: boolean;
  onClose: () => void;
  originalPost: UniversalFeedItem;
  onReshare: (commentary: string) => Promise<void>;
}

export const ReshareDialog: React.FC<ReshareDialogProps> = ({
  isOpen,
  onClose,
  originalPost,
  onReshare,
}) => {
  const [commentary, setCommentary] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      await onReshare(commentary);
      setCommentary('');
      onClose();
    } catch (error) {
      console.error('Reshare failed:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Share this post</DialogTitle>
          <DialogDescription>
            Add your thoughts (optional) and share with your network
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <Textarea
            placeholder="What do you think about this? (optional)"
            value={commentary}
            onChange={(e) => setCommentary(e.target.value)}
            rows={3}
            className="resize-none"
          />

          {/* Preview of original post */}
          <Card className="p-4 bg-muted/50">
            <div className="flex items-start gap-3">
              <Avatar className="h-8 w-8">
                <AvatarImage src={originalPost.author_avatar_url || ''} />
                <AvatarFallback>
                  {originalPost.author_display_name?.[0] || 'U'}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm">
                  {originalPost.author_display_name}
                </p>
                <p className="text-sm text-muted-foreground line-clamp-3 mt-1">
                  {originalPost.content}
                </p>
              </div>
            </div>
          </Card>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Share
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
