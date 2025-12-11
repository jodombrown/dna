import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { Check, CheckCheck } from 'lucide-react';
import { MessageAttachment } from './MessageAttachment';
import { LinkPreview } from './LinkPreview';
import { useLinkPreview } from '@/hooks/useLinkPreview';

interface AttachmentData {
  type: 'image' | 'file';
  url: string;
  filename?: string;
  filesize?: number;
  mimetype?: string;
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
}

export const ChatBubble: React.FC<ChatBubbleProps> = ({
  message,
  isOwn,
  showAvatar = true,
}) => {
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

  return (
    <div className={cn(
      "flex gap-2 px-4 py-1",
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

      {/* Message Bubble */}
      <div className={cn(
        "max-w-[75%] rounded-2xl px-4 py-2",
        isOwn 
          ? "bg-primary text-primary-foreground rounded-tr-sm" 
          : "bg-muted rounded-tl-sm"
      )}>
        {/* Text content */}
        {message.content && (
          <p className="text-sm whitespace-pre-wrap break-words">{message.content}</p>
        )}

        {/* Attachment */}
        {attachment && (
          <MessageAttachment attachment={attachment} isOwn={isOwn} />
        )}

        {/* Link Preview - only show if no attachment and link detected */}
        {!attachment && linkPreview && linkPreview.url && (
          <LinkPreview preview={linkPreview} isOwn={isOwn} />
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
    </div>
  );
};
