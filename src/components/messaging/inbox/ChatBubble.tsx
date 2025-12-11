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

  return (
    <div className={cn(
      "group flex gap-2 px-4 py-1",
      isOwn ? "flex-row-reverse" : "flex-row"
    )}>
      {/* Avatar - Only for other user */}
      {!isOwn && showAvatar && (
        <Avatar className="h-8 w-8 flex-shrink-0">
          <AvatarImage src={message.sender_avatar_url} />
          <AvatarFallback className="bg-muted text-muted-foreground text-xs">
            {message.sender_full_name?.charAt(0) || '?'}
          </AvatarFallback>
        </Avatar>
      )}
      {!isOwn && !showAvatar && <div className="w-8" />}

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

      {/* Message Bubble */}
      <div className="flex flex-col gap-1 max-w-[70%]">
        <div className={cn(
          "rounded-2xl px-4 py-2",
          isOwn 
            ? "bg-primary text-primary-foreground rounded-tr-sm" 
            : "bg-muted rounded-tl-sm"
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

          {/* Timestamp and read receipt */}
          <div className={cn(
            "flex items-center gap-1 mt-1",
            isOwn ? "justify-end" : "justify-start"
          )}>
            <span className={cn(
              "text-[10px]",
              isOwn ? "text-primary-foreground/70" : "text-muted-foreground"
            )}>
              {formatTime(message.created_at)}
            </span>
            {isOwn && (
              message.is_read ? (
                <CheckCheck className="h-3 w-3 text-blue-400" />
              ) : (
                <Check className="h-3 w-3 text-primary-foreground/70" />
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
