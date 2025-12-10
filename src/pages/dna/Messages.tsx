import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { messageService } from '@/services/messageService';
import { useParams } from 'react-router-dom';
import { useMobile } from '@/hooks/useMobile';
import TwoColumnLayout from '@/layouts/TwoColumnLayout';
import ConversationListPanel from '@/components/messaging/ConversationListPanel';
import ConversationThread from '@/components/messaging/ConversationThread';
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

  // Mobile: Show only conversation list or thread, not both
  if (isMobile) {
    if (selectedConversationId) {
      return (
        <div className="min-h-screen bg-background pt-20">
          <div className="border-b bg-card">
            <div className="container mx-auto px-4 py-3">
              <MessagesBreadcrumb 
                selectedConversation={selectedConversation}
                onClearSelection={() => setSelectedConversationId(null)}
              />
            </div>
          </div>

          <div className="container mx-auto px-4">
            <ConversationThread conversationId={selectedConversationId} />
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
          selectedConversationId ? (
            <ConversationThread conversationId={selectedConversationId} />
          ) : (
            <EmptyConversationState />
          )
        }
      />
    </div>
  );
};

export default DnaMessages;
