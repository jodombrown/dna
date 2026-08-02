import { useState, useCallback } from 'react';
import { Upload, Image, Video, FileText, X, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { uploadMedia, ACCEPT } from '@/lib/uploadMedia';
import { toast } from 'sonner';

interface MediaDropZoneProps {
  onMediaInsert: (markdown: string) => void;
  isDragging: boolean;
  setIsDragging: (dragging: boolean) => void;
}

/**
 * Supabase storage errors are often plain objects, not Error instances.
 * Surface the real message; fall back only when there is genuinely nothing.
 * Mirrors describeUploadError in EventCoverUpload.tsx — swallowing this error
 * silently is what hid the missing-bucket defect for months.
 */
function describeUploadError(error: unknown): string {
  if (error !== null && typeof error === 'object') {
    const e = error as { message?: unknown; error?: unknown; statusCode?: unknown };
    if (typeof e.message === 'string' && e.message.trim()) return e.message;
    const errPart = typeof e.error === 'string' && e.error.trim() ? e.error : undefined;
    const statusPart =
      typeof e.statusCode === 'string' || typeof e.statusCode === 'number'
        ? String(e.statusCode)
        : undefined;
    if (errPart && statusPart) return `${errPart} (status ${statusPart})`;
    if (errPart) return errPart;
    if (statusPart) return `Upload failed with status ${statusPart}`;
    try {
      const json = JSON.stringify(error);
      if (json && json !== '{}') return json;
    } catch {
      // fall through to generic fallback
    }
  }
  if (typeof error === 'string' && error.trim()) return error;
  return 'Please try again';
}

export function MediaDropZone({ onMediaInsert, isDragging, setIsDragging }: MediaDropZoneProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const uploadFile = useCallback(async (file: File): Promise<string | null> => {
    try {
      setIsUploading(true);
      setUploadProgress(0);

      const { url } = await uploadMedia(file, 'story');

      setUploadProgress(100);
      return url;
    } catch (error) {
      toast.error(`Failed to upload file: ${describeUploadError(error)}`);
      return null;
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  }, []);

  const handleDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const files = Array.from(e.dataTransfer.files);
    if (files.length === 0) return;

    for (const file of files) {
      const url = await uploadFile(file);
      if (url) {
        const isImage = file.type.startsWith('image/');
        const markdown = isImage 
          ? `![${file.name}](${url})`
          : `[Video: ${file.name}](${url})`;
        onMediaInsert(markdown);
        toast.success(`${isImage ? 'Image' : 'Video'} uploaded successfully`);
      }
    }
  }, [uploadFile, onMediaInsert, setIsDragging]);

  const handleFileSelect = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    for (const file of Array.from(files)) {
      const url = await uploadFile(file);
      if (url) {
        const isImage = file.type.startsWith('image/');
        const markdown = isImage 
          ? `![${file.name}](${url})`
          : `[Video: ${file.name}](${url})`;
        onMediaInsert(markdown);
        toast.success(`${isImage ? 'Image' : 'Video'} uploaded successfully`);
      }
    }

    // Reset input
    e.target.value = '';
  }, [uploadFile, onMediaInsert]);

  if (isDragging) {
    return (
      <div
        className="absolute inset-0 z-10 flex items-center justify-center bg-primary/5 border-2 border-dashed border-primary rounded-lg"
        onDragOver={(e) => e.preventDefault()}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
      >
        <div className="text-center">
          <Upload className="h-12 w-12 mx-auto text-primary mb-3" />
          <p className="text-lg font-medium text-primary">Drop to upload</p>
          <p className="text-sm text-muted-foreground">Images & videos supported</p>
        </div>
      </div>
    );
  }

  if (isUploading) {
    return (
      <div className="absolute bottom-4 right-4 z-10 flex items-center gap-2 px-4 py-2 bg-popover border border-border rounded-lg shadow-lg">
        <Loader2 className="h-4 w-4 animate-spin text-primary" />
        <span className="text-sm">Uploading... {uploadProgress}%</span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <input
        type="file"
        id="media-upload"
        className="hidden"
        accept={ACCEPT.story}
        multiple
        onChange={handleFileSelect}
      />
      <label htmlFor="media-upload">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="cursor-pointer"
          asChild
        >
          <span>
            <Upload className="h-4 w-4 mr-1" />
            Upload
          </span>
        </Button>
      </label>
    </div>
  );
}
