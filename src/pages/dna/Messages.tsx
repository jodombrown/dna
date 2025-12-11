import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { messageService } from '@/services/messageService';
import { useParams } from 'react-router-dom';
import { useMobile } from '@/hooks/useMobile';
import TwoColumnLayout from '@/layouts/TwoColumnLayout';
import ConversationListPanel from '@/components/messaging/ConversationListPanel';
import { ChatThread } from '@/components/messaging/inbox/ChatThread';
import EmptyConversationState from '@/components/messaging/EmptyConversationState';
import { LayoutTransitionLoader } from '@/components/LayoutTransitionLoader';

import MobileBottomNav from '@/components/mobile/MobileBottomNav';
import MessagesBreadcrumb from '@/components/messaging/MessagesBreadcrumb';

/**
 * DnaMessages - Canonical Messages route (/dna/messages)
 * 
 * MESSAGES_MODE: Two-column layout (35% list / 65% thread)
 * Replaces legacy /dna/connect/messages route
 * Part of ADA v2 (Adaptive Dashboard Architecture)
 */
const DnaMessages = () => {
  const { conversationId } = useParams();
  const { isMobile } = useMobile();
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(conversationId || null);
  const [searchTerm, setSearchTerm] = useState('');

  // Fetch conversations
  const { data: conversations, isLoading } = useQuery({
    queryKey: ['conversations'],
    queryFn: () => messageService.getConversations(),
  });

  if (isLoading) {
    return <LayoutTransitionLoader message="Loading messages..." />;
  }

  const selectedConversation = conversations?.find(c => c.conversation_id === selectedConversationId);
  
  // Build otherUser object for ChatThread
  const otherUser = selectedConversation ? {
    id: selectedConversation.other_user_id,
    username: selectedConversation.other_user_username || 'user',
    full_name: selectedConversation.other_user_full_name || 'Unknown User',
    avatar_url: selectedConversation.other_user_avatar_url || '',
  } : null;

  // Mobile: Show only conversation list or thread, not both
  if (isMobile) {
    if (selectedConversationId && otherUser) {
      return (
        <div className="min-h-screen bg-background pt-20">
          <div className="h-[calc(100vh-80px)]">
            <ChatThread 
              conversationId={selectedConversationId}
              otherUser={otherUser}
              onBack={() => setSelectedConversationId(null)}
            />
          </div>

          <MobileBottomNav />
        </div>
      );
    }

    // Mobile: Conversation list
    return (
      <div className="min-h-screen bg-background pt-20">
        <div className="container mx-auto px-4 py-6">
          <ConversationListPanel
            conversations={conversations || []}
            isLoading={isLoading}
            selectedConversationId={selectedConversationId}
            onSelectConversation={setSelectedConversationId}
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
          />
        </div>
        <MobileBottomNav />
      </div>
    );
  }

  // Desktop: Two-column layout
  return (
    <div className="min-h-screen bg-background pt-20">
      
      <TwoColumnLayout
        leftWidth="35%"
        rightWidth="65%"
        left={
          <ConversationListPanel
            conversations={conversations || []}
            isLoading={isLoading}
            selectedConversationId={selectedConversationId}
            onSelectConversation={setSelectedConversationId}
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
          />
        }
        right={
          selectedConversationId && otherUser ? (
            <ChatThread 
              conversationId={selectedConversationId}
              otherUser={otherUser}
              onBack={() => setSelectedConversationId(null)}
            />
          ) : (
            <EmptyConversationState />
          )
        }
      />
    </div>
  );
};

export default DnaMessages;
