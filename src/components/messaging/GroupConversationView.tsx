import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/CleanAuthContext';
import { ArrowLeft, Send, Users, Settings } from 'lucide-react';
import { format } from 'date-fns';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import FileUploadButton from './FileUploadButton';

interface GroupMember {
  id: string;
  user_id: string;
  role: 'admin' | 'moderator' | 'member';
  joined_at: string;
  profile: {
    full_name: string;
    avatar_url?: string;
  };
}

interface GroupMessage {
  id: string;
  sender_id: string;
  content: string;
  attachments?: any[];
  created_at: string;
  sender_profile: {
    full_name: string;
    avatar_url?: string;
  };
}

interface GroupConversation {
  id: string;
  name: string;
  description?: string;
  avatar_url?: string;
  member_count: number;
  created_by: string;
}

interface GroupConversationViewProps {
  conversation: GroupConversation;
  onBack: () => void;
}

const GroupConversationView: React.FC<GroupConversationViewProps> = ({
  conversation,
  onBack
}) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [messages, setMessages] = useState<GroupMessage[]>([]);
  const [members, setMembers] = useState<GroupMember[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    fetchMessages();
    fetchMembers();
  }, [conversation.id]);

  const fetchMessages = async () => {
    try {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('group_conversation_id', conversation.id)
        .order('created_at', { ascending: true })
        .limit(50);

      if (error) throw error;

      if (!data || data.length === 0) {
        setMessages([]);
        return;
      }

      // Get sender profiles separately
      const senderIds = [...new Set(data.map(msg => msg.sender_id))];
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, full_name, avatar_url')
        .in('id', senderIds);

      const formattedMessages: GroupMessage[] = data.map(msg => ({
        id: msg.id,
        sender_id: msg.sender_id,
        content: msg.content || '',
        attachments: msg.attachments ? JSON.parse(msg.attachments as string) : [],
        created_at: msg.created_at,
        sender_profile: {
          full_name: profiles?.find(p => p.id === msg.sender_id)?.full_name || 'Unknown User',
          avatar_url: profiles?.find(p => p.id === msg.sender_id)?.avatar_url
        }
      }));

      setMessages(formattedMessages);
    } catch (error) {
      console.error('Error fetching messages:', error);
      toast({
        title: "Error",
        description: "Failed to load messages",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchMembers = async () => {
    try {
      const { data, error } = await supabase
        .from('group_conversation_members')
        .select('*')
        .eq('group_conversation_id', conversation.id);

      if (error) throw error;

      // Get member profiles separately
      const userIds = (data || []).map(member => member.user_id);
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, full_name, avatar_url')
        .in('id', userIds);

      const formattedMembers: GroupMember[] = (data || []).map(member => ({
        id: member.id,
        user_id: member.user_id,
        role: member.role as 'admin' | 'moderator' | 'member',
        joined_at: member.joined_at,
        profile: {
          full_name: profiles?.find(p => p.id === member.user_id)?.full_name || 'Unknown User',
          avatar_url: profiles?.find(p => p.id === member.user_id)?.avatar_url
        }
      }));

      setMembers(formattedMembers);
    } catch (error) {
      console.error('Error fetching members:', error);
    }
  };

  const sendMessage = async (content: string, attachments?: any[]) => {
    if (!user || (!content.trim() && !attachments?.length)) return;

    setSending(true);
    try {
      // Create a dummy conversation ID for group messages since it's required
      const dummyConversationId = '00000000-0000-0000-0000-000000000000';
      
      const messageData = {
        conversation_id: dummyConversationId, // Required but not used for group messages
        group_conversation_id: conversation.id,
        sender_id: user.id,
        content: content.trim(),
        message_type: attachments?.length ? 'attachment' : 'text',
        attachments: attachments?.length ? JSON.stringify(attachments) : null
      };

      const { error } = await supabase
        .from('messages')
        .insert(messageData);

      if (error) throw error;

      setNewMessage('');
      await fetchMessages();
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: "Error",
        description: "Failed to send message",
        variant: "destructive"
      });
    } finally {
      setSending(false);
    }
  };

  const handleSendMessage = () => {
    sendMessage(newMessage);
  };

  const handleFileUploaded = (url: string, filename: string) => {
    const attachment = {
      url,
      filename,
      type: 'file'
    };
    sendMessage('', [attachment]);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'admin': return 'bg-red-500';
      case 'moderator': return 'bg-blue-500';
      default: return 'bg-gray-500';
    }
  };

  if (loading) {
    return (
      <Card className="h-[600px] flex flex-col">
        <CardContent className="pt-6 flex items-center justify-center h-full">
          <div className="text-gray-600">Loading group conversation...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-[600px] flex flex-col">
      <CardHeader className="pb-4 border-b">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm" onClick={onBack}>
              <ArrowLeft className="w-4 h-4" />
            </Button>
            
            <Avatar className="w-8 h-8">
              <AvatarImage src={conversation.avatar_url} />
              <AvatarFallback>
                <Users className="w-4 h-4" />
              </AvatarFallback>
            </Avatar>
            
            <div>
              <CardTitle className="text-lg">{conversation.name}</CardTitle>
              <p className="text-sm text-gray-500">{members.length} members</p>
            </div>
          </div>

          <Button variant="ghost" size="sm">
            <Settings className="w-4 h-4" />
          </Button>
        </div>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col p-0">
        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No messages yet. Start the conversation!
            </div>
          ) : (
            messages.map((message) => {
              const isOwn = message.sender_id === user?.id;
              
              return (
                <div
                  key={message.id}
                  className={`flex ${isOwn ? 'justify-end' : 'justify-start'} gap-2`}
                >
                  {!isOwn && (
                    <Avatar className="w-8 h-8">
                      <AvatarImage src={message.sender_profile.avatar_url} />
                      <AvatarFallback>
                        {message.sender_profile.full_name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                  )}
                  
                  <div className={`max-w-[70%] ${isOwn ? 'order-first' : ''}`}>
                    {!isOwn && (
                      <p className="text-xs text-gray-500 mb-1 px-1">
                        {message.sender_profile.full_name}
                      </p>
                    )}
                    
                    <div
                      className={`rounded-lg px-4 py-2 ${
                        isOwn
                          ? 'bg-dna-emerald text-white'
                          : 'bg-gray-100 text-gray-900'
                      }`}
                    >
                      {message.content && <p className="text-sm">{message.content}</p>}
                      
                      {message.attachments?.map((attachment, index) => (
                        <div key={index} className="mt-2">
                          <a
                            href={attachment.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={`text-sm underline ${
                              isOwn ? 'text-emerald-100' : 'text-blue-600'
                            }`}
                          >
                            📎 {attachment.filename}
                          </a>
                        </div>
                      ))}
                      
                      <p className={`text-xs mt-1 ${
                        isOwn ? 'text-emerald-100' : 'text-gray-500'
                      }`}>
                        {format(new Date(message.created_at), 'h:mm a')}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Members List */}
        <div className="border-t p-4 bg-gray-50">
          <div className="flex items-center gap-2 mb-2">
            <Users className="w-4 h-4 text-gray-500" />
            <span className="text-sm text-gray-700">Members ({members.length})</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {members.slice(0, 8).map(member => (
              <div key={member.id} className="flex items-center gap-1">
                <Avatar className="w-6 h-6">
                  <AvatarImage src={member.profile.avatar_url} />
                  <AvatarFallback className="text-xs">
                    {member.profile.full_name.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <span className="text-xs text-gray-600">{member.profile.full_name}</span>
                {member.role !== 'member' && (
                  <Badge 
                    className={`text-xs ${getRoleBadgeColor(member.role)} text-white`}
                  >
                    {member.role}
                  </Badge>
                )}
              </div>
            ))}
            {members.length > 8 && (
              <span className="text-xs text-gray-500">+{members.length - 8} more</span>
            )}
          </div>
        </div>

        {/* Message Input */}
        <div className="border-t p-4">
          <div className="flex gap-2">
            <FileUploadButton
              onFileUploaded={handleFileUploaded}
              disabled={sending}
            />
            <Textarea
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type your message..."
              className="resize-none min-h-[60px]"
              disabled={sending}
            />
            <Button
              onClick={handleSendMessage}
              disabled={!newMessage.trim() || sending}
              className="self-end bg-dna-emerald hover:bg-dna-forest"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            Press Enter to send, Shift+Enter for new line
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default GroupConversationView;