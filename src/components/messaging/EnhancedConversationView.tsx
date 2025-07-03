
import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/CleanAuthContext';
import { useEnhancedMessages, type FileAttachment } from '@/hooks/useEnhancedMessages';
import FileAttachmentUpload from './FileAttachmentUpload';
import { ArrowLeft, Send, User, Paperclip, Download, Users, Check, CheckCheck } from 'lucide-react';
import { format } from 'date-fns';
import type { Conversation } from '@/hooks/useConversations';
import type { GroupConversation } from '@/hooks/useGroupConversations';

interface EnhancedConversationViewProps {
  conversation?: Conversation;
  groupConversation?: GroupConversation;
  onBack: () => void;
}

const EnhancedConversationView: React.FC<EnhancedConversationViewProps> = ({
  conversation,
  groupConversation,
  onBack
}) => {
  const { user } = useAuth();
  const conversationId = conversation?.id;
  const groupConversationId = groupConversation?.id;
  
  const { messages, loading, sendMessage } = useEnhancedMessages(conversationId, groupConversationId);
  const [newMessage, setNewMessage] = useState('');
  const [attachments, setAttachments] = useState<FileAttachment[]>([]);
  const [sending, setSending] = useState(false);
  const [showAttachments, setShowAttachments] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if ((!newMessage.trim() && attachments.length === 0) || !user) return;

    setSending(true);
    const messageType = attachments.length > 0 ? 
      (attachments.some(att => att.type.startsWith('image/')) ? 'image' : 'file') : 'text';
    
    const success = await sendMessage(newMessage || '📎 Attachment', attachments, messageType);
    
    if (success) {
      setNewMessage('');
      setAttachments([]);
      setShowAttachments(false);
    }
    
    setSending(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const downloadAttachment = (attachment: FileAttachment) => {
    const link = document.createElement('a');
    link.href = attachment.url;
    link.download = attachment.name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getConversationTitle = () => {
    if (groupConversation) {
      return groupConversation.name;
    }
    return conversation?.other_user?.full_name || 'Professional';
  };

  const getConversationAvatar = () => {
    if (groupConversation) {
      return groupConversation.avatar_url;
    }
    return conversation?.other_user?.avatar_url;
  };

  const getMessageReadStatus = (message: any) => {
    if (message.sender_id === user?.id) {
      const readReceipts = message.read_receipts || [];
      if (groupConversation) {
        const totalMembers = (groupConversation.members?.length || 1) - 1; // Exclude sender
        const readCount = readReceipts.length;
        
        if (readCount === 0) return <Check className="w-3 h-3 text-gray-400" />;
        if (readCount === totalMembers) return <CheckCheck className="w-3 h-3 text-dna-emerald" />;
        return <CheckCheck className="w-3 h-3 text-blue-500" />;
      } else {
        return readReceipts.length > 0 
          ? <CheckCheck className="w-3 h-3 text-dna-emerald" />
          : <Check className="w-3 h-3 text-gray-400" />;
      }
    }
    return null;
  };

  if (loading) {
    return (
      <Card className="h-[600px] flex flex-col">
        <CardContent className="pt-6 flex items-center justify-center h-full">
          <div className="text-gray-600">Loading conversation...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-[600px] flex flex-col">
      <CardHeader className="pb-4 border-b">
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" onClick={onBack}>
            <ArrowLeft className="w-4 h-4" />
          </Button>
          
          <Avatar className="w-8 h-8">
            <AvatarImage src={getConversationAvatar()} />
            <AvatarFallback>
              {groupConversation ? <Users className="w-4 h-4" /> : <User className="w-4 h-4" />}
            </AvatarFallback>
          </Avatar>
          
          <div className="flex-1">
            <CardTitle className="text-lg">{getConversationTitle()}</CardTitle>
            {groupConversation && (
              <div className="text-sm text-gray-500">
                {groupConversation.member_count} members
              </div>
            )}
          </div>
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
                  className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[70%] rounded-lg px-4 py-2 ${
                      isOwn
                        ? 'bg-dna-emerald text-white'
                        : 'bg-gray-100 text-gray-900'
                    }`}
                  >
                    {message.content && (
                      <p className="text-sm">{message.content}</p>
                    )}
                    
                    {/* Attachments */}
                    {message.attachments && message.attachments.length > 0 && (
                      <div className="mt-2 space-y-2">
                        {message.attachments.map((attachment: FileAttachment) => (
                          <div
                            key={attachment.id}
                            className={`flex items-center gap-2 p-2 rounded ${
                              isOwn ? 'bg-white/10' : 'bg-white'
                            }`}
                          >
                            {attachment.type.startsWith('image/') ? (
                              <img 
                                src={attachment.url} 
                                alt={attachment.name}
                                className="max-w-full max-h-48 rounded"
                              />
                            ) : (
                              <>
                                <div className="flex-1 min-w-0">
                                  <div className="text-xs font-medium truncate">
                                    {attachment.name}
                                  </div>
                                </div>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => downloadAttachment(attachment)}
                                  className={isOwn ? 'text-white hover:bg-white/20' : ''}
                                >
                                  <Download className="w-3 h-3" />
                                </Button>
                              </>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                    
                    <div className={`flex items-center justify-between mt-1 text-xs ${
                      isOwn ? 'text-emerald-100' : 'text-gray-500'
                    }`}>
                      <span>{format(new Date(message.created_at), 'h:mm a')}</span>
                      {getMessageReadStatus(message)}
                    </div>
                  </div>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Attachment Upload */}
        {showAttachments && (
          <div className="border-t p-4">
            <FileAttachmentUpload
              attachments={attachments}
              onAttachmentsChange={setAttachments}
            />
          </div>
        )}

        {/* Message Input */}
        <div className="border-t p-4">
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowAttachments(!showAttachments)}
              className={showAttachments ? 'bg-dna-emerald text-white' : ''}
            >
              <Paperclip className="w-4 h-4" />
            </Button>
            <Textarea
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type your message..."
              className="resize-none min-h-[60px] flex-1"
              disabled={sending}
            />
            <Button
              onClick={handleSendMessage}
              disabled={(!newMessage.trim() && attachments.length === 0) || sending}
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

export default EnhancedConversationView;
