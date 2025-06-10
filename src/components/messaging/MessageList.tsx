
import React from 'react';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { Message } from '@/hooks/useMessages';
import { User, MessageSquare } from 'lucide-react';

interface MessageListProps {
  messages: Message[];
  currentUserId: string;
  onMessageClick: (messageId: string, senderId: string, recipientId: string) => void;
  showConversations: boolean;
}

const MessageList: React.FC<MessageListProps> = ({
  messages,
  currentUserId,
  onMessageClick,
  showConversations
}) => {
  if (messages.length === 0) {
    return (
      <div className="text-center py-8">
        <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-semibold mb-2">No Messages Yet</h3>
        <p className="text-gray-600">
          Start connecting with diaspora professionals to begin conversations.
        </p>
      </div>
    );
  }

  // Group messages by conversation if showing conversations
  const displayMessages = showConversations 
    ? getUniqueConversations(messages, currentUserId)
    : messages;

  return (
    <div className="space-y-3">
      {displayMessages.map((message) => {
        const isReceived = message.recipient_id === currentUserId;
        const isUnread = isReceived && !message.is_read;
        
        return (
          <div
            key={message.id}
            className={`p-4 border rounded-lg cursor-pointer transition-colors hover:bg-gray-50 ${
              isUnread ? 'bg-dna-emerald/5 border-dna-emerald/20' : 'bg-white'
            }`}
            onClick={() => onMessageClick(message.id, message.sender_id, message.recipient_id)}
          >
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-gray-500" />
                <span className="font-medium">
                  {isReceived ? 'From Professional' : 'To Professional'}
                </span>
                {isUnread && (
                  <Badge variant="secondary" className="bg-dna-copper text-white text-xs">
                    New
                  </Badge>
                )}
              </div>
              <span className="text-sm text-gray-500">
                {format(new Date(message.created_at), 'MMM d, h:mm a')}
              </span>
            </div>
            
            {message.subject && (
              <h4 className="font-medium text-gray-900 mb-1">{message.subject}</h4>
            )}
            
            <p className="text-gray-600 text-sm line-clamp-2">
              {message.content}
            </p>
            
            <div className="mt-2 flex items-center gap-2">
              <Badge variant="outline" className="text-xs">
                {isReceived ? 'Received' : 'Sent'}
              </Badge>
              {showConversations && (
                <Badge variant="outline" className="text-xs">
                  Conversation
                </Badge>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

// Helper function to get unique conversations
const getUniqueConversations = (messages: Message[], currentUserId: string) => {
  const conversationMap = new Map<string, Message>();
  
  messages.forEach(message => {
    const otherUserId = message.sender_id === currentUserId 
      ? message.recipient_id 
      : message.sender_id;
    
    const existing = conversationMap.get(otherUserId);
    if (!existing || new Date(message.created_at) > new Date(existing.created_at)) {
      conversationMap.set(otherUserId, message);
    }
  });
  
  return Array.from(conversationMap.values())
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
};

export default MessageList;
