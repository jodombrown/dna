
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useMessages } from '@/hooks/useMessages';
import { useAuth } from '@/contexts/AuthContext';
import { MessageSquare, Users, Send } from 'lucide-react';
import ConversationView from './ConversationView';
import MessageList from './MessageList';

const MessageCenter: React.FC = () => {
  const { user } = useAuth();
  const { messages, loading, markAsRead } = useMessages();
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'inbox' | 'conversations'>('inbox');

  if (!user) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Access Your Messages</h3>
              <p className="text-gray-600">Please sign in to view your messages and conversations.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const unreadCount = messages.filter(msg => !msg.is_read && msg.recipient_id === user.id).length;

  const handleMessageClick = (messageId: string, senderId: string, recipientId: string) => {
    const otherUserId = senderId === user.id ? recipientId : senderId;
    setSelectedConversation(otherUserId);
    setActiveTab('conversations');
    
    // Mark as read if user is the recipient
    const message = messages.find(m => m.id === messageId);
    if (message && message.recipient_id === user.id && !message.is_read) {
      markAsRead(messageId);
    }
  };

  if (selectedConversation) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <ConversationView
          otherUserId={selectedConversation}
          onBack={() => setSelectedConversation(null)}
        />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-dna-emerald" />
              Message Center
              {unreadCount > 0 && (
                <Badge variant="secondary" className="bg-dna-copper text-white">
                  {unreadCount}
                </Badge>
              )}
            </CardTitle>
            <div className="flex gap-2">
              <Button
                variant={activeTab === 'inbox' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setActiveTab('inbox')}
              >
                Inbox
              </Button>
              <Button
                variant={activeTab === 'conversations' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setActiveTab('conversations')}
              >
                <Users className="w-4 h-4 mr-2" />
                Conversations
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">
              <div className="text-gray-600">Loading messages...</div>
            </div>
          ) : (
            <MessageList
              messages={messages}
              currentUserId={user.id}
              onMessageClick={handleMessageClick}
              showConversations={activeTab === 'conversations'}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default MessageCenter;
