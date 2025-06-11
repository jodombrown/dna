
import React from 'react';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ConversationSummary } from '@/hooks/useEnhancedMessages';
import { User, MessageSquare } from 'lucide-react';

interface ConversationListProps {
  conversations: ConversationSummary[];
  onConversationClick: (otherUserId: string) => void;
}

const ConversationList: React.FC<ConversationListProps> = ({
  conversations,
  onConversationClick
}) => {
  if (conversations.length === 0) {
    return (
      <div className="text-center py-8">
        <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-semibold mb-2">No Conversations Yet</h3>
        <p className="text-gray-600">
          Start connecting with diaspora professionals to begin conversations.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {conversations.map((conversation) => (
        <div
          key={conversation.otherUserId}
          className={`p-4 border rounded-lg cursor-pointer transition-colors hover:bg-gray-50 ${
            conversation.unreadCount > 0 ? 'bg-dna-emerald/5 border-dna-emerald/20' : 'bg-white'
          }`}
          onClick={() => onConversationClick(conversation.otherUserId)}
        >
          <div className="flex items-start gap-3">
            <Avatar className="w-10 h-10">
              <AvatarFallback>
                <User className="w-5 h-5" />
              </AvatarFallback>
            </Avatar>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-1">
                <h4 className="font-medium text-gray-900 truncate">
                  {conversation.otherUserName || 'Professional'}
                </h4>
                <div className="flex items-center gap-2">
                  {conversation.unreadCount > 0 && (
                    <Badge variant="secondary" className="bg-dna-copper text-white text-xs">
                      {conversation.unreadCount}
                    </Badge>
                  )}
                  <span className="text-sm text-gray-500">
                    {format(new Date(conversation.lastMessage.created_at), 'MMM d')}
                  </span>
                </div>
              </div>
              
              <p className="text-gray-600 text-sm line-clamp-2">
                {conversation.lastMessage.content}
              </p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ConversationList;
