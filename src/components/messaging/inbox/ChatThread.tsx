import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { messageService, MessageWithSender, MessageAttachmentData, deleteConversation, archiveConversation, pinConversation, muteConversation } from '@/services/messageService';
import type { ReplyToData } from '@/services/messageTypes';
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
import { useTypingIndicator } from '@/hooks/useTypingIndicator';
import { TypingIndicatorDisplay } from '@/components/messaging/group/TypingIndicatorDisplay';

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
  const messageRefs = useRef<Map<string, HTMLDivElement>>(new Map());
  const { toast } = useToast();
  const navigate = useNavigate();
  const [replyingTo, setReplyingTo] = useState<ReplyToData | null>(null);

  // Typing indicator
  const { typingUsers, startTyping } = useTypingIndicator(conversationId);

  // Fetch messages — realtime subscription below handles live updates, no polling needed
  const { data: messages = [], isLoading, isError, error } = useQuery({
    queryKey: ['messages', conversationId],
    queryFn: () => messageService.getMessages(conversationId),
    staleTime: 60_000,
    retry: 2,
  });

  // Send message mutation
  const sendMutation = useMutation({
    mutationFn: ({ content, attachment, linkPreview, replyTo }: {
      content: string;
      attachment?: MessageAttachmentData;
      linkPreview?: MessageLinkPreview;
      replyTo?: ReplyToData;
    }) => messageService.sendMessage(conversationId, content, attachment, linkPreview, replyTo),
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
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
      toast({ title: 'Message deleted' });
    },
    onError: () => {
      toast({ title: 'Failed to delete', description: 'Could not delete the message', variant: 'destructive' });
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

  const handleReply = useCallback((messageId: string) => {
    const msg = messages.find(m => m.message_id === messageId);
    if (!msg) return;
    setReplyingTo({
      messageId: msg.message_id,
      senderName: msg.sender_full_name,
      senderAvatar: msg.sender_avatar_url,
      content: msg.content,
    });
  }, [messages]);

  const handleCancelReply = useCallback(() => {
    setReplyingTo(null);
  }, []);

  const handleScrollToMessage = useCallback((messageId: string) => {
    const el = messageRefs.current.get(messageId);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      el.classList.add('bg-primary/10');
      setTimeout(() => el.classList.remove('bg-primary/10'), 1500);
    }
  }, []);

  const handleSend = (content: string, attachment?: MessageAttachment, linkPreview?: MessageLinkPreview) => {
    // Convert ChatInput attachment to service attachment type
    const serviceAttachment: MessageAttachmentData | undefined = attachment ? {
      type: attachment.type,
      url: attachment.url,
      filename: attachment.filename,
      filesize: attachment.filesize,
      mimetype: attachment.mimetype,
    } : undefined;

    sendMutation.mutate({
      content,
      attachment: serviceAttachment,
      linkPreview,
      replyTo: replyingTo || undefined,
    });
    setReplyingTo(null);
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
    <div className="flex flex-col h-full min-h-0 overflow-hidden bg-background">
      {/* Header - fixed rail, never shrinks */}
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

      {/* Messages - only scrollable region */}
      <div 
        ref={containerRef}
        className="flex-1 min-h-0 overflow-y-auto overscroll-y-contain bg-gradient-to-b from-muted/20 to-muted/40 dark:from-zinc-900 dark:to-zinc-950"
      >
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <Loader2 className="h-6 w-6 animate-spin text-primary/60" />
          </div>
        ) : isError ? (
          <div className="flex flex-col items-center justify-center h-full text-muted-foreground text-sm gap-2">
            <p>Unable to load messages</p>
            <button
              onClick={() => window.location.reload()}
              className="text-primary hover:underline text-sm"
            >
              Try refreshing
            </button>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-muted-foreground gap-1">
            <span className="text-2xl">👋</span>
            <p className="text-sm">Start the conversation!</p>
          </div>
        ) : (
          <div className="py-2">
            {groupedMessages.map((group) => (
              <div key={group.date}>
                <DateSeparator date={group.date} />
                <div className="space-y-0.5">
                  {group.messages.map((msg, msgIndex) => {
                    const isOwn = msg.sender_id === user?.id;
                    const prevMsg = msgIndex > 0 ? group.messages[msgIndex - 1] : null;
                    const showAvatar = !prevMsg || prevMsg.sender_id !== msg.sender_id;
                    
                    return (
                      <div
                        key={msg.message_id}
                        id={`message-${msg.message_id}`}
                        ref={(el) => {
                          if (el) messageRefs.current.set(msg.message_id, el);
                        }}
                        className="transition-colors duration-500"
                      >
                        <ChatBubble
                          message={msg}
                          isOwn={isOwn}
                          showAvatar={showAvatar}
                          onDeleteMessage={handleDeleteMessage}
                          onReply={handleReply}
                          onScrollToMessage={handleScrollToMessage}
                        />
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Input - fixed rail, never shrinks */}
      <ChatInput
        onSend={handleSend}
        onSendVoice={handleSendVoice}
        disabled={sendMutation.isPending}
        replyingTo={replyingTo}
        onCancelReply={handleCancelReply}
      />
    </div>
  );
};