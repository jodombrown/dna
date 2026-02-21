import React, { useRef, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Loader2, Send } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface Message {
  id: string;
  sender_id: string;
  content: string;
  created_at: string;
  read: boolean;
}

interface Conversation {
  id: string;
  otherUser?: {
    full_name?: string;
    avatar_url?: string;
    headline?: string;
  };
}

interface MessageThreadPanelProps {
  conversation: Conversation | null;
  messages?: Message[];
  isLoading: boolean;
  currentUserId?: string;
  messageInput: string;
  onMessageInputChange: (value: string) => void;
  onSendMessage: (e: React.FormEvent) => void;
  isSending: boolean;
}

/**
 * MessageThreadPanel - Right panel (65%) for MESSAGES_MODE
 * Displays active conversation thread and message input
 */
const MessageThreadPanel: React.FC<MessageThreadPanelProps> = ({
  conversation,
  messages,
  isLoading,
  currentUserId,
  messageInput,
  onMessageInputChange,
  onSendMessage,
  isSending,
}) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const getInitials = (name: string) => {
    return name?.split(' ').map(n => n[0]).join('').toUpperCase() || '?';
  };

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  if (!conversation) {
    return (
      <Card className="flex-1 flex items-center justify-center text-muted-foreground">
        <div className="text-center">
          <p className="text-lg">Select a conversation to start messaging</p>
          <p className="text-sm mt-2">Your messages will appear here</p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="flex flex-col h-full">
      {/* Conversation Header */}
      <div className="p-4 border-b flex items-center gap-3">
        <Avatar className="w-10 h-10">
          <AvatarImage src={conversation.otherUser?.avatar_url || ''} />
          <AvatarFallback className="bg-primary text-primary-foreground">
            {getInitials(conversation.otherUser?.full_name || '')}
          </AvatarFallback>
        </Avatar>
        <div>
          <p className="font-semibold">{conversation.otherUser?.full_name}</p>
          {conversation.otherUser?.headline && (
            <p className="text-xs text-muted-foreground">{conversation.otherUser.headline}</p>
          )}
        </div>
      </div>

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
          <div className="space-y-4">
            {messages?.map((message) => {
              const isOwnMessage = message.sender_id === currentUserId;
              return (
                <div
                  key={message.id}
                  className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[70%] rounded-lg px-4 py-2 ${
                      isOwnMessage
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-accent text-accent-foreground'
                    }`}
                  >
                    <p className="text-sm">{message.content}</p>
                    <p className={`text-xs mt-1 ${isOwnMessage ? 'opacity-70' : 'text-muted-foreground'}`}>
                      {formatDistanceToNow(new Date(message.created_at), { addSuffix: true })}
                    </p>
                  </div>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>
        )}
      </ScrollArea>

      {/* Message Input */}
      <form onSubmit={onSendMessage} className="p-4 border-t">
        <div className="flex gap-2">
          <Input
            value={messageInput}
            onChange={(e) => onMessageInputChange(e.target.value)}
            placeholder="Type a message..."
            disabled={isSending}
          />
          <Button
            type="submit"
            disabled={!messageInput.trim() || isSending}
          >
            {isSending ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </Button>
        </div>
      </form>
    </Card>
  );
};

export default MessageThreadPanel;
