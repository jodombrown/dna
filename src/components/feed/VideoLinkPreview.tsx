/**
 * VideoLinkPreview Component
 * 
 * Displays a rich preview card for YouTube/Vimeo video links with:
 * - Thumbnail with play overlay
 * - Title and provider name
 * - Click opens video in lightbox for in-app playback
 */

import React, { useState, useMemo } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Play, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { VideoEmbedLightbox, getYouTubeThumbnail } from './VideoEmbedLightbox';

interface VideoEmbedData {
  url: string;
  title?: string;
  thumbnail_url?: string;
  provider_name?: string;
  author_name?: string;
  type?: string;
}

interface VideoLinkPreviewProps {
  embedData: VideoEmbedData;
  onRemove?: () => void;
  showRemoveButton?: boolean;
  className?: string;
  size?: 'compact' | 'full';
  /** If true, opens external link instead of lightbox (for composer preview) */
  disableLightbox?: boolean;
}

export const VideoLinkPreview: React.FC<VideoLinkPreviewProps> = ({
  embedData,
  onRemove,
  showRemoveButton = false,
  className,
  size = 'full',
  disableLightbox = false,
}) => {
  const [showLightbox, setShowLightbox] = useState(false);
  
  if (!embedData?.url) return null;

  // Get thumbnail - use provided or fallback to YouTube thumbnail from URL
  const thumbnailUrl = embedData.thumbnail_url || getYouTubeThumbnail(embedData.url);

  const handleClick = () => {
    if (disableLightbox) {
      window.open(embedData.url, '_blank', 'noopener,noreferrer');
    } else {
      setShowLightbox(true);
    }
  };

  const getDomain = (url: string) => {
    try {
      return new URL(url).hostname.replace('www.', '');
    } catch {
      return '';
    }
  };

  const isCompact = size === 'compact';

  return (
    <>
      <Card 
        className={cn(
          'relative overflow-hidden border border-border/50 cursor-pointer group',
          'hover:border-primary/30 transition-all duration-200',
          className
        )}
        onClick={handleClick}
      >
        {/* Remove button */}
        {showRemoveButton && onRemove && (
          <Button
            variant="destructive"
            size="icon"
            onClick={(e) => {
              e.stopPropagation();
              onRemove();
            }}
            className="absolute top-2 right-2 z-10 h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <X className="h-3.5 w-3.5" />
          </Button>
        )}

        <div className={cn('flex', isCompact ? 'flex-row' : 'flex-col')}>
          {/* Thumbnail with play overlay */}
          <div 
            className={cn(
              'relative bg-muted flex-shrink-0',
              isCompact ? 'w-32 h-20' : 'aspect-video w-full'
            )}
          >
            {thumbnailUrl ? (
              <img
                src={thumbnailUrl}
                alt={embedData.title || 'Video thumbnail'}
                className="w-full h-full object-cover"
                onError={(e) => {
                  // Hide broken image
                  e.currentTarget.style.display = 'none';
                }}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-muted">
                <Play className="h-8 w-8 text-muted-foreground" />
              </div>
            )}
            
            {/* Play button overlay with heartbeat pulse animation */}
            <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/30 transition-colors">
              <div className="w-12 h-12 rounded-full bg-primary/90 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform animate-heartbeat">
                <Play className="h-5 w-5 text-primary-foreground ml-0.5" fill="currentColor" />
              </div>
            </div>
          </div>

          {/* Metadata */}
          <div className={cn('p-3 flex-1 min-w-0', isCompact && 'py-2')}>
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                {embedData.title && (
                  <h4 className={cn(
                    'font-medium text-foreground line-clamp-2 group-hover:text-primary transition-colors',
                    isCompact ? 'text-sm' : 'text-base'
                  )}>
                    {embedData.title}
                  </h4>
                )}
                
                <div className="flex items-center gap-2 mt-1">
                  {embedData.provider_name && (
                    <span className="text-xs font-medium text-muted-foreground">
                      {embedData.provider_name}
                    </span>
                  )}
                  {embedData.author_name && (
                    <>
                      <span className="text-xs text-muted-foreground">•</span>
                      <span className="text-xs text-muted-foreground truncate">
                        {embedData.author_name}
                      </span>
                    </>
                  )}
                </div>

                <p className="text-xs text-muted-foreground/70 mt-1 truncate">
                  {getDomain(embedData.url)}
                </p>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Video Lightbox */}
      <VideoEmbedLightbox
        open={showLightbox}
        onOpenChange={setShowLightbox}
        videoUrl={embedData.url}
        title={embedData.title}
      />
    </>
  );
};
