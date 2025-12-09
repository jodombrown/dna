/**
 * DNA | FEED - Video Embed Lightbox
 * Modal for playing YouTube/Vimeo videos in-app without leaving the platform
 */

import React, { useMemo } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { X, ExternalLink } from 'lucide-react';

interface VideoEmbedLightboxProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  videoUrl: string;
  title?: string;
}

/**
 * Extract video ID and platform from URL
 */
function parseVideoUrl(url: string): { platform: 'youtube' | 'vimeo' | null; videoId: string | null } {
  // YouTube patterns
  const youtubePatterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/shorts\/)([a-zA-Z0-9_-]+)/,
  ];
  
  for (const pattern of youtubePatterns) {
    const match = url.match(pattern);
    if (match) {
      return { platform: 'youtube', videoId: match[1] };
    }
  }
  
  // Vimeo patterns
  const vimeoPattern = /vimeo\.com\/(?:video\/)?(\d+)/;
  const vimeoMatch = url.match(vimeoPattern);
  if (vimeoMatch) {
    return { platform: 'vimeo', videoId: vimeoMatch[1] };
  }
  
  return { platform: null, videoId: null };
}

export function VideoEmbedLightbox({ 
  open, 
  onOpenChange, 
  videoUrl, 
  title = 'Video' 
}: VideoEmbedLightboxProps) {
  const { platform, videoId } = useMemo(() => parseVideoUrl(videoUrl), [videoUrl]);

  const embedUrl = useMemo(() => {
    if (!videoId) return null;
    
    if (platform === 'youtube') {
      return `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0`;
    }
    
    if (platform === 'vimeo') {
      return `https://player.vimeo.com/video/${videoId}?autoplay=1`;
    }
    
    return null;
  }, [platform, videoId]);

  const handleOpenOriginal = () => {
    window.open(videoUrl, '_blank', 'noopener,noreferrer');
  };

  // If we can't parse the URL, just open externally
  if (!embedUrl) {
    if (open) {
      handleOpenOriginal();
      onOpenChange(false);
    }
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl w-[95vw] p-0 border-0 bg-black/95 overflow-hidden">
        {/* Close button */}
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-4 right-4 z-50 text-white hover:bg-white/20 rounded-full"
          onClick={() => onOpenChange(false)}
        >
          <X className="h-6 w-6" />
        </Button>

        {/* Open in new tab button */}
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-4 left-4 z-50 text-white hover:bg-white/20 rounded-full"
          onClick={handleOpenOriginal}
          title="Open on YouTube"
        >
          <ExternalLink className="h-5 w-5" />
        </Button>

        {/* Video iframe */}
        <div className="relative w-full pt-[56.25%]">
          <iframe
            src={embedUrl}
            title={title}
            className="absolute inset-0 w-full h-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}

/**
 * Helper to get YouTube thumbnail from video ID
 */
export function getYouTubeThumbnail(url: string): string | null {
  const { platform, videoId } = parseVideoUrl(url);
  
  if (platform === 'youtube' && videoId) {
    // Use maxresdefault for best quality, falls back to hqdefault
    return `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
  }
  
  return null;
}

/**
 * Helper to check if URL is a supported video platform
 */
export function isSupportedVideoUrl(url: string): boolean {
  const { platform } = parseVideoUrl(url);
  return platform !== null;
}
