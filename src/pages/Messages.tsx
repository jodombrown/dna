import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { messageService } from '@/services/messageService';
import { useMobile } from '@/hooks/useMobile';
import UnifiedHeader from '@/components/UnifiedHeader';
import MobileBottomNav from '@/components/mobile/MobileBottomNav';
import TwoColumnLayout from '@/layouts/TwoColumnLayout';
import ConversationListPanel from '@/components/messaging/ConversationListPanel';
import { ChatThread } from '@/components/messaging/inbox/ChatThread';
import EmptyConversationState from '@/components/messaging/EmptyConversationState';
import MessagesBreadcrumb from '@/components/messaging/MessagesBreadcrumb';

/**
 * Messages Page - MESSAGES_MODE
 * 
 * Layout: TwoColumnLayout (35%-65%)
 * - Left: Conversation list with search/filters
 * - Right: Active conversation thread or empty state
 * 
 * Features:
 * - Real-time message updates
 * - Search and filter conversations
 * - Mobile responsive (switches between list/thread)
 * - Empty state when no conversation selected
 */
export default function MessagesPage() {
  const { isMobile } = useMobile();
  
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Fetch conversations
  const { data: conversations, isLoading } = useQuery({
    queryKey: ['conversations'],
    queryFn: () => messageService.getConversations(),
  });

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
        <div className="min-h-screen bg-background">
          <UnifiedHeader />
          
          <div className="h-[calc(100vh-140px)]">
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

    return (
      <div className="min-h-screen bg-background">
        <UnifiedHeader />
        
        <div className="border-b bg-card">
          <div className="container mx-auto px-4 py-3">
            <MessagesBreadcrumb />
          </div>
        </div>

        <div className="h-[calc(100vh-140px)]">
          <ConversationListPanel
            conversations={conversations}
            isLoading={isLoading}
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            selectedConversationId={selectedConversationId}
            onSelectConversation={setSelectedConversationId}
          />
        </div>
        
        <MobileBottomNav />
      </div>
    );
  }

  // Desktop: Two-column layout
  return (
    <div className="min-h-screen bg-background">
      <UnifiedHeader />
      
      {/* Breadcrumb Navigation */}
      <div className="border-b bg-card">
        <div className="container mx-auto px-4 py-3">
          <MessagesBreadcrumb 
            selectedConversation={selectedConversation}
            onClearSelection={() => setSelectedConversationId(null)}
          />
        </div>
      </div>
      
      {/* MESSAGES_MODE: Two-column layout (35%-65%) */}
      <TwoColumnLayout
        leftWidth="35%"
        rightWidth="65%"
        left={
          <ConversationListPanel
            conversations={conversations}
            isLoading={isLoading}
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            selectedConversationId={selectedConversationId}
            onSelectConversation={setSelectedConversationId}
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
            <EmptyConversationState message="Select a conversation to start chatting" />
          )
        }
      />
      
      <MobileBottomNav />
    </div>
  );
}
