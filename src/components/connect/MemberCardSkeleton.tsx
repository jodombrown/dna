import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export const MemberCardSkeleton: React.FC = () => {
  return (
    <Card className="overflow-hidden border-border/50">
      <CardContent className="p-3">
        <div className="flex items-start gap-3">
          {/* Avatar */}
          <Skeleton className="h-10 w-10 rounded-full shrink-0" />

          {/* Content */}
          <div className="flex-1 min-w-0 space-y-2">
            {/* Header row with name and match score */}
            <div className="flex items-center justify-between gap-2">
              <Skeleton className="h-4 w-28" />
              <Skeleton className="h-5 w-12 rounded-full" />
            </div>

            {/* Headline */}
            <Skeleton className="h-3 w-3/4" />

            {/* Location */}
            <div className="flex items-center gap-1">
              <Skeleton className="h-3 w-3 rounded" />
              <Skeleton className="h-3 w-20" />
            </div>

            {/* Tags */}
            <div className="flex gap-1.5 pt-0.5">
              <Skeleton className="h-5 w-16 rounded-full" />
              <Skeleton className="h-5 w-20 rounded-full" />
            </div>

            {/* Actions */}
            <div className="flex gap-1.5 pt-1">
              <Skeleton className="h-7 flex-1 rounded-md" />
              <Skeleton className="h-7 w-8 rounded-md" />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

interface MemberCardSkeletonGridProps {
  count?: number;
}

export const MemberCardSkeletonGrid: React.FC<MemberCardSkeletonGridProps> = ({
  count = 4,
}) => {
  return (
    <div className="grid gap-3 px-1">
      {Array.from({ length: count }).map((_, i) => (
        <MemberCardSkeleton key={i} />
      ))}
    </div>
  );
};
