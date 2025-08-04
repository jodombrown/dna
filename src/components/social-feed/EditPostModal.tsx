import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { X, Image, Loader2 } from 'lucide-react';
import { usePostActions } from './usePostActions';
import { useUploadPostMedia } from './useUploadPostMedia';
import type { Post } from './PostList';

interface EditPostModalProps {
  post: Post;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onPostUpdated?: () => void;
}

const getPillarColor = (pillar: string) => {
  switch (pillar) {
    case 'connect': return 'bg-dna-emerald text-white';
    case 'collaborate': return 'bg-dna-copper text-white';
    case 'contribute': return 'bg-dna-gold text-black';
    default: return 'bg-dna-forest text-white';
  }
};

const getPillarLabel = (pillar: string) => {
  return pillar.charAt(0).toUpperCase() + pillar.slice(1);
};

export const EditPostModal: React.FC<EditPostModalProps> = ({
  post,
  open,
  onOpenChange,
  onPostUpdated
}) => {
  const [content, setContent] = useState(post.content);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(post.media_url || null);
  const [keepExistingImage, setKeepExistingImage] = useState(!!post.media_url);
  
  const { updatePost, isLoading } = usePostActions();
  const { uploadMedia, uploading: isUploading } = useUploadPostMedia();

  useEffect(() => {
    if (open) {
      setContent(post.content);
      setImagePreview(post.media_url || null);
      setKeepExistingImage(!!post.media_url);
      setSelectedImage(null);
    }
  }, [open, post]);

  const handleImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedImage(file);
      setKeepExistingImage(false);
      
      const reader = new FileReader();
      reader.onload = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setSelectedImage(null);
    setImagePreview(null);
    setKeepExistingImage(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!content.trim()) return;

    let mediaUrl: string | undefined = undefined;
    
    // Handle image upload/removal
    if (selectedImage) {
      const uploadedUrl = await uploadMedia(selectedImage);
      if (!uploadedUrl) return;
      mediaUrl = uploadedUrl;
    } else if (keepExistingImage) {
      mediaUrl = post.media_url || undefined;
    } else {
      mediaUrl = null; // Explicitly remove image
    }

    const success = await updatePost(post.id, content, mediaUrl);
    if (success) {
      onOpenChange(false);
      onPostUpdated?.();
    }
  };

  const isSubmitting = isLoading || isUploading;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Edit Post</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex items-center gap-2">
            <Badge 
              variant="secondary" 
              className={`text-xs ${getPillarColor(post.pillar)}`}
            >
              {getPillarLabel(post.pillar)}
            </Badge>
          </div>

          <Textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="What's on your mind?"
            className="min-h-[120px] resize-none"
            disabled={isSubmitting}
          />

          {imagePreview && (
            <div className="relative">
              <img 
                src={imagePreview} 
                alt="Post preview" 
                className="w-full max-h-96 object-cover rounded-lg"
              />
              <Button
                type="button"
                variant="secondary"
                size="sm"
                className="absolute top-2 right-2"
                onClick={removeImage}
                disabled={isSubmitting}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          )}

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <input
                type="file"
                accept="image/*"
                onChange={handleImageSelect}
                className="hidden"
                id="edit-image-upload"
                disabled={isSubmitting}
              />
              <label htmlFor="edit-image-upload">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  disabled={isSubmitting}
                  asChild
                >
                  <span className="cursor-pointer">
                    <Image className="h-4 w-4 mr-2" />
                    {imagePreview ? 'Change Image' : 'Add Image'}
                  </span>
                </Button>
              </label>
            </div>

            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={!content.trim() || isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    {isUploading ? 'Uploading...' : 'Updating...'}
                  </>
                ) : (
                  'Update Post'
                )}
              </Button>
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};