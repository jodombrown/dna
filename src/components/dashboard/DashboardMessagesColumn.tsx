import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ConversationListItem as ConversationListItemComponent } from '@/components/messaging/ConversationListItem';
import { ConversationView } from '@/components/messaging/ConversationView';
import { Input } from '@/components/ui/input';
import { ConversationListItem } from '@/types/messaging';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useParams, useNavigate } from 'react-router-dom';
import { Search, MessageCircle, MoreVertical } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Profile } from '@/services/profilesService';
import { cn } from '@/lib/utils';

interface DashboardMessagesColumnProps {
  profile: Profile;
  isOwnProfile: boolean;
}

/**
 * Apple Messages-inspired messages view
 * - Sticky header with search
 * - Full-height scrollable conversation list
 * - Clean, minimal design
 */
export default function DashboardMessagesColumn({ profile, isOwnProfile }: DashboardMessagesColumnProps) {
  const { conversationId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedConversation, setSelectedConversation] = useState<ConversationListItem | null>(null);

  const { data: conversations, refetch } = useQuery({
    queryKey: ['user-conversations', user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase.rpc('get_user_conversations', {
        p_user_id: user.id,
        p_limit: 50,
        p_offset: 0,
      });

      if (error) throw error;
      return (data || []) as ConversationListItem[];
    },
    enabled: !!user,
  });

  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel('user_conversations')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'messages',
        },
        () => {
          refetch();
        }
      )
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, [user, refetch]);

  useEffect(() => {
    if (conversationId && conversations) {
      const conversation = conversations.find((c) => c.conversation_id === conversationId);
      if (conversation) {
        setSelectedConversation(conversation);
      }
    }
  }, [conversationId, conversations]);

  const handleSelectConversation = (conversation: ConversationListItem) => {
    setSelectedConversation(conversation);
    navigate(`/dna/messages/${conversation.conversation_id}`);
  };

  const handleBack = () => {
    setSelectedConversation(null);
    navigate('/dna/messages');
  };

  const filteredConversations = conversations?.filter((c) =>
    c.other_user_full_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Calculate the height to fill remaining viewport
  // This removes the gap at the top and makes the list fill the screen
  return (
    <div className="flex flex-col h-[calc(100vh-3.5rem)] sm:h-[calc(100vh-4rem)] -mt-4 sm:-mt-0">
      {!selectedConversation ? (
        <div className="flex flex-col h-full bg-background">
          {/* Sticky Header - Apple Messages style */}
          <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm border-b border-border/50">
            {/* Title row */}
            <div className="flex items-center justify-between px-4 py-3">
              <h1 className="text-2xl font-bold">Messages</h1>
              <Button variant="ghost" size="icon" className="text-muted-foreground">
                <MoreVertical className="h-5 w-5" />
              </Button>
            </div>

            {/* Search bar */}
            <div className="px-4 pb-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search messages"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-muted/50 border-0 rounded-xl h-9 text-sm placeholder:text-muted-foreground/60"
                />
              </div>
            </div>
          </div>

          {/* Scrollable conversation list */}
          <div className="flex-1 overflow-y-auto">
            {!conversations ? (
              <div className="text-center py-12 text-muted-foreground">
                Loading conversations...
              </div>
            ) : filteredConversations?.length === 0 ? (
              <div className="text-center py-16 px-4">
                <MessageCircle className="h-16 w-16 mx-auto text-muted-foreground/40 mb-4" />
                <h3 className="text-lg font-semibold mb-2">
                  {searchQuery ? 'No conversations found' : 'No messages yet'}
                </h3>
                <p className="text-sm text-muted-foreground mb-6 max-w-xs mx-auto">
                  {searchQuery
                    ? 'Try a different search term'
                    : 'Start a conversation with your connections'}
                </p>
                {!searchQuery && (
                  <Button
                    onClick={() => navigate('/dna/connect/network')}
                    className="rounded-full"
                  >
                    View Network
                  </Button>
                )}
              </div>
            ) : (
              <div>
                {filteredConversations?.map((conversation) => (
                  <ConversationListItemComponent
                    key={conversation.conversation_id}
                    conversation={conversation}
                    currentUserId={user?.id || ''}
                    isActive={selectedConversation?.conversation_id === conversation.conversation_id}
                    onClick={() => handleSelectConversation(conversation)}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="flex-1 flex flex-col h-full bg-background">
          <ConversationView
            conversationId={selectedConversation.conversation_id}
            currentUserId={user?.id || ''}
            otherUserName={selectedConversation.other_user_full_name}
            otherUserUsername={selectedConversation.other_user_username}
            otherUserAvatar={selectedConversation.other_user_avatar_url}
            onBack={handleBack}
          />
        </div>
      )}
    </div>
  );
}
