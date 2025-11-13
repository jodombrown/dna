import React, { useEffect, useRef, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Send, MoreVertical } from 'lucide-react';
import { BlockUserDialog } from '@/components/safety/BlockUserDialog';
import { ReportDialog } from '@/components/safety/ReportDialog';
import { useAnalytics } from '@/hooks/useAnalytics';
import { format } from 'date-fns';
import { useAuth } from '@/contexts/AuthContext';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface Message {
  message_id: string;
  sender_id: string;
  sender_username: string;
  sender_full_name: string;
  sender_avatar_url?: string;
  content: string;
  created_at: string;
  is_deleted: boolean;
}

interface MessageThreadProps {
  messages: Message[];
  otherUser: {
    id: string;
    username: string;
    full_name: string;
    avatar_url?: string;
    headline?: string;
  };
  conversationId: string;
  onSendMessage: (content: string) => Promise<void>;
  onBlock: () => void;
  onReport: () => void;
}

export const MessageThread: React.FC<MessageThreadProps> = ({
  messages,
  otherUser,
  conversationId,
  onSendMessage,
  onBlock,
  onReport,
}) => {
  const { user } = useAuth();
  const [messageContent, setMessageContent] = useState('');
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [showBlockDialog, setShowBlockDialog] = useState(false);
  const [showReportDialog, setShowReportDialog] = useState(false);
  const { trackEvent } = useAnalytics();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!messageContent.trim() || sending) return;

    setSending(true);
    try {
      await onSendMessage(messageContent.trim());
      await trackEvent('connect_message_sent', {
        conversation_id: conversationId,
        target_user_id: otherUser.id,
      });
      setMessageContent('');
    } finally {
      setSending(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="border-b p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10">
            <AvatarImage src={otherUser.avatar_url} alt={otherUser.full_name} />
            <AvatarFallback>
              {otherUser.full_name
                .split(' ')
                .map((n) => n[0])
                .join('')
                .slice(0, 2)}
            </AvatarFallback>
          </Avatar>
          <div>
            <h3 className="font-semibold">{otherUser.full_name}</h3>
            {otherUser.headline && (
              <p className="text-sm text-muted-foreground">{otherUser.headline}</p>
            )}
          </div>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => setShowReportDialog(true)}>
              Report Conversation
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setShowBlockDialog(true)} className="text-destructive">
              Block User
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="text-center text-muted-foreground py-8">
            <p>No messages yet</p>
            <p className="text-sm mt-2">Start the conversation!</p>
          </div>
        ) : (
          messages.map((message) => {
            const isMe = message.sender_id === user?.id;
            return (
              <div
                key={message.message_id}
                className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`flex gap-2 max-w-[70%] ${isMe ? 'flex-row-reverse' : 'flex-row'}`}>
                  {!isMe && (
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={message.sender_avatar_url} alt={message.sender_full_name} />
                      <AvatarFallback>
                        {message.sender_full_name
                          .split(' ')
                          .map((n) => n[0])
                          .join('')
                          .slice(0, 2)}
                      </AvatarFallback>
                    </Avatar>
                  )}
                  <div className={`space-y-1 ${isMe ? 'items-end' : 'items-start'}`}>
                    <Card className={isMe ? 'bg-dna-copper text-white' : ''}>
                      <CardContent className="p-3">
                        <p className="text-sm whitespace-pre-wrap break-words">{message.content}</p>
                      </CardContent>
                    </Card>
                    <span className="text-xs text-muted-foreground px-1">
                      {format(new Date(message.created_at), 'MMM d, h:mm a')}
                    </span>
                  </div>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Composer */}
      <div className="border-t p-4">
        <div className="flex gap-2">
          <Textarea
            placeholder="Type a message..."
            value={messageContent}
            onChange={(e) => setMessageContent(e.target.value)}
            onKeyDown={handleKeyPress}
            className="resize-none"
            rows={2}
          />
          <Button onClick={handleSend} disabled={!messageContent.trim() || sending} size="icon">
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <BlockUserDialog
        open={showBlockDialog}
        onOpenChange={setShowBlockDialog}
        userId={otherUser.id}
        userName={otherUser.full_name}
        onBlockSuccess={onBlock}
      />

      <ReportDialog
        open={showReportDialog}
        onOpenChange={setShowReportDialog}
        targetUserId={otherUser.id}
        conversationId={conversationId}
        context="conversation"
      />
    </div>
  );
};
