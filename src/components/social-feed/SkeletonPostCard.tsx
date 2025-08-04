import React from 'react';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export const SkeletonPostCard: React.FC = () => {
  return (
    <Card className="p-6 space-y-4">
      {/* Header with avatar and user info */}
      <div className="flex items-start space-x-3">
        <Skeleton className="h-10 w-10 rounded-full" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-3 w-24" />
        </div>
        <Skeleton className="h-6 w-16 rounded-full" />
      </div>

      {/* Content */}
      <div className="space-y-2">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
      </div>

      {/* Media placeholder (randomly show/hide) */}
      {Math.random() > 0.5 && (
        <Skeleton className="h-48 w-full rounded-md" />
      )}

      {/* Actions */}
      <div className="flex items-center justify-between pt-4">
        <div className="flex items-center space-x-4">
          <Skeleton className="h-8 w-16" />
          <Skeleton className="h-8 w-16" />
          <Skeleton className="h-8 w-16" />
        </div>
        <Skeleton className="h-6 w-6" />
      </div>
    </Card>
  );
};