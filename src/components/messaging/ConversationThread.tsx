import React, { useRef, useEffect, useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { messageService, ConversationListItem, MessageWithSender } from '@/services/messageService';
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
import { supabase } from '@/integrations/supabase/client';

interface ConversationThreadProps {
  conversationId: string;
  onClose?: () => void;
  isOverlay?: boolean;
}

/**
 * ConversationThread - Simplified conversation view with messages
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

  const [messageInput, setMessageInput] = useState('');

  // Fetch conversation details
  const { data: conversation, isLoading: conversationLoading } = useQuery({
    queryKey: ['conversation-details', conversationId],
    queryFn: () => messageService.getConversationDetails(conversationId),
    enabled: !!conversationId,
    staleTime: 30000,
  });

  // Fetch messages with realtime updates
  const { data: messages, isLoading: messagesLoading } = useRealtimeMessages(conversationId);

  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: (content: string) =>
      messageService.sendMessage(conversationId, content),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['messages', conversationId] });
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
      setMessageInput('');
    },
    onError: (error) => {
      console.error('Failed to send message:', error);
      toast({ title: 'Failed to send message', variant: 'destructive' });
    },
  });

  // Block user mutation
  const blockUserMutation = useMutation({
    mutationFn: async (targetUserId: string) => {
      const { error } = await supabase
        .from('blocked_users')
        .insert({ blocker_id: user?.id, blocked_id: targetUserId });
      if (error) throw error;
      return true;
    },
    onSuccess: () => {
      toast({ title: 'User blocked' });
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
      onClose?.();
    },
    onError: () => {
      toast({ title: 'Failed to block user', variant: 'destructive' });
    },
  });

  // Mute - placeholder
  const handleMuteConversation = () => {
    toast({ title: 'Notifications muted', description: 'Feature coming soon' });
  };

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Mark as read
  useEffect(() => {
    if (conversationId) {
      messageService.markAsRead(conversationId);
    }
  }, [conversationId]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageInput.trim()) return;
    sendMessageMutation.mutate(messageInput.trim());
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMessageInput(e.target.value);
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

  if (conversationLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

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
          <Avatar className="w-10 h-10">
            <AvatarImage src={conversation.other_user_avatar_url || ''} />
            <AvatarFallback className="bg-primary text-primary-foreground">
              {getInitials(conversation.other_user_full_name || '')}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <p className="font-semibold">{conversation.other_user_full_name}</p>
            <p className="text-xs text-muted-foreground">
              @{conversation.other_user_username || 'user'}
            </p>
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
                <DropdownMenuItem onClick={handleMuteConversation}>
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
                  disabled={blockUserMutation.isPending}
                >
                  <Ban className="h-4 w-4 mr-2" />
                  {blockUserMutation.isPending ? 'Blocking...' : 'Block user'}
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

      {/* Messages */}
      <ScrollArea className="flex-1 p-4">
        {messagesLoading ? (
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
                  showReadReceipt={false}
                />
              );
            })}

            <div ref={messagesEndRef} />
          </div>
        )}
      </ScrollArea>

      {/* Message Input */}
      <form onSubmit={handleSendMessage} className="p-4 border-t bg-card">
        <div className="flex gap-2">
          <Input
            value={messageInput}
            onChange={handleInputChange}
            onKeyPress={handleKeyPress}
            placeholder="Type a message..."
            disabled={sendMessageMutation.isPending}
            className="flex-1 text-base md:text-sm"
          />
          <Button
            type="submit"
            disabled={!messageInput.trim() || sendMessageMutation.isPending}
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
