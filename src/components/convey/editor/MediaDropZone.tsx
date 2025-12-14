import { useState, useCallback } from 'react';
import { Upload, Image, Video, FileText, X, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabaseClient } from '@/lib/supabaseHelpers';
import { toast } from 'sonner';

interface MediaDropZoneProps {
  onMediaInsert: (markdown: string) => void;
  isDragging: boolean;
  setIsDragging: (dragging: boolean) => void;
}

export function MediaDropZone({ onMediaInsert, isDragging, setIsDragging }: MediaDropZoneProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const uploadFile = useCallback(async (file: File): Promise<string | null> => {
    try {
      setIsUploading(true);
      setUploadProgress(0);

      // Validate file type
      const isImage = file.type.startsWith('image/');
      const isVideo = file.type.startsWith('video/');
      
      if (!isImage && !isVideo) {
        toast.error('Only images and videos are supported');
        return null;
      }

      // Validate file size (10MB for images, 50MB for videos)
      const maxSize = isVideo ? 50 * 1024 * 1024 : 10 * 1024 * 1024;
      if (file.size > maxSize) {
        toast.error(`File too large. Max size: ${isVideo ? '50MB' : '10MB'}`);
        return null;
      }

      // Generate unique filename
      const ext = file.name.split('.').pop();
      const fileName = `story-media/${Date.now()}-${Math.random().toString(36).substring(7)}.${ext}`;

      // Upload to Supabase Storage
      const { data, error } = await supabaseClient.storage
        .from('media')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false,
        });

      if (error) throw error;

      // Get public URL
      const { data: { publicUrl } } = supabaseClient.storage
        .from('media')
        .getPublicUrl(fileName);

      setUploadProgress(100);
      return publicUrl;
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Failed to upload file');
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
        accept="image/*,video/*"
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
