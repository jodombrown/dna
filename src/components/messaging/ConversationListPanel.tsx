import React from 'react';
import { Card } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Loader2, Search } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface Conversation {
  id: string;
  last_message_at?: string;
  otherUser?: {
    full_name?: string;
    avatar_url?: string;
    headline?: string;
  };
}

interface ConversationListPanelProps {
  conversations?: Conversation[];
  isLoading: boolean;
  searchTerm: string;
  onSearchChange: (term: string) => void;
  selectedConversationId: string | null;
  onSelectConversation: (id: string) => void;
}

/**
 * ConversationListPanel - Left panel (35%) for MESSAGES_MODE
 * Lists all user conversations with search/filter
 */
const ConversationListPanel: React.FC<ConversationListPanelProps> = ({
  conversations,
  isLoading,
  searchTerm,
  onSearchChange,
  selectedConversationId,
  onSelectConversation,
}) => {
  const getInitials = (name: string) => {
    return name?.split(' ').map(n => n[0]).join('').toUpperCase() || '?';
  };

  const filteredConversations = conversations?.filter(conv =>
    conv.otherUser?.full_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Card className="flex flex-col h-full">
      {/* Search Header */}
      <div className="p-4 border-b">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            placeholder="Search conversations..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      {/* Conversation List */}
      <ScrollArea className="flex-1">
        {isLoading ? (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : filteredConversations?.length === 0 ? (
          <div className="p-6 text-center text-muted-foreground">
            <p>No conversations yet</p>
            <p className="text-sm mt-2">Start connecting with people!</p>
          </div>
        ) : (
          <div className="divide-y">
            {filteredConversations?.map((conversation) => (
              <button
                key={conversation.id}
                onClick={() => onSelectConversation(conversation.id)}
                className={`w-full p-4 hover:bg-accent transition-colors text-left ${
                  selectedConversationId === conversation.id ? 'bg-accent' : ''
                }`}
              >
                <div className="flex items-start gap-3">
                  <Avatar className="w-12 h-12">
                    <AvatarImage src={conversation.otherUser?.avatar_url || ''} />
                    <AvatarFallback className="bg-primary text-primary-foreground">
                      {getInitials(conversation.otherUser?.full_name || '')}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="font-semibold text-sm truncate">
                        {conversation.otherUser?.full_name}
                      </p>
                      {conversation.last_message_at && (
                        <span className="text-xs text-muted-foreground">
                          {formatDistanceToNow(new Date(conversation.last_message_at), { addSuffix: true })}
                        </span>
                      )}
                    </div>
                    {conversation.otherUser?.headline && (
                      <p className="text-xs text-muted-foreground truncate">
                        {conversation.otherUser.headline}
                      </p>
                    )}
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </ScrollArea>
    </Card>
  );
};

export default ConversationListPanel;
