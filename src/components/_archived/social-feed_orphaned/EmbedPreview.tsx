import React, { useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { X, ExternalLink, Globe } from 'lucide-react';
import DOMPurify from 'dompurify';

interface EmbedMetadata {
  url: string;
  type?: 'article' | 'video' | 'image' | 'website' | 'rich' | string;
  title?: string;
  description?: string;
  image?: string;
  site_name?: string;
  author?: string;
  favicon?: string;
  // Video-specific
  html?: string;
  embed_html?: string;
  video_url?: string;
  thumbnail_url?: string;
  provider_name?: string;
  // Legacy compatibility
  author_name?: string;
  is_video?: boolean;
}

interface EmbedPreviewProps {
  embedData: EmbedMetadata;
  onRemove?: () => void;
  showRemoveButton?: boolean;
}

export const EmbedPreview: React.FC<EmbedPreviewProps> = ({ 
  embedData, 
  onRemove, 
  showRemoveButton = false 
}) => {
  if (!embedData) return null;

  const handleOpenLink = () => {
    window.open(embedData.url, '_blank', 'noopener,noreferrer');
  };

  // Determine the best image to show
  const previewImage = embedData.thumbnail_url || embedData.image;
  const rawEmbedHtml = embedData.embed_html || embedData.html;
  const isVideo = embedData.type === 'video' || embedData.is_video;
  const authorName = embedData.author_name || embedData.author;
  const providerName = embedData.provider_name || embedData.site_name;

  // Sanitize embed HTML to prevent XSS - only allow iframe tags with safe attributes
  const sanitizedEmbedHtml = useMemo(() => {
    if (!rawEmbedHtml) return null;
    return DOMPurify.sanitize(rawEmbedHtml, {
      ALLOWED_TAGS: ['iframe'],
      ALLOWED_ATTR: ['src', 'width', 'height', 'frameborder', 'allow', 'allowfullscreen', 'title', 'loading'],
      ALLOWED_URI_REGEXP: /^https:\/\/(www\.)?(youtube\.com|youtube-nocookie\.com|player\.vimeo\.com|platform\.twitter\.com|www\.tiktok\.com)/i,
    });
  }, [rawEmbedHtml]);

  // Get domain for display
  const getDomain = (url: string) => {
    try {
      const urlObj = new URL(url);
      return urlObj.hostname.replace('www.', '');
    } catch {
      return url;
    }
  };

  return (
    <Card className="border border-border overflow-hidden relative">
      <CardContent className="p-0">
        {showRemoveButton && onRemove && (
          <div className="absolute top-2 right-2 z-10">
            <Button
              variant="destructive"
              size="sm"
              onClick={onRemove}
              className="h-8 w-8 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        )}
        
        {/* Rich embed with HTML (for videos) - sanitized to prevent XSS */}
        {sanitizedEmbedHtml && isVideo ? (
          <div className="aspect-video w-full">
            <div
              dangerouslySetInnerHTML={{ __html: sanitizedEmbedHtml }}
              className="w-full h-full [&_iframe]:w-full [&_iframe]:h-full [&_iframe]:border-0"
            />
          </div>
        ) : (
          /* Link preview card - LinkedIn style */
          <div 
            className="cursor-pointer hover:bg-muted/50 transition-colors"
            onClick={handleOpenLink}
          >
            {/* Large image preview if available */}
            {previewImage && (
              <div className="w-full h-40 sm:h-48 overflow-hidden bg-muted">
                <img 
                  src={previewImage} 
                  alt={embedData.title || 'Preview'}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    // Hide broken images
                    (e.target as HTMLImageElement).style.display = 'none';
                  }}
                />
              </div>
            )}
            <div className="p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  {/* Title */}
                  {embedData.title && (
                    <h3 className="font-semibold text-foreground line-clamp-2 mb-1 text-base">
                      {embedData.title}
                    </h3>
                  )}
                  
                  {/* Description */}
                  {embedData.description && (
                    <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                      {embedData.description}
                    </p>
                  )}
                  
                  {/* Author */}
                  {authorName && (
                    <p className="text-sm text-muted-foreground mb-1">
                      by {authorName}
                    </p>
                  )}
                  
                  {/* Domain/Provider with favicon */}
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    {embedData.favicon ? (
                      <img 
                        src={embedData.favicon} 
                        alt="" 
                        className="w-4 h-4"
                        onError={(e) => {
                          // Replace with globe icon on error
                          (e.target as HTMLImageElement).style.display = 'none';
                        }}
                      />
                    ) : (
                      <Globe className="w-4 h-4" />
                    )}
                    <span>{providerName || getDomain(embedData.url)}</span>
                  </div>
                </div>
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleOpenLink();
                  }}
                  className="flex-shrink-0"
                >
                  <ExternalLink className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
