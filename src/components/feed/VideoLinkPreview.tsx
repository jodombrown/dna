/**
 * VideoLinkPreview Component
 * 
 * Displays a rich preview card for YouTube/Vimeo video links with:
 * - Thumbnail with play overlay
 * - Title and provider name
 * - Click opens external site in new tab
 */

import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Play, X, ExternalLink } from 'lucide-react';
import { cn } from '@/lib/utils';

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
}

export const VideoLinkPreview: React.FC<VideoLinkPreviewProps> = ({
  embedData,
  onRemove,
  showRemoveButton = false,
  className,
  size = 'full',
}) => {
  if (!embedData?.url) return null;

  const handleOpenLink = () => {
    window.open(embedData.url, '_blank', 'noopener,noreferrer');
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
    <Card 
      className={cn(
        'relative overflow-hidden border border-border/50 cursor-pointer group',
        'hover:border-primary/30 transition-all duration-200',
        className
      )}
      onClick={handleOpenLink}
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
          {embedData.thumbnail_url ? (
            <img
              src={embedData.thumbnail_url}
              alt={embedData.title || 'Video thumbnail'}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-muted">
              <Play className="h-8 w-8 text-muted-foreground" />
            </div>
          )}
          
          {/* Play button overlay */}
          <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/30 transition-colors">
            <div className="w-12 h-12 rounded-full bg-primary/90 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
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

            <ExternalLink className="h-4 w-4 text-muted-foreground flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
        </div>
      </div>
    </Card>
  );
};
