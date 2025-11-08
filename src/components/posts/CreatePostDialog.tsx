import { useState } from 'react';
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
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { PostType, PrivacyLevel } from '@/types/posts';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Globe, Users } from 'lucide-react';

interface CreatePostDialogProps {
  isOpen: boolean;
  onClose: () => void;
  currentUserId: string;
  onSuccess?: () => void;
}

export function CreatePostDialog({
  isOpen,
  onClose,
  currentUserId,
  onSuccess,
}: CreatePostDialogProps) {
  const [content, setContent] = useState('');
  const [postType, setPostType] = useState<PostType>('update');
  const [privacyLevel, setPrivacyLevel] = useState<PrivacyLevel>('public');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const maxLength = 5000;
  const remainingChars = maxLength - content.length;

  const handleSubmit = async () => {
    const trimmedContent = content.trim();

    if (!trimmedContent || trimmedContent.length === 0) {
      toast({
        title: 'Content required',
        description: 'Please write something to post',
        variant: 'destructive',
      });
      return;
    }

    if (trimmedContent.length > maxLength) {
      toast({
        title: 'Content too long',
        description: `Posts must be ${maxLength} characters or less`,
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const { error } = await supabase.from('posts').insert({
        author_id: currentUserId,
        content: trimmedContent,
        post_type: postType,
        privacy_level: privacyLevel,
      });

      if (error) throw error;

      toast({
        title: 'Post created!',
        description: 'Your post is live on All Posts',
      });

      onSuccess?.();
      onClose();
      setContent('');
      setPostType('update');
      setPrivacyLevel('public');
    } catch (error) {
      console.error('Error creating post:', error);
      toast({
        title: 'Error',
        description: 'Failed to create post',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Create a Post</DialogTitle>
          <DialogDescription>
            Share an update, article, question, or celebration with your network
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Post Type */}
          <div className="space-y-2">
            <Label htmlFor="post-type">Post Type</Label>
            <Select value={postType} onValueChange={(value) => setPostType(value as PostType)}>
              <SelectTrigger id="post-type">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="update">📝 Update</SelectItem>
                <SelectItem value="article">📄 Article</SelectItem>
                <SelectItem value="question">❓ Question</SelectItem>
                <SelectItem value="celebration">🎉 Celebration</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Content */}
          <div className="space-y-2">
            <Label htmlFor="content">Content</Label>
            <Textarea
              id="content"
              placeholder="What would you like to share?"
              value={content}
              onChange={(e) => setContent(e.target.value.slice(0, maxLength))}
              maxLength={maxLength}
              rows={8}
              className="resize-none"
            />
            <p className="text-xs text-muted-foreground text-right">
              {remainingChars} characters remaining
            </p>
          </div>

          {/* Privacy Level */}
          <div className="space-y-2">
            <Label htmlFor="privacy">Privacy</Label>
            <Select
              value={privacyLevel}
              onValueChange={(value) => setPrivacyLevel(value as PrivacyLevel)}
            >
              <SelectTrigger id="privacy">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="connections">
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    <span>Connections Only</span>
                  </div>
                </SelectItem>
                <SelectItem value="public">
                  <div className="flex items-center gap-2">
                    <Globe className="h-4 w-4" />
                    <span>Public</span>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              {privacyLevel === 'connections'
                ? 'Only your connections can see this post'
                : 'Anyone on DNA Platform can see this post'}
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting || !content.trim()}
            className="bg-[hsl(151,75%,50%)] hover:bg-[hsl(151,75%,40%)] text-white"
          >
            {isSubmitting ? 'Posting...' : 'Post'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
