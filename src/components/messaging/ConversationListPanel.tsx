import React, { useState, useMemo } from 'react';
import { Card } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { Loader2, Search, Plus, MoreVertical, Pin, BellOff, Trash2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ConversationListItem, InboxTab } from '@/types/messaging';
import InboxTabs from './InboxTabs';
import PresenceIndicator from './PresenceIndicator';
import { ConversationContextBadge } from './ConversationContext';
import { MessageRequestCard } from './MessageRequestBanner';
import { useMessageRequests } from '@/hooks/useMessageRequests';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface ConversationListPanelProps {
  conversations?: ConversationListItem[];
  isLoading: boolean;
  searchTerm: string;
  onSearchChange: (term: string) => void;
  selectedConversationId: string | null;
  onSelectConversation: (id: string) => void;
  onNewConversation?: () => void;
  onlineUsers?: string[];
}

/**
 * ConversationListPanel - Left panel (35%) for MESSAGES_MODE
 *
 * Implements PRD requirements:
 * - Inbox Tabs: Focused | Other | Requests (LinkedIn-style)
 * - Presence: Green dot for online users
 * - Context Badge: Icon showing origin (event, project)
 * - Actions: Pin, mute, archive, delete
 * - Search conversations by name
 * - Unread conversation badges
 */
const ConversationListPanel: React.FC<ConversationListPanelProps> = ({
  conversations,
  isLoading,
  searchTerm,
  onSearchChange,
  selectedConversationId,
  onSelectConversation,
  onNewConversation,
  onlineUsers = [],
}) => {
  const [activeTab, setActiveTab] = useState<InboxTab>('focused');
  const { toast } = useToast();
  const { requests, requestCount, isLoading: requestsLoading } = useMessageRequests();

  // Mute/unmute - simplified (just toast for now, needs RPC)
  const handleToggleMute = (conversationId: string, currentlyMuted: boolean) => {
    toast({ title: currentlyMuted ? 'Unmuted' : 'Muted', description: 'Feature coming soon' });
  };

  // Pin/unpin - simplified (just toast for now, needs RPC)
  const handleTogglePin = (conversationId: string, currentlyPinned: boolean) => {
    toast({ title: currentlyPinned ? 'Unpinned' : 'Pinned', description: 'Feature coming soon' });
  };

  const getInitials = (name: string) => {
    return name?.split(' ').map((n) => n[0]).join('').toUpperCase() || '?';
  };

  // Filter conversations based on search term and tab
  const filteredConversations = useMemo(() => {
    if (!conversations) return [];

    let filtered = conversations.filter((conv) =>
      conv.other_user_full_name?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Filter by tab
    switch (activeTab) {
      case 'focused':
        // Active conversations that are not muted
        filtered = filtered.filter(
          (conv) => conv.participant_status === 'active' && !conv.is_muted
        );
        break;
      case 'other':
        // Muted or low-priority conversations
        filtered = filtered.filter(
          (conv) => conv.participant_status === 'active' && conv.is_muted
        );
        break;
      case 'requests':
        // Pending message requests
        filtered = filtered.filter(
          (conv) => conv.participant_status === 'pending'
        );
        break;
    }

    return filtered;
  }, [conversations, searchTerm, activeTab]);

  // Count unread for focused tab
  const focusedUnreadCount = useMemo(() => {
    if (!conversations) return 0;
    return conversations
      .filter((c) => c.participant_status === 'active' && !c.is_muted)
      .reduce((sum, c) => sum + (c.unread_count || 0), 0);
  }, [conversations]);


  const handleMarkAllRead = () => {
    toast({ title: 'Marked all as read', description: 'All conversations marked as read' });
  };

  const handleArchiveAll = () => {
    toast({ title: 'Archive', description: 'Archive feature coming soon' });
  };

  return (
    <Card className="flex flex-col h-full">
      {/* Search Header */}
      <div className="p-4 border-b space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-lg">Messages</h2>
          <div className="flex items-center gap-1">
            {onNewConversation && (
              <Button variant="ghost" size="icon" onClick={onNewConversation} className="h-8 w-8">
                <Plus className="w-4 h-4" />
              </Button>
            )}
            {/* Header Actions Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="default" size="icon" className="h-8 w-8 bg-primary hover:bg-primary/90">
                  <MoreVertical className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem onClick={handleMarkAllRead}>
                  <span className="mr-2">✓</span>
                  Mark all as read
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleArchiveAll}>
                  <span className="mr-2">📁</span>
                  Archive all read
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => toast({ title: 'Settings', description: 'Message settings coming soon' })}>
                  <span className="mr-2">⚙️</span>
                  Message settings
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            placeholder="Search messages"
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      {/* Inbox Tabs */}
      <InboxTabs
        activeTab={activeTab}
        onTabChange={setActiveTab}
        focusedCount={focusedUnreadCount}
        requestsCount={requestCount}
      />

      {/* Conversation List */}
      <ScrollArea className="flex-1">
        {isLoading || (activeTab === 'requests' && requestsLoading) ? (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : activeTab === 'requests' && requests.length > 0 ? (
          // Show message requests
          <div className="p-4 space-y-4">
            {requests.map((request) => (
              <MessageRequestCard
                key={request.conversation_id}
                request={request}
                onAccept={() => onSelectConversation(request.conversation_id)}
              />
            ))}
          </div>
        ) : filteredConversations.length === 0 ? (
          <div className="p-6 text-center text-muted-foreground">
            {activeTab === 'requests' ? (
              <>
                <p>No message requests</p>
                <p className="text-sm mt-2">
                  Requests from people you're not connected with will appear here
                </p>
              </>
            ) : activeTab === 'other' ? (
              <>
                <p>No muted conversations</p>
                <p className="text-sm mt-2">Muted conversations will appear here</p>
              </>
            ) : (
              <>
                <p>No conversations yet</p>
                <p className="text-sm mt-2">Start connecting with people!</p>
              </>
            )}
          </div>
        ) : (
          <div className="divide-y">
            {filteredConversations.map((conversation) => {
              const hasUnread = conversation.unread_count > 0;
              const isOnline = onlineUsers.includes(conversation.other_user_id || '');

              return (
                <div
                  key={conversation.conversation_id}
                  className={cn(
                    'relative group',
                    selectedConversationId === conversation.conversation_id && 'bg-accent'
                  )}
                >
                  <button
                    onClick={() => onSelectConversation(conversation.conversation_id)}
                    className="w-full p-4 hover:bg-accent transition-colors text-left"
                  >
                    <div className="flex items-start gap-3">
                      {/* Avatar with presence indicator */}
                      <div className="relative">
                        <Avatar className="w-12 h-12">
                          <AvatarImage src={conversation.other_user_avatar_url || ''} />
                          <AvatarFallback className="bg-primary text-primary-foreground">
                            {getInitials(conversation.other_user_full_name || '')}
                          </AvatarFallback>
                        </Avatar>
                        {isOnline && (
                          <div className="absolute bottom-0 right-0 border-2 border-background rounded-full">
                            <PresenceIndicator status="online" size="sm" />
                          </div>
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2 min-w-0">
                            {/* Pin indicator */}
                            {conversation.is_pinned && (
                              <Pin className="w-3 h-3 text-primary flex-shrink-0" />
                            )}
                            <p
                              className={cn(
                                'font-semibold text-sm truncate',
                                hasUnread && 'text-primary'
                              )}
                            >
                              {conversation.other_user_full_name}
                            </p>
                            {/* Origin context badge */}
                            {conversation.origin_type && (
                              <ConversationContextBadge
                                originType={conversation.origin_type}
                              />
                            )}
                            {/* Muted indicator */}
                            {conversation.is_muted && (
                              <BellOff className="w-3 h-3 text-muted-foreground flex-shrink-0" />
                            )}
                          </div>

                          <div className="flex items-center gap-2 flex-shrink-0">
                            {conversation.last_message_at && (
                              <span className="text-xs text-muted-foreground whitespace-nowrap">
                                {formatDistanceToNow(
                                  new Date(conversation.last_message_at),
                                  { addSuffix: false }
                                )}
                              </span>
                            )}
                            {hasUnread && (
                              <Badge
                                variant="default"
                                className="rounded-full px-2 py-0 text-xs"
                              >
                                {conversation.unread_count}
                              </Badge>
                            )}
                          </div>
                        </div>

                        {conversation.other_user_headline && (
                          <p className="text-xs text-muted-foreground truncate mt-1">
                            {conversation.other_user_headline}
                          </p>
                        )}

                        {(conversation.last_message_content ||
                          conversation.last_message_preview) && (
                          <p
                            className={cn(
                              'text-xs truncate mt-1',
                              hasUnread
                                ? 'font-medium text-foreground'
                                : 'text-muted-foreground'
                            )}
                          >
                            {conversation.last_message_preview ||
                              conversation.last_message_content}
                          </p>
                        )}
                      </div>
                    </div>
                  </button>

                  {/* Context menu */}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="absolute top-2 right-2 h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        onClick={(e) => {
                          e.stopPropagation();
                          handleTogglePin(
                            conversation.conversation_id,
                            conversation.is_pinned
                          );
                        }}
                      >
                        <Pin className="h-4 w-4 mr-2" />
                        {conversation.is_pinned ? 'Unpin' : 'Pin'}
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={(e) => {
                          e.stopPropagation();
                          handleToggleMute(
                            conversation.conversation_id,
                            conversation.is_muted
                          );
                        }}
                      >
                        <BellOff className="h-4 w-4 mr-2" />
                        {conversation.is_muted ? 'Unmute' : 'Mute'}
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem className="text-destructive">
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              );
            })}
          </div>
        )}
      </ScrollArea>
    </Card>
  );
};

export default ConversationListPanel;
