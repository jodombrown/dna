import { useEffect, useRef } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { MessageBubble, MessageDateSeparator } from './MessageBubble';
import { MessageComposer } from './MessageComposer';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { messageService, MessageWithSender } from '@/services/messageService';
import { supabase } from '@/integrations/supabase/client';
import { ArrowLeft, Phone, Video, Info } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';

interface ConversationViewProps {
  conversationId: string;
  currentUserId: string;
  otherUserName: string;
  otherUserUsername: string;
  otherUserAvatar?: string;
  onBack?: () => void;
}

/**
 * Apple Messages-inspired conversation view
 * - Clean header with avatar and actions
 * - Date separators between message groups
 * - Smooth scrolling with message bubbles
 */
export function ConversationView({
  conversationId,
  currentUserId,
  otherUserName,
  otherUserUsername,
  otherUserAvatar,
  onBack,
}: ConversationViewProps) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  const { data: messages = [], isLoading } = useQuery({
    queryKey: ['messages', conversationId],
    queryFn: () => messageService.getMessages(conversationId),
    enabled: !!conversationId,
  });

  // Real-time subscription
  useEffect(() => {
    const channel = supabase
      .channel(`conversation:${conversationId}`)
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
      channel.unsubscribe();
    };
  }, [conversationId, queryClient]);

  // Mark as read
  useEffect(() => {
    if (conversationId) {
      messageService.markAsRead(conversationId);
    }
  }, [conversationId]);

  // Scroll to bottom
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

  // Group messages by date for date separators
  const groupMessagesByDate = (msgs: MessageWithSender[]) => {
    const groups: { date: Date; messages: MessageWithSender[] }[] = [];
    let currentDate: string | null = null;

    msgs.forEach((msg) => {
      const msgDate = new Date(msg.created_at);
      const dateKey = msgDate.toDateString();

      if (dateKey !== currentDate) {
        currentDate = dateKey;
        groups.push({ date: msgDate, messages: [msg] });
      } else {
        groups[groups.length - 1].messages.push(msg);
      }
    });

    return groups;
  };

  const messageGroups = groupMessagesByDate(messages);

  return (
    <div className="flex flex-col h-full">
      {/* Header - Apple Messages style */}
      <div className="bg-background/95 backdrop-blur-sm border-b border-border/50 px-4 py-2 flex items-center gap-3">
        {onBack && (
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={onBack} 
            className="h-9 w-9 -ml-2 text-primary"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
        )}
        
        <div 
          className="flex items-center gap-3 flex-1 cursor-pointer"
          onClick={() => navigate(`/dna/${otherUserUsername}`)}
        >
          <Avatar className="h-9 w-9">
            <AvatarImage src={otherUserAvatar} alt={otherUserName} />
            <AvatarFallback className="bg-muted text-muted-foreground text-sm">
              {getInitials(otherUserName)}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <h2 className="font-semibold text-[15px] truncate">{otherUserName}</h2>
          </div>
        </div>

        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate(`/dna/${otherUserUsername}`)}
          className="h-9 w-9 text-primary"
        >
          <Info className="h-5 w-5" />
        </Button>
      </div>

      {/* Messages - scrollable area */}
      <div
        ref={messagesContainerRef}
        className="flex-1 overflow-y-auto px-4 py-4"
        style={{ minHeight: 0 }}
      >
        {isLoading ? (
          <div className="flex items-center justify-center h-full text-muted-foreground">
            Loading messages...
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center py-16">
            <Avatar className="h-20 w-20 mb-4">
              <AvatarImage src={otherUserAvatar} alt={otherUserName} />
              <AvatarFallback className="bg-muted text-muted-foreground text-xl">
                {getInitials(otherUserName)}
              </AvatarFallback>
            </Avatar>
            <h3 className="font-semibold text-lg mb-1">{otherUserName}</h3>
            <p className="text-sm text-muted-foreground">
              Start a conversation
            </p>
          </div>
        ) : (
          <>
            {messageGroups.map((group, groupIndex) => (
              <div key={groupIndex}>
                <MessageDateSeparator date={group.date} />
                {group.messages.map((message, index) => {
                  const isOwnMessage = message.sender_id === currentUserId;
                  const prevMessage = index > 0 ? group.messages[index - 1] : null;
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
              </div>
            ))}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Composer */}
      <MessageComposer
        conversationId={conversationId}
        currentUserId={currentUserId}
        onMessageSent={() => {}}
      />
    </div>
  );
}
