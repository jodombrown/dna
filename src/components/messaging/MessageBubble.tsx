import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { MessageWithSender, MessageContentType } from '@/types/messaging';
import { formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils';
import { Check, CheckCheck, Image, FileText, Link2, AlertCircle } from 'lucide-react';

interface MessageBubbleProps {
  message: MessageWithSender;
  isOwnMessage: boolean;
  showAvatar?: boolean;
  showReadReceipt?: boolean;
  isRead?: boolean;
  isDelivered?: boolean;
}

/**
 * MessageBubble - Individual message display
 *
 * Implements PRD requirements:
 * - Right-aligned for self, left for others
 * - Read receipts: Single check=sent, double=delivered, blue=read
 * - Timestamps grouped by day, individual on hover
 * - Support for different content types (text, image, file, link_preview)
 */
export function MessageBubble({
  message,
  isOwnMessage,
  showAvatar = true,
  showReadReceipt = true,
  isRead = false,
  isDelivered = false,
}: MessageBubbleProps) {
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const timeAgo = formatDistanceToNow(new Date(message.created_at), {
    addSuffix: true,
  });

  // Render deleted message
  if (message.is_deleted) {
    return (
      <div className={cn('flex gap-3 mb-4', isOwnMessage && 'flex-row-reverse')}>
        {showAvatar && <div className="w-8 h-8" />}
        <div
          className={cn(
            'max-w-[70%] px-4 py-2 rounded-lg',
            'bg-muted text-muted-foreground italic'
          )}
        >
          <p className="text-sm">This message was deleted</p>
        </div>
      </div>
    );
  }

  // Render read receipt indicator
  const renderReadReceipt = () => {
    if (!showReadReceipt || !isOwnMessage) return null;

    if (isRead) {
      // Blue double check = read
      return (
        <span className="flex items-center text-primary" title="Read">
          <CheckCheck className="h-3.5 w-3.5" />
        </span>
      );
    } else if (isDelivered || message.delivered_at) {
      // Gray double check = delivered
      return (
        <span
          className="flex items-center text-muted-foreground"
          title="Delivered"
        >
          <CheckCheck className="h-3.5 w-3.5" />
        </span>
      );
    } else {
      // Single check = sent
      return (
        <span className="flex items-center text-muted-foreground" title="Sent">
          <Check className="h-3.5 w-3.5" />
        </span>
      );
    }
  };

  // Render content based on type
  const renderContent = () => {
    const contentType = message.content_type || 'text';
    const metadata = message.metadata || {};

    switch (contentType) {
      case 'image':
        return (
          <div className="space-y-2">
            {metadata.image_url && (
              <a
                href={metadata.image_url}
                target="_blank"
                rel="noopener noreferrer"
                className="block"
              >
                <img
                  src={metadata.thumbnail_url || metadata.image_url}
                  alt="Shared image"
                  className="max-w-full rounded-md max-h-64 object-cover"
                  style={{
                    width: metadata.width ? Math.min(metadata.width, 300) : 'auto',
                    height: metadata.height
                      ? Math.min(metadata.height, 256)
                      : 'auto',
                  }}
                />
              </a>
            )}
            {message.content && (
              <p className="text-sm whitespace-pre-wrap">{message.content}</p>
            )}
          </div>
        );

      case 'file':
        return (
          <div className="flex items-center gap-2 min-w-[200px]">
            <div className="p-2 bg-background/50 rounded">
              <FileText className="h-5 w-5 text-muted-foreground" />
            </div>
            <div className="flex-1 min-w-0">
              {metadata.file_url ? (
                <a
                  href={metadata.file_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm font-medium hover:underline truncate block"
                >
                  {metadata.file_name || 'Download file'}
                </a>
              ) : (
                <span className="text-sm font-medium truncate block">
                  {metadata.file_name || 'File'}
                </span>
              )}
              {metadata.file_size && (
                <span className="text-xs text-muted-foreground">
                  {formatFileSize(metadata.file_size)}
                </span>
              )}
            </div>
          </div>
        );

      case 'link_preview':
        return (
          <div className="space-y-2">
            {message.content && (
              <p className="text-sm whitespace-pre-wrap">{message.content}</p>
            )}
            {metadata.preview_url && (
              <a
                href={metadata.preview_url}
                target="_blank"
                rel="noopener noreferrer"
                className={cn(
                  'block rounded-md overflow-hidden border',
                  isOwnMessage ? 'border-primary-foreground/20' : 'border-border'
                )}
              >
                {metadata.preview_image && (
                  <img
                    src={metadata.preview_image}
                    alt=""
                    className="w-full h-32 object-cover"
                  />
                )}
                <div className="p-2 bg-background/50">
                  <p className="text-sm font-medium line-clamp-1">
                    {metadata.preview_title || metadata.preview_url}
                  </p>
                  {metadata.preview_description && (
                    <p className="text-xs text-muted-foreground line-clamp-2">
                      {metadata.preview_description}
                    </p>
                  )}
                  <div className="flex items-center gap-1 mt-1 text-xs text-muted-foreground">
                    <Link2 className="h-3 w-3" />
                    <span className="truncate">
                      {new URL(metadata.preview_url).hostname}
                    </span>
                  </div>
                </div>
              </a>
            )}
          </div>
        );

      case 'system':
        return (
          <div className="flex items-center gap-2 text-muted-foreground">
            <AlertCircle className="h-4 w-4" />
            <p className="text-sm italic">{message.content}</p>
          </div>
        );

      case 'text':
      default:
        return (
          <p className="text-sm whitespace-pre-wrap">{message.content}</p>
        );
    }
  };

  // System messages are centered
  if (message.content_type === 'system') {
    return (
      <div className="flex justify-center my-4">
        <div className="px-4 py-2 rounded-full bg-muted/50 text-muted-foreground text-sm">
          {message.content}
        </div>
      </div>
    );
  }

  return (
    <div className={cn('flex gap-3 mb-4', isOwnMessage && 'flex-row-reverse')}>
      {showAvatar && (
        <Avatar className="h-8 w-8 flex-shrink-0">
          <AvatarImage
            src={message.sender_avatar_url}
            alt={message.sender_full_name}
          />
          <AvatarFallback className="bg-primary text-white text-xs">
            {getInitials(message.sender_full_name)}
          </AvatarFallback>
        </Avatar>
      )}

      <div
        className={cn(
          'flex flex-col',
          isOwnMessage ? 'items-end' : 'items-start'
        )}
      >
        <div
          className={cn(
            'max-w-[70%] px-4 py-2 rounded-lg break-words',
            isOwnMessage
              ? 'bg-primary text-primary-foreground rounded-br-none'
              : 'bg-muted rounded-bl-none'
          )}
        >
          {renderContent()}
        </div>
        <div className="flex items-center gap-1.5 mt-1 px-1">
          <span className="text-xs text-muted-foreground">{timeAgo}</span>
          {renderReadReceipt()}
        </div>
      </div>
    </div>
  );
}

/**
 * Format file size in human-readable format
 */
function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1024 * 1024 * 1024)
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} GB`;
}

/**
 * Message group separator with date
 */
export const MessageDateSeparator: React.FC<{ date: Date }> = ({ date }) => {
  const isToday = new Date().toDateString() === date.toDateString();
  const isYesterday =
    new Date(Date.now() - 86400000).toDateString() === date.toDateString();

  let label: string;
  if (isToday) {
    label = 'Today';
  } else if (isYesterday) {
    label = 'Yesterday';
  } else {
    label = date.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'short',
      day: 'numeric',
    });
  }

  return (
    <div className="flex items-center justify-center my-4">
      <div className="flex-1 h-px bg-border" />
      <span className="px-3 text-xs text-muted-foreground">{label}</span>
      <div className="flex-1 h-px bg-border" />
    </div>
  );
};
