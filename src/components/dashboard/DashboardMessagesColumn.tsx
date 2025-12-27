// Apple Messages-inspired messaging UI - v3
import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ConversationListItem as ConversationListItemComponent } from '@/components/messaging/ConversationListItem';
import { ConversationView } from '@/components/messaging/ConversationView';
import { Input } from '@/components/ui/input';
import { ConversationListItem } from '@/types/messaging';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useParams, useNavigate } from 'react-router-dom';
import { Search, MessageCircle, Filter, PenSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Profile } from '@/services/profilesService';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from '@/components/ui/dropdown-menu';

interface DashboardMessagesColumnProps {
  profile: Profile;
  isOwnProfile: boolean;
}

type FilterType = 'all' | 'unread';

/**
 * Apple Messages-inspired messages view
 * - Clean header with Edit and Filter
 * - NO top gap - content starts immediately
 * - Search bar at bottom (iOS style)
 * - Full-height scrollable conversation list
 */
export default function DashboardMessagesColumn({ profile, isOwnProfile }: DashboardMessagesColumnProps) {
  const { conversationId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedConversation, setSelectedConversation] = useState<ConversationListItem | null>(null);
  const [filter, setFilter] = useState<FilterType>('all');

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

  // Filter conversations based on search and filter type
  const filteredConversations = conversations?.filter((c) => {
    const matchesSearch = c.other_user_full_name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filter === 'all' || (filter === 'unread' && c.unread_count > 0);
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="flex flex-col h-[calc(100vh-3.5rem)] sm:h-[calc(100vh-4rem)] bg-background">
      {!selectedConversation ? (
        <div className="flex flex-col h-full">
          {/* Apple Messages Header - NO gap */}
          <div className="flex items-center justify-between px-4 py-2 border-b border-border/30">
            {/* Edit button - left side */}
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-primary font-normal px-3 h-8 hover:bg-transparent hover:text-primary/80"
            >
              Edit
            </Button>

            {/* Title - center */}
            <h1 className="text-lg font-semibold absolute left-1/2 -translate-x-1/2">
              Messages
            </h1>

            {/* Filter menu - right side */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-8 w-8 rounded-full bg-muted/60"
                >
                  <Filter className="h-4 w-4 text-muted-foreground" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuItem 
                  onClick={() => setFilter('all')}
                  className="flex items-center gap-3"
                >
                  <MessageCircle className="h-4 w-4" />
                  <span>Messages</span>
                  {filter === 'all' && <span className="ml-auto text-primary">✓</span>}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuLabel className="text-xs text-muted-foreground font-normal">
                  Filter By
                </DropdownMenuLabel>
                <DropdownMenuItem 
                  onClick={() => setFilter('unread')}
                  className="flex items-center gap-3"
                >
                  <div className="w-4 h-4 rounded-full border-2 border-muted-foreground flex items-center justify-center">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                  </div>
                  <span>Unread</span>
                  {filter === 'unread' && <span className="ml-auto text-primary">✓</span>}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Scrollable conversation list - fills remaining space */}
          <div className="flex-1 overflow-y-auto">
            {!conversations ? (
              <div className="text-center py-12 text-muted-foreground">
                Loading conversations...
              </div>
            ) : filteredConversations?.length === 0 ? (
              <div className="text-center py-16 px-4">
                <MessageCircle className="h-16 w-16 mx-auto text-muted-foreground/40 mb-4" />
                <h3 className="text-lg font-semibold mb-2">
                  {searchQuery ? 'No conversations found' : filter === 'unread' ? 'No unread messages' : 'No messages yet'}
                </h3>
                <p className="text-sm text-muted-foreground mb-6 max-w-xs mx-auto">
                  {searchQuery
                    ? 'Try a different search term'
                    : filter === 'unread'
                    ? 'All caught up!'
                    : 'Start a conversation with your connections'}
                </p>
                {!searchQuery && filter === 'all' && (
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

          {/* Bottom search bar - iOS style */}
          <div className="border-t border-border/30 px-4 py-2 bg-background/95 backdrop-blur-sm">
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-muted/50 border-0 rounded-xl h-9 text-sm placeholder:text-muted-foreground/60"
                />
              </div>
              {/* Compose button */}
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-9 w-9 rounded-full text-muted-foreground hover:text-primary"
                onClick={() => navigate('/dna/connect/network')}
              >
                <PenSquare className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex-1 flex flex-col h-full">
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
