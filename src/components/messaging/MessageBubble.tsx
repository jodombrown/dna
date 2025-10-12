import React, { useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { formatDistanceToNow, format, isToday, isYesterday } from 'date-fns';
import { Check, CheckCheck } from 'lucide-react';

interface MessageBubbleProps {
  message: {
    id: string;
    content: string;
    created_at: string;
    read: boolean;
    sender?: {
      full_name?: string;
      avatar_url?: string;
    };
  };
  isMine: boolean;
  showSenderName?: boolean; // For group chats (future)
}

/**
 * MessageBubble - Individual message display component
 * 
 * Features:
 * - Different styling for own vs received messages
 * - Smart timestamp formatting (hover to see full)
 * - Delivery status indicators (sent, delivered, read)
 * - Sender avatar for received messages
 */
const MessageBubble: React.FC<MessageBubbleProps> = ({
  message,
  isMine,
  showSenderName = false,
}) => {
  const [showFullTimestamp, setShowFullTimestamp] = useState(false);

  const getInitials = (name: string) => {
    return name?.split(' ').map(n => n[0]).join('').toUpperCase() || '?';
  };

  const formatTimestamp = (dateString: string) => {
    const date = new Date(dateString);
    
    if (showFullTimestamp) {
      return format(date, 'PPp'); // Full date and time
    }
    
    if (isToday(date)) {
      return format(date, 'p'); // Just time
    }
    
    if (isYesterday(date)) {
      return `Yesterday ${format(date, 'p')}`;
    }
    
    return formatDistanceToNow(date, { addSuffix: true });
  };

  return (
    <div className={`flex gap-2 mb-3 ${isMine ? 'justify-end' : 'justify-start'}`}>
      {!isMine && (
        <Avatar className="w-8 h-8 flex-shrink-0">
          <AvatarImage src={message.sender?.avatar_url || ''} />
          <AvatarFallback className="bg-primary text-primary-foreground text-xs">
            {getInitials(message.sender?.full_name || '')}
          </AvatarFallback>
        </Avatar>
      )}
      
      <div className={`flex flex-col max-w-[70%] ${isMine ? 'items-end' : 'items-start'}`}>
        {showSenderName && !isMine && (
          <span className="text-xs text-muted-foreground mb-1 px-1">
            {message.sender?.full_name}
          </span>
        )}
        
        <div
          className={`rounded-2xl px-4 py-2 ${
            isMine
              ? 'bg-primary text-primary-foreground rounded-br-sm'
              : 'bg-accent text-accent-foreground rounded-bl-sm'
          }`}
          onMouseEnter={() => setShowFullTimestamp(true)}
          onMouseLeave={() => setShowFullTimestamp(false)}
        >
          <p className="text-sm whitespace-pre-wrap break-words">{message.content}</p>
        </div>
        
        <div className={`flex items-center gap-1 mt-1 px-1 ${isMine ? 'flex-row-reverse' : 'flex-row'}`}>
          <span className="text-xs text-muted-foreground">
            {formatTimestamp(message.created_at)}
          </span>
          
          {isMine && (
            <span className="text-muted-foreground">
              {message.read ? (
                <CheckCheck className="w-3 h-3" />
              ) : (
                <Check className="w-3 h-3" />
              )}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default MessageBubble;
