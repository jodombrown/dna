import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { formatDistanceToNow } from 'date-fns';
import { useNavigate } from 'react-router-dom';

interface Conversation {
  conversation_id: string;
  other_user_id: string;
  other_user_username: string;
  other_user_full_name: string;
  other_user_avatar_url?: string;
  other_user_headline?: string;
  last_message_content?: string;
  last_message_sender_id?: string;
  last_message_at?: string;
  unread_count: number;
}

interface ConversationListProps {
  conversations: Conversation[];
  currentUserId?: string;
}

export const ConversationList: React.FC<ConversationListProps> = ({
  conversations,
  currentUserId,
}) => {
  const navigate = useNavigate();

  if (conversations.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <p>No conversations yet</p>
        <p className="text-sm mt-2">Start a conversation with your connections</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {conversations.map((conversation) => {
        const isUnread = conversation.unread_count > 0;
        const isSentByMe = conversation.last_message_sender_id === currentUserId;

        return (
          <Card
            key={conversation.conversation_id}
            className={`cursor-pointer transition-all hover:shadow-md ${
              isUnread ? 'bg-accent/5 border-dna-copper/20' : ''
            }`}
            onClick={() => navigate(`/dna/connect/messages/${conversation.conversation_id}`)}
          >
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <Avatar className="h-12 w-12">
                  <AvatarImage
                    src={conversation.other_user_avatar_url}
                    alt={conversation.other_user_full_name}
                  />
                  <AvatarFallback>
                    {conversation.other_user_full_name
                      .split(' ')
                      .map((n) => n[0])
                      .join('')
                      .slice(0, 2)}
                  </AvatarFallback>
                </Avatar>

                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <h3 className={`font-semibold truncate ${isUnread ? 'text-foreground' : ''}`}>
                      {conversation.other_user_full_name}
                    </h3>
                    {conversation.last_message_at && (
                      <span className="text-xs text-muted-foreground flex-shrink-0">
                        {formatDistanceToNow(new Date(conversation.last_message_at), {
                          addSuffix: true,
                        })}
                      </span>
                    )}
                  </div>

                  {conversation.other_user_headline && (
                    <p className="text-xs text-muted-foreground truncate mb-1">
                      {conversation.other_user_headline}
                    </p>
                  )}

                  {conversation.last_message_content && (
                    <div className="flex items-center gap-2">
                      <p
                        className={`text-sm truncate ${
                          isUnread ? 'font-medium text-foreground' : 'text-muted-foreground'
                        }`}
                      >
                        {isSentByMe && 'You: '}
                        {conversation.last_message_content}
                      </p>
                      {isUnread && (
                        <Badge variant="default" className="flex-shrink-0 h-5 min-w-5 px-1.5">
                          {conversation.unread_count}
                        </Badge>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};
