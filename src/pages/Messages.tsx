import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { messagingService } from '@/services/messagingService';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import UnifiedHeader from '@/components/UnifiedHeader';
import MobileBottomNav from '@/components/mobile/MobileBottomNav';
import TwoColumnLayout from '@/layouts/TwoColumnLayout';
import ConversationListPanel from '@/components/messaging/ConversationListPanel';
import MessageThreadPanel from '@/components/messaging/MessageThreadPanel';
import MessagesBreadcrumb from '@/components/messaging/MessagesBreadcrumb';

/**
 * Messages Page - MESSAGES_MODE
 * 
 * Layout: TwoColumnLayout (35%-65%)
 * - Left: Conversation list with search
 * - Right: Active conversation thread with message input
 * 
 * Features:
 * - Real-time message updates via Supabase Realtime
 * - Search conversations
 * - Mark messages as read
 * - Responsive mobile/desktop layout
 */
const Messages: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
  const [messageInput, setMessageInput] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  // Fetch conversations
  const { data: conversations, isLoading: conversationsLoading } = useQuery({
    queryKey: ['conversations'],
    queryFn: messagingService.getConversations,
  });

  // Fetch messages for selected conversation
  const { data: messages, isLoading: messagesLoading } = useQuery({
    queryKey: ['messages', selectedConversationId],
    queryFn: () => selectedConversationId ? messagingService.getMessages(selectedConversationId) : null,
    enabled: !!selectedConversationId,
  });

  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: ({ conversationId, content }: { conversationId: string; content: string }) =>
      messagingService.sendMessage(conversationId, content),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['messages', selectedConversationId] });
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
      setMessageInput('');
    },
    onError: () => {
      toast({ title: 'Failed to send message', variant: 'destructive' });
    },
  });

  // Subscribe to real-time messages
  useEffect(() => {
    if (!selectedConversationId) return;

    const channel = messagingService.subscribeToMessages(selectedConversationId, () => {
      queryClient.invalidateQueries({ queryKey: ['messages', selectedConversationId] });
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
    });

    return () => {
      channel.unsubscribe();
    };
  }, [selectedConversationId, queryClient]);

  // Mark as read when opening conversation
  useEffect(() => {
    if (selectedConversationId) {
      messagingService.markAsRead(selectedConversationId);
    }
  }, [selectedConversationId]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageInput.trim() || !selectedConversationId) return;

    sendMessageMutation.mutate({
      conversationId: selectedConversationId,
      content: messageInput.trim(),
    });
  };

  const selectedConversation = conversations?.find(c => c.id === selectedConversationId);

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
            isLoading={conversationsLoading}
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            selectedConversationId={selectedConversationId}
            onSelectConversation={setSelectedConversationId}
          />
        }
        right={
          <MessageThreadPanel
            conversation={selectedConversation || null}
            messages={messages || []}
            isLoading={messagesLoading}
            currentUserId={user?.id}
            messageInput={messageInput}
            onMessageInputChange={setMessageInput}
            onSendMessage={handleSendMessage}
            isSending={sendMessageMutation.isPending}
          />
        }
      />
      
      <MobileBottomNav />
    </div>
  );
};

export default Messages;
