import React, { useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { X, Maximize2, LogOut, LogIn, Loader2 } from 'lucide-react';
import { FeedbackMessageList, FeedbackComposer } from '@/components/feedback';
import { FeedbackThreadView } from './FeedbackThreadView';
import { useFeedbackMessages } from '@/hooks/useFeedbackMessages';
import { useFeedbackMembership } from '@/hooks/useFeedbackMembership';
import type { FeedbackFilter, FeedbackMessageWithSender } from '@/types/feedback';

interface FeedbackDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export function FeedbackDrawer({ isOpen, onClose }: FeedbackDrawerProps) {
  const navigate = useNavigate();
  const [filter, setFilter] = useState<FeedbackFilter>('all');
  const [replyTo, setReplyTo] = useState<{
    id: string;
    username: string;
    preview: string;
  } | null>(null);
  const [selectedThread, setSelectedThread] = useState<FeedbackMessageWithSender | null>(null);

  const {
    channel,
    isAdmin,
    isOptedIn,
    isOptedOut,
    optOut,
    optIn,
    isOptingOut,
    isOptingIn,
    updateLastRead,
  } = useFeedbackMembership();

  const {
    messages,
    isLoading: isMessagesLoading,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
  } = useFeedbackMessages(channel?.id || null, filter);

  // Update last read when drawer opens
  useEffect(() => {
    if (isOpen && channel?.id) {
      updateLastRead();
    }
  }, [isOpen, channel?.id]);

  const handleReply = useCallback((messageId: string) => {
    const message = messages.find((m) => m.id === messageId);
    if (message) {
      // If message has replies, open thread view
      if (message.reply_count > 0) {
        setSelectedThread(message);
      } else {
        // Otherwise set up inline reply
        setReplyTo({
          id: message.id,
          username: message.sender?.username || 'anonymous',
          preview: message.content || '',
        });
      }
    }
  }, [messages]);

  const handleCancelReply = useCallback(() => {
    setReplyTo(null);
  }, []);

  const handleOpenFullPage = () => {
    onClose();
    navigate('/dna/feedback');
  };

  const handleOptOut = () => {
    optOut();
    onClose();
  };

  return (
    <>
      <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
        <SheetContent side="right" className="w-full sm:max-w-lg p-0 flex flex-col">
          {/* Header */}
          <SheetHeader className="px-4 py-3 border-b shrink-0">
            <div className="flex items-center justify-between">
              <SheetTitle className="text-lg">
                {channel?.name || 'DNA | Feedback Hub'}
              </SheetTitle>
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleOpenFullPage}
                  title="Open full page"
                >
                  <Maximize2 className="h-4 w-4" />
                </Button>
                {!isOptedOut && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleOptOut}
                    disabled={isOptingOut}
                    title="Opt out"
                  >
                    {isOptingOut ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <LogOut className="h-4 w-4" />
                    )}
                  </Button>
                )}
                <Button variant="ghost" size="icon" onClick={onClose}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </SheetHeader>

          {/* Opted Out State */}
          {isOptedOut ? (
            <div className="flex-1 flex items-center justify-center p-6">
              <div className="text-center max-w-xs">
                <div className="text-4xl mb-4">👋</div>
                <h3 className="text-lg font-semibold mb-2">You've opted out</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  You're not receiving feedback hub updates. Opt back in to participate.
                </p>
                <Button onClick={() => optIn()} disabled={isOptingIn}>
                  {isOptingIn ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : (
                    <LogIn className="h-4 w-4 mr-2" />
                  )}
                  Opt Back In
                </Button>
              </div>
            </div>
          ) : (
            <>
              {/* Filters */}
              <div className="px-4 py-2 border-b shrink-0">
                <Tabs value={filter} onValueChange={(v) => setFilter(v as FeedbackFilter)}>
                  <TabsList className="h-8">
                    <TabsTrigger value="all" className="text-xs h-7">All</TabsTrigger>
                    <TabsTrigger value="my_feedback" className="text-xs h-7">Mine</TabsTrigger>
                    <TabsTrigger value="pinned" className="text-xs h-7">Pinned</TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>

              {/* Message List */}
              <FeedbackMessageList
                messages={messages}
                channelId={channel?.id || ''}
                isLoading={isMessagesLoading}
                isFetchingNextPage={isFetchingNextPage}
                hasNextPage={hasNextPage ?? false}
                onLoadMore={() => fetchNextPage()}
                onReply={handleReply}
                isAdmin={isAdmin}
              />

              {/* Composer */}
              {channel && (
                <FeedbackComposer
                  channelId={channel.id}
                  replyTo={replyTo}
                  onCancelReply={handleCancelReply}
                />
              )}
            </>
          )}
        </SheetContent>
      </Sheet>

      {/* Thread View Dialog */}
      {selectedThread && channel && (
        <FeedbackThreadView
          parentMessage={selectedThread}
          channelId={channel.id}
          isOpen={!!selectedThread}
          onClose={() => setSelectedThread(null)}
          isAdmin={isAdmin}
        />
      )}
    </>
  );
}
