/**
 * GroupMessageBubble - Message bubble with sender attribution for group chats
 * 
 * Shows sender name + avatar above the first bubble in a consecutive run.
 * Renders media (images/documents) inline. Shows read receipts on last message.
 */

import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { Clock, AlertCircle, Check, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { MessageMediaGrid } from './MessageMediaGrid';
import { DocumentChip } from './DocumentChip';
import { GroupReadReceipts } from './GroupReadReceipts';
import type { GroupMessage, ConversationParticipant } from '@/types/groupMessaging';

interface GroupMessageBubbleProps {
  message: GroupMessage;
  isOwn: boolean;
  showSenderInfo: boolean;
  onDelete?: (messageId: string) => void;
  onRetry?: (message: GroupMessage) => void;
  /** Whether this is the last message in a consecutive sender run (for read receipts) */
  isLastInRun?: boolean;
  /** Participants for read receipts */
  participants?: ConversationParticipant[];
}

export function GroupMessageBubble({
  message,
  isOwn,
  showSenderInfo,
  onDelete,
  onRetry,
  isLastInRun = false,
  participants = [],
}: GroupMessageBubbleProps) {
  const initials = message.sender_full_name
    .split(' ')
    .map(n => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  // Separate media types
  const images = (message.media_urls || []).filter(m => m.type === 'image');
  const documents = (message.media_urls || []).filter(m => m.type === 'document');

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
            <div className="w-7" />
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
          {/* Text content */}
          {message.content && <p className="whitespace-pre-wrap">{message.content}</p>}

          {/* Image grid */}
          {images.length > 0 && (
            <MessageMediaGrid media={images} isOwn={isOwn} />
          )}

          {/* Document chips */}
          {documents.map((doc, i) => (
            <DocumentChip key={i} doc={doc} isOwn={isOwn} />
          ))}

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
            {isOwn && (message._status === 'sent' || !message._status) && (
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

        {/* Group read receipts - only on last message in run for own messages */}
        {isOwn && isLastInRun && !message._status && participants.length > 0 && (
          <GroupReadReceipts
            messageCreatedAt={message.created_at}
            senderId={message.sender_id}
            participants={participants}
          />
        )}

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
