import React from 'react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import type { AdminStatus } from '@/types/feedback';
import { ADMIN_STATUS_LABELS, ADMIN_STATUS_COLORS } from '@/types/feedback';

interface FeedbackStatusBadgeProps {
  status: AdminStatus;
  className?: string;
}

export function FeedbackStatusBadge({ status, className }: FeedbackStatusBadgeProps) {
  return (
    <Badge className={cn('text-xs', ADMIN_STATUS_COLORS[status], className)}>
      {ADMIN_STATUS_LABELS[status]}
    </Badge>
  );
}
