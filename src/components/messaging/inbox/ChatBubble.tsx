import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { Check, CheckCheck } from 'lucide-react';
import { MessageAttachment } from './MessageAttachment';
import { LinkPreview } from './LinkPreview';
import { useLinkPreview } from '@/hooks/useLinkPreview';
import { MessageActionsMenu } from './MessageActionsMenu';
import { MessageReactions } from './MessageReactions';
import { VoiceMessagePlayer } from './VoiceMessagePlayer';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { messageService, MessageReaction } from '@/services/messageService';

interface AttachmentData {
  type: 'image' | 'file' | 'voice' | 'video';
  url: string;
  filename?: string;
  filesize?: number;
  mimetype?: string;
  duration?: number;
  thumbnail_url?: string;
}

interface LinkPreviewData {
  url: string;
  title?: string;
  description?: string;
  image?: string;
  siteName?: string;
}

interface MessagePayload {
  attachment?: AttachmentData;
  linkPreview?: LinkPreviewData;
}

interface ChatBubbleProps {
  message: {
    message_id: string;
    content: string;
    created_at: string;
    sender_id: string;
    sender_avatar_url: string;
    sender_full_name: string;
    is_read?: boolean;
    is_deleted?: boolean;
    payload?: MessagePayload;
  };
  isOwn: boolean;
  showAvatar?: boolean;
  onDeleteMessage?: (messageId: string) => void;
}

export const ChatBubble: React.FC<ChatBubbleProps> = ({
  message,
  isOwn,
  showAvatar = true,
  onDeleteMessage,
}) => {
  const queryClient = useQueryClient();
  
  // Auto-detect links in message content
  const { previews } = useLinkPreview(message.content || '');
  
  const formatTime = (dateStr: string) => {
    try {
      return format(new Date(dateStr), 'h:mm a');
    } catch {
      return '';
    }
  };

  // Use payload link preview if available, otherwise use auto-detected
  const linkPreview = message.payload?.linkPreview || previews[0];
  const attachment = message.payload?.attachment;
  
  // Check if this is a voice message
  const isVoiceMessage = attachment?.type === 'voice' || 
    attachment?.mimetype?.startsWith('audio/') || 
    (attachment?.filename?.includes('voice-') && attachment?.type === 'file');

  // Fetch reactions for this message
  const { data: reactions = [] } = useQuery({
    queryKey: ['message-reactions', message.message_id],
    queryFn: () => messageService.getMessageReactions(message.message_id),
    staleTime: 30000,
  });

  // Add reaction mutation
  const addReactionMutation = useMutation({
    mutationFn: (emoji: string) => messageService.addReaction(message.message_id, emoji),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['message-reactions', message.message_id] });
    },
  });

  // Remove reaction mutation
  const removeReactionMutation = useMutation({
    mutationFn: (emoji: string) => messageService.removeReaction(message.message_id, emoji),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['message-reactions', message.message_id] });
    },
  });

  // Render deleted message placeholder
  if (message.is_deleted) {
    return (
      <div className={cn(
        "flex gap-1 px-2 py-px",
        isOwn ? "flex-row-reverse" : "flex-row"
      )}>
        {!isOwn && showAvatar && <div className="w-6 h-6" />}
        {!isOwn && !showAvatar && <div className="w-6" />}
        <div className="max-w-[85%]">
          <div className={cn(
            "rounded-2xl px-2.5 py-1.5 bg-muted/50",
            isOwn ? "rounded-br-md" : "rounded-bl-md"
          )}>
            <p className="text-xs text-muted-foreground italic">
              Message deleted
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={cn(
      "group flex gap-1 px-2 py-px",
      isOwn ? "flex-row-reverse" : "flex-row"
    )}>
      {/* Avatar - Compact for mobile */}
      {!isOwn && showAvatar && (
        <Avatar className="h-6 w-6 flex-shrink-0 mt-0.5">
          <AvatarImage src={message.sender_avatar_url} />
          <AvatarFallback className="bg-primary/10 text-primary text-[9px] font-medium">
            {message.sender_full_name?.charAt(0) || '?'}
          </AvatarFallback>
        </Avatar>
      )}
      {!isOwn && !showAvatar && <div className="w-6" />}

      {/* Message Actions - hover reveal */}
      <div className={cn(
        "flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity",
        isOwn ? "order-first" : "order-last"
      )}>
        <MessageReactions
          reactions={[]}
          onAddReaction={(emoji) => addReactionMutation.mutate(emoji)}
          onRemoveReaction={(emoji) => removeReactionMutation.mutate(emoji)}
          isOwn={isOwn}
          showTriggerOnly
        />
        <MessageActionsMenu
          messageId={message.message_id}
          content={message.content}
          isOwn={isOwn}
          onDelete={onDeleteMessage}
        />
      </div>

      {/* Message Bubble - DNA branded with tighter spacing */}
      <div className="flex flex-col gap-px max-w-[82%]">
        <div className={cn(
          "rounded-2xl px-2.5 py-1.5",
          isOwn 
            ? "bg-primary/15 dark:bg-primary/25 text-foreground rounded-br-md" 
            : "bg-card text-foreground rounded-bl-md border border-border/40 shadow-sm"
        )}>
          {/* Voice Message Player */}
          {isVoiceMessage && attachment?.url ? (
            <VoiceMessagePlayer url={attachment.url} duration={attachment.duration} isOwn={isOwn} />
          ) : (
            <>
              {/* Text content */}
              {message.content && (
                <p className="text-[13px] leading-snug whitespace-pre-wrap break-words">
                  {linkPreview && linkPreview.url 
                    ? message.content.replace(linkPreview.url, '').trim() 
                    : message.content}
                </p>
              )}

              {/* Regular Attachment */}
              {attachment && !isVoiceMessage && (
                <MessageAttachment attachment={attachment} isOwn={isOwn} />
              )}

              {/* Link Preview */}
              {!attachment && linkPreview && linkPreview.url && (
                <LinkPreview preview={linkPreview} isOwn={isOwn} />
              )}
            </>
          )}

          {/* Timestamp and read receipt - inline compact */}
          <div className="flex items-center gap-0.5 mt-0.5 justify-end">
            <span className="text-[9px] text-muted-foreground/60">
              {formatTime(message.created_at)}
            </span>
            {isOwn && (
              message.is_read ? (
                <CheckCheck className="h-3 w-3 text-primary" />
              ) : (
                <Check className="h-3 w-3 text-muted-foreground/50" />
              )
            )}
          </div>
        </div>

        {/* Reactions below message */}
        {reactions.length > 0 && (
          <MessageReactions
            reactions={reactions}
            onAddReaction={(emoji) => addReactionMutation.mutate(emoji)}
            onRemoveReaction={(emoji) => removeReactionMutation.mutate(emoji)}
            isOwn={isOwn}
          />
        )}
      </div>
    </div>
  );
};
