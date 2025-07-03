
import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/contexts/CleanAuthContext';
import { ArrowLeft, Send, User } from 'lucide-react';
import { toast } from 'sonner';

interface ConversationViewProps {
  otherUserId: string;
  onBack: () => void;
}

const ConversationView: React.FC<ConversationViewProps> = ({
  otherUserId,
  onBack
}) => {
  const { user } = useAuth();
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // For now, just set loading to false since we don't have messages table
    setLoading(false);
  }, [otherUserId]);

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !user) return;

    setSending(true);
    try {
      // TODO: Implement message sending when messages table is created
      setNewMessage('');
      toast.success('Message functionality will be implemented soon!');
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message');
    } finally {
      setSending(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center py-8">
            <div className="text-gray-600">Loading conversation...</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-[600px] flex flex-col">
      <CardHeader className="pb-4">
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" onClick={onBack}>
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <CardTitle className="flex items-center gap-2">
            <User className="w-5 h-5 text-dna-emerald" />
            Conversation with Professional
          </CardTitle>
        </div>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col p-0">
        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          <div className="text-center py-8 text-gray-500">
            Messaging system will be implemented soon. Start the conversation!
          </div>
          <div ref={messagesEndRef} />
        </div>

        {/* Message Input */}
        <div className="border-t p-4">
          <div className="flex gap-2">
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

export default ConversationView;
