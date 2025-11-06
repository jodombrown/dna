import { useState, useRef } from 'react';
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
import { Globe, Users, Image as ImageIcon, Video, FileText, X } from 'lucide-react';

interface EnhancedCreatePostDialogProps {
  isOpen: boolean;
  onClose: () => void;
  currentUserId: string;
  onSuccess?: () => void;
}

export function EnhancedCreatePostDialog({
  isOpen,
  onClose,
  currentUserId,
  onSuccess,
}: EnhancedCreatePostDialogProps) {
  const [content, setContent] = useState('');
  const [postType, setPostType] = useState<PostType>('update');
  const [privacyLevel, setPrivacyLevel] = useState<PrivacyLevel>('connections');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [mediaFile, setMediaFile] = useState<File | null>(null);
  const [mediaPreview, setMediaPreview] = useState<string | null>(null);
  const [mediaType, setMediaType] = useState<'image' | 'video' | 'document' | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const maxLength = 5000;
  const remainingChars = maxLength - content.length;

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Check file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast({
        title: 'File too large',
        description: 'Please select a file smaller than 10MB',
        variant: 'destructive',
      });
      return;
    }

    setMediaFile(file);

    // Determine media type
    if (file.type.startsWith('image/')) {
      setMediaType('image');
      const reader = new FileReader();
      reader.onloadend = () => setMediaPreview(reader.result as string);
      reader.readAsDataURL(file);
    } else if (file.type.startsWith('video/')) {
      setMediaType('video');
      const url = URL.createObjectURL(file);
      setMediaPreview(url);
    } else {
      setMediaType('document');
      setMediaPreview(null);
    }
  };

  const removeMedia = () => {
    setMediaFile(null);
    setMediaPreview(null);
    setMediaType(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const uploadMedia = async (file: File): Promise<string | null> => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${currentUserId}-${Date.now()}.${fileExt}`;
    const filePath = `posts/${fileName}`;

    const { error: uploadError, data } = await supabase.storage
      .from('post-media')
      .upload(filePath, file);

    if (uploadError) {
      console.error('Upload error:', uploadError);
      return null;
    }

    const { data: { publicUrl } } = supabase.storage
      .from('post-media')
      .getPublicUrl(filePath);

    return publicUrl;
  };

  const handleSubmit = async () => {
    const trimmedContent = content.trim();

    if (!trimmedContent && !mediaFile) {
      toast({
        title: 'Content required',
        description: 'Please write something or add media to post',
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
      let imageUrl: string | null = null;

      // Upload media if present
      if (mediaFile) {
        imageUrl = await uploadMedia(mediaFile);
        if (!imageUrl) {
          throw new Error('Failed to upload media');
        }
      }

      const { error } = await supabase.from('posts').insert({
        author_id: currentUserId,
        content: trimmedContent,
        post_type: postType,
        privacy_level: privacyLevel,
        image_url: imageUrl,
      });

      if (error) throw error;

      toast({
        title: 'Post created!',
        description: 'Your post has been shared with your network',
      });

      onSuccess?.();
      onClose();
      
      // Reset form
      setContent('');
      setPostType('update');
      setPrivacyLevel('connections');
      removeMedia();
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
      <DialogContent className="sm:max-w-[650px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create a Post</DialogTitle>
          <DialogDescription>
            Share updates, insights, and media with your network
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Content */}
          <div className="space-y-2">
            <Textarea
              id="content"
              placeholder="What would you like to share?"
              value={content}
              onChange={(e) => setContent(e.target.value.slice(0, maxLength))}
              maxLength={maxLength}
              rows={6}
              className="resize-none text-base"
            />
            <p className="text-xs text-muted-foreground text-right">
              {remainingChars} characters remaining
            </p>
          </div>

          {/* Media Preview */}
          {mediaPreview && (
            <div className="relative rounded-lg border overflow-hidden">
              <Button
                variant="destructive"
                size="icon"
                className="absolute top-2 right-2 z-10 h-8 w-8"
                onClick={removeMedia}
              >
                <X className="h-4 w-4" />
              </Button>
              
              {mediaType === 'image' && (
                <img
                  src={mediaPreview}
                  alt="Upload preview"
                  className="w-full h-auto max-h-96 object-cover"
                />
              )}
              
              {mediaType === 'video' && (
                <video
                  src={mediaPreview}
                  controls
                  className="w-full h-auto max-h-96"
                />
              )}
            </div>
          )}

          {mediaFile && mediaType === 'document' && (
            <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
              <FileText className="h-8 w-8 text-muted-foreground" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{mediaFile.name}</p>
                <p className="text-xs text-muted-foreground">
                  {(mediaFile.size / 1024).toFixed(1)} KB
                </p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={removeMedia}
                className="h-8 w-8"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
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

            {/* Privacy Level */}
            <div className="space-y-2">
              <Label htmlFor="privacy">Visibility</Label>
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
                      <span>Connections</span>
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
            </div>
          </div>

          {/* Media Upload Options */}
          <div className="flex items-center gap-2 pt-2 border-t">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*,video/*,.pdf,.doc,.docx"
              onChange={handleFileSelect}
              className="hidden"
            />
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
              disabled={!!mediaFile}
              className="gap-2"
            >
              <ImageIcon className="h-4 w-4" />
              Image
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
              disabled={!!mediaFile}
              className="gap-2"
            >
              <Video className="h-4 w-4" />
              Video
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
              disabled={!!mediaFile}
              className="gap-2"
            >
              <FileText className="h-4 w-4" />
              Document
            </Button>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting || (!content.trim() && !mediaFile)}
            className="bg-primary hover:bg-primary/90"
          >
            {isSubmitting ? 'Posting...' : 'Post'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
