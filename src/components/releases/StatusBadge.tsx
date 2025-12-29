/**
 * StatusBadge Component
 * Displays lifecycle stage badges for releases (NEW, RECENT, ARCHIVED)
 */

import React from 'react';
import { cn } from '@/lib/utils';
import { LIFECYCLE_CONFIG, type ReleaseLifecycleStage, type StatusBadgeProps } from '@/types/releases';

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  stage,
  size = 'md',
  className,
}) => {
  const config = LIFECYCLE_CONFIG[stage];

  const sizeClasses = {
    sm: 'px-1.5 py-0.5 text-[10px]',
    md: 'px-2 py-0.5 text-xs',
    lg: 'px-2.5 py-1 text-sm',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center font-semibold rounded-full border uppercase tracking-wide',
        config.bgColor,
        config.color,
        config.borderColor,
        sizeClasses[size],
        className
      )}
    >
      {config.label}
    </span>
  );
};

export default StatusBadge;
