/**
 * DiscoveryFeed
 *
 * Main container for the Zero State discovery experience.
 * Shows curated content for new users who haven't yet built
 * their own activity on the platform.
 */

import React, { useState, useEffect } from 'react';
import { useZeroStateFeed } from '@/hooks/useZeroStateFeed';
import { ZeroStateWelcomeCard } from './ZeroStateWelcomeCard';
import { TrendingStoryCard } from './TrendingStoryCard';
import { UpcomingEventCard } from './UpcomingEventCard';
import { SuggestedConnectionsCard } from './SuggestedConnectionsCard';
import { PopularSpaceCard } from './PopularSpaceCard';
import { MarketplaceHighlightCard } from './MarketplaceHighlightCard';

const WELCOME_DISMISSED_KEY = 'dna-welcome-card-dismissed';

export function DiscoveryFeed() {
  const { data: feed, isLoading, error } = useZeroStateFeed();
  const [welcomeDismissed, setWelcomeDismissed] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem(WELCOME_DISMISSED_KEY) === 'true';
    }
    return false;
  });

  // Persist welcome card dismissal
  const handleDismissWelcome = () => {
    setWelcomeDismissed(true);
    localStorage.setItem(WELCOME_DISMISSED_KEY, 'true');
  };

  if (isLoading) {
    return <DiscoveryFeedSkeleton />;
  }

  if (error) {
    // Silently fail - show empty state or fallback
    return null;
  }

  if (!feed?.show_discovery_feed) {
    return null; // User has transitioned to normal Activity Stream
  }

  const hasContent =
    (feed.trending_stories?.length || 0) > 0 ||
    (feed.upcoming_events?.length || 0) > 0 ||
    (feed.suggested_connections?.length || 0) > 0 ||
    (feed.popular_spaces?.length || 0) > 0 ||
    (feed.marketplace_highlights?.length || 0) > 0;

  return (
    <div className="space-y-6">
      {/* DIA Welcome Card */}
      {feed.show_welcome_card && !welcomeDismissed && (
        <ZeroStateWelcomeCard onDismiss={handleDismissWelcome} />
      )}

      {hasContent && (
        <>
          {/* Section Header */}
          <SectionDivider label="What's Happening in Your Community" />

          {/* Trending Stories */}
          {feed.trending_stories?.length > 0 && (
            <div className="space-y-4">
              {feed.trending_stories.map((story) => (
                <TrendingStoryCard key={story.id} story={story} />
              ))}
            </div>
          )}

          {/* Upcoming Events */}
          {feed.upcoming_events?.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {feed.upcoming_events.map((event) => (
                <UpcomingEventCard key={event.id} event={event} />
              ))}
            </div>
          )}

          {/* Suggested Connections */}
          {feed.suggested_connections?.length > 0 && (
            <SuggestedConnectionsCard connections={feed.suggested_connections} />
          )}

          {/* Popular Spaces */}
          {feed.popular_spaces?.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {feed.popular_spaces.map((space) => (
                <PopularSpaceCard key={space.id} space={space} />
              ))}
            </div>
          )}

          {/* Marketplace Highlights */}
          {feed.marketplace_highlights?.length > 0 && (
            <div className="space-y-4">
              {feed.marketplace_highlights.map((opportunity) => (
                <MarketplaceHighlightCard key={opportunity.id} opportunity={opportunity} />
              ))}
            </div>
          )}

          {/* More to Explore */}
          <SectionDivider label="More to Explore" />
        </>
      )}

      {!hasContent && !feed.show_welcome_card && (
        <EmptyDiscoveryState />
      )}
    </div>
  );
}

/**
 * Section divider with label
 */
function SectionDivider({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-3 py-2">
      <div className="h-px flex-1 bg-border" />
      <span className="text-sm font-medium text-muted-foreground whitespace-nowrap">
        {label}
      </span>
      <div className="h-px flex-1 bg-border" />
    </div>
  );
}

/**
 * Loading skeleton for discovery feed
 */
function DiscoveryFeedSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Welcome Card Skeleton */}
      <div className="h-48 bg-gradient-to-br from-muted to-muted/50 rounded-xl" />

      {/* Section Divider */}
      <div className="flex items-center gap-3 py-2">
        <div className="h-px flex-1 bg-border" />
        <div className="h-4 w-48 bg-muted rounded" />
        <div className="h-px flex-1 bg-border" />
      </div>

      {/* Story Card Skeleton */}
      <div className="h-32 bg-muted rounded-xl" />

      {/* Event Cards Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="h-64 bg-muted rounded-xl" />
        <div className="h-64 bg-muted rounded-xl" />
      </div>

      {/* Connections Card Skeleton */}
      <div className="h-48 bg-muted rounded-xl" />
    </div>
  );
}

/**
 * Empty state when no content is available
 */
function EmptyDiscoveryState() {
  return (
    <div className="text-center py-12">
      <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
        <span className="text-2xl">🌍</span>
      </div>
      <h3 className="text-lg font-semibold mb-2">
        Welcome to the DNA Community
      </h3>
      <p className="text-muted-foreground max-w-md mx-auto">
        Content is being curated for you. Check back soon to discover
        trending stories, events, and connections from the diaspora community.
      </p>
    </div>
  );
}
