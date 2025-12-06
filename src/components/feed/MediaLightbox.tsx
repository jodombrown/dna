/**
 * DNA | FEED - Media Lightbox
 * Full-screen modal for viewing images and videos from posts
 */

import React from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { X, Download, ExternalLink } from 'lucide-react';

interface MediaLightboxProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mediaUrl: string;
  alt?: string;
}

export function MediaLightbox({ open, onOpenChange, mediaUrl, alt = 'Media' }: MediaLightboxProps) {
  const isVideo = mediaUrl.match(/\.(mp4|webm|mov|quicktime)$/i);

  const handleDownload = async () => {
    try {
      const response = await fetch(mediaUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `dna-media-${Date.now()}.${isVideo ? 'mp4' : 'jpg'}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Download failed:', error);
    }
  };

  const handleOpenOriginal = () => {
    window.open(mediaUrl, '_blank');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[95vw] max-h-[95vh] p-0 border-0 bg-black/95 overflow-hidden">
        {/* Close button */}
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-4 right-4 z-50 text-white hover:bg-white/20 rounded-full"
          onClick={() => onOpenChange(false)}
        >
          <X className="h-6 w-6" />
        </Button>

        {/* Action buttons */}
        <div className="absolute top-4 left-4 z-50 flex gap-2">
          <Button
            variant="ghost"
            size="icon"
            className="text-white hover:bg-white/20 rounded-full"
            onClick={handleDownload}
            title="Download"
          >
            <Download className="h-5 w-5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="text-white hover:bg-white/20 rounded-full"
            onClick={handleOpenOriginal}
            title="Open original"
          >
            <ExternalLink className="h-5 w-5" />
          </Button>
        </div>

        {/* Media content */}
        <div className="flex items-center justify-center w-full h-full min-h-[50vh] p-4">
          {isVideo ? (
            <video
              src={mediaUrl}
              controls
              autoPlay
              className="max-w-full max-h-[85vh] object-contain"
            >
              Your browser does not support the video tag.
            </video>
          ) : (
            <img
              src={mediaUrl}
              alt={alt}
              className="max-w-full max-h-[85vh] object-contain cursor-zoom-out"
              onClick={() => onOpenChange(false)}
            />
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
