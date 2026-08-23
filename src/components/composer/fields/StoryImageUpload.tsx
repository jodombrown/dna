import { useRef, useState } from 'react';
import { ImagePlus, X, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { uploadMedia, ACCEPT } from '@/lib/uploadMedia';
import { compressAndTinify } from '@/lib/compressImage';
import { validateImageDimensions } from '@/utils/validateImageDimensions';
import { isCroppableImage } from '@/lib/utils/cropImage';
import { ImageCropDialog } from './ImageCropDialog';

interface StoryImageUploadProps {
  currentImageUrl?: string;
  onUpload: (url: string) => void;
  onRemove: () => void;
}

export function StoryImageUpload({ currentImageUrl, onUpload, onRemove }: StoryImageUploadProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isUploading, setIsUploading] = useState(false);
  // Non-null while the crop step is open. The file is held here and nowhere
  // else, so cancelling costs nothing and changes nothing.
  const [pendingCrop, setPendingCrop] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  /**
   * The pipeline, unchanged: validate, compress, upload. What reaches it is
   * either the member's original file or the crop they chose — nothing here
   * knows or needs to know which.
   */
  const processFile = async (original: File) => {
    // Aspect ratio must sit between 9:16 and 16:9, and clear the size floor.
    const dimensions = await validateImageDimensions(original);
    if (!dimensions.ok) {
      toast({
        title: dimensions.title,
        description: dimensions.description,
        variant: 'destructive',
      });
      return;
    }

    setIsUploading(true);
    try {
      // Auto-compress oversized images down to <=5MB / 1920px max
      const file = await compressAndTinify(original, {
        maxDimension: 1920,
        maxSizeBytes: 5 * 1024 * 1024,
      });
      const { url } = await uploadMedia(file, 'story');
      onUpload(url);
      const savedPct =
        file.size < original.size
          ? ` (optimized ${Math.round((1 - file.size / original.size) * 100)}%)`
          : '';
      toast({ description: `Hero image uploaded successfully.${savedPct}` });
    } catch (error) {
      const msg =
        error && typeof error === 'object' && 'message' in error && typeof (error as { message: unknown }).message === 'string'
          ? (error as { message: string }).message
          : "We couldn't upload that image. Try a smaller JPG or PNG.";
      console.error('[StoryImageUpload] upload failed:', error);
      toast({
        title: 'Upload failed',
        description: msg,
        variant: 'destructive',
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const original = e.target.files?.[0];
    // Cleared up front, not in a finally: the File is already captured, and
    // clearing here is what lets a member re-pick the same file after
    // cancelling the crop step (a change event does not fire for an
    // unchanged value).
    if (fileInputRef.current) fileInputRef.current.value = '';
    if (!original || !user) return;

    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!validTypes.includes(original.type)) {
      toast({
        title: 'Invalid file type',
        description: 'Please upload a JPG, PNG, or WebP image.',
        variant: 'destructive',
      });
      return;
    }

    // Hard ceiling before compression (avoid decoding absurd files)
    if (original.size > 25 * 1024 * 1024) {
      toast({
        title: 'File too large',
        description: 'Please upload an image smaller than 25MB.',
        variant: 'destructive',
      });
      return;
    }

    // Crop first, validate second. The dialog only ever hands back something
    // the guardrail accepts, so a deliberate crop is not re-litigated.
    if (isCroppableImage(original)) {
      setPendingCrop(original);
      return;
    }

    void processFile(original);
  };

  const body = currentImageUrl ? (
    <div className="space-y-2">
      <Label>Hero Image (optional)</Label>
      <div className="relative rounded-lg border border-border overflow-hidden">
        <img src={currentImageUrl} alt="Story hero" className="w-full h-40 object-cover" />
        <div className="absolute top-2 right-2 flex gap-2">
          <Button type="button" size="sm" variant="secondary" onClick={() => fileInputRef.current?.click()}>
            Change
          </Button>
          <Button type="button" size="sm" variant="destructive" onClick={onRemove}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>
      <input
        ref={fileInputRef}
        type="file"
        accept={ACCEPT.story}
        onChange={handleFileSelect}
        className="hidden"
      />
    </div>
  ) : (
    <div className="space-y-2">
      <Label>Hero Image (optional)</Label>
      <button
        type="button"
        onClick={() => fileInputRef.current?.click()}
        disabled={isUploading}
        className="w-full border-2 border-dashed border-border rounded-lg p-6 hover:border-primary/50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <div className="flex flex-col items-center gap-2 text-muted-foreground">
          {isUploading ? (
            <>
              <Loader2 className="h-8 w-8 animate-spin" />
              <p className="text-sm">Uploading...</p>
            </>
          ) : (
            <>
              <ImagePlus className="h-8 w-8" />
              <p className="text-sm font-medium">Add Hero Image</p>
              <p className="text-xs">Landscape photos work best. Large images are auto-optimized (up to 25MB).</p>
            </>
          )}
        </div>
      </button>
      <input
        ref={fileInputRef}
        type="file"
        accept={ACCEPT.story}
        onChange={handleFileSelect}
        className="hidden"
      />
    </div>
  );

  return (
    <>
      {body}
      <ImageCropDialog
        file={pendingCrop}
        onComplete={(file) => {
          setPendingCrop(null);
          void processFile(file);
        }}
        onCancel={() => setPendingCrop(null)}
      />
    </>
  );
}
