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
        'group rounded-xl border transition-all duration-200',
        'bg-card hover:shadow-sm',
        message.is_pinned && 'border-amber-200 dark:border-amber-800 bg-amber-50/30 dark:bg-amber-950/20',
        message.is_highlighted && 'border-orange-200 dark:border-orange-800 bg-orange-50/30 dark:bg-orange-950/20',
        !message.is_pinned && !message.is_highlighted && 'border-border/60'
      )}
    >
      {/* Pinned indicator */}
      {message.is_pinned && (
        <div className="flex items-center gap-1.5 px-4 pt-2.5 text-xs text-amber-600 dark:text-amber-400 font-medium">
          <Pin className="h-3 w-3" />
          Pinned
          {message.priority && (
            <Badge className={cn('text-[10px] ml-1 h-4', PRIORITY_COLORS[message.priority])}>
              {PRIORITY_LABELS[message.priority]}
            </Badge>
          )}
        </div>
      )}

      <div className="p-4">
        {/* Header */}
        <div className="flex items-start gap-3">
          <Avatar className="h-9 w-9 ring-2 ring-background shadow-sm">
            <AvatarImage src={message.sender?.avatar_url || undefined} alt={senderName} />
            <AvatarFallback className="text-xs font-medium bg-primary/10 text-primary">{senderInitials}</AvatarFallback>
          </Avatar>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="font-semibold text-sm text-foreground">
                @{message.sender?.username || 'anonymous'}
              </span>
              {isAdmin && (
                <span className="inline-flex items-center gap-0.5 text-amber-600 dark:text-amber-400">
                  <Crown className="h-3 w-3" />
                </span>
              )}
              {message.user_tag && (
                <Badge variant="secondary" className="text-[10px] h-4 px-1.5 font-normal">
                  #{USER_TAG_LABELS[message.user_tag]}
                </Badge>
              )}
              <span className="text-xs text-muted-foreground ml-auto">{timeAgo}</span>
            </div>

            {/* Content */}
            <div className="mt-1.5 text-sm text-foreground/90 whitespace-pre-wrap break-words leading-relaxed">
              {message.content}
            </div>

            {/* Attachments */}
            {message.attachments && message.attachments.length > 0 && (
              <div className="mt-2.5 flex flex-col gap-2">
                {message.attachments.map((attachment) => (
                  <FeedbackAttachmentDisplay
                    key={attachment.id}
                    attachment={attachment}
                  />
                ))}
              </div>
            )}

            {/* Reactions + Actions Row */}
            <div className="mt-2.5 flex items-center gap-1 flex-wrap">
              {/* Existing reactions */}
              {FEEDBACK_EMOJIS.map((emoji) => {
                const reaction = message.reactions?.[emoji];
                const count = reaction?.count || 0;
                const isReacted = reaction?.reacted_by_me || false;
                if (count === 0 && !isReacted) return null;

                return (
                  <button
                    key={emoji}
                    disabled={isPending}
                    onClick={() => handleReaction(emoji)}
                    className={cn(
                      'inline-flex items-center gap-1 h-7 px-2 rounded-full text-xs transition-colors',
                      'border',
                      isReacted
                        ? 'bg-primary/10 border-primary/30 text-primary'
                        : 'bg-muted/50 border-border/50 text-muted-foreground hover:bg-muted'
                    )}
                  >
                    {emoji}
                    {count > 0 && <span className="font-medium">{count}</span>}
                  </button>
                );
              })}

              {/* Add reaction - hidden emoji pills */}
              <div className="hidden group-hover:flex items-center gap-0.5">
                {FEEDBACK_EMOJIS.map((emoji) => {
                  const reaction = message.reactions?.[emoji];
                  if (reaction && reaction.count > 0) return null;
                  return (
                    <button
                      key={emoji}
                      disabled={isPending}
                      onClick={() => handleReaction(emoji)}
                      className="h-6 w-6 rounded-full flex items-center justify-center text-xs opacity-40 hover:opacity-100 hover:bg-muted transition-all"
                    >
                      {emoji}
                    </button>
                  );
                })}
              </div>

              {/* Status badge */}
              {message.status && (
                <Badge className={cn('text-[10px] h-5 ml-1', STATUS_COLORS[message.status])}>
                  {STATUS_LABELS[message.status]}
                </Badge>
              )}

              {/* Spacer */}
              <div className="flex-1" />

              {/* Reply count / button */}
              {message.reply_count > 0 ? (
                <button
                  onClick={() => onReply?.(message.id)}
                  className="inline-flex items-center gap-1 text-xs text-primary hover:text-primary/80 font-medium transition-colors"
                >
                  <MessageCircle className="h-3.5 w-3.5" />
                  {message.reply_count} {message.reply_count === 1 ? 'reply' : 'replies'}
                </button>
              ) : (
                <button
                  onClick={() => onReply?.(message.id)}
                  className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground opacity-0 group-hover:opacity-100 transition-all"
                >
                  <MessageCircle className="h-3.5 w-3.5" />
                  Reply
                </button>
              )}

              {/* Admin Controls */}
              {isAdmin && (
                <FeedbackAdminControls message={message} channelId={channelId} />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
