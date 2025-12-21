import React from 'react';
import { formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Pin, MessageCircle, Crown } from 'lucide-react';
import { FeedbackAttachmentDisplay } from './FeedbackAttachmentDisplay';
import { FeedbackAdminControls } from './FeedbackAdminControls';
import type { FeedbackMessageWithSender, FeedbackEmoji } from '@/types/feedback';
import {
  USER_TAG_LABELS,
  STATUS_LABELS,
  STATUS_COLORS,
  PRIORITY_LABELS,
  PRIORITY_COLORS,
  FEEDBACK_EMOJIS,
} from '@/types/feedback';
import { useFeedbackReactions } from '@/hooks/useFeedbackMessages';

interface FeedbackMessageProps {
  message: FeedbackMessageWithSender;
  channelId: string;
  isAdmin?: boolean;
  onReply?: (messageId: string) => void;
}

export function FeedbackMessage({
  message,
  channelId,
  isAdmin = false,
  onReply,
}: FeedbackMessageProps) {
  const { toggleReaction, isPending } = useFeedbackReactions(message.id, channelId);

  const senderName = message.sender?.full_name || message.sender?.username || 'Anonymous';
  const senderInitials = senderName.slice(0, 2).toUpperCase();
  const timeAgo = formatDistanceToNow(new Date(message.created_at), { addSuffix: true });

  const handleReaction = async (emoji: FeedbackEmoji) => {
    const isReacted = message.reactions?.[emoji]?.reacted_by_me || false;
    await toggleReaction(emoji, isReacted);
  };

  return (
    <div
      className={cn(
        'p-4 rounded-lg border bg-card transition-colors',
        message.is_pinned && 'border-amber-300 bg-amber-50/50',
        message.is_highlighted && 'border-orange-300 bg-orange-50/50'
      )}
    >
      {/* Pinned/Highlighted Badge */}
      {(message.is_pinned || message.is_highlighted) && (
        <div className="flex items-center gap-2 mb-2 text-sm">
          {message.is_pinned && (
            <span className="flex items-center gap-1 text-amber-600 font-medium">
              <Pin className="h-3 w-3" />
              PINNED
            </span>
          )}
          {message.is_highlighted && (
            <span className="text-orange-600 font-medium">HIGHLIGHTED</span>
          )}
          {(message.priority || message.admin_priority) && (
            <Badge className={cn('text-xs', PRIORITY_COLORS[(message.priority || message.admin_priority)!])}>
              {PRIORITY_LABELS[(message.priority || message.admin_priority)!]}
            </Badge>
          )}
        </div>
      )}

      {/* Header */}
      <div className="flex items-start gap-3">
        <Avatar className="h-10 w-10">
          <AvatarImage src={message.sender?.avatar_url || undefined} alt={senderName} />
          <AvatarFallback>{senderInitials}</AvatarFallback>
        </Avatar>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-semibold text-foreground">
              @{message.sender?.username || 'anonymous'}
            </span>
            {isAdmin && (
              <span className="flex items-center gap-1 text-amber-600 text-xs">
                <Crown className="h-3 w-3" />
                Admin
              </span>
            )}
            <span className="text-sm text-muted-foreground">{timeAgo}</span>
          </div>

          {/* Content */}
          <div className="mt-2 text-foreground whitespace-pre-wrap break-words">
            {message.content}
          </div>

          {/* Attachments */}
          {message.attachments && message.attachments.length > 0 && (
            <div className="mt-3 flex flex-col gap-2">
              {message.attachments.map((attachment) => (
                <FeedbackAttachmentDisplay
                  key={attachment.id}
                  attachment={attachment}
                />
              ))}
            </div>
          )}

          {/* User Tag */}
          {message.user_tag && (
            <div className="mt-2">
              <Badge variant="outline" className="text-xs">
                #{USER_TAG_LABELS[message.user_tag]}
              </Badge>
            </div>
          )}

          {/* Reactions */}
          <div className="mt-3 flex items-center gap-2 flex-wrap">
            {FEEDBACK_EMOJIS.map((emoji) => {
              const reaction = message.reactions?.[emoji];
              const count = reaction?.count || 0;
              const isReacted = reaction?.reacted_by_me || false;

              if (count === 0 && !isReacted) return null;

              return (
                <Button
                  key={emoji}
                  variant="ghost"
                  size="sm"
                  disabled={isPending}
                  onClick={() => handleReaction(emoji)}
                  className={cn(
                    'h-7 px-2 gap-1 text-sm',
                    isReacted && 'bg-primary/10 hover:bg-primary/20'
                  )}
                >
                  {emoji}
                  {count > 0 && <span>{count}</span>}
                </Button>
              );
            })}

            {/* Add reaction button */}
            <div className="flex items-center gap-1">
              {FEEDBACK_EMOJIS.map((emoji) => {
                const reaction = message.reactions?.[emoji];
                if (reaction && reaction.count > 0) return null;

                return (
                  <Button
                    key={emoji}
                    variant="ghost"
                    size="sm"
                    disabled={isPending}
                    onClick={() => handleReaction(emoji)}
                    className="h-7 w-7 p-0 opacity-50 hover:opacity-100"
                  >
                    {emoji}
                  </Button>
                );
              })}
            </div>
          </div>

          {/* Footer */}
          <div className="mt-3 flex items-center gap-3 flex-wrap">
            {/* Status Badge */}
            {(message.status || message.admin_status) && (
              <Badge className={cn('text-xs', STATUS_COLORS[(message.status || message.admin_status) as keyof typeof STATUS_COLORS] || 'bg-gray-100 text-gray-800')}>
                {STATUS_LABELS[(message.status || message.admin_status) as keyof typeof STATUS_LABELS] || message.status || message.admin_status}
              </Badge>
            )}

            {/* Reply Count */}
            {message.reply_count > 0 && (
              <button
                onClick={() => onReply?.(message.id)}
                className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
              >
                <MessageCircle className="h-4 w-4" />
                {message.reply_count} {message.reply_count === 1 ? 'reply' : 'replies'}
              </button>
            )}

            {/* Reply Button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onReply?.(message.id)}
              className="h-7 text-xs"
            >
              Reply
            </Button>

            {/* Admin Controls */}
            {isAdmin && (
              <div className="ml-auto">
                <FeedbackAdminControls message={message} channelId={channelId} />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
