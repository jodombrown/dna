/**
 * DNA | Sprint 11 - Feed Skeleton Cards
 *
 * Skeleton loading cards matching exact dimensions of each card type.
 * Animated shimmer effect. Used during initial load and infinite scroll.
 */

import React from 'react';
import { cn } from '@/lib/utils';

// ============================================================
// SHIMMER BASE
// ============================================================

const Shimmer: React.FC<{ className?: string }> = ({ className }) => (
  <div
    className={cn(
      'animate-pulse bg-muted rounded',
      className
    )}
  />
);

// ============================================================
// POST SKELETON
// ============================================================

const PostSkeleton: React.FC = () => (
  <div className="bg-card rounded-xl border border-border/50 p-5 space-y-3">
    {/* Module indicator */}
    <div className="flex items-center gap-1.5">
      <Shimmer className="w-2 h-2 rounded-full" />
      <Shimmer className="w-16 h-3" />
    </div>
    {/* Author */}
    <div className="flex items-center gap-3">
      <Shimmer className="h-10 w-10 rounded-full" />
      <div className="space-y-1.5 flex-1">
        <Shimmer className="h-3.5 w-32" />
        <Shimmer className="h-3 w-24" />
      </div>
    </div>
    {/* Body */}
    <div className="space-y-2">
      <Shimmer className="h-3.5 w-full" />
      <Shimmer className="h-3.5 w-5/6" />
      <Shimmer className="h-3.5 w-2/3" />
    </div>
    {/* Engagement */}
    <div className="flex items-center gap-4 pt-2 border-t border-border/30">
      <Shimmer className="h-8 w-16 rounded-md" />
      <Shimmer className="h-8 w-16 rounded-md" />
      <Shimmer className="h-8 w-16 rounded-md" />
      <Shimmer className="h-8 w-8 rounded-md ml-auto" />
    </div>
  </div>
);

// ============================================================
// EVENT SKELETON
// ============================================================

const EventSkeleton: React.FC = () => (
  <div className="bg-card rounded-xl border-2 border-amber-200/50 overflow-hidden">
    {/* Cover image */}
    <Shimmer className="w-full h-40 rounded-none" />
    <div className="p-5 space-y-3">
      {/* Badge */}
      <Shimmer className="h-5 w-20 rounded-full" />
      {/* Title */}
      <Shimmer className="h-6 w-3/4" />
      {/* Date */}
      <div className="flex items-center gap-3">
        <Shimmer className="h-12 w-12 rounded-lg" />
        <div className="space-y-1.5">
          <Shimmer className="h-3.5 w-40" />
          <Shimmer className="h-3 w-28" />
        </div>
      </div>
      {/* Footer */}
      <div className="flex items-center justify-between pt-3 border-t border-border/30">
        <Shimmer className="h-4 w-24" />
        <Shimmer className="h-9 w-20 rounded-md" />
      </div>
    </div>
  </div>
);

// ============================================================
// OPPORTUNITY SKELETON
// ============================================================

const OpportunitySkeleton: React.FC = () => (
  <div className="bg-card rounded-xl border-2 border-amber-700/30 p-5 space-y-3">
    {/* Badge */}
    <div className="flex gap-2">
      <Shimmer className="h-5 w-16 rounded-full" />
      <Shimmer className="h-5 w-24 rounded-full" />
    </div>
    {/* Title */}
    <Shimmer className="h-5 w-2/3" />
    {/* Description */}
    <div className="space-y-2">
      <Shimmer className="h-3.5 w-full" />
      <Shimmer className="h-3.5 w-4/5" />
    </div>
    {/* CTA */}
    <Shimmer className="h-10 w-full rounded-md" />
    {/* Engagement */}
    <div className="flex items-center gap-4 pt-2 border-t border-border/30">
      <Shimmer className="h-8 w-16 rounded-md" />
      <Shimmer className="h-8 w-16 rounded-md" />
      <Shimmer className="h-8 w-8 rounded-md ml-auto" />
    </div>
  </div>
);

// ============================================================
// SPACE SKELETON
// ============================================================

const SpaceSkeleton: React.FC = () => (
  <div className="bg-card rounded-xl border-2 border-green-700/30 p-5 space-y-3">
    {/* Badge */}
    <Shimmer className="h-5 w-28 rounded-full" />
    {/* Author */}
    <div className="flex items-center gap-3">
      <Shimmer className="h-10 w-10 rounded-full" />
      <div className="space-y-1.5">
        <Shimmer className="h-3.5 w-32" />
        <Shimmer className="h-3 w-24" />
      </div>
    </div>
    {/* Title */}
    <Shimmer className="h-6 w-3/4" />
    {/* Description */}
    <Shimmer className="h-3.5 w-full" />
    <Shimmer className="h-3.5 w-2/3" />
    {/* Meta */}
    <div className="flex items-center gap-4">
      <Shimmer className="h-4 w-24" />
      <Shimmer className="h-4 w-16" />
    </div>
    {/* CTA */}
    <Shimmer className="h-10 w-full rounded-md" />
  </div>
);

// ============================================================
// STORY SKELETON
// ============================================================

const StorySkeleton: React.FC = () => (
  <div className="bg-card rounded-xl border-2 border-teal-700/30 p-5 space-y-3">
    {/* Author */}
    <div className="flex items-center gap-3">
      <Shimmer className="h-10 w-10 rounded-full" />
      <div className="space-y-1.5 flex-1">
        <div className="flex items-center gap-2">
          <Shimmer className="h-3.5 w-24" />
          <Shimmer className="h-5 w-14 rounded-full" />
        </div>
        <Shimmer className="h-3 w-20" />
      </div>
    </div>
    {/* Title */}
    <Shimmer className="h-6 w-4/5" />
    {/* Cover image */}
    <Shimmer className="w-full h-44 rounded-lg" />
    {/* Body preview */}
    <div className="space-y-2">
      <Shimmer className="h-3.5 w-full" />
      <Shimmer className="h-3.5 w-5/6" />
    </div>
    {/* Engagement */}
    <div className="flex items-center gap-4 pt-2 border-t border-border/30">
      <Shimmer className="h-8 w-20 rounded-md" />
      <Shimmer className="h-8 w-20 rounded-md" />
      <Shimmer className="h-8 w-8 rounded-md ml-auto" />
    </div>
  </div>
);

// ============================================================
// COMPOSITE SKELETON FEED
// ============================================================

const SKELETON_PATTERN: Array<'post' | 'event' | 'opportunity' | 'space' | 'story'> = [
  'post',
  'event',
  'post',
  'opportunity',
  'story',
  'post',
  'space',
];

interface FeedSkeletonProps {
  count?: number;
  className?: string;
}

export const FeedSkeleton: React.FC<FeedSkeletonProps> = ({
  count = 3,
  className,
}) => {
  return (
    <div className={cn('space-y-4', className)}>
      {Array.from({ length: count }).map((_, i) => {
        const type = SKELETON_PATTERN[i % SKELETON_PATTERN.length];
        switch (type) {
          case 'event':
            return <EventSkeleton key={i} />;
          case 'opportunity':
            return <OpportunitySkeleton key={i} />;
          case 'space':
            return <SpaceSkeleton key={i} />;
          case 'story':
            return <StorySkeleton key={i} />;
          default:
            return <PostSkeleton key={i} />;
        }
      })}
    </div>
  );
};

// ============================================================
// INLINE LOADING SKELETON (for infinite scroll)
// ============================================================

export const FeedLoadingMore: React.FC = () => (
  <div className="space-y-4 py-2">
    <PostSkeleton />
  </div>
);
