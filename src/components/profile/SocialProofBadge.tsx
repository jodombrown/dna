import React from 'react';
import { Users, Calendar, Eye } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SocialProofBadgeProps {
  type: 'mutual_connections' | 'event_attendees' | 'profile_views';
  count: number;
  className?: string;
}

export const SocialProofBadge: React.FC<SocialProofBadgeProps> = ({
  type,
  count,
  className,
}) => {
  if (count === 0) return null;

  const config = {
    mutual_connections: {
      icon: Users,
      label: count === 1 ? 'mutual connection' : 'mutual connections',
      color: 'text-dna-emerald',
    },
    event_attendees: {
      icon: Calendar,
      label: count === 1 ? 'person you know attending' : 'people you know attending',
      color: 'text-dna-copper',
    },
    profile_views: {
      icon: Eye,
      label: count === 1 ? 'view this month' : 'views this month',
      color: 'text-muted-foreground',
    },
  };

  const { icon: Icon, label, color } = config[type];

  return (
    <div className={cn("flex items-center gap-1.5 text-xs", color, className)}>
      <Icon className="h-3.5 w-3.5" />
      <span>
        <span className="font-medium">{count}</span> {label}
      </span>
    </div>
  );
};
