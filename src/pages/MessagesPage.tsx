import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ConversationListItem } from '@/components/messaging/ConversationListItem';
import { ConversationView } from '@/components/messaging/ConversationView';
import { Input } from '@/components/ui/input';
import { ConversationListItem as ConversationListItemType } from '@/types/messaging';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useParams, useNavigate } from 'react-router-dom';
import { Search, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import UnifiedHeader from '@/components/UnifiedHeader';
import MobileBottomNav from '@/components/mobile/MobileBottomNav';

export default function MessagesPage() {
  const { conversationId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedConversation, setSelectedConversation] =
    useState<ConversationListItemType | null>(null);

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
      return (data || []) as ConversationListItemType[];
    },
    enabled: !!user,
  });

  // Real-time subscription for conversation updates
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel('user_conversations')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'messages_new',
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

  // Set selected conversation from URL param
  useEffect(() => {
    if (conversationId && conversations) {
      const conversation = conversations.find((c) => c.conversation_id === conversationId);
      if (conversation) {
        setSelectedConversation(conversation);
      }
    }
  }, [conversationId, conversations]);

  const handleSelectConversation = (conversation: ConversationListItemType) => {
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
    <div className="min-h-screen bg-background">
      <UnifiedHeader />
      <div className="h-[calc(100vh-64px)] flex">
        {/* Conversations List */}
        <div
          className={`w-full md:w-96 border-r flex flex-col ${
            selectedConversation ? 'hidden md:flex' : 'flex'
          }`}
        >
          <div className="p-4 border-b">
            <h1 className="text-2xl font-bold mb-4">Messages</h1>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search conversations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-2">
            {!conversations ? (
              <div className="text-center py-12 text-muted-foreground">
                Loading conversations...
              </div>
            ) : filteredConversations?.length === 0 ? (
              <div className="text-center py-12">
                <MessageCircle className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">
                  {searchQuery ? 'No conversations found' : 'No messages yet'}
                </h3>
                <p className="text-muted-foreground mb-6">
                  {searchQuery
                    ? 'Try a different search term'
                    : 'Start a conversation with your connections'}
                </p>
                {!searchQuery && (
                  <Button
                    onClick={() => navigate('/dna/network')}
                  >
                    View Network
                  </Button>
                )}
              </div>
            ) : (
              filteredConversations?.map((conversation) => (
                <ConversationListItem
                  key={conversation.conversation_id}
                  conversation={conversation}
                  currentUserId={user?.id || ''}
                  isActive={selectedConversation?.conversation_id === conversation.conversation_id}
                  onClick={() => handleSelectConversation(conversation)}
                />
              ))
            )}
          </div>
        </div>

        {/* Conversation View */}
        <div
          className={`flex-1 ${
            selectedConversation ? 'flex' : 'hidden md:flex'
          } flex-col bg-muted/30`}
        >
          {selectedConversation ? (
            <ConversationView
              conversationId={selectedConversation.conversation_id}
              currentUserId={user?.id || ''}
              otherUserName={selectedConversation.other_user_full_name}
              otherUserUsername={selectedConversation.other_user_username}
              otherUserAvatar={selectedConversation.other_user_avatar_url}
              onBack={handleBack}
            />
          ) : (
            <div className="flex items-center justify-center h-full text-center p-8">
              <div>
                <MessageCircle className="h-20 w-20 mx-auto text-muted-foreground mb-4" />
                <h2 className="text-2xl font-semibold mb-2">Select a conversation</h2>
                <p className="text-muted-foreground">
                  Choose a conversation from the list to start messaging
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
      <MobileBottomNav />
    </div>
  );
}
