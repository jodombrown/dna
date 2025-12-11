import React from 'react';
import { ExternalLink, Globe } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LinkPreviewData {
  url: string;
  title?: string;
  description?: string;
  image?: string;
  siteName?: string;
}

interface LinkPreviewProps {
  preview: LinkPreviewData;
  isOwn: boolean;
}

export const LinkPreview: React.FC<LinkPreviewProps> = ({
  preview,
  isOwn,
}) => {
  const getDomain = (url: string) => {
    try {
      return new URL(url).hostname.replace('www.', '');
    } catch {
      return url;
    }
  };

  return (
    <a
      href={preview.url}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(
        "block mt-2 rounded-lg border overflow-hidden transition-all hover:shadow-md",
        isOwn 
          ? "bg-primary-foreground/10 border-primary-foreground/20" 
          : "bg-background border-border"
      )}
    >
      {preview.image && (
        <div className="w-full h-32 overflow-hidden">
          <img 
            src={preview.image} 
            alt={preview.title || 'Link preview'} 
            className="w-full h-full object-cover"
            loading="lazy"
          />
        </div>
      )}
      <div className="p-3">
        <div className={cn(
          "flex items-center gap-1 text-xs mb-1",
          isOwn ? "text-primary-foreground/60" : "text-muted-foreground"
        )}>
          <Globe className="h-3 w-3" />
          <span>{preview.siteName || getDomain(preview.url)}</span>
        </div>
        {preview.title && (
          <p className={cn(
            "text-sm font-medium line-clamp-2",
            isOwn ? "text-primary-foreground" : "text-foreground"
          )}>
            {preview.title}
          </p>
        )}
        {preview.description && (
          <p className={cn(
            "text-xs line-clamp-2 mt-1",
            isOwn ? "text-primary-foreground/70" : "text-muted-foreground"
          )}>
            {preview.description}
          </p>
        )}
      </div>
    </a>
  );
};
