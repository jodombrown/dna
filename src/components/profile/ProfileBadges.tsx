/**
 * DNA | Profile Badges — Sprint 13C
 *
 * Displays earned and locked badges on user profiles.
 * Users can feature up to 3 badges prominently.
 */

import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Star, Lock } from 'lucide-react';
import {
  getUserBadges,
  getAllBadgeDefinitions,
  toggleBadgeFeatured,
  type UserBadge,
  type BadgeDefinition,
} from '@/services/badge-service';
import { cn } from '@/lib/utils';

interface ProfileBadgesProps {
  userId: string;
  isOwner: boolean;
  isPro?: boolean;
}

function isNewBadge(earnedAt: string): boolean {
  const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
  return new Date(earnedAt).getTime() > sevenDaysAgo;
}

const ProfileBadges: React.FC<ProfileBadgesProps> = ({
  userId,
  isOwner,
  isPro = false,
}) => {
  const queryClient = useQueryClient();
  const maxDisplay = isPro ? 5 : 3;

  const { data: userBadges = [] } = useQuery({
    queryKey: ['user-badges', userId],
    queryFn: () => getUserBadges(userId),
    enabled: !!userId,
    staleTime: 60_000,
  });

  const { data: allDefinitions = [] } = useQuery({
    queryKey: ['badge-definitions'],
    queryFn: getAllBadgeDefinitions,
    staleTime: 5 * 60_000,
    enabled: isOwner,
  });

  const toggleFeaturedMutation = useMutation({
    mutationFn: ({ badgeId, featured }: { badgeId: string; featured: boolean }) =>
      toggleBadgeFeatured(userId, badgeId, featured),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-badges', userId] });
    },
  });

  const earnedSlugs = new Set(userBadges.map(b => (b.badge as any)?.slug ?? ''));
  const featuredBadges = userBadges.filter(b => b.is_featured);
  const regularBadges = userBadges.filter(b => !b.is_featured);

  // For owner view: show unearned badges as locked
  const unearnedDefs = isOwner
    ? allDefinitions.filter(d => !earnedSlugs.has(d.slug))
    : [];

  if (userBadges.length === 0 && !isOwner) return null;

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          Achievements
          {userBadges.length > 0 && (
            <span className="text-xs text-muted-foreground font-normal">
              {userBadges.length} earned
            </span>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* Featured badges */}
        {featuredBadges.length > 0 && (
          <div className="flex flex-wrap gap-3 mb-4">
            {featuredBadges.map((badge) => (
              <BadgeItem
                key={badge.id}
                badge={badge}
                isOwner={isOwner}
                isNew={isNewBadge(badge.earned_at)}
                onToggleFeatured={() =>
                  toggleFeaturedMutation.mutate({ badgeId: badge.id, featured: false })
                }
              />
            ))}
          </div>
        )}

        {/* Regular earned badges */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {regularBadges.slice(0, maxDisplay).map((badge) => (
            <BadgeItem
              key={badge.id}
              badge={badge}
              isOwner={isOwner}
              isNew={isNewBadge(badge.earned_at)}
              onToggleFeatured={() =>
                toggleFeaturedMutation.mutate({ badgeId: badge.id, featured: true })
              }
            />
          ))}

          {/* Locked badges (owner only) */}
          {isOwner && unearnedDefs.slice(0, 3).map((def) => (
            <LockedBadgeItem key={def.id} definition={def} />
          ))}
        </div>

        {!isPro && userBadges.length > maxDisplay && (
          <p className="text-xs text-muted-foreground mt-3 text-center">
            Upgrade to Pro to display more badges
          </p>
        )}
      </CardContent>
    </Card>
  );
};

// ============================================================
// Sub-components
// ============================================================

function BadgeItem({
  badge,
  isOwner,
  isNew,
  onToggleFeatured,
}: {
  badge: UserBadge;
  isOwner: boolean;
  isNew: boolean;
  onToggleFeatured: () => void;
}) {
  const def = badge.badge as BadgeDefinition | undefined;
  if (!def) return null;

  return (
    <div
      className={cn(
        'relative flex flex-col items-center gap-1 p-2 rounded-lg border bg-card text-center',
        isNew && 'ring-2 ring-[#4A8D77]/50 animate-pulse',
        badge.is_featured && 'border-[#4A8D77] bg-[#4A8D77]/5'
      )}
    >
      <span className="text-2xl" role="img" aria-label={def.name}>
        {def.icon}
      </span>
      <span className="text-xs font-medium leading-tight">{def.name}</span>
      <span className="text-[10px] text-muted-foreground leading-tight">
        {def.description}
      </span>
      {isOwner && (
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={onToggleFeatured}
          className="absolute top-0.5 right-0.5 h-5 w-5 p-0"
          title={badge.is_featured ? 'Remove from featured' : 'Feature this badge'}
        >
          <Star
            className={cn(
              'w-3 h-3',
              badge.is_featured ? 'fill-[#4A8D77] text-[#4A8D77]' : 'text-muted-foreground'
            )}
          />
        </Button>
      )}
    </div>
  );
}

function LockedBadgeItem({ definition }: { definition: BadgeDefinition }) {
  return (
    <div className="flex flex-col items-center gap-1 p-2 rounded-lg border border-dashed bg-muted/30 text-center opacity-50">
      <div className="relative">
        <span className="text-2xl grayscale" role="img" aria-label={definition.name}>
          {definition.icon}
        </span>
        <Lock className="w-3 h-3 absolute -bottom-0.5 -right-0.5 text-muted-foreground" />
      </div>
      <span className="text-xs font-medium leading-tight text-muted-foreground">
        {definition.name}
      </span>
      <span className="text-[10px] text-muted-foreground leading-tight">
        {definition.description}
      </span>
    </div>
  );
}

export default ProfileBadges;
