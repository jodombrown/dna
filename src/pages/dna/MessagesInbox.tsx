import React, { useState, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useParams, useNavigate } from 'react-router-dom';
import { messageService, ConversationListItem } from '@/services/messageService';
import { useAuth } from '@/contexts/AuthContext';
import { useMobile } from '@/hooks/useMobile';
import { supabase } from '@/integrations/supabase/client';

// Inbox components
import { InboxHeader } from '@/components/messaging/inbox/InboxHeader';
import { ConversationListItem as ConversationItem } from '@/components/messaging/inbox/ConversationListItem';
import { ChatThread } from '@/components/messaging/inbox/ChatThread';
import { EmptyInbox } from '@/components/messaging/inbox/EmptyInbox';

import MobileBottomNav from '@/components/mobile/MobileBottomNav';
import { Loader2 } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';

/**
 * MessagesInbox - WhatsApp-inspired messaging interface
 * 
 * Mobile: Shows conversation list OR chat thread (not both)
 * Desktop: Two-column layout (list left, thread right)
 */
const MessagesInbox = () => {
  const { conversationId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { isMobile } = useMobile();
  const queryClient = useQueryClient();
  
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(conversationId || null);
  const [searchTerm, setSearchTerm] = useState('');

  // Fetch conversations
  const { data: conversations = [], isLoading } = useQuery({
    queryKey: ['conversations'],
    queryFn: () => messageService.getConversations(),
    refetchInterval: 10000, // Refresh every 10s
  });

  // Subscribe to conversation updates
  useEffect(() => {
    const channel = supabase
      .channel('inbox-updates')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'messages' },
        () => {
          queryClient.invalidateQueries({ queryKey: ['conversations'] });
          queryClient.invalidateQueries({ queryKey: ['unread-message-count'] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  // Sync URL with selection
  useEffect(() => {
    if (conversationId && conversationId !== selectedConversationId) {
      setSelectedConversationId(conversationId);
    }
  }, [conversationId]);

  // Filter conversations by search
  const filteredConversations = conversations.filter((conv) =>
    conv.other_user_full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    conv.other_user_username.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Get selected conversation details
  const selectedConversation = conversations.find(
    (c) => c.conversation_id === selectedConversationId
  );

  const handleSelectConversation = (conv: ConversationListItem) => {
    setSelectedConversationId(conv.conversation_id);
    navigate(`/dna/messages/${conv.conversation_id}`);
  };

  const handleBack = () => {
    setSelectedConversationId(null);
    navigate('/dna/messages');
  };

  // Scroll to top on mount
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  if (!user) return null;

  // ========== MOBILE LAYOUT ==========
  if (isMobile) {
    // Show chat thread if conversation selected
    if (selectedConversationId && selectedConversation) {
      return (
        <div className="fixed inset-0 bg-background flex flex-col pt-16">
          <ChatThread
            conversationId={selectedConversationId}
            otherUser={{
              id: selectedConversation.other_user_id,
              username: selectedConversation.other_user_username,
              full_name: selectedConversation.other_user_full_name,
              avatar_url: selectedConversation.other_user_avatar_url,
            }}
            onBack={handleBack}
          />
        </div>
      );
    }

    // Show conversation list
    return (
      <div className="min-h-screen bg-background pt-16 pb-20">
        <InboxHeader
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
        />

        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : filteredConversations.length === 0 ? (
          <EmptyInbox type="no-conversations" />
        ) : (
          <div className="divide-y divide-border/50">
            {filteredConversations.map((conv) => (
              <ConversationItem
                key={conv.conversation_id}
                conversation={conv}
                isSelected={false}
                onClick={() => handleSelectConversation(conv)}
              />
            ))}
          </div>
        )}

        <MobileBottomNav />
      </div>
    );
  }

  // ========== DESKTOP LAYOUT ==========
  return (
    <div className="min-h-screen bg-background pt-16">
      <div className="flex h-[calc(100vh-4rem)]">
        {/* Left Column - Conversation List */}
        <div className="w-[380px] border-r border-border flex flex-col bg-card">
          <InboxHeader
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
          />

          <ScrollArea className="flex-1">
            {isLoading ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : filteredConversations.length === 0 ? (
              <EmptyInbox type="no-conversations" />
            ) : (
              <div>
                {filteredConversations.map((conv) => (
                  <ConversationItem
                    key={conv.conversation_id}
                    conversation={conv}
                    isSelected={conv.conversation_id === selectedConversationId}
                    onClick={() => handleSelectConversation(conv)}
                  />
                ))}
              </div>
            )}
          </ScrollArea>
        </div>

        {/* Right Column - Chat Thread */}
        <div className="flex-1 flex flex-col">
          {selectedConversationId && selectedConversation ? (
            <ChatThread
              conversationId={selectedConversationId}
              otherUser={{
                id: selectedConversation.other_user_id,
                username: selectedConversation.other_user_username,
                full_name: selectedConversation.other_user_full_name,
                avatar_url: selectedConversation.other_user_avatar_url,
              }}
              onBack={handleBack}
            />
          ) : (
            <EmptyInbox type="no-selection" />
          )}
        </div>
      </div>
    </div>
  );
};

export default MessagesInbox;
