import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Search, Send, MoreVertical, Phone, Video, ArrowLeft, User } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useRealtimeMessaging } from '@/hooks/useRealtimeMessaging';
import { useAuth } from '@/contexts/AuthContext';
import { format, isToday, isYesterday } from 'date-fns';
import { MessageThreadView } from './MessageThreadView';

interface EnhancedMessagingViewProps {
  className?: string;
}

export const EnhancedMessagingView: React.FC<EnhancedMessagingViewProps> = ({ className }) => {
  const { user } = useAuth();
  const [messageText, setMessageText] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [isMobileView, setIsMobileView] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout>();

  const {
    conversations,
    selectedConversation,
    setSelectedConversation,
    messages,
    typingUsers,
    loading,
    sendMessage,
    startTyping,
    stopTyping
  } = useRealtimeMessaging(user?.id);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Detect mobile view
  useEffect(() => {
    const checkMobileView = () => {
      setIsMobileView(window.innerWidth < 768);
    };
    
    checkMobileView();
    window.addEventListener('resize', checkMobileView);
    return () => window.removeEventListener('resize', checkMobileView);
  }, []);

  const handleSendMessage = async () => {
    if (!messageText.trim() || !selectedConversation) return;
    
    await sendMessage(selectedConversation, messageText);
    setMessageText('');
    
    // Stop typing indicator
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    await stopTyping(selectedConversation);
  };

  const handleTyping = async (value: string) => {
    setMessageText(value);
    
    if (!selectedConversation || !value.trim()) return;

    // Start typing indicator
    await startTyping(selectedConversation);
    
    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    
    // Stop typing after 2 seconds of inactivity
    typingTimeoutRef.current = setTimeout(() => {
      stopTyping(selectedConversation);
    }, 2000);
  };

  const formatMessageTime = (timestamp: string) => {
    const date = new Date(timestamp);
    
    if (isToday(date)) {
      return format(date, 'HH:mm');
    } else if (isYesterday(date)) {
      return `Yesterday ${format(date, 'HH:mm')}`;
    } else {
      return format(date, 'MMM d, HH:mm');
    }
  };

  const filteredConversations = conversations.filter(conv =>
    conv.other_user?.display_name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const currentConversation = conversations.find(c => c.id === selectedConversation);

  // Mobile back button handler
  const handleBackToList = () => {
    setSelectedConversation(null);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px] h-[calc(100vh-200px)] max-h-[600px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-dna-copper mx-auto mb-2"></div>
          <p className="text-gray-500">Loading conversations...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("min-h-[400px] h-[calc(100vh-200px)] max-h-[80vh] md:grid md:grid-cols-3 gap-2 sm:gap-4", className)}>
      {/* Conversations List - Hidden on mobile when chat is selected */}
      <Card className={cn(
        "md:col-span-1",
        isMobileView && selectedConversation ? "hidden" : "block"
      )}>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg text-dna-forest">Messages</CardTitle>
            <Button size="sm" variant="outline">New</Button>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search conversations"
              className="pl-10 h-9"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <ScrollArea className="h-[450px]">
            {filteredConversations.map((conversation) => (
              <div
                key={conversation.id}
                onClick={() => setSelectedConversation(conversation.id)}
                className={cn(
                  "p-4 border-b cursor-pointer hover:bg-gray-50 transition-colors",
                  selectedConversation === conversation.id 
                    ? "bg-dna-mint/20 border-l-4 border-dna-copper" 
                    : ""
                )}
              >
                <div className="flex items-center space-x-3">
                  <div className="relative">
                <Avatar className="w-10 h-10">
                  <AvatarImage src={conversation.other_user?.avatar_url} />
                  <AvatarFallback className="bg-dna-emerald/10 text-dna-emerald">
                    <User className="w-5 h-5" />
                  </AvatarFallback>
                </Avatar>
                    {/* Online indicator - could be enhanced with real presence */}
                    <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="font-medium text-dna-forest truncate">
                        {conversation.other_user?.display_name || 'Unknown User'}
                      </p>
                      <p className="text-xs text-gray-500">
                        {conversation.last_message_at && formatMessageTime(conversation.last_message_at)}
                      </p>
                    </div>
                    <p className="text-sm text-gray-600 truncate">
                      {conversation.last_message?.content || 'No messages yet'}
                    </p>
                  </div>
                  {conversation.unread_count && conversation.unread_count > 0 && (
                    <Badge variant="destructive" className="bg-dna-copper">
                      {conversation.unread_count}
                    </Badge>
                  )}
                </div>
              </div>
            ))}
            {filteredConversations.length === 0 && (
              <div className="p-8 text-center text-gray-500">
                <p>{searchQuery ? 'No conversations found' : 'No conversations yet'}</p>
              </div>
            )}
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Chat Area - Full width on mobile when selected */}
      <Card className={cn(
        "md:col-span-2",
        isMobileView && !selectedConversation ? "hidden" : "block"
      )}>
        {currentConversation ? (
          <MessageThreadView
            conversation={currentConversation}
            messages={messages}
            currentUserId={user?.id || ''}
            messageText={messageText}
            onMessageTextChange={setMessageText}
            onSendMessage={handleSendMessage}
            onTyping={() => selectedConversation && startTyping(selectedConversation)}
            typingUsers={typingUsers}
            className="h-full"
          />
        ) : (
          <div className="flex items-center justify-center h-full">
            <p className="text-gray-500">Select a conversation to start messaging</p>
          </div>
        )}
      </Card>
    </div>
  );
};

export default EnhancedMessagingView;