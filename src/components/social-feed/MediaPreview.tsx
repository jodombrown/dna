import React from 'react';
import { X, FileImage, FileVideo } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface MediaPreviewProps {
  file: File;
  preview: string;
  onRemove: () => void;
  uploading?: boolean;
}

export const MediaPreview: React.FC<MediaPreviewProps> = ({
  file,
  preview,
  onRemove,
  uploading = false
}) => {
  const isVideo = file.type.startsWith('video/');
  const isImage = file.type.startsWith('image/');

  return (
    <div className="relative inline-block">
      <div className="relative rounded-lg overflow-hidden border border-border bg-muted/30">
        {isImage && (
          <img
            src={preview}
            alt="Upload preview"
            className="max-w-xs max-h-32 object-cover"
          />
        )}
        
        {isVideo && (
          <div className="flex items-center space-x-2 p-4 min-w-[200px]">
            <FileVideo className="h-8 w-8 text-muted-foreground" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{file.name}</p>
              <p className="text-xs text-muted-foreground">
                {(file.size / (1024 * 1024)).toFixed(1)} MB
              </p>
            </div>
          </div>
        )}

        {!isImage && !isVideo && (
          <div className="flex items-center space-x-2 p-4 min-w-[200px]">
            <FileImage className="h-8 w-8 text-muted-foreground" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{file.name}</p>
              <p className="text-xs text-muted-foreground">
                {(file.size / (1024 * 1024)).toFixed(1)} MB
              </p>
            </div>
          </div>
        )}

        {uploading && (
          <div className="absolute inset-0 bg-background/80 flex items-center justify-center">
            <div className="flex items-center space-x-2">
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-primary border-t-transparent"></div>
              <span className="text-xs text-muted-foreground">Uploading...</span>
            </div>
          </div>
        )}
      </div>

      <Button
        onClick={onRemove}
        variant="destructive"
        size="sm"
        className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0"
        disabled={uploading}
      >
        <X className="h-3 w-3" />
      </Button>
    </div>
  );
};