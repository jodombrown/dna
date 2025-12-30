import React, { useEffect, useRef, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { messageService, MessageWithSender, MessageAttachmentData, deleteConversation, archiveConversation, pinConversation, muteConversation } from '@/services/messageService';
import { useAuth } from '@/contexts/AuthContext';
import { ChatHeader } from './ChatHeader';
import { ChatBubble } from './ChatBubble';
import { ChatInput, MessageAttachment, MessageLinkPreview } from './ChatInput';
import { DateSeparator } from './DateSeparator';
import { Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';

interface ChatThreadProps {
  conversationId: string;
  otherUser: {
    id: string;
    username: string;
    full_name: string;
    avatar_url: string;
  };
  isMuted?: boolean;
  isPinned?: boolean;
  isArchived?: boolean;
  onBack: () => void;
}

export const ChatThread: React.FC<ChatThreadProps> = ({
  conversationId,
  otherUser,
  isMuted = false,
  isPinned = false,
  isArchived = false,
  onBack,
}) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const navigate = useNavigate();

  // Fetch messages
  const { data: messages = [], isLoading, isError, error } = useQuery({
    queryKey: ['messages', conversationId],
    queryFn: () => messageService.getMessages(conversationId),
    refetchInterval: 5000, // Poll every 5s as backup
    retry: 2, // Retry failed requests twice
  });

  // Send message mutation
  const sendMutation = useMutation({
    mutationFn: ({ content, attachment, linkPreview }: { content: string; attachment?: MessageAttachmentData; linkPreview?: MessageLinkPreview }) => 
      messageService.sendMessage(conversationId, content, attachment, linkPreview),
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

  // Delete conversation mutation
  const deleteConversationMutation = useMutation({
    mutationFn: () => deleteConversation(conversationId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
      toast({
        title: "Conversation deleted",
        description: "The conversation has been removed from your inbox",
      });
      navigate('/dna/messages');
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete conversation",
        variant: "destructive",
      });
    },
  });

  // Archive conversation mutation
  const archiveConversationMutation = useMutation({
    mutationFn: () => archiveConversation(conversationId, !isArchived),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
      toast({
        title: isArchived ? "Conversation unarchived" : "Conversation archived",
        description: isArchived 
          ? "The conversation has been moved back to your inbox"
          : "The conversation has been archived",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update conversation",
        variant: "destructive",
      });
    },
  });

  // Pin conversation mutation
  const pinConversationMutation = useMutation({
    mutationFn: () => pinConversation(conversationId, !isPinned),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
      toast({
        title: isPinned ? "Conversation unpinned" : "Conversation pinned",
        description: isPinned 
          ? "The conversation has been unpinned"
          : "The conversation has been pinned to the top",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update conversation",
        variant: "destructive",
      });
    },
  });

  // Mute conversation mutation
  const muteConversationMutation = useMutation({
    mutationFn: () => muteConversation(conversationId, !isMuted),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
      toast({
        title: isMuted ? "Notifications unmuted" : "Notifications muted",
        description: isMuted 
          ? `You'll receive notifications from ${otherUser.full_name}`
          : `You won't receive notifications from ${otherUser.full_name}`,
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update notification settings",
        variant: "destructive",
      });
    },
  });

  // Mark as read on mount and when new messages arrive
  useEffect(() => {
    if (conversationId) {
      messageService.markAsRead(conversationId)
        .then(() => {
          // Invalidate all relevant queries after marking as read
          queryClient.invalidateQueries({ queryKey: ['unread-message-count'] });
          queryClient.invalidateQueries({ queryKey: ['conversations'] });
          queryClient.invalidateQueries({ queryKey: ['messages', conversationId] });
        })
        .catch((err) => {
          // Silent fail for mark as read errors
        });
    }
  }, [conversationId, messages.length, queryClient]);

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

  const handleSend = (content: string, attachment?: MessageAttachment, linkPreview?: MessageLinkPreview) => {
    // Convert ChatInput attachment to service attachment type
    const serviceAttachment: MessageAttachmentData | undefined = attachment ? {
      type: attachment.type,
      url: attachment.url,
      filename: attachment.filename,
      filesize: attachment.filesize,
      mimetype: attachment.mimetype,
    } : undefined;

    sendMutation.mutate({ content, attachment: serviceAttachment, linkPreview });
  };

  const handleSendVoice = async (audioBlob: Blob, duration: number) => {
    await messageService.sendVoiceMessage(conversationId, audioBlob, duration);
    queryClient.invalidateQueries({ queryKey: ['messages', conversationId] });
    queryClient.invalidateQueries({ queryKey: ['conversations'] });
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
        isMuted={isMuted}
        isPinned={isPinned}
        isArchived={isArchived}
        onBack={onBack}
        onMuteToggle={() => muteConversationMutation.mutate()}
        onPinToggle={() => pinConversationMutation.mutate()}
        onArchiveToggle={() => archiveConversationMutation.mutate()}
        onDeleteConversation={() => deleteConversationMutation.mutate()}
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
        ) : isError ? (
          <div className="flex flex-col items-center justify-center h-full text-muted-foreground text-sm gap-2">
            <p>Unable to load messages</p>
            <button
              onClick={() => window.location.reload()}
              className="text-primary hover:underline"
            >
              Try refreshing
            </button>
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
        onSendVoice={handleSendVoice}
        disabled={sendMutation.isPending}
      />
    </div>
  );
};