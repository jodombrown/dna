
import React, { useState } from 'react';
import { useAuth } from '@/contexts/CleanAuthContext';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useConversations } from '@/hooks/useConversations';
import { useContactRequests } from '@/hooks/useContactRequests';
import ConversationView from '@/components/messaging/ConversationView';
import ContactRequestsList from '@/components/messaging/ContactRequestsList';
import Header from '@/components/Header';
import { MessageSquare, Users, Inbox, Send, User } from 'lucide-react';
import { format } from 'date-fns';
import type { Conversation } from '@/hooks/useConversations';

const Messages: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { conversations, loading } = useConversations();
  const { getPendingRequestsCount } = useContactRequests();
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [activeTab, setActiveTab] = useState('conversations');

  const pendingRequestsCount = getPendingRequestsCount();

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex items-center justify-center py-20">
          <div className="max-w-md text-center">
            <MessageSquare className="w-16 h-16 text-gray-400 mx-auto mb-6" />
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              Access Your Messages
            </h1>
            <p className="text-gray-600 mb-6">
              Sign in to view your messages and connect with diaspora professionals worldwide.
            </p>
            <Button 
              onClick={() => navigate('/functional-auth')}
              className="bg-dna-emerald hover:bg-dna-forest text-white"
            >
              Sign In to Continue
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (selectedConversation) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-4xl mx-auto p-6">
          <ConversationView
            conversation={selectedConversation}
            onBack={() => setSelectedConversation(null)}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="max-w-4xl mx-auto p-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Messages</h1>
          <p className="text-gray-600">
            Connect and communicate with diaspora professionals
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="conversations" className="flex items-center gap-2">
              <MessageSquare className="w-4 h-4" />
              Conversations
            </TabsTrigger>
            <TabsTrigger value="received" className="flex items-center gap-2">
              <Inbox className="w-4 h-4" />
              Received
              {pendingRequestsCount > 0 && (
                <Badge variant="destructive" className="ml-1 text-xs">
                  {pendingRequestsCount}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="sent" className="flex items-center gap-2">
              <Send className="w-4 h-4" />
              Sent
            </TabsTrigger>
          </TabsList>

          <TabsContent value="conversations" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="w-5 h-5 text-dna-emerald" />
                  Your Conversations
                </CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="text-center py-8">
                    <div className="text-gray-600">Loading conversations...</div>
                  </div>
                ) : conversations.length === 0 ? (
                  <div className="text-center py-8">
                    <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No conversations yet</h3>
                    <p className="text-gray-600 mb-4">
                      Start connecting with diaspora professionals to begin conversations.
                    </p>
                    <Button 
                      onClick={() => navigate('/connect')}
                      className="bg-dna-emerald hover:bg-dna-forest text-white"
                    >
                      Explore Professionals
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {conversations.map((conversation) => (
                      <div
                        key={conversation.id}
                        className={`p-4 border rounded-lg cursor-pointer transition-colors hover:bg-gray-50 ${
                          conversation.unread_count && conversation.unread_count > 0 
                            ? 'bg-dna-emerald/5 border-dna-emerald/20' 
                            : 'bg-white'
                        }`}
                        onClick={() => setSelectedConversation(conversation)}
                      >
                        <div className="flex items-start gap-3">
                          <Avatar className="w-10 h-10">
                            <AvatarImage src={conversation.other_user?.avatar_url} />
                            <AvatarFallback>
                              <User className="w-5 h-5" />
                            </AvatarFallback>
                          </Avatar>
                          
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-1">
                              <h4 className="font-medium text-gray-900 truncate">
                                {conversation.other_user?.full_name || 'Professional'}
                              </h4>
                              <div className="flex items-center gap-2">
                                {conversation.unread_count && conversation.unread_count > 0 && (
                                  <Badge variant="secondary" className="bg-dna-copper text-white text-xs">
                                    {conversation.unread_count}
                                  </Badge>
                                )}
                                <span className="text-sm text-gray-500">
                                  {format(new Date(conversation.last_message_at), 'MMM d')}
                                </span>
                              </div>
                            </div>
                            
                            {conversation.last_message && (
                              <p className="text-gray-600 text-sm line-clamp-2">
                                {conversation.last_message.content}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="received" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Inbox className="w-5 h-5 text-dna-emerald" />
                  Received Requests
                  {pendingRequestsCount > 0 && (
                    <Badge variant="destructive" className="ml-2">
                      {pendingRequestsCount} pending
                    </Badge>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ContactRequestsList type="received" />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="sent" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Send className="w-5 h-5 text-dna-emerald" />
                  Sent Requests
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ContactRequestsList type="sent" />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Messages;
