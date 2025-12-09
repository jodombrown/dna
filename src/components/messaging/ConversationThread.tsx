import React, { useRef, useEffect, useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { messagingService } from '@/services/messagingService';
import { useAuth } from '@/contexts/AuthContext';
import { useRealtimeMessages } from '@/hooks/useRealtimeMessages';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Loader2, Send, X, MoreVertical, Ban, BellOff, Flag } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { useToast } from '@/hooks/use-toast';
import { MessageBubble, MessageDateSeparator } from './MessageBubble';
import { TypingIndicator } from './TypingIndicator';
import { messageService } from '@/services/messageService';
import ConversationContext from './ConversationContext';
import MessageRequestBanner from './MessageRequestBanner';
import PresenceIndicator, { LastSeenStatus } from './PresenceIndicator';
import { useConversationPresence } from '@/hooks/usePresence';
import { ConversationListItem, MessageWithSender } from '@/types/messaging';

interface ConversationThreadProps {
  conversationId: string;
  onClose?: () => void;
  isOverlay?: boolean;
}

/**
 * ConversationThread - Full conversation view with messages
 *
 * Implements PRD requirements:
 * - Real-time message updates
 * - Auto-scroll to bottom
 * - Typing indicators
 * - Read receipts (sent/delivered/read)
 * - Context banner for origin
 * - Message request banner for pending status
 * - Presence indicator (online/offline)
 */
const ConversationThread: React.FC<ConversationThreadProps> = ({
  conversationId,
  onClose,
  isOverlay = false,
}) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const [messageInput, setMessageInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [typingUsers, setTypingUsers] = useState<
    Array<{ user_id: string; display_name: string }>
  >([]);

  // Fetch conversation details
  const { data: conversations } = useQuery({
    queryKey: ['conversations'],
    queryFn: () => messagingService.getConversations(),
  });

  const conversation = useMemo(
    () => conversations?.find((c) => c.conversation_id === conversationId),
    [conversations, conversationId]
  ) as ConversationListItem | undefined;

  // Track presence for the other user
  const { isOtherUserOnline, onlineUsers } = useConversationPresence(
    conversationId,
    conversation?.other_user_id || ''
  );

  // Fetch messages with realtime updates
  const { data: messages, isLoading } = useRealtimeMessages(conversationId);

  // Check if this is a pending message request
  const isPendingRequest = conversation?.participant_status === 'pending';

  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: (content: string) =>
      messageService.sendMessage(conversationId, content),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['messages', conversationId] });
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
      setMessageInput('');
      setIsTyping(false);
    },
    onError: () => {
      toast({ title: 'Failed to send message', variant: 'destructive' });
    },
  });

  // Block user mutation (stubbed - feature not yet implemented)
  const blockUserMutation = useMutation({
    mutationFn: async (_targetUserId: string) => {
      toast({ title: 'Block feature coming soon' });
      return false;
    },
    onSuccess: () => {},
    onError: () => {},
  });

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Mark as read
  useEffect(() => {
    if (conversationId && !isPendingRequest) {
      messageService.markAsRead(conversationId);
    }
  }, [conversationId, isPendingRequest]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageInput.trim()) return;

    sendMessageMutation.mutate(messageInput.trim());
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMessageInput(e.target.value);

    // Set local typing state (typing indicators not yet implemented)
    if (!isTyping && e.target.value.length > 0) {
      setIsTyping(true);
    }

    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Set timeout to stop typing indicator
    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
    }, 2000);
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage(e);
    }
  };

  const getInitials = (name: string) => {
    return (
      name
        ?.split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase() || '?'
    );
  };

  // Group messages by date for separators
  const messagesWithSeparators = useMemo(() => {
    if (!messages) return [];

    const result: Array<{ type: 'message' | 'separator'; data: any }> = [];
    let lastDate: string | null = null;

    messages.forEach((msg) => {
      const msgDate = new Date(msg.created_at).toDateString();
      if (msgDate !== lastDate) {
        result.push({
          type: 'separator',
          data: new Date(msg.created_at),
        });
        lastDate = msgDate;
      }
      result.push({ type: 'message', data: msg });
    });

    return result;
  }, [messages]);

  if (!conversation) {
    return (
      <div className="h-full flex items-center justify-center text-muted-foreground">
        <p>Conversation not found</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Thread Header */}
      {!isOverlay && (
        <div className="p-4 border-b flex items-center gap-3 bg-card">
          <div className="relative">
            <Avatar className="w-10 h-10">
              <AvatarImage src={conversation.other_user_avatar_url || ''} />
              <AvatarFallback className="bg-primary text-primary-foreground">
                {getInitials(conversation.other_user_full_name || '')}
              </AvatarFallback>
            </Avatar>
            {isOtherUserOnline && (
              <div className="absolute bottom-0 right-0 border-2 border-background rounded-full">
                <PresenceIndicator status="online" size="sm" />
              </div>
            )}
          </div>
          <div className="flex-1">
            <p className="font-semibold">{conversation.other_user_full_name}</p>
            {conversation.other_user_headline && (
              <p className="text-xs text-muted-foreground">
                {conversation.other_user_headline}
              </p>
            )}
            <LastSeenStatus
              status={isOtherUserOnline ? 'online' : 'offline'}
            />
          </div>

          {/* Actions */}
          <div className="flex items-center gap-1">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <MoreVertical className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>
                  <BellOff className="h-4 w-4 mr-2" />
                  Mute notifications
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="text-destructive"
                  onClick={() =>
                    conversation.other_user_id &&
                    blockUserMutation.mutate(conversation.other_user_id)
                  }
                >
                  <Ban className="h-4 w-4 mr-2" />
                  Block user
                </DropdownMenuItem>
                <DropdownMenuItem className="text-destructive">
                  <Flag className="h-4 w-4 mr-2" />
                  Report
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {onClose && (
              <Button variant="ghost" size="icon" onClick={onClose}>
                <X className="h-5 w-5" />
              </Button>
            )}
          </div>
        </div>
      )}

      {/* Context Banner (if conversation has origin) */}
      {conversation.origin_type && (
        <div className="px-4 pt-4">
          <ConversationContext
            originType={conversation.origin_type}
            originId={conversation.origin_id}
            originMetadata={conversation.origin_metadata}
          />
        </div>
      )}

      {/* Message Request Banner (if pending) */}
      {isPendingRequest && (
        <div className="px-4 pt-4">
          <MessageRequestBanner
            conversationId={conversationId}
            requester={{
              id: conversation.other_user_id || '',
              full_name: conversation.other_user_full_name || '',
              avatar_url: conversation.other_user_avatar_url,
              headline: conversation.other_user_headline,
            }}
            previewContent={
              conversation.last_message_content ||
              conversation.last_message_preview ||
              undefined
            }
            originType={conversation.origin_type}
            originMetadata={conversation.origin_metadata}
            onAccept={() => {
              queryClient.invalidateQueries({ queryKey: ['conversations'] });
            }}
            onDecline={() => {
              onClose?.();
            }}
          />
        </div>
      )}

      {/* Messages */}
      <ScrollArea className="flex-1 p-4">
        {isLoading ? (
          <div className="flex justify-center items-center h-full">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : messages?.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
            <p>No messages yet</p>
            <p className="text-sm mt-2">Start the conversation!</p>
          </div>
        ) : (
          <div className="space-y-1">
            {messagesWithSeparators.map((item, index) => {
              if (item.type === 'separator') {
                return (
                  <MessageDateSeparator key={`sep-${index}`} date={item.data} />
                );
              }

              const message = item.data as MessageWithSender;
              const isOwnMessage = message.sender_id === user?.id;

              return (
                <MessageBubble
                  key={message.message_id}
                  message={message}
                  isOwnMessage={isOwnMessage}
                  showReadReceipt={true}
                  isRead={message.is_read}
                  isDelivered={!!message.delivered_at}
                />
              );
            })}

            {/* Typing Indicator */}
            {typingUsers.length > 0 && (
              <div className="px-4">
                <TypingIndicator users={typingUsers} />
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        )}
      </ScrollArea>

      {/* Message Input (disabled for pending requests) */}
      <form onSubmit={handleSendMessage} className="p-4 border-t bg-card">
        <div className="flex gap-2">
          <Input
            value={messageInput}
            onChange={handleInputChange}
            onKeyPress={handleKeyPress}
            placeholder={
              isPendingRequest
                ? 'Accept the request to reply...'
                : 'Type a message...'
            }
            disabled={sendMessageMutation.isPending || isPendingRequest}
            className="flex-1"
          />
          <Button
            type="submit"
            disabled={
              !messageInput.trim() ||
              sendMessageMutation.isPending ||
              isPendingRequest
            }
            size="icon"
          >
            {sendMessageMutation.isPending ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default ConversationThread;
