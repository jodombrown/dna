import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { MessageWithSender } from '@/types/messaging';
import { formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils';

interface MessageBubbleProps {
  message: MessageWithSender;
  isOwnMessage: boolean;
  showAvatar?: boolean;
  showReadReceipt?: boolean;
  isRead?: boolean;
}

export function MessageBubble({ 
  message, 
  isOwnMessage, 
  showAvatar = true, 
  showReadReceipt = false,
  isRead = false 
}: MessageBubbleProps) {
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const timeAgo = formatDistanceToNow(new Date(message.created_at), { addSuffix: true });

  if (message.is_deleted) {
    return (
      <div className={cn('flex gap-3 mb-4', isOwnMessage && 'flex-row-reverse')}>
        {showAvatar && (
          <div className="w-8 h-8" />
        )}
        <div className={cn(
          'max-w-[70%] px-4 py-2 rounded-lg',
          'bg-muted text-muted-foreground italic'
        )}>
          <p className="text-sm">This message was deleted</p>
        </div>
      </div>
    );
  }

  return (
    <div className={cn('flex gap-3 mb-4', isOwnMessage && 'flex-row-reverse')}>
      {showAvatar && (
        <Avatar className="h-8 w-8 flex-shrink-0">
          <AvatarImage src={message.sender_avatar_url} alt={message.sender_full_name} />
          <AvatarFallback className="bg-primary text-white text-xs">
            {getInitials(message.sender_full_name)}
          </AvatarFallback>
        </Avatar>
      )}

      <div className={cn('flex flex-col', isOwnMessage ? 'items-end' : 'items-start')}>
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
        <div className="flex items-center gap-1 mt-1 px-1">
          <span className="text-xs text-muted-foreground">
            {timeAgo}
          </span>
          {showReadReceipt && isOwnMessage && (
            <span className="text-xs">
              {isRead ? (
                <span className="text-primary">✓✓</span>
              ) : (
                <span className="text-muted-foreground">✓</span>
              )}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
