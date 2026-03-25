/**
 * GroupThreadView - Full group messaging thread
 * 
 * Uses useRealtimeMessaging for optimistic updates, connection state,
 * typing indicators, and cursor-based pagination.
 */

import React, { useEffect, useRef, useMemo, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Loader2, ArrowLeft, Users, ChevronUp, Image as ImageIcon } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import { useRealtimeMessaging } from '@/hooks/useRealtimeMessaging';
import { groupMessageService } from '@/services/groupMessageService';
import { GroupMessageBubble } from './GroupMessageBubble';
import { GroupSystemMessage } from './GroupSystemMessage';
import { GroupChatInput } from './GroupChatInput';
import { RealtimeStatusBanner } from './RealtimeStatusBanner';
import { TypingIndicatorDisplay } from './TypingIndicatorDisplay';
import { GroupInfoDrawer } from './GroupInfoDrawer';
import { MediaGalleryDrawer } from './MediaGalleryDrawer';
import { DateSeparator } from '../inbox/DateSeparator';
import type { GroupMessage, MediaItem } from '@/types/groupMessaging';

export function GroupThreadView() {
  const { groupId } = useParams<{ groupId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [showGroupInfo, setShowGroupInfo] = useState(false);
  const [showMediaGallery, setShowMediaGallery] = useState(false);

  // Fetch conversation details
  const { data: conversation } = useQuery({
    queryKey: ['group-conversation', groupId],
    queryFn: () => groupMessageService.getConversation(groupId!),
    enabled: !!groupId,
  });

  // Fetch participants
  const { data: participants = [] } = useQuery({
    queryKey: ['group-participants', groupId],
    queryFn: () => groupMessageService.getParticipants(groupId!),
    enabled: !!groupId,
  });

  // Real-time messaging hook
  const {
    messages,
    isLoading,
    isError,
    sendMessage,
    connectionStatus,
    retryConnection,
    typingUsers,
    broadcastTyping,
    loadMore,
    hasMore,
  } = useRealtimeMessaging({
    conversationId: groupId || '',
    type: 'group',
    enabled: !!groupId,
  });

  // Update read cursor on mount and on new messages
  useEffect(() => {
    if (groupId) {
      groupMessageService.updateReadCursor(groupId);
    }
  }, [groupId, messages.length]);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length]);

  // Group messages by date
  const groupedMessages = useMemo(() => {
    const groups: { date: string; messages: GroupMessage[] }[] = [];
    let currentDate = '';

    messages.forEach((msg) => {
      const msgDate = format(new Date(msg.created_at), 'yyyy-MM-dd');
      if (msgDate !== currentDate) {
        currentDate = msgDate;
        groups.push({ date: msg.created_at, messages: [msg] });
      } else {
        groups[groups.length - 1].messages.push(msg);
      }
    });

    return groups;
  }, [messages]);

  const handleSend = useCallback(async (content: string, mediaUrls?: MediaItem[]) => {
    await sendMessage(content, { mediaUrls });
  }, [sendMessage]);

  const handleBack = useCallback(() => {
    navigate('/dna/messages');
  }, [navigate]);

  const handleDeleteMessage = useCallback(async (messageId: string) => {
    await groupMessageService.deleteMessage(messageId);
    queryClient.invalidateQueries({ queryKey: ['group-messages', groupId] });
  }, [groupId, queryClient]);

  if (!groupId) return null;

  return (
    <div className="flex flex-col h-full min-h-0 overflow-hidden bg-background">
      {/* Header */}
      <div className="flex-shrink-0 flex items-center gap-3 px-4 py-3 border-b border-border bg-card">
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 flex-shrink-0"
          onClick={handleBack}
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>

        <button
          onClick={() => setShowGroupInfo(true)}
          className="flex items-center gap-3 flex-1 min-w-0 hover:opacity-80 transition-opacity"
        >
          <Avatar className="h-10 w-10 flex-shrink-0">
            <AvatarImage src={conversation?.avatar_url || ''} />
            <AvatarFallback className="bg-primary/10 text-primary text-sm font-semibold">
              <Users className="h-5 w-5" />
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <h2 className="text-sm font-semibold truncate">
              {conversation?.title || 'Group Chat'}
            </h2>
            <p className="text-xs text-muted-foreground">
              {participants.length} members
            </p>
          </div>
        </button>

        {/* Media gallery shortcut */}
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 flex-shrink-0"
          onClick={() => setShowMediaGallery(true)}
        >
          <ImageIcon className="h-4 w-4 text-muted-foreground" />
        </Button>
      </div>

      {/* Connection Status Banner */}
      <RealtimeStatusBanner
        status={connectionStatus}
        onRetry={retryConnection}
      />

      {/* Messages */}
      <div
        ref={containerRef}
        className="flex-1 min-h-0 overflow-y-auto overscroll-y-contain bg-gradient-to-b from-muted/20 to-muted/40"
      >
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <Loader2 className="h-6 w-6 animate-spin text-primary/60" />
          </div>
        ) : isError ? (
          <div className="flex flex-col items-center justify-center h-full text-muted-foreground text-sm gap-2">
            <p>Unable to load messages</p>
            <Button variant="ghost" size="sm" onClick={retryConnection}>
              Try again
            </Button>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-muted-foreground gap-1">
            <Users className="h-8 w-8 text-muted-foreground/50" />
            <p className="text-sm">Group created! Start the conversation.</p>
          </div>
        ) : (
          <div className="py-2">
            {/* Load more button */}
            {hasMore && (
              <div className="flex justify-center py-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={loadMore}
                  className="text-xs text-muted-foreground"
                >
                  <ChevronUp className="h-3 w-3 mr-1" />
                  Load older messages
                </Button>
              </div>
            )}

            {groupedMessages.map((group) => (
              <div key={group.date}>
                <DateSeparator date={group.date} />
                <div className="space-y-0.5">
                  {group.messages.map((msg, msgIndex) => {
                    if (msg.message_type === 'system') {
                      return (
                        <GroupSystemMessage
                          key={msg.message_id}
                          content={msg.content}
                        />
                      );
                    }

                    const isOwn = msg.sender_id === user?.id;
                    const prevMsg = msgIndex > 0 ? group.messages[msgIndex - 1] : null;
                    const nextMsg = msgIndex < group.messages.length - 1 ? group.messages[msgIndex + 1] : null;
                    const showSenderInfo =
                      !isOwn &&
                      (!prevMsg ||
                        prevMsg.sender_id !== msg.sender_id ||
                        prevMsg.message_type === 'system');

                    // Is this the last message in a run from the same sender?
                    const isLastInRun = !nextMsg || nextMsg.sender_id !== msg.sender_id || nextMsg.message_type === 'system';

                    return (
                      <GroupMessageBubble
                        key={msg.message_id}
                        message={msg}
                        isOwn={isOwn}
                        showSenderInfo={showSenderInfo}
                        isLastInRun={isLastInRun}
                        participants={participants}
                        onDelete={handleDeleteMessage}
                      />
                    );
                  })}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Typing Indicator */}
      <TypingIndicatorDisplay typingUsers={typingUsers} />

      {/* Input */}
      <GroupChatInput
        onSend={handleSend}
        onTyping={broadcastTyping}
        disabled={connectionStatus === 'offline'}
        conversationId={groupId}
      />

      {/* Group Info Drawer */}
      <GroupInfoDrawer
        open={showGroupInfo}
        onOpenChange={setShowGroupInfo}
        conversationId={groupId}
        conversation={conversation || undefined}
        participants={participants}
      />

      {/* Media Gallery Drawer */}
      <MediaGalleryDrawer
        open={showMediaGallery}
        onOpenChange={setShowMediaGallery}
        conversationId={groupId}
      />
    </div>
  );
}
