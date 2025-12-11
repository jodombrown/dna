import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Input } from '@/components/ui/input';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useParams, useNavigate } from 'react-router-dom';
import { Search, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import UnifiedHeader from '@/components/UnifiedHeader';
import MobileBottomNav from '@/components/mobile/MobileBottomNav';
import { ChatThread } from '@/components/messaging/inbox/ChatThread';
import { ConversationListItem as ConversationItem } from '@/components/messaging/inbox/ConversationListItem';
import { messageService, ConversationListItem } from '@/services/messageService';
import { useMobile } from '@/hooks/useMobile';

export default function MessagesPage() {
  const { conversationId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { isMobile } = useMobile();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(conversationId || null);

  const { data: conversations, refetch, isLoading } = useQuery({
    queryKey: ['conversations'],
    queryFn: () => messageService.getConversations(),
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

  // Set selected conversation from URL param
  useEffect(() => {
    if (conversationId) {
      setSelectedConversationId(conversationId);
    }
  }, [conversationId]);

  const handleSelectConversation = (conversation: ConversationListItem) => {
    setSelectedConversationId(conversation.conversation_id);
    navigate(`/dna/messages/${conversation.conversation_id}`);
  };

  const handleBack = () => {
    setSelectedConversationId(null);
    navigate('/dna/messages');
  };

  const filteredConversations = conversations?.filter((c) =>
    c.other_user_full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.other_user_username.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const selectedConversation = conversations?.find(c => c.conversation_id === selectedConversationId);
  
  // Build otherUser object for ChatThread
  const otherUser = selectedConversation ? {
    id: selectedConversation.other_user_id,
    username: selectedConversation.other_user_username || 'user',
    full_name: selectedConversation.other_user_full_name || 'Unknown User',
    avatar_url: selectedConversation.other_user_avatar_url || '',
  } : null;

  return (
    <div className="min-h-screen bg-background">
      <UnifiedHeader />
      <div className="h-[calc(100vh-64px)] flex">
        {/* Conversations List */}
        <div
          className={`w-full md:w-96 border-r flex flex-col ${
            selectedConversationId ? 'hidden md:flex' : 'flex'
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

          <div className="flex-1 overflow-y-auto">
            {isLoading ? (
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
              <div>
                {filteredConversations?.map((conversation) => (
                  <ConversationItem
                    key={conversation.conversation_id}
                    conversation={conversation}
                    isSelected={selectedConversationId === conversation.conversation_id}
                    onClick={() => handleSelectConversation(conversation)}
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Conversation View - Enhanced ChatThread */}
        <div
          className={`flex-1 ${
            selectedConversationId ? 'flex' : 'hidden md:flex'
          } flex-col bg-muted/30`}
        >
          {selectedConversationId && otherUser ? (
            <ChatThread
              conversationId={selectedConversationId}
              otherUser={otherUser}
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
