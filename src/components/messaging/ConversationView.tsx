import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Textarea } from '@/components/ui/textarea';
import { 
  ArrowLeft, 
  Paperclip, 
  Smile, 
  Send, 
  MoreVertical,
  Star,
  Archive,
  Trash2,
  AlertTriangle
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface Message {
  id: string;
  content: string;
  sender_id: string;
  created_at: string;
  is_read: boolean;
  conversation_id: string;
}

interface Conversation {
  id: string;
  user_1_id: string;
  user_2_id: string;
  last_message_at: string;
}

interface ConversationViewProps {
  conversationId: string | null;
  onBack?: () => void;
  showBackButton?: boolean;
}

const ConversationView: React.FC<ConversationViewProps> = ({ 
  conversationId, 
  onBack, 
  showBackButton = false 
}) => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [otherUser, setOtherUser] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (conversationId && user) {
      fetchMessages();
      fetchOtherUser();
    }
  }, [conversationId, user]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const fetchMessages = async () => {
    if (!conversationId) return;

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('messages' as any)
        .select('*')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true });
      
      if (error) throw error;
      setMessages((data as unknown as Message[]) || []);
    } catch (error) {
      console.error('Error fetching messages:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchOtherUser = async () => {
    if (!conversationId || !user) return;

    try {
      // Get conversation details
      const { data: convData, error: convError } = await supabase
        .from('conversations' as any)
        .select('user_1_id, user_2_id')
        .eq('id', conversationId)
        .single();

      if (convError) throw convError;

      const conversation = convData as unknown as Conversation;
      const otherUserId = conversation.user_1_id === user.id ? conversation.user_2_id : conversation.user_1_id;

      const { data: userData, error: userError } = await supabase
        .from('profiles')
        .select('full_name, avatar_url, headline')
        .eq('id', otherUserId)
        .single();

      if (userError) throw userError;
      setOtherUser(userData);
    } catch (error) {
      console.error('Error fetching other user:', error);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !conversationId || !user || sending) return;

    setSending(true);
    try {
      const { error } = await supabase
        .from('messages' as any)
        .insert({
          conversation_id: conversationId,
          sender_id: user.id,
          content: newMessage.trim()
        });

      if (error) throw error;

      setNewMessage('');
      fetchMessages(); // Refresh messages
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setSending(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  if (!conversationId) {
    return (
      <div className="h-full flex items-center justify-center text-gray-500">
        <div className="text-center">
          <h3 className="text-lg font-medium mb-2">No conversation selected</h3>
          <p className="text-sm">Choose a conversation from the left to start messaging</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <CardHeader className="border-b border-gray-200 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            {showBackButton && (
              <Button variant="ghost" size="sm" onClick={onBack}>
                <ArrowLeft className="h-4 w-4" />
              </Button>
            )}
            
            {otherUser && (
              <>
                <Avatar className="h-8 w-8">
                  <AvatarImage src={otherUser.avatar_url} />
                  <AvatarFallback className="bg-dna-emerald text-white">
                    {otherUser.full_name?.charAt(0) || 'U'}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-medium text-dna-forest">{otherUser.full_name}</h3>
                  {otherUser.headline && (
                    <p className="text-xs text-gray-500">{otherUser.headline}</p>
                  )}
                </div>
              </>
            )}
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>
                <Star className="h-4 w-4 mr-2" />
                Star conversation
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Archive className="h-4 w-4 mr-2" />
                Archive
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-red-600">
                <AlertTriangle className="h-4 w-4 mr-2" />
                Report
              </DropdownMenuItem>
              <DropdownMenuItem className="text-red-600">
                <Trash2 className="h-4 w-4 mr-2" />
                Delete conversation
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>

      {/* Messages */}
      <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
        {loading ? (
          <div className="text-center text-gray-500">Loading messages...</div>
        ) : messages.length === 0 ? (
          <div className="text-center text-gray-500">
            <p>No messages yet. Start the conversation!</p>
          </div>
        ) : (
          messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.sender_id === user?.id ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                  message.sender_id === user?.id
                    ? 'bg-dna-emerald text-white'
                    : 'bg-gray-100 text-gray-900'
                }`}
              >
                <p className="text-sm">{message.content}</p>
                <p className={`text-xs mt-1 ${
                  message.sender_id === user?.id ? 'text-emerald-100' : 'text-gray-500'
                }`}>
                  {new Date(message.created_at).toLocaleTimeString([], { 
                    hour: '2-digit', 
                    minute: '2-digit' 
                  })}
                </p>
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </CardContent>

      {/* Message Input */}
      <div className="border-t border-gray-200 p-4">
        <div className="flex items-end space-x-2">
          <Button variant="ghost" size="sm">
            <Paperclip className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm">
            <Smile className="h-4 w-4" />
          </Button>
          
          <div className="flex-1">
            <Textarea
              placeholder="Type your message..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              className="min-h-[40px] max-h-32 resize-none"
            />
          </div>
          
          <Button 
            onClick={sendMessage} 
            disabled={!newMessage.trim() || sending}
            className="bg-dna-emerald hover:bg-dna-emerald/90"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ConversationView;