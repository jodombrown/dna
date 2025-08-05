import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { X, ExternalLink } from 'lucide-react';

interface EmbedMetadata {
  url: string;
  version: string;
  type: string;
  provider_name?: string;
  provider_url?: string;
  html?: string;
  width?: number;
  height?: number;
  title?: string;
  author_name?: string;
  author_url?: string;
  thumbnail_url?: string;
  thumbnail_width?: number;
  thumbnail_height?: number;
  cache_age?: number;
  fetched_at?: string;
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

  return (
    <Card className="border border-border overflow-hidden">
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
        
        {/* Rich embed with HTML */}
        {embedData.html && embedData.type === 'video' ? (
          <div className="aspect-video w-full">
            <div 
              dangerouslySetInnerHTML={{ __html: embedData.html }}
              className="w-full h-full [&_iframe]:w-full [&_iframe]:h-full [&_iframe]:border-0"
            />
          </div>
        ) : (
          /* Link preview card */
          <div className="flex">
            {embedData.thumbnail_url && (
              <div className="w-32 h-32 flex-shrink-0">
                <img 
                  src={embedData.thumbnail_url} 
                  alt={embedData.title || 'Preview'}
                  className="w-full h-full object-cover"
                />
              </div>
            )}
            <div className="flex-1 p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  {embedData.title && (
                    <h3 className="font-semibold text-foreground line-clamp-2 mb-1">
                      {embedData.title}
                    </h3>
                  )}
                  {embedData.author_name && (
                    <p className="text-sm text-muted-foreground mb-1">
                      by {embedData.author_name}
                    </p>
                  )}
                  {embedData.provider_name && (
                    <p className="text-xs text-muted-foreground mb-2">
                      {embedData.provider_name}
                    </p>
                  )}
                  <p className="text-xs text-muted-foreground truncate">
                    {embedData.url}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleOpenLink}
                  className="ml-2 flex-shrink-0"
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