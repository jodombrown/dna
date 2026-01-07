import React, { useState, useMemo, useCallback } from 'react';
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
import { Loader2, Search, Plus, MoreVertical, Pin, BellOff, Trash2, Archive, ArchiveRestore, Check, Settings } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';
import { ConversationListItem, InboxTab } from '@/types/messaging';
import InboxTabs from './InboxTabs';
import PresenceIndicator from './PresenceIndicator';
import { ConversationContextBadge } from './ConversationContext';
import { MessageRequestCard } from './MessageRequestBanner';
import { useMessageRequests } from '@/hooks/useMessageRequests';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { messageService, deleteConversation } from '@/services/messageService';

interface ConversationListPanelProps {
  conversations?: ConversationListItem[];
  isLoading: boolean;
  searchTerm: string;
  onSearchChange: (term: string) => void;
  selectedConversationId: string | null;
  onSelectConversation: (id: string) => void;
  onNewConversation?: () => void;
  onlineUsers?: string[];
  onRefresh?: () => void;
  archivedConversations?: ConversationListItem[];
}

/**
 * ConversationListPanel - Left panel (35%) for MESSAGES_MODE
 *
 * Implements PRD requirements:
 * - Inbox Tabs: Focused | Other | Requests | Archived (LinkedIn-style)
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
  onRefresh,
  archivedConversations = [],
}) => {
  const [activeTab, setActiveTab] = useState<InboxTab>('focused');
  const [removingIds, setRemovingIds] = useState<Set<string>>(new Set());
  const { toast } = useToast();
  const { requests, requestCount, isLoading: requestsLoading } = useMessageRequests();

  // Poof animation helper - triggers animation then runs callback
  const triggerPoof = useCallback((id: string, callback: () => Promise<void>) => {
    setRemovingIds(prev => new Set(prev).add(id));
    // Wait for animation to complete before running callback
    setTimeout(async () => {
      await callback();
      setRemovingIds(prev => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    }, 250);
  }, []);

  // Archive a conversation with poof animation
  const handleArchive = (conversationId: string) => {
    triggerPoof(conversationId, async () => {
      try {
        await messageService.archiveConversation(conversationId);
        toast({ 
          title: 'Conversation archived', 
          description: 'You can find it in the Archived tab',
          action: (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={async () => {
                await messageService.unarchiveConversation(conversationId);
                onRefresh?.();
                toast({ title: 'Conversation restored' });
              }}
            >
              Undo
            </Button>
          ),
        });
        onRefresh?.();
      } catch (error) {
        toast({ title: 'Error', description: 'Failed to archive conversation', variant: 'destructive' });
      }
    });
  };

  // Unarchive a conversation with poof animation
  const handleUnarchive = (conversationId: string) => {
    triggerPoof(conversationId, async () => {
      try {
        await messageService.unarchiveConversation(conversationId);
        toast({ title: 'Conversation restored', description: 'Moved back to Focused' });
        onRefresh?.();
      } catch (error) {
        toast({ title: 'Error', description: 'Failed to restore conversation', variant: 'destructive' });
      }
    });
  };

  // Mute/unmute
  const handleToggleMute = async (conversationId: string, currentlyMuted: boolean) => {
    try {
      if (currentlyMuted) {
        await messageService.unmuteConversation(conversationId);
        toast({ title: 'Conversation unmuted' });
      } else {
        await messageService.muteConversation(conversationId);
        toast({ title: 'Conversation muted', description: 'Moved to Other tab' });
      }
      onRefresh?.();
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to update mute status', variant: 'destructive' });
    }
  };

  // Pin/unpin - simplified (just toast for now, needs RPC)
  const handleTogglePin = (conversationId: string, currentlyPinned: boolean) => {
    toast({ title: currentlyPinned ? 'Unpinned' : 'Pinned', description: 'Feature coming soon' });
  };

  // Delete a conversation with poof animation
  const handleDelete = (conversationId: string) => {
    triggerPoof(conversationId, async () => {
      try {
        await deleteConversation(conversationId);
        toast({ title: 'Conversation deleted' });
        onRefresh?.();
      } catch (error) {
        toast({ title: 'Error', description: 'Failed to delete conversation', variant: 'destructive' });
      }
    });
  };

  const getInitials = (name: string) => {
    return name?.split(' ').map((n) => n[0]).join('').toUpperCase() || '?';
  };

  // Filter conversations based on search term and tab
  const filteredConversations = useMemo(() => {
    // For archived tab, use archivedConversations prop
    if (activeTab === 'archived') {
      return archivedConversations.filter((conv) =>
        conv.other_user_full_name?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (!conversations) return [];

    let filtered = conversations.filter((conv) =>
      conv.other_user_full_name?.toLowerCase().includes(searchTerm.toLowerCase()) &&
      !conv.is_archived // Exclude archived from other tabs
    );

    // Filter by tab
    switch (activeTab) {
      case 'focused':
        // Active conversations that are not muted
        filtered = filtered.filter(
          (conv) => !conv.is_muted
        );
        break;
      case 'other':
        // Muted conversations
        filtered = filtered.filter(
          (conv) => conv.is_muted
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
  }, [conversations, archivedConversations, searchTerm, activeTab]);

  // Count unread for focused tab
  const focusedUnreadCount = useMemo(() => {
    if (!conversations) return 0;
    return conversations
      .filter((c) => !c.is_muted && !c.is_archived)
      .reduce((sum, c) => sum + (c.unread_count || 0), 0);
  }, [conversations]);

  // Count archived conversations
  const archivedCount = archivedConversations.length;

  const handleMarkAllRead = async () => {
    // Mark all conversations as read
    const unreadConversations = conversations?.filter(c => c.unread_count > 0 && !c.is_archived) || [];
    
    if (unreadConversations.length === 0) {
      toast({ title: 'All caught up!', description: 'No unread messages' });
      return;
    }

    try {
      for (const conv of unreadConversations) {
        await messageService.markAsRead(conv.conversation_id);
      }
      toast({ 
        title: 'All marked as read', 
        description: `${unreadConversations.length} conversation${unreadConversations.length > 1 ? 's' : ''} marked as read` 
      });
      onRefresh?.();
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to mark conversations as read', variant: 'destructive' });
    }
  };

  const handleArchiveAllRead = async () => {
    // Archive all conversations with no unread messages
    const conversationsToArchive = conversations?.filter(c => c.unread_count === 0 && !c.is_archived) || [];
    
    if (conversationsToArchive.length === 0) {
      toast({ title: 'Nothing to archive', description: 'No read conversations found' });
      return;
    }

    try {
      for (const conv of conversationsToArchive) {
        await messageService.archiveConversation(conv.conversation_id);
      }
      toast({ 
        title: `Archived ${conversationsToArchive.length} conversation${conversationsToArchive.length > 1 ? 's' : ''}`,
        description: 'Find them in the Archived tab'
      });
      onRefresh?.();
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to archive conversations', variant: 'destructive' });
    }
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
              <DropdownMenuContent align="end" className="w-56 z-[9999]">
                <DropdownMenuItem onClick={handleMarkAllRead} className="cursor-pointer">
                  <Check className="h-4 w-4 mr-2" />
                  Mark all as read
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleArchiveAllRead} className="cursor-pointer">
                  <Archive className="h-4 w-4 mr-2" />
                  Archive all read
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  onClick={() => toast({ title: 'Coming soon', description: 'Message settings will be available soon' })}
                  className="cursor-pointer"
                >
                  <Settings className="h-4 w-4 mr-2" />
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
        archivedCount={archivedCount}
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
            {activeTab === 'archived' ? (
              <>
                <Archive className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p className="font-medium">No archived conversations</p>
                <p className="text-sm mt-2">
                  Archived conversations will appear here
                </p>
              </>
            ) : activeTab === 'requests' ? (
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
            <AnimatePresence mode="popLayout">
              {filteredConversations.map((conversation) => {
                const hasUnread = conversation.unread_count > 0;
                const isOnline = onlineUsers.includes(conversation.other_user_id || '');
                const isArchived = activeTab === 'archived';
                const isRemoving = removingIds.has(conversation.conversation_id);

                if (isRemoving) {
                  return (
                    <motion.div
                      key={conversation.conversation_id}
                      initial={{ opacity: 1, scale: 1 }}
                      animate={{ 
                        opacity: 0, 
                        scale: 0.8, 
                        filter: 'blur(4px)',
                      }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] } as const}
                      className="relative group"
                    />
                  );
                }

                return (
                  <motion.div
                    key={conversation.conversation_id}
                    layout
                    initial={{ opacity: 1, scale: 1 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ 
                      opacity: 0, 
                      scale: 0.8, 
                      filter: 'blur(4px)',
                    }}
                    transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] } as const}
                    className={cn(
                      'relative group',
                      selectedConversationId === conversation.conversation_id && 'bg-accent'
                    )}
                  >
                  <button
                    onClick={() => onSelectConversation(conversation.conversation_id)}
                    className="w-full p-4 pr-12 hover:bg-accent transition-colors text-left"
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
                        className="absolute top-2 right-2 h-8 w-8 md:opacity-0 md:group-hover:opacity-100 transition-opacity"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent 
                      align="end" 
                      className="z-[9999] bg-popover border border-border shadow-lg"
                    >
                      {isArchived ? (
                        // Archived conversation menu
                        <DropdownMenuItem
                          onClick={(e) => {
                            e.stopPropagation();
                            handleUnarchive(conversation.conversation_id);
                          }}
                        >
                          <ArchiveRestore className="h-4 w-4 mr-2" />
                          Unarchive
                        </DropdownMenuItem>
                      ) : (
                        // Regular conversation menu
                        <>
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
                          <DropdownMenuItem
                            onClick={(e) => {
                              e.stopPropagation();
                              handleArchive(conversation.conversation_id);
                            }}
                          >
                            <Archive className="h-4 w-4 mr-2" />
                            Archive
                          </DropdownMenuItem>
                        </>
                      )}
                      <DropdownMenuSeparator />
                      <DropdownMenuItem 
                        className="text-destructive"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(conversation.conversation_id);
                        }}
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </motion.div>
              );
            })}
            </AnimatePresence>
          </div>
        )}
      </ScrollArea>
    </Card>
  );
};

export default ConversationListPanel;
