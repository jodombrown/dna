/**
 * ProfileV2QuickStats - Compact Horizontal Stats Row
 * Replaces verbose DNA Activity with clickable stat badges
 * Mobile-first responsive design with icons
 */

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Users, BookOpen, Calendar, Layers } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface QuickStatProps {
  icon: React.ElementType;
  label: string;
  count: number;
  onClick: () => void;
  color?: string;
  tooltip?: string;
  interactive?: boolean;
}

const QuickStat: React.FC<QuickStatProps> = ({
  icon: Icon,
  label,
  count,
  onClick,
  color = 'text-primary',
  tooltip,
  interactive = true,
}) => {
  const inner = (
    <>
      <div className="flex items-center gap-1.5">
        <Icon className={cn("w-4 h-4", color, interactive && "group-hover:scale-110 transition-transform")} />
        <span className={cn(
          "text-lg sm:text-xl font-bold text-foreground",
          interactive && "group-hover:text-primary transition-colors"
        )}>
          {count}
        </span>
      </div>
      <span className="text-[10px] sm:text-xs text-muted-foreground truncate w-full text-center">
        {label}
      </span>
    </>
  );

  // Non-interactive tile: no tap target, no hover/cursor affordance, no
  // tooltip promising a destination this viewer cannot reach.
  if (!interactive) {
    return (
      <div
        aria-label={`${label}: ${count}`}
        className={cn(
          "flex flex-col items-center gap-1 p-2 sm:p-3 rounded-lg",
          "bg-secondary/50",
          "flex-1 min-w-0 min-h-[44px]"
        )}
      >
        {inner}
      </div>
    );
  }

  const content = (
    <button
      onClick={onClick}
      aria-label={`${label}: ${count}. ${tooltip ?? 'Open details'}`}
      className={cn(
        "flex flex-col items-center gap-1 p-2 sm:p-3 rounded-lg",
        "bg-secondary/50 hover:bg-secondary transition-colors",
        "flex-1 min-w-0 cursor-pointer group min-h-[44px]",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      )}
    >
      {inner}
    </button>
  );

  if (!tooltip) return content;

  return (
    <Tooltip>
      <TooltipTrigger asChild>{content}</TooltipTrigger>
      <TooltipContent side="bottom" className="max-w-[200px] text-center">
        <p className="text-xs">{tooltip}</p>
      </TooltipContent>
    </Tooltip>
  );
};

interface ProfileV2QuickStatsProps {
  activity: {
    connections_count?: number;
    stories_count?: number;
    events_count?: number;
    spaces?: { id: string; title: string; role: string }[];
    events?: { id: string; title: string; role: string; event_date: string }[];
  };
  username?: string;
  isOwner: boolean;
}

const ProfileV2QuickStats: React.FC<ProfileV2QuickStatsProps> = ({
  activity,
  username,
  isOwner,
}) => {
  const navigate = useNavigate();

  const stats = [
    {
      icon: Users,
      label: 'Connections',
      count: activity.connections_count || 0,
      // A visitor cannot view this member's network; only the owner deep-links
      // into their own. Non-owners get a plain count, no tap target.
      interactive: isOwner,
      onClick: () => navigate('/dna/connect/network?tab=connections'),
      color: 'text-blue-500',
      tooltip: isOwner ? "View this member's network" : undefined,
    },
    {
      icon: BookOpen,
      label: 'Posts',
      count: activity.stories_count || 0,
      interactive: true,
      onClick: () =>
        navigate(isOwner ? '/dna/convey' : `/dna/feed${username ? `?author=${username}` : ''}`),
      color: 'text-emerald-500',
      tooltip: 'View posts and stories',
    },
    {
      icon: Layers,
      label: 'Spaces',
      count: activity.spaces?.length || 0,
      interactive: true,
      onClick: () => navigate(isOwner ? '/dna/collaborate/my-spaces' : '/dna/collaborate'),
      color: 'text-copper-500',
      tooltip: 'View collaboration spaces',
    },
    {
      icon: Calendar,
      label: 'Events',
      count: activity.events_count ?? activity.events?.length ?? 0,
      interactive: true,
      onClick: () => navigate(isOwner ? '/dna/convene/my-events' : '/dna/convene'),
      color: 'text-amber-500',
      tooltip: 'View events',
    },
  ];

  return (
    <TooltipProvider>
      <Card className="overflow-hidden border-border/50">
        <CardContent className="p-3 sm:p-4">
          <div className="flex gap-2">
            {stats.map((stat) => (
              <QuickStat
                key={stat.label}
                icon={stat.icon}
                label={stat.label}
                count={stat.count}
                onClick={stat.onClick}
                color={stat.color}
                tooltip={stat.tooltip}
                interactive={stat.interactive}
              />
            ))}
          </div>
        </CardContent>
      </Card>
    </TooltipProvider>
  );
};

export default ProfileV2QuickStats;
