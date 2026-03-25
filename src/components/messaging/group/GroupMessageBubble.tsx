/**
 * GroupMessageBubble - Message bubble with sender attribution for group chats
 * 
 * Shows sender name + avatar above the first bubble in a consecutive run.
 * Own messages: right-aligned, primary background.
 * Others' messages: left-aligned, muted background.
 */

import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { Clock, AlertCircle, Check, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { GroupMessage } from '@/types/groupMessaging';

interface GroupMessageBubbleProps {
  message: GroupMessage;
  isOwn: boolean;
  showSenderInfo: boolean;
  onDelete?: (messageId: string) => void;
  onRetry?: (message: GroupMessage) => void;
}

export function GroupMessageBubble({
  message,
  isOwn,
  showSenderInfo,
  onDelete,
  onRetry,
}: GroupMessageBubbleProps) {
  const initials = message.sender_full_name
    .split(' ')
    .map(n => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  if (message.is_deleted) {
    return (
      <div className={cn('flex px-4 py-0.5', isOwn ? 'justify-end' : 'justify-start')}>
        <div className="max-w-[75%] px-3 py-1.5 rounded-lg bg-muted/50 italic text-xs text-muted-foreground">
          This message was deleted
        </div>
      </div>
    );
  }

  return (
    <div className={cn('flex px-4', isOwn ? 'justify-end' : 'justify-start', showSenderInfo ? 'mt-3' : 'mt-0.5')}>
      {/* Avatar for others' messages */}
      {!isOwn && (
        <div className="w-8 flex-shrink-0 mr-2">
          {showSenderInfo ? (
            <Avatar className="h-7 w-7">
              <AvatarImage src={message.sender_avatar_url} />
              <AvatarFallback className="text-[10px] bg-muted">
                {initials}
              </AvatarFallback>
            </Avatar>
          ) : (
            <div className="w-7" /> /* Spacer for alignment */
          )}
        </div>
      )}

      <div className={cn('max-w-[75%] min-w-0', isOwn ? 'items-end' : 'items-start')}>
        {/* Sender name */}
        {showSenderInfo && !isOwn && (
          <p className="text-xs font-medium text-muted-foreground mb-0.5 px-1">
            {message.sender_full_name}
          </p>
        )}

        {/* Bubble */}
        <div
          className={cn(
            'relative px-3 py-2 text-sm break-words group',
            isOwn
              ? 'bg-primary text-primary-foreground rounded-2xl rounded-br-sm'
              : 'bg-muted rounded-2xl rounded-bl-sm'
          )}
        >
          {message.content && <p className="whitespace-pre-wrap">{message.content}</p>}

          {/* Timestamp + status */}
          <div className={cn(
            'flex items-center gap-1 mt-1',
            isOwn ? 'justify-end' : 'justify-start'
          )}>
            <span className={cn(
              'text-[10px]',
              isOwn ? 'text-primary-foreground/60' : 'text-muted-foreground'
            )}>
              {format(new Date(message.created_at), 'HH:mm')}
            </span>

            {/* Message status indicators */}
            {isOwn && message._status === 'pending' && (
              <Clock className="h-3 w-3 text-primary-foreground/50" />
            )}
            {isOwn && message._status === 'sent' && (
              <Check className="h-3 w-3 text-primary-foreground/60" />
            )}
            {isOwn && !message._status && (
              <Check className="h-3 w-3 text-primary-foreground/60" />
            )}
          </div>

          {/* Delete button (own messages) */}
          {isOwn && onDelete && !message._status && (
            <Button
              variant="ghost"
              size="icon"
              className="absolute -left-8 top-1/2 -translate-y-1/2 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={() => onDelete(message.message_id)}
            >
              <Trash2 className="h-3 w-3 text-muted-foreground" />
            </Button>
          )}
        </div>

        {/* Failed state */}
        {message._status === 'failed' && (
          <button
            onClick={() => onRetry?.(message)}
            className="flex items-center gap-1 mt-1 text-destructive text-xs hover:underline"
          >
            <AlertCircle className="h-3 w-3" />
            Failed to send. Tap to retry.
          </button>
        )}
      </div>
    </div>
  );
}
