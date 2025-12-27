import React, { useRef, useEffect, useCallback } from 'react';
import { FeedbackMessage } from './FeedbackMessage';
import type { FeedbackMessageWithSender } from '@/types/feedback';
import { Loader2 } from 'lucide-react';

interface FeedbackMessageListProps {
  messages: FeedbackMessageWithSender[];
  channelId: string;
  isLoading: boolean;
  isFetchingNextPage: boolean;
  hasNextPage: boolean;
  onLoadMore: () => void;
  onReply: (messageId: string) => void;
  isAdmin?: boolean;
}

export function FeedbackMessageList({
  messages,
  channelId,
  isLoading,
  isFetchingNextPage,
  hasNextPage,
  onLoadMore,
  onReply,
  isAdmin = false,
}: FeedbackMessageListProps) {
  const loadMoreRef = useRef<HTMLDivElement>(null);

  // Infinite scroll observer
  const handleObserver = useCallback(
    (entries: IntersectionObserverEntry[]) => {
      const [entry] = entries;
      if (entry.isIntersecting && hasNextPage && !isFetchingNextPage) {
        onLoadMore();
      }
    },
    [hasNextPage, isFetchingNextPage, onLoadMore]
  );

  useEffect(() => {
    const element = loadMoreRef.current;
    if (!element) return;

    const observer = new IntersectionObserver(handleObserver, {
      threshold: 0.1,
    });

    observer.observe(element);
    return () => observer.disconnect();
  }, [handleObserver]);

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (messages.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
        <div className="text-4xl mb-4">💬</div>
        <h3 className="text-lg font-semibold text-foreground">No feedback yet</h3>
        <p className="text-muted-foreground mt-1">
          Be the first to share your thoughts, report a bug, or suggest a feature!
        </p>
      </div>
    );
  }

  // Separate pinned from regular messages
  const pinnedMessages = messages.filter((m) => m.is_pinned);
  const regularMessages = messages.filter((m) => !m.is_pinned);

  return (
    <div className="h-full overflow-y-auto p-3 md:p-4 space-y-3 md:space-y-4">
      {/* Pinned Messages Section */}
      {pinnedMessages.length > 0 && (
        <div className="space-y-2 md:space-y-3">
          <h3 className="text-xs md:text-sm font-medium text-muted-foreground flex items-center gap-2">
            📌 Pinned
          </h3>
          {pinnedMessages.map((message) => (
            <FeedbackMessage
              key={message.id}
              message={message}
              channelId={channelId}
              isAdmin={isAdmin}
              onReply={() => onReply(message.id)}
            />
          ))}
          <hr className="my-3 md:my-4" />
        </div>
      )}

      {/* Regular Messages */}
      {regularMessages.map((message) => (
        <FeedbackMessage
          key={message.id}
          message={message}
          channelId={channelId}
          isAdmin={isAdmin}
          onReply={() => onReply(message.id)}
        />
      ))}

      {/* Load More Trigger */}
      <div ref={loadMoreRef} className="h-4" />

      {/* Loading More Indicator */}
      {isFetchingNextPage && (
        <div className="flex justify-center py-3 md:py-4">
          <Loader2 className="h-5 w-5 md:h-6 md:w-6 animate-spin text-muted-foreground" />
        </div>
      )}
    </div>
  );
}
