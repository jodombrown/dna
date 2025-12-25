import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ConversationListItem as ConversationListItemComponent } from '@/components/messaging/ConversationListItem';
import { ConversationView } from '@/components/messaging/ConversationView';
import { Input } from '@/components/ui/input';
import { ConversationListItem } from '@/types/messaging';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useParams, useNavigate } from 'react-router-dom';
import { Search, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Profile } from '@/services/profilesService';

interface DashboardMessagesColumnProps {
  profile: Profile;
  isOwnProfile: boolean;
}

export default function DashboardMessagesColumn({ profile, isOwnProfile }: DashboardMessagesColumnProps) {
  const { conversationId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedConversation, setSelectedConversation] = useState<ConversationListItem | null>(null);

  const { data: conversations, refetch } = useQuery({
    queryKey: ['user-conversations', user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase.rpc('get_user_conversations', {
        p_user_id: user.id,
        p_limit: 50,
        p_offset: 0,
      });

      if (error) throw error;
      return (data || []) as ConversationListItem[];
    },
    enabled: !!user,
  });

  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel('user_conversations')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'messages',
        },
        () => {
          refetch();
        }
      )
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, [user, refetch]);

  useEffect(() => {
    if (conversationId && conversations) {
      const conversation = conversations.find((c) => c.conversation_id === conversationId);
      if (conversation) {
        setSelectedConversation(conversation);
      }
    }
  }, [conversationId, conversations]);

  const handleSelectConversation = (conversation: ConversationListItem) => {
    setSelectedConversation(conversation);
    navigate(`/dna/messages/${conversation.conversation_id}`);
  };

  const handleBack = () => {
    setSelectedConversation(null);
    navigate('/dna/messages');
  };

  const filteredConversations = conversations?.filter((c) =>
    c.other_user_full_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-4 h-full flex flex-col">
      <div>
        <h2 className="text-2xl font-bold mb-1">Messages</h2>
        <p className="text-sm text-muted-foreground">Connect with your network</p>
      </div>

      {!selectedConversation ? (
        <>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search conversations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          <div className="flex-1 overflow-y-auto space-y-2">
            {!conversations ? (
              <div className="text-center py-12 text-muted-foreground">
                Loading conversations...
              </div>
            ) : filteredConversations?.length === 0 ? (
              <div className="text-center py-12">
                <MessageCircle className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
                <h3 className="text-base font-semibold mb-1">
                  {searchQuery ? 'No conversations found' : 'No messages yet'}
                </h3>
                <p className="text-sm text-muted-foreground mb-4">
                  {searchQuery
                    ? 'Try a different search term'
                    : 'Start a conversation with your connections'}
                </p>
                {!searchQuery && (
                  <Button
                    size="sm"
                    onClick={() => navigate('/dna/connect/network')}
                  >
                    View Network
                  </Button>
                )}
              </div>
            ) : (
              filteredConversations?.map((conversation) => (
                <ConversationListItemComponent
                  key={conversation.conversation_id}
                  conversation={conversation}
                  currentUserId={user?.id || ''}
                  isActive={selectedConversation?.conversation_id === conversation.conversation_id}
                  onClick={() => handleSelectConversation(conversation)}
                />
              ))
            )}
          </div>
        </>
      ) : (
        <div className="flex-1 flex flex-col">
          <ConversationView
            conversationId={selectedConversation.conversation_id}
            currentUserId={user?.id || ''}
            otherUserName={selectedConversation.other_user_full_name}
            otherUserUsername={selectedConversation.other_user_username}
            otherUserAvatar={selectedConversation.other_user_avatar_url}
            onBack={handleBack}
          />
        </div>
      )}
    </div>
  );
}
