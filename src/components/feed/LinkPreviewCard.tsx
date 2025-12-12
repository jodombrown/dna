/**
 * LinkPreviewCard Component
 * 
 * Universal link preview card that handles both video and article URLs.
 * Follows LinkedIn/Twitter patterns:
 * - Videos: Show thumbnail with play overlay, click opens lightbox
 * - Articles: Show large image + title + description + domain
 */

import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Play, X, ExternalLink, Globe } from 'lucide-react';
import { cn } from '@/lib/utils';
import { VideoEmbedLightbox, getYouTubeThumbnail } from './VideoEmbedLightbox';

interface LinkPreviewData {
  url: string;
  type?: 'article' | 'video' | 'image' | 'website' | 'rich' | string;
  title?: string;
  description?: string;
  image?: string;
  thumbnail_url?: string;
  site_name?: string;
  provider_name?: string;
  author?: string;
  author_name?: string;
  favicon?: string;
  is_video?: boolean;
}

interface LinkPreviewCardProps {
  data: LinkPreviewData;
  onRemove?: () => void;
  showRemoveButton?: boolean;
  className?: string;
  size?: 'compact' | 'full';
  /** If true, opens external link instead of lightbox for videos */
  disableLightbox?: boolean;
}

export const LinkPreviewCard: React.FC<LinkPreviewCardProps> = ({
  data,
  onRemove,
  showRemoveButton = false,
  className,
  size = 'full',
  disableLightbox = false,
}) => {
  const [showLightbox, setShowLightbox] = useState(false);
  
  if (!data?.url) return null;

  // Determine if this is a video
  const isVideo = data.type === 'video' || data.is_video || 
    /youtube\.com|youtu\.be|vimeo\.com/i.test(data.url);

  // Get the best available image
  const previewImage = data.thumbnail_url || data.image || 
    (isVideo ? getYouTubeThumbnail(data.url) : undefined);

  const authorName = data.author_name || data.author;
  const providerName = data.provider_name || data.site_name;
  const isCompact = size === 'compact';

  const getDomain = (url: string) => {
    try {
      return new URL(url).hostname.replace('www.', '');
    } catch {
      return '';
    }
  };

  const handleClick = () => {
    if (isVideo && !disableLightbox) {
      setShowLightbox(true);
    } else {
      window.open(data.url, '_blank', 'noopener,noreferrer');
    }
  };

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
          {/* Image/Thumbnail */}
          {previewImage && (
            <div 
              className={cn(
                'relative bg-muted flex-shrink-0 overflow-hidden',
                isCompact ? 'w-32 h-20' : 'aspect-video w-full max-h-64'
              )}
            >
              <img
                src={previewImage}
                alt={data.title || 'Preview'}
                className="w-full h-full object-cover"
                onError={(e) => {
                  // Hide broken image
                  (e.currentTarget.parentElement as HTMLElement).style.display = 'none';
                }}
              />
              
              {/* Play button overlay for videos */}
              {isVideo && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/30 transition-colors">
                  <div className="w-12 h-12 rounded-full bg-primary/90 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform animate-heartbeat">
                    <Play className="h-5 w-5 text-primary-foreground ml-0.5" fill="currentColor" />
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Metadata */}
          <div className={cn('p-3 flex-1 min-w-0', isCompact && 'py-2')}>
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                {/* Title */}
                {data.title && (
                  <h4 className={cn(
                    'font-medium text-foreground line-clamp-2 group-hover:text-primary transition-colors',
                    isCompact ? 'text-sm' : 'text-base'
                  )}>
                    {data.title}
                  </h4>
                )}
                
                {/* Description (for articles) */}
                {!isVideo && data.description && !isCompact && (
                  <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                    {data.description}
                  </p>
                )}
                
                {/* Provider/Author */}
                <div className="flex items-center gap-2 mt-1.5">
                  {/* Favicon */}
                  {data.favicon ? (
                    <img 
                      src={data.favicon} 
                      alt="" 
                      className="w-4 h-4 flex-shrink-0"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none';
                      }}
                    />
                  ) : (
                    <Globe className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                  )}
                  
                  <span className="text-xs font-medium text-muted-foreground">
                    {providerName || getDomain(data.url)}
                  </span>
                  
                  {authorName && (
                    <>
                      <span className="text-xs text-muted-foreground">•</span>
                      <span className="text-xs text-muted-foreground truncate">
                        {authorName}
                      </span>
                    </>
                  )}
                </div>
              </div>

              {/* External link button */}
              {!isVideo && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={(e) => {
                    e.stopPropagation();
                    window.open(data.url, '_blank', 'noopener,noreferrer');
                  }}
                  className="flex-shrink-0 h-8 w-8"
                >
                  <ExternalLink className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        </div>
      </Card>

      {/* Video Lightbox */}
      {isVideo && (
        <VideoEmbedLightbox
          open={showLightbox}
          onOpenChange={setShowLightbox}
          videoUrl={data.url}
          title={data.title}
        />
      )}
    </>
  );
};
