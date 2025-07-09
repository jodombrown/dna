import React, { useState } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { Search, Star, Briefcase, Mail, Users, MessageCircle, Loader2, Plus } from 'lucide-react';
import { useConversations } from '@/hooks/useMessaging';
import { NewConversationModal } from './NewConversationModal';

interface MessagesListProps {
  onConversationSelect: (conversationId: string) => void;
  activeConversationId: string | null;
}

const MessagesList: React.FC<MessagesListProps> = ({ 
  onConversationSelect, 
  activeConversationId 
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');
  const { conversations, loading, error } = useConversations();

  const filters = [
    { id: 'all', label: 'All', icon: MessageCircle },
    { id: 'focused', label: 'Focused', icon: Star },
    { id: 'starred', label: 'Starred', icon: Star },
    { id: 'jobs', label: 'Jobs', icon: Briefcase },
    { id: 'unread', label: 'Unread', icon: Mail },
    { id: 'connections', label: 'My Connections', icon: Users }
  ];

  const filteredConversations = conversations.filter(conv => {
    const matchesSearch = conv.other_user.full_name
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    
    if (activeFilter === 'unread') {
      return matchesSearch && conv.latest_message && !conv.latest_message.is_read;
    }
    
    return matchesSearch;
  });

  if (error) {
    return (
      <div className="h-full flex items-center justify-center p-4">
        <div className="text-center text-red-600">
          <p className="font-medium">Error loading conversations</p>
          <p className="text-sm">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-dna-forest">Messaging</h2>
          <Dialog>
            <DialogTrigger asChild>
              <Button size="sm" className="bg-dna-emerald hover:bg-dna-emerald/90">
                <Plus className="h-4 w-4 mr-1" />
                New
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <NewConversationModal onConversationCreated={onConversationSelect} />
            </DialogContent>
          </Dialog>
        </div>
        
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search messages..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-2">
          {filters.map((filter) => {
            const Icon = filter.icon;
            return (
              <Button
                key={filter.id}
                variant={activeFilter === filter.id ? "default" : "outline"}
                size="sm"
                onClick={() => setActiveFilter(filter.id)}
                className="text-xs"
              >
                <Icon className="h-3 w-3 mr-1" />
                {filter.label}
              </Button>
            );
          })}
        </div>
      </CardHeader>

      <CardContent className="flex-1 overflow-y-auto p-0">
        {loading ? (
          <div className="p-4 text-center">
            <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2 text-dna-emerald" />
            <p className="text-sm text-gray-600">Loading conversations...</p>
          </div>
        ) : filteredConversations.length === 0 ? (
          <div className="p-4 text-center text-gray-500">
            {searchQuery ? 'No conversations found' : 'No messages yet'}
          </div>
        ) : (
          <div className="space-y-1">
            {filteredConversations.map((conversation) => (
              <div
                key={conversation.id}
                onClick={() => onConversationSelect(conversation.id)}
                className={`p-4 cursor-pointer hover:bg-gray-50 border-l-4 transition-colors ${
                  activeConversationId === conversation.id
                    ? 'bg-dna-emerald/10 border-dna-emerald'
                    : 'border-transparent'
                }`}
              >
                <div className="flex items-start space-x-3">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={conversation.other_user.avatar_url} />
                    <AvatarFallback className="bg-dna-emerald text-white">
                      {conversation.other_user.full_name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h3 className="font-medium text-dna-forest truncate">
                        {conversation.other_user.full_name}
                      </h3>
                       <span className="text-xs text-gray-500">
                         {new Date(conversation.last_message_at).toLocaleDateString()}
                       </span>
                     </div>
                     
                     <p className="text-sm text-gray-600 truncate mt-1">
                       {conversation.latest_message?.content || 'No messages yet'}
                     </p>
                    
                     <div className="flex items-center justify-between mt-2">
                       {conversation.latest_message && !conversation.latest_message.is_read && (
                         <Badge variant="default" className="text-xs bg-dna-emerald">
                           New
                         </Badge>
                       )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </div>
  );
};

export default MessagesList;