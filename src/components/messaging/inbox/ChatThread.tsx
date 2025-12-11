import React, { useEffect, useRef, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { messageService, MessageWithSender, MessageAttachmentData } from '@/services/messageService';
import { useAuth } from '@/contexts/AuthContext';
import { ChatHeader } from './ChatHeader';
import { ChatBubble } from './ChatBubble';
import { ChatInput, MessageAttachment } from './ChatInput';
import { DateSeparator } from './DateSeparator';
import { Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { supabase } from '@/integrations/supabase/client';

interface ChatThreadProps {
  conversationId: string;
  otherUser: {
    id: string;
    username: string;
    full_name: string;
    avatar_url: string;
  };
  onBack: () => void;
}

export const ChatThread: React.FC<ChatThreadProps> = ({
  conversationId,
  otherUser,
  onBack,
}) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Fetch messages
  const { data: messages = [], isLoading } = useQuery({
    queryKey: ['messages', conversationId],
    queryFn: () => messageService.getMessages(conversationId),
    refetchInterval: 5000, // Poll every 5s as backup
  });

  // Send message mutation
  const sendMutation = useMutation({
    mutationFn: ({ content, attachment }: { content: string; attachment?: MessageAttachmentData }) => 
      messageService.sendMessage(conversationId, content, attachment),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['messages', conversationId] });
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
    },
  });

  // Delete message mutation
  const deleteMutation = useMutation({
    mutationFn: (messageId: string) => messageService.deleteMessage(messageId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['messages', conversationId] });
    },
  });

  // Mark as read on mount and when new messages arrive
  useEffect(() => {
    if (conversationId) {
      messageService.markAsRead(conversationId);
      queryClient.invalidateQueries({ queryKey: ['unread-message-count'] });
    }
  }, [conversationId, messages.length]);

  // Subscribe to new messages
  useEffect(() => {
    const channel = supabase
      .channel(`chat:${conversationId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${conversationId}`,
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ['messages', conversationId] });
          queryClient.invalidateQueries({ queryKey: ['conversations'] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [conversationId, queryClient]);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Group messages by date
  const groupedMessages = useMemo(() => {
    const groups: { date: string; messages: MessageWithSender[] }[] = [];
    let currentDate = '';

    messages.forEach((msg) => {
      const msgDate = format(new Date(msg.created_at), 'yyyy-MM-dd');
      if (msgDate !== currentDate) {
        currentDate = msgDate;
        groups.push({ date: msg.created_at, messages: [msg] });
      } else {
        groups[groups.length - 1].messages.push(msg);
      }
    });

    return groups;
  }, [messages]);

  const handleSend = (content: string, attachment?: MessageAttachment) => {
    // Convert ChatInput attachment to service attachment type
    const serviceAttachment: MessageAttachmentData | undefined = attachment ? {
      type: attachment.type,
      url: attachment.url,
      filename: attachment.filename,
      filesize: attachment.filesize,
      mimetype: attachment.mimetype,
    } : undefined;

    sendMutation.mutate({ content, attachment: serviceAttachment });
  };

  const handleDeleteMessage = (messageId: string) => {
    deleteMutation.mutate(messageId);
  };

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Header */}
      <ChatHeader 
        otherUser={otherUser} 
        conversationId={conversationId}
        onBack={onBack} 
      />

      {/* Messages */}
      <div 
        ref={containerRef}
        className="flex-1 overflow-y-auto"
        style={{ 
          backgroundImage: 'url("data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%239C92AC" fill-opacity="0.03"%3E%3Cpath d="M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")',
        }}
      >
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : messages.length === 0 ? (
          <div className="flex items-center justify-center h-full text-muted-foreground text-sm">
            Start the conversation!
          </div>
        ) : (
          <div className="py-4">
            {groupedMessages.map((group) => (
              <div key={group.date}>
                <DateSeparator date={group.date} />
                {group.messages.map((msg, msgIndex) => {
                  const isOwn = msg.sender_id === user?.id;
                  const prevMsg = msgIndex > 0 ? group.messages[msgIndex - 1] : null;
                  const showAvatar = !prevMsg || prevMsg.sender_id !== msg.sender_id;
                  
                  return (
                    <ChatBubble
                      key={msg.message_id}
                      message={msg}
                      isOwn={isOwn}
                      showAvatar={showAvatar}
                      onDeleteMessage={handleDeleteMessage}
                    />
                  );
                })}
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Input */}
      <ChatInput 
        onSend={handleSend} 
        disabled={sendMutation.isPending}
      />
    </div>
  );
};
