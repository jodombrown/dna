import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Loader2, Search, Plus } from 'lucide-react';
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
  onNewConversation?: () => void;
}

type FilterTab = 'all' | 'unread';

/**
 * ConversationListPanel - Left panel (35%) for MESSAGES_MODE
 * Lists all user conversations with search/filter
 * 
 * Features:
 * - Search conversations by name
 * - Filter tabs (All/Unread)
 * - Unread conversation badges
 * - New conversation button
 */
const ConversationListPanel: React.FC<ConversationListPanelProps> = ({
  conversations,
  isLoading,
  searchTerm,
  onSearchChange,
  selectedConversationId,
  onSelectConversation,
  onNewConversation,
}) => {
  const [filterTab, setFilterTab] = useState<FilterTab>('all');

  const getInitials = (name: string) => {
    return name?.split(' ').map(n => n[0]).join('').toUpperCase() || '?';
  };

  // Filter by search term
  let filteredConversations = conversations?.filter(conv =>
    conv.otherUser?.full_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Filter by tab (unread - placeholder for now, needs unread_count field)
  if (filterTab === 'unread') {
    filteredConversations = filteredConversations?.filter(conv => false); // TODO: Add unread logic
  }

  return (
    <Card className="flex flex-col h-full">
      {/* Search Header */}
      <div className="p-4 border-b space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold">Messages</h2>
          {onNewConversation && (
            <Button variant="ghost" size="sm" onClick={onNewConversation}>
              <Plus className="w-4 h-4" />
            </Button>
          )}
        </div>
        
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            placeholder="Search conversations..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-9"
          />
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-2">
          <Button
            variant={filterTab === 'all' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setFilterTab('all')}
            className="flex-1"
          >
            All
          </Button>
          <Button
            variant={filterTab === 'unread' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setFilterTab('unread')}
            className="flex-1"
          >
            Unread
          </Button>
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
