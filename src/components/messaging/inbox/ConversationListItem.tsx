import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';

interface ConversationListItemProps {
  conversation: {
    conversation_id: string;
    other_user_id: string;
    other_user_username: string;
    other_user_full_name: string;
    other_user_avatar_url: string;
    last_message_content: string | null;
    last_message_at: string | null;
    unread_count: number;
  };
  isSelected: boolean;
  onClick: () => void;
}

export const ConversationListItem: React.FC<ConversationListItemProps> = ({
  conversation,
  isSelected,
  onClick,
}) => {
  const hasUnread = conversation.unread_count > 0;
  
  const formatTime = (dateStr: string | null) => {
    if (!dateStr) return '';
    try {
      return formatDistanceToNow(new Date(dateStr), { addSuffix: false });
    } catch {
      return '';
    }
  };

  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full flex items-center gap-3 p-3 hover:bg-muted/50 transition-colors border-b border-border/50",
        isSelected && "bg-primary/10 border-l-2 border-l-primary",
        hasUnread && "bg-primary/5"
      )}
    >
      {/* Avatar */}
      <div className="relative flex-shrink-0">
        <Avatar className="h-12 w-12">
          <AvatarImage src={conversation.other_user_avatar_url} />
          <AvatarFallback className="bg-primary/10 text-primary font-semibold">
            {conversation.other_user_full_name?.charAt(0) || '?'}
          </AvatarFallback>
        </Avatar>
        {/* Online indicator - placeholder */}
        {/* <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-background" /> */}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0 text-left">
        <div className="flex items-center justify-between gap-2">
          <span className={cn(
            "font-medium truncate text-sm",
            hasUnread && "font-semibold text-foreground"
          )}>
            {conversation.other_user_full_name || 'Unknown User'}
          </span>
          <span className={cn(
            "text-xs flex-shrink-0",
            hasUnread ? "text-primary font-medium" : "text-muted-foreground"
          )}>
            {formatTime(conversation.last_message_at)}
          </span>
        </div>
        <div className="flex items-center justify-between gap-2 mt-0.5">
          <p className={cn(
            "text-sm truncate",
            hasUnread ? "text-foreground font-medium" : "text-muted-foreground"
          )}>
            {conversation.last_message_content || 'No messages yet'}
          </p>
          {hasUnread && (
            <Badge className="bg-primary text-primary-foreground h-5 min-w-5 flex items-center justify-center text-xs">
              {conversation.unread_count > 9 ? '9+' : conversation.unread_count}
            </Badge>
          )}
        </div>
      </div>
    </button>
  );
};
