import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { MessageWithSender } from '@/services/messageService';
import { formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils';
import { Check, CheckCheck } from 'lucide-react';

interface MessageBubbleProps {
  message: MessageWithSender;
  isOwnMessage: boolean;
  showAvatar?: boolean;
  showReadReceipt?: boolean;
  isRead?: boolean;
  isDelivered?: boolean;
}

/**
 * MessageBubble - Individual message display (simplified)
 */
export function MessageBubble({
  message,
  isOwnMessage,
  showAvatar = true,
  showReadReceipt = false,
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
      return (
        <span className="flex items-center text-primary" title="Read">
          <CheckCheck className="h-3.5 w-3.5" />
        </span>
      );
    } else if (isDelivered) {
      return (
        <span className="flex items-center text-muted-foreground" title="Delivered">
          <CheckCheck className="h-3.5 w-3.5" />
        </span>
      );
    } else {
      return (
        <span className="flex items-center text-muted-foreground" title="Sent">
          <Check className="h-3.5 w-3.5" />
        </span>
      );
    }
  };

  return (
    <div className={cn('flex gap-3 mb-4', isOwnMessage && 'flex-row-reverse')}>
      {showAvatar && (
        <Avatar className="h-8 w-8 flex-shrink-0">
          <AvatarImage
            src={message.sender_avatar_url || ''}
            alt={message.sender_full_name}
          />
          <AvatarFallback className="bg-primary text-white text-xs">
            {getInitials(message.sender_full_name || '?')}
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
          <p className="text-sm whitespace-pre-wrap">{message.content}</p>
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
