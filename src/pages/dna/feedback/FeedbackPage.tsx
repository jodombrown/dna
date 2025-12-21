import React, { useState, useCallback, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { ArrowLeft, BarChart2, LogOut, LogIn, Loader2 } from 'lucide-react';
import { FeedbackMessageList, FeedbackComposer, FeedbackAnalytics } from '@/components/feedback';
import { FeedbackWelcomeBanner } from '@/components/feedback/FeedbackWelcomeBanner';
import { FeedbackHeroSection } from '@/components/feedback/FeedbackHeroSection';
import { useFeedbackMessages } from '@/hooks/useFeedbackMessages';
import { useFeedbackMembership } from '@/hooks/useFeedbackMembership';
import type { FeedbackFilter, UserTag } from '@/types/feedback';

export default function FeedbackPage() {
  const navigate = useNavigate();
  const composerRef = useRef<HTMLFormElement>(null);
  const [filter, setFilter] = useState<FeedbackFilter>('all');
  const [selectedTag, setSelectedTag] = useState<UserTag | null>(null);
  const [replyTo, setReplyTo] = useState<{
    id: string;
    username: string;
    preview: string;
  } | null>(null);

  const {
    channel,
    membership,
    isLoading: isMembershipLoading,
    isOptedIn,
    isOptedOut,
    isAdmin,
    optOut,
    optIn,
    isOptingOut,
    isOptingIn,
    updateLastRead,
  } = useFeedbackMembership();

  // Only fetch messages once membership is confirmed (for RLS to work)
  const isMembershipReady = !isMembershipLoading && isOptedIn;

  const {
    messages,
    isLoading: isMessagesLoading,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
  } = useFeedbackMessages(channel?.id || null, filter, isMembershipReady);

  // Update last read on mount
  useEffect(() => {
    if (channel?.id) {
      updateLastRead();
    }
  }, [channel?.id]);

  const handleReply = useCallback(async (messageId: string) => {
    const message = messages.find((m) => m.id === messageId);
    if (message) {
      setReplyTo({
        id: message.id,
        username: message.sender?.username || 'anonymous',
        preview: message.content || '',
      });
    }
  }, [messages]);

  const handleCancelReply = useCallback(() => {
    setReplyTo(null);
  }, []);

  const handleHeroCardClick = useCallback((tag: UserTag | null) => {
    setSelectedTag(tag);
    // Scroll to composer
    setTimeout(() => {
      composerRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 100);
  }, []);

  // Loading state
  if (isMembershipLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  // Opted out state
  if (isOptedOut) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="max-w-md w-full p-6 text-center">
          <div className="text-4xl mb-4">👋</div>
          <h2 className="text-xl font-semibold mb-2">You've opted out</h2>
          <p className="text-muted-foreground mb-4">
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
        </Card>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-background">
      {/* Welcome Banner */}
      <FeedbackWelcomeBanner />

      {/* Header */}
      <header className="border-b px-4 py-3 flex items-center gap-4 shrink-0">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate(-1)}
          className="shrink-0"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>

        <div className="flex-1 min-w-0">
          <h1 className="text-lg font-semibold truncate">
            {channel?.name || 'DNA | Feedback Hub'}
          </h1>
          <p className="text-sm text-muted-foreground truncate">
            Share feedback, report bugs, suggest features
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {isAdmin && (
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  <BarChart2 className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-full sm:max-w-xl overflow-y-auto">
                <SheetHeader>
                  <SheetTitle>Feedback Analytics</SheetTitle>
                </SheetHeader>
                <FeedbackAnalytics className="mt-6" />
              </SheetContent>
            </Sheet>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => optOut()}
            disabled={isOptingOut}
            title="Opt out of Feedback Hub"
          >
            {isOptingOut ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <LogOut className="h-5 w-5" />
            )}
          </Button>
        </div>
      </header>

      {/* Hero Section */}
      <FeedbackHeroSection onCardClick={handleHeroCardClick} />

      {/* Filters */}
      <div className="border-b px-4 py-2 shrink-0">
        <Tabs value={filter} onValueChange={(v) => setFilter(v as FeedbackFilter)}>
          <TabsList>
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="my_feedback">My Feedback</TabsTrigger>
            <TabsTrigger value="pinned">Pinned</TabsTrigger>
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
          initialTag={selectedTag}
          composerRef={composerRef}
        />
      )}
    </div>
  );
}
