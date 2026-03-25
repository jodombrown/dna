import React from 'react';
import { cn } from '@/lib/utils';
import { CollaborateSpaceCard, CollaborateSpaceCardProps } from './CollaborateSpaceCard';

interface SpaceDiscoveryLaneProps {
  title: string;
  spaces: CollaborateSpaceCardProps[];
  onSeeAll?: () => void;
  className?: string;
}

export function SpaceDiscoveryLane({ title, spaces, onSeeAll, className }: SpaceDiscoveryLaneProps) {
  if (!spaces || spaces.length === 0) return null;

  return (
    <div className={cn('space-y-3', className)}>
      {/* Lane header */}
      <div className="flex items-center justify-between px-1">
        <h2 className="text-base font-semibold text-foreground">{title}</h2>
        {onSeeAll && (
          <button
            onClick={onSeeAll}
            className="text-xs font-medium text-primary hover:text-primary/80 transition-colors"
          >
            See All →
          </button>
        )}
      </div>

      {/* Horizontal scroll */}
      <div className="overflow-x-auto scrollbar-hide -mx-3 px-3">
        <div className="flex gap-3" style={{ minWidth: 'min-content' }}>
          {spaces.map((space) => (
            <CollaborateSpaceCard
              key={space.id}
              {...space}
              className="w-72 min-w-[288px] sm:w-64 sm:min-w-[256px]"
            />
          ))}
        </div>
      </div>
    </div>
  );
}
