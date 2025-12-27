import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ConversationListItem as ConversationListItemType } from '@/types/messaging';
import { formatDistanceToNow, isToday, isYesterday, format } from 'date-fns';
import { cn } from '@/lib/utils';
import { ChevronRight } from 'lucide-react';

interface ConversationListItemProps {
  conversation: ConversationListItemType;
  currentUserId: string;
  isActive?: boolean;
  onClick: () => void;
}

/**
 * Apple Messages-inspired conversation list item
 * Features: 
 * - Blue unread dot on left (like iOS)
 * - Large circular avatar
 * - Bold name with timestamp + chevron
 * - Message preview
 * - Subtle bottom divider
 */
export function ConversationListItem({
  conversation,
  currentUserId,
  isActive = false,
  onClick,
}: ConversationListItemProps) {
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  // Format time like iOS: "2:42 PM" for today, "Yesterday" for yesterday, or date
  const formatMessageTime = (dateString: string) => {
    const date = new Date(dateString);
    if (isToday(date)) {
      return format(date, 'h:mm a');
    } else if (isYesterday(date)) {
      return 'Yesterday';
    } else {
      return format(date, 'M/d/yy');
    }
  };

  const timeDisplay = formatMessageTime(conversation.last_message_at || new Date().toISOString());
  const isLastMessageFromSelf = conversation.last_message_sender_id === currentUserId;
  const hasUnread = conversation.unread_count > 0;

  return (
    <div
      className={cn(
        'relative flex items-center gap-3 pl-2 pr-3 py-3 cursor-pointer transition-colors',
        'hover:bg-muted/50 active:bg-muted',
        isActive && 'bg-muted'
      )}
      onClick={onClick}
    >
      {/* Unread indicator dot - iOS blue */}
      <div className="w-3 flex-shrink-0 flex justify-center">
        {hasUnread && (
          <div className="w-2.5 h-2.5 rounded-full bg-[#007AFF]" />
        )}
      </div>

      {/* Avatar - large and circular like iOS */}
      <Avatar className="h-14 w-14 flex-shrink-0">
        <AvatarImage
          src={conversation.other_user_avatar_url}
          alt={conversation.other_user_full_name}
          className="object-cover"
        />
        <AvatarFallback className="bg-[#C7C7CC] text-white text-base font-medium">
          {getInitials(conversation.other_user_full_name)}
        </AvatarFallback>
      </Avatar>

      {/* Content */}
      <div className="flex-1 min-w-0 border-b border-border/40 pb-3">
        <div className="flex items-center justify-between gap-2">
          <h3 className={cn(
            'text-[16px] truncate',
            hasUnread ? 'font-semibold text-foreground' : 'font-medium text-foreground'
          )}>
            {conversation.other_user_full_name}
          </h3>
          <div className="flex items-center gap-0.5 flex-shrink-0">
            <span className="text-[13px] text-muted-foreground">
              {timeDisplay}
            </span>
            <ChevronRight className="h-4 w-4 text-muted-foreground/50" />
          </div>
        </div>

        {conversation.last_message_content && (
          <p
            className={cn(
              'text-[15px] leading-snug mt-0.5 line-clamp-2',
              hasUnread ? 'font-medium text-foreground' : 'text-muted-foreground'
            )}
          >
            {isLastMessageFromSelf && (
              <span className="text-muted-foreground">You: </span>
            )}
            {conversation.last_message_content}
          </p>
        )}
      </div>
    </div>
  );
}
