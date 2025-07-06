import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Search, Star, Briefcase, Mail, Users, MessageCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface Conversation {
  id: string;
  user_1_id: string;
  user_2_id: string;
  last_message_at: string;
  other_user: {
    full_name: string;
    avatar_url: string;
  };
  latest_message: {
    content: string;
    is_read: boolean;
  };
}

interface MessagesListProps {
  onConversationSelect: (conversationId: string) => void;
  activeConversationId: string | null;
}

const MessagesList: React.FC<MessagesListProps> = ({ 
  onConversationSelect, 
  activeConversationId 
}) => {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');
  const [loading, setLoading] = useState(true);

  const filters = [
    { id: 'all', label: 'All', icon: MessageCircle },
    { id: 'focused', label: 'Focused', icon: Star },
    { id: 'starred', label: 'Starred', icon: Star },
    { id: 'jobs', label: 'Jobs', icon: Briefcase },
    { id: 'unread', label: 'Unread', icon: Mail },
    { id: 'connections', label: 'My Connections', icon: Users }
  ];

  useEffect(() => {
    if (user) {
      fetchConversations();
    }
  }, [user]);

  const fetchConversations = async () => {
    if (!user) return;

    try {
      // Fetch conversations where user is participant
      const { data: conversationsData, error } = await supabase
        .from('conversations')
        .select(`
          *,
          messages(content, is_read, created_at)
        `)
        .or(`user_1_id.eq.${user.id},user_2_id.eq.${user.id}`)
        .order('last_message_at', { ascending: false });

      if (error) throw error;

      // For each conversation, get the other user's profile
      const enrichedConversations = await Promise.all(
        (conversationsData || []).map(async (conv) => {
          const otherUserId = conv.user_1_id === user.id ? conv.user_2_id : conv.user_1_id;
          
          const { data: profileData } = await supabase
            .from('profiles')
            .select('full_name, avatar_url')
            .eq('id', otherUserId)
            .single();

          const latestMessage = conv.messages?.[0];

          return {
            id: conv.id,
            user_1_id: conv.user_1_id,
            user_2_id: conv.user_2_id,
            last_message_at: conv.last_message_at,
            other_user: {
              full_name: profileData?.full_name || 'Unknown User',
              avatar_url: profileData?.avatar_url || ''
            },
            latest_message: {
              content: latestMessage?.content || 'No messages yet',
              is_read: latestMessage?.is_read || true
            }
          };
        })
      );

      setConversations(enrichedConversations);
    } catch (error) {
      console.error('Error fetching conversations:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredConversations = conversations.filter(conv => {
    const matchesSearch = conv.other_user.full_name
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    
    if (activeFilter === 'unread') {
      return matchesSearch && !conv.latest_message.is_read;
    }
    
    return matchesSearch;
  });

  return (
    <div className="h-full flex flex-col">
      <CardHeader className="pb-4">
        <h2 className="text-xl font-semibold text-dna-forest">Messaging</h2>
        
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
          <div className="p-4 text-center text-gray-500">Loading conversations...</div>
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
                      {conversation.latest_message.content}
                    </p>
                    
                    <div className="flex items-center justify-between mt-2">
                      {!conversation.latest_message.is_read && (
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