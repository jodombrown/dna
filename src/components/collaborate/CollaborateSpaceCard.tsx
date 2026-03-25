import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';

const SPACE_TYPE_COLORS: Record<string, string> = {
  startup: 'bg-[hsl(28,48%,45%)]',             // Copper
  community_project: 'bg-primary',              // Emerald
  mentorship_circle: 'bg-[hsl(153,43%,32%)]',  // Forest
  investment_syndicate: 'bg-[hsl(43,50%,54%)]', // Gold
  advocacy_campaign: 'bg-[hsl(16,52%,47%)]',    // Rust
  project: 'bg-primary',
  working_group: 'bg-[hsl(153,43%,32%)]',
  initiative: 'bg-primary',
  program: 'bg-[hsl(43,50%,54%)]',
};

const SPACE_TYPE_LABELS: Record<string, string> = {
  startup: 'Startup',
  community_project: 'Community',
  mentorship_circle: 'Mentorship',
  investment_syndicate: 'Investment',
  advocacy_campaign: 'Advocacy',
  project: 'Project',
  working_group: 'Working Group',
  initiative: 'Initiative',
  program: 'Program',
};

interface SpaceMemberPreview {
  id: string;
  avatar_url?: string;
  full_name?: string;
}

export interface CollaborateSpaceCardProps {
  id: string;
  slug: string;
  name: string;
  tagline?: string;
  space_type: string;
  region?: string;
  updated_at: string;
  focus_areas?: string[];
  members?: SpaceMemberPreview[];
  memberCount?: number;
  openRolesCount?: number;
  milestoneProgress?: { current: number; total: number };
  isMember?: boolean;
  matchPercent?: number;
  className?: string;
}

export function CollaborateSpaceCard({
  id,
  slug,
  name,
  tagline,
  space_type,
  region,
  updated_at,
  focus_areas,
  members = [],
  memberCount = 0,
  openRolesCount = 0,
  milestoneProgress,
  isMember = false,
  matchPercent,
  className,
}: CollaborateSpaceCardProps) {
  const navigate = useNavigate();

  const typeColor = SPACE_TYPE_COLORS[space_type] || 'bg-primary';
  const typeLabel = SPACE_TYPE_LABELS[space_type] || space_type?.replace('_', ' ');

  const daysSinceUpdate = Math.floor(
    (Date.now() - new Date(updated_at).getTime()) / (1000 * 60 * 60 * 24)
  );
  const isQuiet = daysSinceUpdate > 7;

  const displayMembers = members.slice(0, 3);
  const overflowCount = memberCount - displayMembers.length;

  return (
    <button
      onClick={() => navigate(`/dna/collaborate/spaces/${slug}`)}
      className={cn(
        'relative flex flex-col bg-card border border-border rounded-dna-lg overflow-hidden',
        'hover:shadow-dna-2 hover:border-primary/30 transition-all text-left group',
        className
      )}
    >
      {/* 4px type color bar */}
      <div className={cn('h-1 w-full', typeColor)} />

      {/* Card body */}
      <div className="p-4 flex-1 flex flex-col gap-2.5">
        {/* Match badge */}
        {matchPercent !== undefined && matchPercent > 0 && (
          <Badge
            variant="secondary"
            className="self-start text-xs bg-primary/10 text-primary border-0"
          >
            {matchPercent}% match
          </Badge>
        )}

        {/* Name */}
        <h3 className="font-semibold text-foreground line-clamp-2 text-[15px] leading-snug">
          {name}
        </h3>

        {/* Type + Region */}
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span className="capitalize">{typeLabel}</span>
          {region && (
            <>
              <span className="text-border">·</span>
              <span>{region}</span>
            </>
          )}
        </div>

        {/* Progress bar */}
        {milestoneProgress && milestoneProgress.total > 0 && (
          <div className="space-y-1">
            <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-primary rounded-full transition-all"
                style={{
                  width: `${Math.min(100, (milestoneProgress.current / milestoneProgress.total) * 100)}%`,
                }}
              />
            </div>
            <p className="text-xs text-muted-foreground">
              Milestone {milestoneProgress.current} of {milestoneProgress.total}
            </p>
          </div>
        )}

        {/* Avatar stack + activity */}
        <div className="flex items-center justify-between mt-auto pt-1">
          <div className="flex items-center">
            {displayMembers.map((member, i) => (
              <Avatar
                key={member.id}
                className={cn('w-6 h-6 border-2 border-card', i > 0 && '-ml-1.5')}
              >
                <AvatarImage src={member.avatar_url || ''} />
                <AvatarFallback className="text-[10px]">
                  {member.full_name?.[0] || '?'}
                </AvatarFallback>
              </Avatar>
            ))}
            {overflowCount > 0 && (
              <span className="ml-1.5 text-xs text-muted-foreground font-medium">
                +{overflowCount}
              </span>
            )}
          </div>
          <span
            className={cn(
              'text-xs',
              isQuiet ? 'text-[hsl(36,80%,50%)]' : 'text-muted-foreground'
            )}
          >
            {isQuiet
              ? `Quiet for ${daysSinceUpdate}d`
              : `Active ${formatDistanceToNow(new Date(updated_at), { addSuffix: false })} ago`}
          </span>
        </div>
      </div>

      {/* Card footer */}
      <div className="px-4 py-3 border-t border-border flex items-center justify-between">
        {openRolesCount > 0 ? (
          <span className="text-xs font-medium text-[hsl(28,48%,45%)] bg-[hsl(28,48%,45%)]/10 px-2 py-1 rounded-full">
            🧩 {openRolesCount} Open Role{openRolesCount !== 1 ? 's' : ''}
          </span>
        ) : (
          <span />
        )}
        <Button
          size="sm"
          variant={isMember ? 'outline' : 'default'}
          className={cn(
            'text-xs h-8 min-h-[32px]',
            !isMember && 'bg-primary text-primary-foreground hover:bg-primary/90'
          )}
          onClick={(e) => {
            e.stopPropagation();
            navigate(`/dna/collaborate/spaces/${slug}`);
          }}
        >
          {isMember ? 'View →' : 'Join →'}
        </Button>
      </div>
    </button>
  );
}
