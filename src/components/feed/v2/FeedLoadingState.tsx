/**
 * DNA | FEED v2 - Loading State
 *
 * Skeleton cards for feed loading with cultural pattern accents.
 */

import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';

interface FeedLoadingStateProps {
  count?: number;
}

const SkeletonCard: React.FC = () => (
  <div className="px-4 py-4 md:px-5 md:py-5 border-b border-border/20 md:border md:border-border/30 md:rounded-xl">
    {/* Module indicator */}
    <div className="flex items-center gap-1.5 mb-3">
      <Skeleton className="w-2 h-2 rounded-full" />
      <Skeleton className="w-16 h-3" />
    </div>

    {/* Author header */}
    <div className="flex items-center gap-3 mb-4">
      <Skeleton className="w-10 h-10 rounded-full" />
      <div className="flex-1">
        <Skeleton className="w-32 h-4 mb-1" />
        <Skeleton className="w-48 h-3" />
      </div>
    </div>

    {/* Body */}
    <div className="space-y-2 mb-4">
      <Skeleton className="w-full h-3" />
      <Skeleton className="w-full h-3" />
      <Skeleton className="w-3/4 h-3" />
    </div>

    {/* Engagement bar */}
    <div className="flex items-center justify-between pt-3 border-t border-border/30">
      <Skeleton className="w-16 h-8 rounded" />
      <Skeleton className="w-16 h-8 rounded" />
      <Skeleton className="w-16 h-8 rounded" />
      <Skeleton className="w-8 h-8 rounded" />
    </div>
  </div>
);

const SkeletonCardWithImage: React.FC = () => (
  <div className="border-b border-border/20 md:border md:border-border/30 md:rounded-xl overflow-hidden">
    {/* Cover image */}
    <Skeleton className="w-full h-48" />

    <div className="px-4 py-4 md:px-5 md:py-5">
      {/* Module indicator */}
      <div className="flex items-center gap-1.5 mb-3">
        <Skeleton className="w-2 h-2 rounded-full" />
        <Skeleton className="w-16 h-3" />
      </div>

      {/* Title */}
      <Skeleton className="w-3/4 h-5 mb-2" />
      <Skeleton className="w-1/2 h-4 mb-3" />

      {/* Meta */}
      <div className="flex gap-3 mb-3">
        <Skeleton className="w-20 h-3" />
        <Skeleton className="w-20 h-3" />
      </div>

      {/* CTA */}
      <Skeleton className="w-full h-9 rounded-md mb-3" />

      {/* Engagement bar */}
      <div className="flex items-center justify-between pt-3 border-t border-border/30">
        <Skeleton className="w-16 h-8 rounded" />
        <Skeleton className="w-16 h-8 rounded" />
        <Skeleton className="w-16 h-8 rounded" />
        <Skeleton className="w-8 h-8 rounded" />
      </div>
    </div>
  </div>
);

export const FeedLoadingState: React.FC<FeedLoadingStateProps> = ({ count = 4 }) => {
  return (
    <div className="space-y-2 md:space-y-3">
      {Array.from({ length: count }).map((_, i) =>
        i % 3 === 1 ? <SkeletonCardWithImage key={i} /> : <SkeletonCard key={i} />
      )}
    </div>
  );
};
