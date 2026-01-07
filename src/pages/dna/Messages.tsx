import React, { useState, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { messageService } from '@/services/messageService';
import { useParams } from 'react-router-dom';
import { useMobile } from '@/hooks/useMobile';
import TwoColumnLayout from '@/layouts/TwoColumnLayout';
import ConversationListPanel from '@/components/messaging/ConversationListPanel';
import { ChatThread } from '@/components/messaging/inbox/ChatThread';
import EmptyConversationState from '@/components/messaging/EmptyConversationState';
import { LayoutTransitionLoader } from '@/components/LayoutTransitionLoader';
import { useHeaderVisibility } from '@/hooks/useHeaderVisibility';
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
  const queryClient = useQueryClient();
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(conversationId || null);
  const [searchTerm, setSearchTerm] = useState('');

  // Get header visibility controls
  const { hideHeader, showHeader } = useHeaderVisibility();

  // Manage header visibility based on mobile chat state
  useEffect(() => {
    if (isMobile && selectedConversationId) {
      hideHeader();
    } else {
      showHeader();
    }
    
    // Cleanup: show header when leaving the page
    return () => {
      showHeader();
    };
  }, [isMobile, selectedConversationId, hideHeader, showHeader]);

  // Proper refresh function that invalidates both query keys
  const handleRefresh = () => {
    queryClient.invalidateQueries({ queryKey: ['conversations'] });
    queryClient.invalidateQueries({ queryKey: ['conversations-archived'] });
  };

  // Fetch conversations
  const { data: conversations, isLoading, refetch } = useQuery({
    queryKey: ['conversations'],
    queryFn: () => messageService.getConversations(),
  });

  // Fetch archived conversations
  const { data: archivedConversations } = useQuery({
    queryKey: ['conversations-archived'],
    queryFn: () => messageService.getConversations(50, 0, true),
    select: (data) => data.filter(c => c.is_archived),
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
      // WhatsApp-style: Chat takes full screen, no header padding needed
      return (
        <div className="fixed inset-0 flex flex-col bg-background pb-16">
          <div className="flex-1 overflow-hidden">
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
            archivedConversations={archivedConversations || []}
            isLoading={isLoading}
            selectedConversationId={selectedConversationId}
            onSelectConversation={setSelectedConversationId}
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            onRefresh={handleRefresh}
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
            archivedConversations={archivedConversations || []}
            isLoading={isLoading}
            selectedConversationId={selectedConversationId}
            onSelectConversation={setSelectedConversationId}
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            onRefresh={handleRefresh}
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
