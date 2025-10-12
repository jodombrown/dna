import React, { useRef, useEffect, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { messagingService } from '@/services/messagingService';
import { useAuth } from '@/contexts/AuthContext';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Loader2, Send } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import MessageBubble from './MessageBubble';
import { TypingIndicator } from './TypingIndicator';

interface ConversationThreadProps {
  conversationId: string;
  onClose?: () => void;
  isOverlay?: boolean;
}

/**
 * ConversationThread - Full conversation view with messages
 * 
 * Features:
 * - Real-time message updates
 * - Auto-scroll to bottom
 * - Typing indicators
 * - Message input with send
 * - Smart timestamp formatting
 * - Read receipts
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
  const [isTyping, setIsTyping] = useState(false);

  // Fetch conversation details
  const { data: conversations } = useQuery({
    queryKey: ['conversations'],
    queryFn: messagingService.getConversations,
  });

  const conversation = conversations?.find(c => c.id === conversationId);

  // Fetch messages
  const { data: messages, isLoading } = useQuery({
    queryKey: ['messages', conversationId],
    queryFn: () => messagingService.getMessages(conversationId),
    enabled: !!conversationId,
  });

  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: (content: string) => messagingService.sendMessage(conversationId, content),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['messages', conversationId] });
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
      setMessageInput('');
    },
    onError: () => {
      toast({ title: 'Failed to send message', variant: 'destructive' });
    },
  });

  // Subscribe to real-time messages
  useEffect(() => {
    if (!conversationId) return;

    const channel = messagingService.subscribeToMessages(conversationId, () => {
      queryClient.invalidateQueries({ queryKey: ['messages', conversationId] });
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
    });

    return () => {
      channel.unsubscribe();
    };
  }, [conversationId, queryClient]);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Mark as read
  useEffect(() => {
    if (conversationId) {
      messagingService.markAsRead(conversationId);
    }
  }, [conversationId]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageInput.trim()) return;

    sendMessageMutation.mutate(messageInput.trim());
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMessageInput(e.target.value);
    // TODO: Implement typing indicator broadcast
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage(e);
    }
  };

  const getInitials = (name: string) => {
    return name?.split(' ').map(n => n[0]).join('').toUpperCase() || '?';
  };

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
            <AvatarImage src={conversation.otherUser?.avatar_url || ''} />
            <AvatarFallback className="bg-primary text-primary-foreground">
              {getInitials(conversation.otherUser?.full_name || '')}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <p className="font-semibold">{conversation.otherUser?.full_name}</p>
            {conversation.otherUser?.headline && (
              <p className="text-xs text-muted-foreground">{conversation.otherUser.headline}</p>
            )}
          </div>
          {onClose && (
            <Button variant="ghost" size="sm" onClick={onClose}>
              ×
            </Button>
          )}
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
            {messages?.map((message) => (
              <MessageBubble
                key={message.id}
                message={{
                  ...message,
                  sender: message.sender_id === user?.id 
                    ? undefined 
                    : conversation.otherUser,
                }}
                isMine={message.sender_id === user?.id}
              />
            ))}
            {isTyping && (
              <TypingIndicator 
                users={[{ 
                  user_id: conversation.otherUser?.id || '', 
                  display_name: conversation.otherUser?.full_name || 'User' 
                }]} 
              />
            )}
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
            className="flex-1"
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
