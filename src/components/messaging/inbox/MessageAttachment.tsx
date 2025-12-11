import React from 'react';
import { FileText, Download, Image as ImageIcon, ExternalLink } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AttachmentData {
  type: 'image' | 'file';
  url: string;
  filename?: string;
  filesize?: number;
  mimetype?: string;
}

interface MessageAttachmentProps {
  attachment: AttachmentData;
  isOwn: boolean;
}

export const MessageAttachment: React.FC<MessageAttachmentProps> = ({
  attachment,
  isOwn,
}) => {
  const formatFileSize = (bytes?: number) => {
    if (!bytes) return '';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  if (attachment.type === 'image') {
    return (
      <a 
        href={attachment.url} 
        target="_blank" 
        rel="noopener noreferrer"
        className="block mt-2 rounded-lg overflow-hidden max-w-[280px]"
      >
        <img 
          src={attachment.url} 
          alt={attachment.filename || 'Image'} 
          className="w-full h-auto object-cover rounded-lg hover:opacity-90 transition-opacity"
          loading="lazy"
        />
      </a>
    );
  }

  // File attachment
  return (
    <a
      href={attachment.url}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(
        "flex items-center gap-3 mt-2 p-3 rounded-lg border transition-colors",
        isOwn 
          ? "bg-primary-foreground/10 border-primary-foreground/20 hover:bg-primary-foreground/20" 
          : "bg-background border-border hover:bg-muted"
      )}
    >
      <div className={cn(
        "p-2 rounded-lg",
        isOwn ? "bg-primary-foreground/20" : "bg-muted"
      )}>
        <FileText className={cn(
          "h-5 w-5",
          isOwn ? "text-primary-foreground" : "text-muted-foreground"
        )} />
      </div>
      <div className="flex-1 min-w-0">
        <p className={cn(
          "text-sm font-medium truncate",
          isOwn ? "text-primary-foreground" : "text-foreground"
        )}>
          {attachment.filename || 'File'}
        </p>
        {attachment.filesize && (
          <p className={cn(
            "text-xs",
            isOwn ? "text-primary-foreground/70" : "text-muted-foreground"
          )}>
            {formatFileSize(attachment.filesize)}
          </p>
        )}
      </div>
      <Download className={cn(
        "h-4 w-4 flex-shrink-0",
        isOwn ? "text-primary-foreground/70" : "text-muted-foreground"
      )} />
    </a>
  );
};
