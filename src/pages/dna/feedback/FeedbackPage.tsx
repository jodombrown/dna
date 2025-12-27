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
import { ArrowLeft, BarChart2, LogOut, LogIn, Loader2, HelpCircle } from 'lucide-react';
import { FeedbackMessageList, FeedbackComposer, FeedbackAnalytics } from '@/components/feedback';
import { FeedbackWelcomeBanner } from '@/components/feedback/FeedbackWelcomeBanner';
import { FeedbackHeroSection } from '@/components/feedback/FeedbackHeroSection';
import { FeedbackHubTour } from '@/components/tours';
import { useFeedbackMessages } from '@/hooks/useFeedbackMessages';
import { useFeedbackMembership } from '@/hooks/useFeedbackMembership';
import { useAuth } from '@/contexts/AuthContext';
import type { FeedbackFilter, UserTag } from '@/types/feedback';

export default function FeedbackPage() {
  const navigate = useNavigate();
  const { user, loading: isAuthLoading } = useAuth();
  const composerRef = useRef<HTMLFormElement>(null);
  const [filter, setFilter] = useState<FeedbackFilter>('all');
  const [selectedTag, setSelectedTag] = useState<UserTag | null>(null);
  const [replyTo, setReplyTo] = useState<{
    id: string;
    username: string;
    preview: string;
  } | null>(null);
  const [showHelpTour, setShowHelpTour] = useState(false);

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
  if (isAuthLoading || isMembershipLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  // Not logged in state
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="max-w-md w-full p-6 text-center">
          <div className="text-4xl mb-4">🔐</div>
          <h2 className="text-xl font-semibold mb-2">Login Required</h2>
          <p className="text-muted-foreground mb-4">
            Please log in to view and share feedback in the DNA Feedback Hub.
          </p>
          <Button onClick={() => navigate('/auth')}>
            <LogIn className="h-4 w-4 mr-2" />
            Log In
          </Button>
        </Card>
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
    <div className="h-screen flex flex-col bg-background overflow-hidden">
      {/* Welcome Banner */}
      <FeedbackWelcomeBanner />

      {/* Header */}
      <header className="border-b px-3 py-2 md:px-4 md:py-3 flex items-center gap-3 shrink-0">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate(-1)}
          className="shrink-0 h-8 w-8 md:h-10 md:w-10"
        >
          <ArrowLeft className="h-4 w-4 md:h-5 md:w-5" />
        </Button>

        <div className="flex-1 min-w-0">
          <h1 className="text-base md:text-lg font-semibold truncate">
            DNA | Feedback Hub
          </h1>
          <p className="text-xs md:text-sm text-muted-foreground truncate hidden sm:block">
            Share feedback, report bugs, suggest features
          </p>
        </div>

        <div className="flex items-center gap-1 md:gap-2 shrink-0">
          {isAdmin && (
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8 md:h-10 md:w-10">
                  <BarChart2 className="h-4 w-4 md:h-5 md:w-5" />
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
            className="h-8 w-8 md:h-10 md:w-10"
          >
            {isOptingOut ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <LogOut className="h-4 w-4 md:h-5 md:w-5" />
            )}
          </Button>
        </div>
      </header>

      {/* Hero Section */}
      <FeedbackHeroSection onCardClick={handleHeroCardClick} />

      {/* Filters */}
      <div className="border-b px-3 md:px-4 py-2 shrink-0 flex items-center justify-between gap-2">
        <Tabs value={filter} onValueChange={(v) => setFilter(v as FeedbackFilter)}>
          <TabsList className="h-8">
            <TabsTrigger value="all" className="text-xs px-2 md:px-3">All</TabsTrigger>
            <TabsTrigger value="my_feedback" className="text-xs px-2 md:px-3">Mine</TabsTrigger>
            <TabsTrigger value="pinned" className="text-xs px-2 md:px-3">Pinned</TabsTrigger>
          </TabsList>
        </Tabs>
        <Button
          variant="default"
          size="sm"
          onClick={() => setShowHelpTour(true)}
          title="Learn how to use Feedback Hub"
          className="gap-1 text-xs h-7 md:h-8 px-2 md:px-3 bg-primary text-primary-foreground"
        >
          <HelpCircle className="h-3.5 w-3.5 md:h-4 md:w-4" />
          <span className="hidden sm:inline">Help</span>
        </Button>
      </div>

      {/* Message List - flex-1 and min-h-0 allow proper scrolling */}
      <div className="flex-1 min-h-0 overflow-hidden">
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
      </div>

      {/* Composer */}
      {channel && isMembershipReady && (
        <FeedbackComposer
          channelId={channel.id}
          replyTo={replyTo}
          onCancelReply={handleCancelReply}
          initialTag={selectedTag}
          composerRef={composerRef}
        />
      )}

      {/* Help Tour */}
      <FeedbackHubTour
        open={showHelpTour}
        onClose={() => setShowHelpTour(false)}
      />
    </div>
  );
}
