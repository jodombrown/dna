import React, { useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Maximize2, LogOut, LogIn, Loader2, ChevronRight } from 'lucide-react';
import { FeedbackMessageList, FeedbackComposer } from '@/components/feedback';
import { FeedbackThreadView } from './FeedbackThreadView';
import { useFeedbackMessages } from '@/hooks/useFeedbackMessages';
import { useFeedbackMembership } from '@/hooks/useFeedbackMembership';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';
import type { FeedbackFilter, FeedbackMessageWithSender } from '@/types/feedback';

interface FeedbackDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export function FeedbackDrawer({ isOpen, onClose }: FeedbackDrawerProps) {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const [filter, setFilter] = useState<FeedbackFilter>('all');
  const [replyTo, setReplyTo] = useState<{
    id: string;
    username: string;
    preview: string;
  } | null>(null);
  const [selectedThread, setSelectedThread] = useState<FeedbackMessageWithSender | null>(null);
  const [showOptOutConfirm, setShowOptOutConfirm] = useState(false);

  const {
    channel,
    isLoading: isMembershipLoading,
    isAdmin,
    isOptedIn,
    isOptedOut,
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

  const handleOptOutClick = () => {
    setShowOptOutConfirm(true);
  };

  const handleConfirmOptOut = () => {
    optOut();
    setShowOptOutConfirm(false);
    onClose();
    toast({
      title: "You've opted out of the Feedback Hub",
      description: "To opt back in, tap the feedback button again and select 'Opt Back In'.",
      duration: 6000,
    });
  };

  return (
    <>
      <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
        <SheetContent side="right" className="w-full sm:max-w-lg p-0 flex flex-col overflow-visible" hideCloseButton>
          {/* Left-edge chevron close tab - flush with drawer */}
          <button
            onClick={onClose}
            className="absolute left-0 top-1/2 -translate-x-full -translate-y-1/2 z-[60] flex items-center justify-center w-6 h-16 md:w-8 md:h-20 bg-background border border-r-0 border-border hover:bg-muted rounded-l-lg shadow-md transition-all duration-200"
            aria-label="Close Feedback Hub"
          >
            <ChevronRight className="h-5 w-5 md:h-6 md:w-6 text-foreground" />
          </button>

          {/* Header */}
          <SheetHeader className="px-4 py-3 border-b shrink-0">
            <div className="flex items-center justify-between">
              <SheetTitle className="text-lg">
                {channel?.name || 'DNA | Feedback Hub'}
              </SheetTitle>
              <div className="flex items-center gap-1">
                {/* Full page - desktop only */}
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleOpenFullPage}
                  title="Open full page"
                  className="hidden md:flex"
                >
                  <Maximize2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </SheetHeader>

          {/* Auth Loading State */}
          {authLoading ? (
            <div className="flex-1 flex items-center justify-center p-6">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : !user ? (
            /* Not Logged In State */
            <div className="flex-1 flex items-center justify-center p-6">
              <div className="text-center max-w-xs">
                <div className="text-4xl mb-4">🔐</div>
                <h3 className="text-lg font-semibold mb-2">Sign in to share feedback</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Join the DNA community to share your thoughts, report bugs, and suggest new features.
                </p>
                <Button onClick={() => { onClose(); navigate('/auth'); }}>
                  <LogIn className="h-4 w-4 mr-2" />
                  Sign In
                </Button>
              </div>
            </div>
          ) : isOptedOut ? (
            /* Opted Out State */
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
              {/* Filters with opt-out option */}
              <div className="px-4 py-2 border-b shrink-0">
                <div className="flex items-center justify-between gap-2">
                  <Tabs value={filter} onValueChange={(v) => setFilter(v as FeedbackFilter)}>
                    <TabsList className="h-8">
                      <TabsTrigger value="all" className="text-xs h-7">All</TabsTrigger>
                      <TabsTrigger value="my_feedback" className="text-xs h-7">Mine</TabsTrigger>
                      <TabsTrigger value="pinned" className="text-xs h-7">Pinned</TabsTrigger>
                    </TabsList>
                  </Tabs>
                  
                  {/* Opt out option - moved here */}
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground hidden sm:inline">Opt in/out</span>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={handleOptOutClick}
                            disabled={isOptingOut}
                            className="h-7 w-7"
                          >
                            {isOptingOut ? (
                              <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            ) : (
                              <LogOut className="h-3.5 w-3.5" />
                            )}
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent side="bottom">
                          <p>Stop receiving feedback updates and hide this hub</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                </div>
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
              {channel && isMembershipReady && (
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
      {/* Opt Out Confirmation Dialog */}
      <AlertDialog open={showOptOutConfirm} onOpenChange={setShowOptOutConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Opt out of Feedback Hub?</AlertDialogTitle>
            <AlertDialogDescription className="space-y-2">
              <p>Are you sure you want to opt out? You will no longer see the feedback button or receive updates.</p>
              <p className="font-medium text-foreground">
                To opt back in later, tap the feedback button (it will reappear after you refresh) and select "Opt Back In".
              </p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>No, stay in</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmOptOut}>
              Yes, opt me out
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
