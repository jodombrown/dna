import React, { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Image, X, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FeedbackMediaUploadProps {
  onFilesSelected: (files: File[]) => void;
  selectedFiles: File[];
  onRemoveFile: (index: number) => void;
  disabled?: boolean;
  maxFiles?: number;
  maxSizeMB?: number;
}

export function FeedbackMediaUpload({
  onFilesSelected,
  selectedFiles,
  onRemoveFile,
  disabled = false,
  maxFiles = 5,
  maxSizeMB = 10,
}: FeedbackMediaUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Previews are derived from the selectedFiles prop rather than kept as
  // independent local state populated by async FileReader callbacks.
  // FileReader.onload for multiple simultaneously-selected files can
  // resolve out of order, so previews[index] wasn't guaranteed to
  // correspond to selectedFiles[index]; and if a parent ever mutated
  // selectedFiles other than through onRemoveFile, previews had no way to
  // notice and would silently go stale. Object URLs are synchronous and
  // index-stable, so this can't desync.
  const [previews, setPreviews] = useState<string[]>([]);

  useEffect(() => {
    const urls = selectedFiles.map((file) => URL.createObjectURL(file));
    setPreviews(urls);
    return () => {
      urls.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [selectedFiles]);

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);

    // Filter valid files
    const validFiles = files.filter((file) => {
      // Check size
      if (file.size > maxSizeMB * 1024 * 1024) {
        alert(`File ${file.name} is too large. Max size is ${maxSizeMB}MB.`);
        return false;
      }
      // Check if image
      if (!file.type.startsWith('image/')) {
        alert(`File ${file.name} is not an image.`);
        return false;
      }
      return true;
    });

    // Check total count
    const totalFiles = selectedFiles.length + validFiles.length;
    if (totalFiles > maxFiles) {
      alert(`You can only upload up to ${maxFiles} images.`);
      return;
    }

    onFilesSelected(validFiles);

    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleRemove = (index: number) => {
    onRemoveFile(index);
  };

  return (
    <div className="space-y-2">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        onChange={handleFileChange}
        className="hidden"
        disabled={disabled || selectedFiles.length >= maxFiles}
      />

      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={handleClick}
        disabled={disabled || selectedFiles.length >= maxFiles}
        className="h-8 px-2"
      >
        <Image className="h-4 w-4" />
      </Button>

      {/* Previews */}
      {previews.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {previews.map((preview, index) => (
            <div key={index} className="relative group">
              <img
                src={preview}
                alt={`Preview ${index + 1}`}
                className="h-16 w-16 object-cover rounded border"
              />
              <button
                type="button"
                onClick={() => handleRemove(index)}
                className="absolute -top-1 -right-1 bg-destructive text-destructive-foreground rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
