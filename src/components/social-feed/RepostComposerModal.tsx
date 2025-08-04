import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Loader2, Share } from 'lucide-react';
import { SharedPostPreview } from './SharedPostPreview';
import { useRepost } from './useRepost';
import type { Post } from './PostList';

interface RepostComposerModalProps {
  originalPost: Post;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onRepostCreated?: () => void;
}

const PILLARS = [
  { value: 'connect', label: 'Connect', color: 'bg-dna-emerald text-white' },
  { value: 'collaborate', label: 'Collaborate', color: 'bg-dna-copper text-white' },
  { value: 'contribute', label: 'Contribute', color: 'bg-dna-gold text-black' },
];

export const RepostComposerModal: React.FC<RepostComposerModalProps> = ({
  originalPost,
  open,
  onOpenChange,
  onRepostCreated
}) => {
  const [commentary, setCommentary] = useState('');
  const [selectedPillar, setSelectedPillar] = useState<string>('connect');
  const { createRepost, isLoading } = useRepost();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!commentary.trim()) {
      return;
    }

    const result = await createRepost(originalPost.id, commentary, selectedPillar);
    if (result) {
      setCommentary('');
      setSelectedPillar('connect');
      onOpenChange(false);
      onRepostCreated?.();
    }
  };

  const handleClose = () => {
    setCommentary('');
    setSelectedPillar('connect');
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Share className="h-5 w-5" />
            Share Post
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Pillar Selection */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Choose a pillar for your commentary:</label>
            <Select value={selectedPillar} onValueChange={setSelectedPillar}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {PILLARS.map((pillar) => (
                  <SelectItem key={pillar.value} value={pillar.value}>
                    <div className="flex items-center gap-2">
                      <Badge className={`text-xs ${pillar.color}`}>
                        {pillar.label}
                      </Badge>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Commentary Input */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Add your thoughts:</label>
            <Textarea
              value={commentary}
              onChange={(e) => setCommentary(e.target.value)}
              placeholder="Share your perspective on this post..."
              className="min-h-[100px] resize-none"
              disabled={isLoading}
              required
            />
          </div>

          {/* Original Post Preview */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Original post:</label>
            <SharedPostPreview sharedPost={originalPost} />
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={!commentary.trim() || isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Sharing...
                </>
              ) : (
                <>
                  <Share className="h-4 w-4 mr-2" />
                  Share Post
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};