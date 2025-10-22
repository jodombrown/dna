import { useEffect, useRef, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { MessageBubble } from './MessageBubble';
import { MessageComposer } from './MessageComposer';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { MessageWithSender } from '@/types/messaging';
import { supabase } from '@/integrations/supabase/client';
import { ArrowLeft, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface ConversationViewProps {
  conversationId: string;
  currentUserId: string;
  otherUserName: string;
  otherUserUsername: string;
  otherUserAvatar?: string;
  onBack?: () => void;
}

export function ConversationView({
  conversationId,
  currentUserId,
  otherUserName,
  otherUserUsername,
  otherUserAvatar,
  onBack,
}: ConversationViewProps) {
  const navigate = useNavigate();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const [messages, setMessages] = useState<MessageWithSender[]>([]);

  const { data, isLoading } = useQuery({
    queryKey: ['conversation-messages', conversationId],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('get_conversation_messages', {
        p_conversation_id: conversationId,
        p_user_id: currentUserId,
        p_limit: 50,
        p_before_timestamp: null,
      });

      if (error) throw error;
      return (data || []) as MessageWithSender[];
    },
    enabled: !!conversationId,
  });

  useEffect(() => {
    if (data) {
      setMessages([...data].reverse());
    }
  }, [data]);

  // Real-time subscription for new messages
  useEffect(() => {
    const channel = supabase
      .channel(`conversation:${conversationId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages_new',
          filter: `conversation_id=eq.${conversationId}`,
        },
        async (payload) => {
          // Fetch the complete message with sender info
          const { data: newMessageData } = await supabase.rpc('get_conversation_messages', {
            p_conversation_id: conversationId,
            p_user_id: currentUserId,
            p_limit: 1,
            p_before_timestamp: null,
          });

          if (newMessageData && newMessageData.length > 0) {
            setMessages((prev) => [...prev, newMessageData[0]]);
          }
        }
      )
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, [conversationId, currentUserId]);

  // Mark conversation as read
  useEffect(() => {
    const markAsRead = async () => {
      await supabase.rpc('mark_conversation_read', {
        p_conversation_id: conversationId,
        p_user_id: currentUserId,
      });
    };

    markAsRead();
  }, [conversationId, currentUserId]);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const handleMessageSent = () => {
    // Messages will be added via real-time subscription
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="border-b bg-background p-4 flex items-center gap-3">
        {onBack && (
          <Button variant="ghost" size="icon" onClick={onBack} className="md:hidden">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        )}
        <Avatar
          className="h-10 w-10 cursor-pointer"
          onClick={() => navigate(`/dna/${otherUserUsername}`)}
        >
          <AvatarImage src={otherUserAvatar} alt={otherUserName} />
          <AvatarFallback className="bg-primary text-primary-foreground">
            {getInitials(otherUserName)}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <h2
            className="font-semibold truncate cursor-pointer hover:text-primary transition-colors"
            onClick={() => navigate(`/dna/${otherUserUsername}`)}
          >
            {otherUserName}
          </h2>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate(`/dna/${otherUserUsername}`)}
        >
          <User className="h-4 w-4 mr-2" />
          View Profile
        </Button>
      </div>

      {/* Messages */}
      <div
        ref={messagesContainerRef}
        className="flex-1 overflow-y-auto p-4 space-y-4"
        style={{ minHeight: 0 }}
      >
        {isLoading ? (
          <div className="flex items-center justify-center h-full text-muted-foreground">
            Loading messages...
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <p className="text-muted-foreground mb-2">No messages yet</p>
            <p className="text-sm text-muted-foreground">
              Start the conversation with {otherUserName}
            </p>
          </div>
        ) : (
          <>
            {messages.map((message, index) => {
              const isOwnMessage = message.sender_id === currentUserId;
              const prevMessage = index > 0 ? messages[index - 1] : null;
              const showAvatar = !prevMessage || prevMessage.sender_id !== message.sender_id;

              return (
                <MessageBubble
                  key={message.message_id}
                  message={message}
                  isOwnMessage={isOwnMessage}
                  showAvatar={showAvatar}
                />
              );
            })}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Composer */}
      <MessageComposer
        conversationId={conversationId}
        currentUserId={currentUserId}
        onMessageSent={handleMessageSent}
      />
    </div>
  );
}
