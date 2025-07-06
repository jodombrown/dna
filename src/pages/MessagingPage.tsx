import React, { useState } from 'react';
import { useScrollToTop } from '@/hooks/useScrollToTop';
import AppHeader from '@/components/app/AppHeader';
import MessagesList from '@/components/messaging/MessagesList';
import ConversationView from '@/components/messaging/ConversationView';
import MessageSidebar from '@/components/messaging/MessageSidebar';
import { useIsMobile } from '@/hooks/use-mobile';

const MessagingPage = () => {
  useScrollToTop();
  const isMobile = useIsMobile();
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [showConversation, setShowConversation] = useState(false);

  const handleConversationSelect = (conversationId: string) => {
    setActiveConversationId(conversationId);
    if (isMobile) {
      setShowConversation(true);
    }
  };

  const handleBackToList = () => {
    if (isMobile) {
      setShowConversation(false);
      setActiveConversationId(null);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <AppHeader />
      
      <div className="max-w-full mx-auto">
        <div className="flex h-[calc(100vh-64px)]">
          {/* Left Panel - Messages List */}
          <div className={`${
            isMobile 
              ? showConversation ? 'hidden' : 'w-full'
              : 'w-80 border-r border-gray-200'
          } bg-white flex-shrink-0`}>
            <MessagesList 
              onConversationSelect={handleConversationSelect}
              activeConversationId={activeConversationId}
            />
          </div>

          {/* Center Panel - Active Conversation */}
          <div className={`${
            isMobile 
              ? showConversation ? 'w-full' : 'hidden'
              : 'flex-1'
          } bg-white border-r border-gray-200`}>
            <ConversationView 
              conversationId={activeConversationId}
              onBack={handleBackToList}
              showBackButton={isMobile}
            />
          </div>

          {/* Right Panel - Message Sidebar (Desktop Only) */}
          {!isMobile && (
            <div className="w-80 bg-white flex-shrink-0">
              <MessageSidebar conversationId={activeConversationId} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MessagingPage;