/**
 * Presence dot indicator for profile pages.
 * Same system as ConnectMemberCard — green pulse (<24h), emerald (week), gray (inactive).
 */

import React, { useMemo } from 'react';
import { cn } from '@/lib/utils';

interface ProfilePresenceDotProps {
  lastSeenAt?: string | null;
  className?: string;
  size?: 'sm' | 'md';
}

export const ProfilePresenceDot: React.FC<ProfilePresenceDotProps> = ({
  lastSeenAt,
  className,
  size = 'md',
}) => {
  const presence = useMemo(() => {
    if (lastSeenAt) {
      const hours = (Date.now() - new Date(lastSeenAt).getTime()) / (1000 * 60 * 60);
      if (hours < 24) return { color: 'bg-green-500', pulse: true, label: 'Active today' };
      if (hours < 168) return { color: 'bg-emerald-500', pulse: false, label: 'Active this week' };
    }
    return { color: 'bg-muted-foreground/40', pulse: false, label: 'Inactive' };
  }, [lastSeenAt]);

  const sizeClasses = size === 'sm' ? 'h-2.5 w-2.5' : 'h-3 w-3';

  return (
    <span className={cn('relative inline-flex', sizeClasses, className)} title={presence.label}>
      {presence.pulse && (
        <span className={cn('animate-ping absolute inline-flex h-full w-full rounded-full opacity-75', presence.color)} />
      )}
      <span className={cn('relative inline-flex rounded-full', sizeClasses, presence.color)} />
    </span>
  );
};
