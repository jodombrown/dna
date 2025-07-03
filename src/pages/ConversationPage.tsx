
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/CleanAuthContext';
import { useConversations } from '@/hooks/useConversations';
import ConversationView from '@/components/messaging/ConversationView';
import Header from '@/components/Header';
import { Loader2 } from 'lucide-react';
import type { Conversation } from '@/hooks/useConversations';

const ConversationPage: React.FC = () => {
  const { conversationId } = useParams<{ conversationId: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { conversations, loading } = useConversations();
  const [conversation, setConversation] = useState<Conversation | null>(null);

  useEffect(() => {
    if (!user) {
      navigate('/functional-auth');
      return;
    }

    if (!loading && conversationId) {
      const foundConversation = conversations.find(conv => conv.id === conversationId);
      if (foundConversation) {
        setConversation(foundConversation);
      } else {
        navigate('/messages');
      }
    }
  }, [user, loading, conversationId, conversations, navigate]);

  if (!user) {
    return null;
  }

  if (loading || !conversation) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-dna-copper" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="max-w-4xl mx-auto p-6">
        <ConversationView
          conversation={conversation}
          onBack={() => navigate('/messages')}
        />
      </div>
    </div>
  );
};

export default ConversationPage;
