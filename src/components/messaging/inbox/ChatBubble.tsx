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
        "flex gap-1.5 px-2 sm:px-3 py-0.5",
        isOwn ? "flex-row-reverse" : "flex-row"
      )}>
        {!isOwn && showAvatar && <div className="w-7 h-7" />}
        {!isOwn && !showAvatar && <div className="w-7" />}
        <div className="max-w-[88%] sm:max-w-[75%]">
          <div className={cn(
            "rounded-xl px-3 py-2 bg-muted",
            isOwn ? "rounded-br-sm" : "rounded-bl-sm"
          )}>
            <p className="text-sm text-muted-foreground italic">
              This message was deleted
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={cn(
      "group flex gap-1.5 px-2 sm:px-3 py-0.5",
      isOwn ? "flex-row-reverse" : "flex-row"
    )}>
      {/* Avatar - Only for other user, smaller on mobile */}
      {!isOwn && showAvatar && (
        <Avatar className="h-7 w-7 flex-shrink-0">
          <AvatarImage src={message.sender_avatar_url} />
          <AvatarFallback className="bg-muted text-muted-foreground text-[10px]">
            {message.sender_full_name?.charAt(0) || '?'}
          </AvatarFallback>
        </Avatar>
      )}
      {!isOwn && !showAvatar && <div className="w-7" />}

      {/* Message Actions Menu - appears on hover */}
      <div className={cn(
        "flex items-center gap-1",
        isOwn ? "order-first" : "order-last"
      )}>
        {/* Reaction trigger button - visible on hover */}
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

      {/* Message Bubble - WhatsApp-inspired styling */}
      <div className="flex flex-col gap-0.5 max-w-[88%] sm:max-w-[75%]">
        <div className={cn(
          "rounded-xl px-3 py-1.5",
          // WhatsApp-inspired colors: light green for sent, white for received
          isOwn 
            ? "bg-[#dcf8c6] dark:bg-emerald-800/80 text-foreground dark:text-white rounded-br-sm shadow-sm" 
            : "bg-white dark:bg-zinc-800 text-foreground rounded-bl-sm shadow-sm"
        )}>
          {/* Voice Message Player */}
          {isVoiceMessage && attachment?.url ? (
            <VoiceMessagePlayer url={attachment.url} duration={attachment.duration} isOwn={isOwn} />
          ) : (
            <>
              {/* Text content - hide raw URLs when link preview exists */}
              {message.content && (
                <p className="text-sm whitespace-pre-wrap break-words">
                  {linkPreview && linkPreview.url 
                    ? message.content.replace(linkPreview.url, '').trim() 
                    : message.content}
                </p>
              )}

              {/* Regular Attachment */}
              {attachment && !isVoiceMessage && (
                <MessageAttachment attachment={attachment} isOwn={isOwn} />
              )}

              {/* Link Preview - only show if no attachment and link detected */}
              {!attachment && linkPreview && linkPreview.url && (
                <LinkPreview preview={linkPreview} isOwn={isOwn} />
              )}
            </>
          )}

          {/* Timestamp and read receipt - WhatsApp style inline */}
          <div className={cn(
            "flex items-center gap-1 mt-0.5",
            "justify-end"
          )}>
            <span className="text-[10px] text-muted-foreground/70">
              {formatTime(message.created_at)}
            </span>
            {isOwn && (
              message.is_read ? (
                <CheckCheck className="h-3.5 w-3.5 text-blue-500" />
              ) : (
                <Check className="h-3.5 w-3.5 text-muted-foreground/60" />
              )
            )}
          </div>
        </div>

        {/* Existing Reactions - displayed below message */}
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
