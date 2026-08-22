import { useRef, useState } from 'react';
import { ImagePlus, X, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { uploadMedia } from '@/lib/uploadMedia';
import { validateImageDimensions } from '@/utils/validateImageDimensions';

const IMAGE_ACCEPT = 'image/jpeg,image/jpg,image/png,image/webp,image/gif';

interface MediaUploadButtonProps {
  label?: string;
  onUpload: (url: string) => void;
  currentMediaUrl?: string;
  onRemove?: () => void;
}

export function MediaUploadButton({
  label = 'Add Media',
  onUpload,
  currentMediaUrl,
  onRemove,
}: MediaUploadButtonProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    const validImageTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
    const isImage = validImageTypes.includes(file.type);

    if (!isImage) {
      toast({
        title: 'Invalid file type',
        description: 'Please upload a JPG, PNG, WebP, or GIF image.',
        variant: 'destructive',
      });
      return;
    }

    const maxSize = 25 * 1024 * 1024;
    if (file.size > maxSize) {
      toast({
        title: 'File too large',
        description: 'Please upload an image smaller than 25MB.',
        variant: 'destructive',
      });
      return;
    }

    // Aspect ratio must sit between 9:16 and 16:9, and clear the size floor.
    const dimensions = await validateImageDimensions(file);
    if (!dimensions.ok) {
      toast({
        title: dimensions.title,
        description: dimensions.description,
        variant: 'destructive',
      });
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    setIsUploading(true);
    try {
      const { url } = await uploadMedia(file, 'post');
      onUpload(url);
      toast({ description: 'Image uploaded successfully.' });
    } catch (error) {
      toast({
        title: 'Upload failed',
        description: "We couldn't upload that file. Please try again.",
        variant: 'destructive',
      });
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  if (currentMediaUrl) {
    const isVideo =
      currentMediaUrl.includes('.mp4') ||
      currentMediaUrl.includes('.webm') ||
      currentMediaUrl.includes('.mov');
    return (
      <div className="space-y-2">
        <Label>Media</Label>
        <div className="relative rounded-lg border border-border overflow-hidden">
          {isVideo ? (
            <video src={currentMediaUrl} className="w-full h-20 sm:h-40 object-cover" controls />
          ) : (
            <img src={currentMediaUrl} alt="Post media" className="w-full h-20 sm:h-40 object-cover" />
          )}
          <div className="absolute top-2 right-2 flex gap-2">
            <Button
              type="button"
              size="sm"
              variant="secondary"
              onClick={() => fileInputRef.current?.click()}
            >
              Change
            </Button>
            {onRemove && (
              <Button
                type="button"
                size="icon"
                variant="destructive"
                className="h-8 w-8"
                onClick={onRemove}
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept={IMAGE_ACCEPT}
          onChange={handleFileSelect}
          className="hidden"
        />
      </div>
    );
  }

  return (
    <div>
      <input
        ref={fileInputRef}
        type="file"
        accept={IMAGE_ACCEPT}
        onChange={handleFileSelect}
        className="hidden"
      />
      <Button
        variant="outline"
        size="sm"
        className="w-full"
        disabled={isUploading}
        onClick={() => fileInputRef.current?.click()}
      >
        {isUploading ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Uploading...
          </>
        ) : (
          <>
            <ImagePlus className="w-4 h-4 mr-2" />
            {label}
          </>
        )}
      </Button>
    </div>
  );
}
