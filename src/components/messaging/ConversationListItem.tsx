import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ConversationListItem as ConversationListItemType } from '@/types/messaging';
import { formatDistanceToNow } from 'date-fns';
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
 * Features: unread dot indicator, chevron navigation, clean divider styling
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

  const timeAgo = formatDistanceToNow(new Date(conversation.last_message_at), {
    addSuffix: false,
  });

  const isLastMessageFromSelf = conversation.last_message_sender_id === currentUserId;
  const hasUnread = conversation.unread_count > 0;

  return (
    <div
      className={cn(
        'flex items-center gap-3 px-4 py-3 cursor-pointer transition-colors',
        'border-b border-border/50',
        'hover:bg-accent/50 active:bg-accent',
        isActive && 'bg-accent'
      )}
      onClick={onClick}
    >
      {/* Unread indicator dot - DNA copper accent */}
      <div className="w-2.5 flex-shrink-0">
        {hasUnread && (
          <div className="w-2.5 h-2.5 rounded-full bg-dna-copper" />
        )}
      </div>

      {/* Avatar */}
      <Avatar className="h-12 w-12 flex-shrink-0">
        <AvatarImage
          src={conversation.other_user_avatar_url}
          alt={conversation.other_user_full_name}
        />
        <AvatarFallback className="bg-muted text-muted-foreground text-sm">
          {getInitials(conversation.other_user_full_name)}
        </AvatarFallback>
      </Avatar>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2 mb-0.5">
          <h3 className={cn(
            'font-semibold text-[15px] truncate',
            hasUnread ? 'text-foreground' : 'text-foreground'
          )}>
            {conversation.other_user_full_name}
          </h3>
          <div className="flex items-center gap-1 flex-shrink-0">
            <span className="text-xs text-muted-foreground">
              {timeAgo}
            </span>
            <ChevronRight className="h-4 w-4 text-muted-foreground/60" />
          </div>
        </div>

        {conversation.last_message_content && (
          <p
            className={cn(
              'text-sm truncate leading-snug',
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
