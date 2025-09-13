import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  MoreVertical, 
  Phone, 
  Video, 
  Info, 
  Star,
  Reply,
  Forward,
  Trash2,
  Clock,
  Check,
  CheckCheck,
  User
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { format, formatDistanceToNow, isToday, isYesterday } from 'date-fns';
import { Message, Conversation } from '@/hooks/useRealtimeMessaging';
import { AdvancedMessageComposer } from './AdvancedMessageComposer';

interface MessageThreadViewProps {
  conversation: Conversation;
  messages: Message[];
  currentUserId: string;
  messageText: string;
  onMessageTextChange: (text: string) => void;
  onSendMessage: () => void;
  onTyping: () => void;
  typingUsers: any[];
  className?: string;
}

export const MessageThreadView: React.FC<MessageThreadViewProps> = ({
  conversation,
  messages,
  currentUserId,
  messageText,
  onMessageTextChange,
  onSendMessage,
  onTyping,
  typingUsers,
  className
}) => {
  const [selectedMessage, setSelectedMessage] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const formatMessageTime = (timestamp: string) => {
    const date = new Date(timestamp);
    
    if (isToday(date)) {
      return format(date, 'h:mm a');
    } else if (isYesterday(date)) {
      return `Yesterday ${format(date, 'h:mm a')}`;
    } else {
      return format(date, 'MMM d, h:mm a');
    }
  };

  const getMessageStatus = (message: Message) => {
    const isOwnMessage = message.sender_id === currentUserId;
    if (!isOwnMessage) return null;

    const isRead = message.read_by?.includes(conversation.other_user?.id || '');
    
    if (isRead) {
      return <CheckCheck className="w-4 h-4 text-blue-500" />;
    } else {
      return <Check className="w-4 h-4 text-gray-400" />;
    }
  };

  const groupMessagesByDate = (messages: Message[]) => {
    const groups: { [key: string]: Message[] } = {};
    
    messages.forEach(message => {
      const date = format(new Date(message.created_at), 'yyyy-MM-dd');
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(message);
    });
    
    return groups;
  };

  const getDateHeader = (dateStr: string) => {
    const date = new Date(dateStr);
    
    if (isToday(date)) {
      return 'Today';
    } else if (isYesterday(date)) {
      return 'Yesterday';
    } else {
      return format(date, 'MMMM d, yyyy');
    }
  };

  const messageGroups = groupMessagesByDate(messages);

  return (
    <Card className={cn("flex flex-col h-full", className)}>
      {/* Thread Header */}
      <CardHeader className="border-b p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10">
              <AvatarImage src={conversation.other_user?.avatar_url} />
              <AvatarFallback className="bg-dna-emerald/10 text-dna-emerald">
                <User className="w-5 h-5" />
              </AvatarFallback>
            </Avatar>
            
            <div>
              <h3 className="font-semibold text-foreground">
                {conversation.other_user?.display_name || 'Unknown User'}
              </h3>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                Active now
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" disabled>
              <Phone className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="sm" disabled>
              <Video className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="sm">
              <Info className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="sm">
              <MoreVertical className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardHeader>

      {/* Messages Area */}
      <CardContent className="flex-1 p-0">
        <ScrollArea ref={scrollAreaRef} className="h-full p-4">
          <div className="space-y-6">
            {Object.entries(messageGroups).map(([dateStr, dayMessages]) => (
              <div key={dateStr}>
                {/* Date separator */}
                <div className="flex items-center justify-center my-4">
                  <Badge variant="secondary" className="bg-muted">
                    {getDateHeader(dateStr)}
                  </Badge>
                </div>

                {/* Messages for this date */}
                <div className="space-y-3">
                  {dayMessages.map((message, index) => {
                    const isOwnMessage = message.sender_id === currentUserId;
                    const showAvatar = index === 0 || 
                      dayMessages[index - 1].sender_id !== message.sender_id;

                    return (
                      <div
                        key={message.id}
                        className={cn(
                          "flex gap-3 group",
                          isOwnMessage ? "justify-end" : "justify-start"
                        )}
                      >
                        {!isOwnMessage && (
                          <Avatar className={cn("h-8 w-8", !showAvatar && "invisible")}>
                            <AvatarImage src={message.sender?.avatar_url} />
                            <AvatarFallback className="bg-dna-emerald/10 text-dna-emerald text-xs">
                              <User className="w-4 h-4" />
                            </AvatarFallback>
                          </Avatar>
                        )}

                        <div className={cn(
                          "flex flex-col gap-1 max-w-[70%]",
                          isOwnMessage && "items-end"
                        )}>
                          <div
                            className={cn(
                              "px-4 py-2 rounded-2xl break-words cursor-pointer transition-all",
                              isOwnMessage
                                ? "bg-dna-emerald text-white rounded-br-md"
                                : "bg-muted text-foreground rounded-bl-md",
                              selectedMessage === message.id && "ring-2 ring-dna-copper"
                            )}
                            onClick={() => setSelectedMessage(
                              selectedMessage === message.id ? null : message.id
                            )}
                          >
                            <p className="text-sm leading-relaxed whitespace-pre-wrap">
                              {message.content}
                            </p>
                          </div>

                          <div className={cn(
                            "flex items-center gap-2 text-xs text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity",
                            isOwnMessage && "flex-row-reverse"
                          )}>
                            <span>{formatMessageTime(message.created_at)}</span>
                            {getMessageStatus(message)}
                          </div>

                          {/* Message actions */}
                          {selectedMessage === message.id && (
                            <div className={cn(
                              "flex items-center gap-1 mt-1",
                              isOwnMessage && "flex-row-reverse"
                            )}>
                              <Button variant="ghost" size="sm" className="h-6 px-2">
                                <Reply className="w-3 h-3" />
                              </Button>
                              <Button variant="ghost" size="sm" className="h-6 px-2">
                                <Forward className="w-3 h-3" />
                              </Button>
                              <Button variant="ghost" size="sm" className="h-6 px-2">
                                <Star className="w-3 h-3" />
                              </Button>
                              {isOwnMessage && (
                                <Button variant="ghost" size="sm" className="h-6 px-2 text-destructive">
                                  <Trash2 className="w-3 h-3" />
                                </Button>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}

            {/* Typing indicator */}
            {typingUsers.length > 0 && (
              <div className="flex items-center gap-3">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={conversation.other_user?.avatar_url} />
                  <AvatarFallback className="bg-dna-emerald/10 text-dna-emerald text-xs">
                    <User className="w-4 h-4" />
                  </AvatarFallback>
                </Avatar>
                <div className="flex items-center gap-2 px-4 py-2 bg-muted rounded-2xl rounded-bl-md">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                    <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                    <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>
      </CardContent>

      {/* Message Composer */}
      <AdvancedMessageComposer
        value={messageText}
        onChange={onMessageTextChange}
        onSend={onSendMessage}
        onTyping={onTyping}
        placeholder={`Message ${conversation.other_user?.display_name || 'user'}...`}
        className="border-t"
      />
    </Card>
  );
};