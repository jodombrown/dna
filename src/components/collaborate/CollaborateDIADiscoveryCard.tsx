/**
 * DNA | DIA Discovery Card for COLLABORATE
 *
 * Inline discovery card shown between sub-nav and the main content area.
 * Priority-ordered: first matching condition wins. One card at a time.
 * Uses existing DIA dismiss system (7-day cooldown via localStorage).
 *
 * Priority order:
 * 1. no-spaces       — user hasn't joined any spaces
 * 2. stalled-space   — user owns a space with no activity in 7+ days
 * 3. skills-match    — spaces match the user's skills/sectors
 * 4. network-active  — connections recently joined spaces
 * 5. welcome         — account created < 7 days ago
 */

import React, { useState, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { isDismissed, dismissDIACard } from '@/services/diaCardService';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  X, Sparkles, Users, Target, Layers, AlertTriangle, Heart,
} from 'lucide-react';

// ── Types ──────────────────────────────────────────

interface CollaborateDIADiscoveryCardProps {
  spaceCount: number;
  onCreateSpace: () => void;
  className?: string;
}

type DiscoveryCardType =
  | 'no-spaces'
  | 'stalled-space'
  | 'skills-match'
  | 'network-active'
  | 'welcome';

interface DiscoveryCardContent {
  cardTypeId: DiscoveryCardType;
  headline: string;
  body: string;
  ctaLabel: string;
  icon: React.FC<{ className?: string; style?: React.CSSProperties }>;
  action: () => void;
}

const ACCENT = '#2D5A3D';

interface CollaborateProfile {
  sectors: string[] | null;
  skills: string[] | null;
  created_at: string;
}

// ── Component ──────────────────────────────────────

export function CollaborateDIADiscoveryCard({
  spaceCount,
  onCreateSpace,
  className,
}: CollaborateDIADiscoveryCardProps) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [dismissVersion, setDismissVersion] = useState(0);

  // Profile query
  const { data: profile } = useQuery({
    queryKey: ['dia-collab-discovery-profile', user?.id],
    queryFn: async (): Promise<CollaborateProfile | null> => {
      if (!user?.id) return null;
      const { data, error } = await supabase
        .from('profiles')
        .select('sectors, skills, created_at')
        .eq('id', user.id)
        .single();
      if (error || !data) return null;
      return {
        sectors: data.sectors as string[] | null,
        skills: data.skills as string[] | null,
        created_at: data.created_at as string,
      };
    },
    enabled: !!user?.id,
    staleTime: 5 * 60 * 1000,
  });

  // User's membership count
  const { data: membershipCount = 0 } = useQuery({
    queryKey: ['dia-collab-memberships', user?.id],
    queryFn: async (): Promise<number> => {
      if (!user?.id) return 0;
      const { count } = await supabase
        .from('space_members')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', user.id);
      return count || 0;
    },
    enabled: !!user?.id,
    staleTime: 5 * 60 * 1000,
  });

  // Check for stalled spaces owned by user
  const { data: stalledSpaceCount = 0 } = useQuery({
    queryKey: ['dia-collab-stalled', user?.id],
    queryFn: async (): Promise<number> => {
      if (!user?.id) return 0;
      const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
      const { count } = await supabase
        .from('spaces')
        .select('id', { count: 'exact', head: true })
        .eq('created_by', user.id)
        .eq('status', 'active')
        .lt('updated_at', sevenDaysAgo);
      return count || 0;
    },
    enabled: !!user?.id,
    staleTime: 5 * 60 * 1000,
  });

  // Dismiss handler
  const getDismissKey = useCallback(
    (cardTypeId: DiscoveryCardType): string =>
      `collaborate-discovery-${cardTypeId}-${user?.id || ''}`,
    [user?.id]
  );

  const handleDismiss = useCallback(
    (cardTypeId: DiscoveryCardType) => {
      dismissDIACard(getDismissKey(cardTypeId));
      setDismissVersion((v) => v + 1);
    },
    [getDismissKey]
  );

  // Card selection (priority order)
  const cardContent = useMemo((): DiscoveryCardContent | null => {
    if (!profile || !user?.id) return null;
    void dismissVersion;

    // 1. No spaces joined
    const noSpacesId: DiscoveryCardType = 'no-spaces';
    if (membershipCount === 0 && !isDismissed(getDismissKey(noSpacesId))) {
      return {
        cardTypeId: noSpacesId,
        headline: 'Join your first collaboration space',
        body: 'Spaces bring the diaspora together on projects, initiatives, and working groups.',
        ctaLabel: 'Browse Spaces',
        icon: Layers,
        action: () => {
          const grid = document.getElementById('collaborate-space-grid');
          if (grid) grid.scrollIntoView({ behavior: 'smooth' });
        },
      };
    }

    // 2. Stalled space
    const stalledId: DiscoveryCardType = 'stalled-space';
    if (stalledSpaceCount > 0 && !isDismissed(getDismissKey(stalledId))) {
      return {
        cardTypeId: stalledId,
        headline: `${stalledSpaceCount} ${stalledSpaceCount === 1 ? 'space has' : 'spaces have'} been idle for 7+ days`,
        body: 'Reactivate your space with a quick update or new task.',
        ctaLabel: 'View My Spaces',
        icon: AlertTriangle,
        action: () => navigate('/dna/collaborate'),
      };
    }

    // 3. Skills match
    const skillsId: DiscoveryCardType = 'skills-match';
    const userSkills = profile.skills || profile.sectors || [];
    if (userSkills.length > 0 && spaceCount > 0 && !isDismissed(getDismissKey(skillsId))) {
      return {
        cardTypeId: skillsId,
        headline: `Spaces looking for ${userSkills[0]} expertise`,
        body: 'Your skills match active collaboration spaces.',
        ctaLabel: 'Find Matches',
        icon: Target,
        action: () => {
          const grid = document.getElementById('collaborate-space-grid');
          if (grid) grid.scrollIntoView({ behavior: 'smooth' });
        },
      };
    }

    // 4. Network active
    const networkId: DiscoveryCardType = 'network-active';
    if (spaceCount >= 3 && !isDismissed(getDismissKey(networkId))) {
      return {
        cardTypeId: networkId,
        headline: 'Collaboration is growing across the network',
        body: `${spaceCount} active spaces — join one or start your own.`,
        ctaLabel: 'Explore Spaces',
        icon: Users,
        action: () => {
          const grid = document.getElementById('collaborate-space-grid');
          if (grid) grid.scrollIntoView({ behavior: 'smooth' });
        },
      };
    }

    // 5. Welcome
    const welcomeId: DiscoveryCardType = 'welcome';
    const createdAt = new Date(profile.created_at);
    const daysSinceCreation = (Date.now() - createdAt.getTime()) / (1000 * 60 * 60 * 24);
    if (daysSinceCreation < 7 && !isDismissed(getDismissKey(welcomeId))) {
      return {
        cardTypeId: welcomeId,
        headline: 'Welcome to COLLABORATE',
        body: 'Create or join spaces to work together on projects that move Africa forward.',
        ctaLabel: 'Get Started',
        icon: Heart,
        action: onCreateSpace,
      };
    }

    return null;
  }, [
    profile, user?.id, membershipCount, stalledSpaceCount, spaceCount,
    getDismissKey, dismissVersion, navigate, onCreateSpace,
  ]);

  if (!cardContent) return null;

  const CardIcon = cardContent.icon;

  return (
    <div className={cn('w-full', className)}>
      <div
        className="relative overflow-hidden rounded-xl border border-border/50 bg-card px-4 py-4"
        style={{
          borderLeftWidth: '3px',
          borderLeftColor: ACCENT,
          backgroundColor: `${ACCENT}08`,
        }}
      >
        <button
          onClick={() => handleDismiss(cardContent.cardTypeId)}
          className="absolute top-1 right-1 p-3 text-muted-foreground hover:text-foreground transition-colors rounded-md hover:bg-muted"
          aria-label="Dismiss"
          style={{ minWidth: 44, minHeight: 44 }}
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-2 mb-2 pr-12">
          <div
            className="flex items-center justify-center w-6 h-6 rounded-full"
            style={{ backgroundColor: `${ACCENT}20` }}
          >
            <Sparkles className="w-3 h-3" style={{ color: ACCENT }} />
          </div>
          <span
            className="text-[10px] font-bold tracking-widest"
            style={{ color: ACCENT }}
          >
            DIA &bull; COLLABORATE
          </span>
        </div>

        <div className="flex items-start gap-2 mb-1.5">
          <CardIcon className="w-4 h-4 mt-0.5 shrink-0" style={{ color: ACCENT }} />
          <h4 className="font-semibold text-sm text-foreground leading-tight">
            {cardContent.headline}
          </h4>
        </div>

        <p className="text-sm text-muted-foreground leading-relaxed ml-6">
          {cardContent.body}
        </p>

        <div className="flex items-center mt-3 ml-6">
          <Button
            size="sm"
            className="text-xs rounded-full px-4 text-white"
            style={{ backgroundColor: ACCENT, minHeight: 44 }}
            onClick={cardContent.action}
          >
            {cardContent.ctaLabel}
          </Button>
        </div>
      </div>
    </div>
  );
}

export default CollaborateDIADiscoveryCard;
