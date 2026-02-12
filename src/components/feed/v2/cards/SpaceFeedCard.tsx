/**
 * DNA | FEED v2 - Space Card
 *
 * Renders spaces/projects with type badge, role tags with skill matching,
 * member preview, and join CTA.
 */

import React from 'react';
import { FeedCardShell } from './FeedCardShell';
import { EngagementBar } from '../EngagementBar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Users, Lock, Globe, Briefcase } from 'lucide-react';
import type { FeedItem, SpaceFeedContent } from '@/types/feedTypes';

interface SpaceFeedCardProps {
  item: FeedItem;
  onEngagementToggle: (feedItemId: string, action: string) => void;
  onNavigate?: (contentId: string) => void;
}

const SPACE_TYPE_LABELS: Record<string, string> = {
  project: 'Project',
  working_group: 'Working Group',
  community: 'Community',
  campaign: 'Campaign',
};

export const SpaceFeedCard: React.FC<SpaceFeedCardProps> = ({
  item,
  onEngagementToggle,
  onNavigate,
}) => {
  const content = item.content as SpaceFeedContent;
  const typeLabel = SPACE_TYPE_LABELS[content.spaceType] || 'Space';

  return (
    <FeedCardShell
      contentType="space"
      primaryC={item.primaryC}
      author={item.createdBy}
      createdAt={item.createdAt}
      onClick={() => onNavigate?.(item.contentId)}
    >
      {/* Type badge and title */}
      <div className="mb-2">
        <div className="flex items-center gap-2 mb-1">
          <Badge variant="outline" className="text-[10px] border-[#2D5A3D] text-[#2D5A3D]">
            <Briefcase className="w-3 h-3 mr-0.5" />
            {typeLabel}
          </Badge>
          {content.visibility === 'invite_only' && (
            <Lock className="w-3.5 h-3.5 text-muted-foreground" />
          )}
          {content.visibility === 'open' && (
            <Globe className="w-3.5 h-3.5 text-muted-foreground" />
          )}
        </div>
        <h3 className="text-base font-semibold leading-tight line-clamp-2">
          {content.name}
        </h3>
      </div>

      {/* Description */}
      <p className="text-sm text-muted-foreground leading-relaxed mb-3 line-clamp-3">
        {content.description}
      </p>

      {/* Progress bar (for projects/campaigns) */}
      {content.progressPercentage !== null && (
        <div className="mb-3">
          <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
            <span>Progress</span>
            <span>{content.progressPercentage}%</span>
          </div>
          <div className="h-1.5 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-[#2D5A3D] rounded-full transition-all"
              style={{ width: `${content.progressPercentage}%` }}
            />
          </div>
        </div>
      )}

      {/* Roles needed */}
      {content.rolesNeeded.length > 0 && (
        <div className="mb-3">
          <p className="text-xs font-medium text-muted-foreground mb-1.5">Roles needed:</p>
          <div className="flex flex-wrap gap-1.5">
            {content.rolesNeeded.filter((r) => !r.filled).map((role) => (
              <Badge
                key={role.title}
                variant={role.matchesMySkills ? 'default' : 'outline'}
                className={
                  role.matchesMySkills
                    ? 'text-[10px] bg-[#2D5A3D] hover:bg-[#2D5A3D]/90'
                    : 'text-[10px]'
                }
              >
                {role.title}
                {role.matchesMySkills && ' (Match)'}
              </Badge>
            ))}
          </div>
        </div>
      )}

      {/* Member row */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          {content.memberPreview.length > 0 && (
            <div className="flex -space-x-2">
              {content.memberPreview.slice(0, 3).map((m) => (
                <Avatar key={m.id} className="h-6 w-6 border-2 border-background">
                  <AvatarImage src={m.avatarUrl || undefined} />
                  <AvatarFallback className="text-[8px]">{m.displayName[0]}</AvatarFallback>
                </Avatar>
              ))}
            </div>
          )}
          <span className="text-xs text-muted-foreground flex items-center gap-1">
            <Users className="w-3.5 h-3.5" />
            {content.memberCount} member{content.memberCount !== 1 ? 's' : ''}
            {content.connectionMemberCount > 0 &&
              ` · ${content.connectionMemberCount} connection${content.connectionMemberCount !== 1 ? 's' : ''}`}
          </span>
        </div>
      </div>

      {/* Recent activity */}
      {content.recentActivity && (
        <p className="text-xs text-dna-emerald font-medium mb-3">{content.recentActivity}</p>
      )}

      {/* Join CTA */}
      <div className="mb-3">
        <Button
          size="sm"
          className="h-9 text-xs w-full bg-[#2D5A3D] hover:bg-[#2D5A3D]/90"
          onClick={(e) => {
            e.stopPropagation();
            onEngagementToggle(item.id, 'join');
          }}
        >
          {content.isMember
            ? 'View Space'
            : content.membershipStatus === 'pending'
              ? 'Request Pending'
              : content.visibility === 'open'
                ? 'Join Space'
                : 'Request to Join'}
        </Button>
      </div>

      <EngagementBar
        contentType="space"
        engagement={item.engagement}
        feedItemId={item.id}
        onToggle={onEngagementToggle}
      />
    </FeedCardShell>
  );
};
