import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { ConversationListItem as ConversationListItemType } from '@/types/messaging';
import { formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils';

interface ConversationListItemProps {
  conversation: ConversationListItemType;
  currentUserId: string;
  isActive?: boolean;
  onClick: () => void;
}

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
    addSuffix: true,
  });

  const isLastMessageFromSelf = conversation.last_message_sender_id === currentUserId;
  const hasUnread = conversation.unread_count > 0;

  return (
    <Card
      className={cn(
        'p-4 cursor-pointer hover:bg-accent transition-colors',
        isActive && 'bg-accent border-primary',
        hasUnread && 'border-l-4 border-l-primary'
      )}
      onClick={onClick}
    >
      <div className="flex gap-3">
        <Avatar className="h-12 w-12 flex-shrink-0">
          <AvatarImage
            src={conversation.other_user_avatar_url}
            alt={conversation.other_user_full_name}
          />
          <AvatarFallback className="bg-primary text-primary-foreground">
            {getInitials(conversation.other_user_full_name)}
          </AvatarFallback>
        </Avatar>

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1">
            <h3 className={cn('font-semibold truncate', hasUnread && 'text-primary')}>
              {conversation.other_user_full_name}
            </h3>
            {hasUnread && (
              <Badge className="ml-2 bg-primary hover:bg-primary/90 flex-shrink-0">
                {conversation.unread_count}
              </Badge>
            )}
          </div>

          {conversation.other_user_headline && (
            <p className="text-xs text-muted-foreground truncate mb-1">
              {conversation.other_user_headline}
            </p>
          )}

          {conversation.last_message_content && (
            <p
              className={cn(
                'text-sm truncate',
                hasUnread ? 'font-semibold text-foreground' : 'text-muted-foreground'
              )}
            >
              {isLastMessageFromSelf && 'You: '}
              {conversation.last_message_content}
            </p>
          )}

          <p className="text-xs text-muted-foreground mt-1">{timeAgo}</p>
        </div>
      </div>
    </Card>
  );
}
