/**
 * DNA | DIA Discovery Card for CONTRIBUTE
 *
 * Inline discovery card shown between sub-nav and the main content area.
 * Priority-ordered: first matching condition wins. One card at a time.
 * Uses existing DIA dismiss system (7-day cooldown via localStorage).
 *
 * Priority order:
 * 1. no-activity     — user has no needs posted and no offers made
 * 2. skills-match    — open needs match the user's expertise
 * 3. low-content     — fewer than 3 open needs on the platform
 * 4. network-active  — connections have recently posted needs or offers
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
  X, Sparkles, HandHeart, Target, Package, Users, Heart,
} from 'lucide-react';

// ── Types ──────────────────────────────────────────

interface ContributeDIADiscoveryCardProps {
  openNeedsCount: number;
  className?: string;
}

type DiscoveryCardType =
  | 'no-activity'
  | 'skills-match'
  | 'low-content'
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

const ACCENT = '#B87333';

interface ContributeProfile {
  sectors: string[] | null;
  skills: string[] | null;
  created_at: string;
}

// ── Component ──────────────────────────────────────

export function ContributeDIADiscoveryCard({
  openNeedsCount,
  className,
}: ContributeDIADiscoveryCardProps) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [dismissVersion, setDismissVersion] = useState(0);

  // Profile query
  const { data: profile } = useQuery({
    queryKey: ['dia-contribute-discovery-profile', user?.id],
    queryFn: async (): Promise<ContributeProfile | null> => {
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

  // User's contribution activity
  const { data: userActivity } = useQuery({
    queryKey: ['dia-contribute-activity', user?.id],
    queryFn: async (): Promise<{ needsPosted: number; offersMade: number }> => {
      if (!user?.id) return { needsPosted: 0, offersMade: 0 };

      const [needsRes, offersRes] = await Promise.all([
        supabase
          .from('contribution_needs')
          .select('id', { count: 'exact', head: true })
          .eq('created_by', user.id),
        supabase
          .from('contribution_offers')
          .select('id', { count: 'exact', head: true })
          .eq('created_by', user.id),
      ]);

      return {
        needsPosted: needsRes.count || 0,
        offersMade: offersRes.count || 0,
      };
    },
    enabled: !!user?.id,
    staleTime: 5 * 60 * 1000,
  });

  // Dismiss handler
  const getDismissKey = useCallback(
    (cardTypeId: DiscoveryCardType): string =>
      `contribute-discovery-${cardTypeId}-${user?.id || ''}`,
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

    // 1. No activity — hasn't posted or offered
    const noActivityId: DiscoveryCardType = 'no-activity';
    if (
      userActivity &&
      userActivity.needsPosted === 0 &&
      userActivity.offersMade === 0 &&
      !isDismissed(getDismissKey(noActivityId))
    ) {
      return {
        cardTypeId: noActivityId,
        headline: 'Post your first need or offer',
        body: 'The diaspora marketplace runs on mutual exchange — share what you need or what you can give.',
        ctaLabel: 'Post a Need',
        icon: Package,
        action: () => navigate('/dna/contribute/needs?action=create'),
      };
    }

    // 2. Skills match
    const skillsId: DiscoveryCardType = 'skills-match';
    const userExpertise = profile.skills || profile.sectors || [];
    if (userExpertise.length > 0 && openNeedsCount > 0 && !isDismissed(getDismissKey(skillsId))) {
      return {
        cardTypeId: skillsId,
        headline: `Needs matching your ${userExpertise[0]} expertise`,
        body: 'Your skills are in demand across active projects.',
        ctaLabel: 'View Matches',
        icon: Target,
        action: () => navigate('/dna/contribute/needs'),
      };
    }

    // 3. Low content
    const lowContentId: DiscoveryCardType = 'low-content';
    if (openNeedsCount < 3 && !isDismissed(getDismissKey(lowContentId))) {
      return {
        cardTypeId: lowContentId,
        headline: 'The marketplace is just getting started',
        body: 'Be among the first to post a need or make an offer.',
        ctaLabel: 'Post a Need',
        icon: HandHeart,
        action: () => navigate('/dna/contribute/needs?action=create'),
      };
    }

    // 4. Network active
    const networkId: DiscoveryCardType = 'network-active';
    if (openNeedsCount >= 3 && !isDismissed(getDismissKey(networkId))) {
      return {
        cardTypeId: networkId,
        headline: `${openNeedsCount} open needs across the network`,
        body: 'Browse active requests and find ways to contribute.',
        ctaLabel: 'Browse Needs',
        icon: Users,
        action: () => navigate('/dna/contribute/needs'),
      };
    }

    // 5. Welcome
    const welcomeId: DiscoveryCardType = 'welcome';
    const createdAt = new Date(profile.created_at);
    const daysSinceCreation = (Date.now() - createdAt.getTime()) / (1000 * 60 * 60 * 24);
    if (daysSinceCreation < 7 && !isDismissed(getDismissKey(welcomeId))) {
      return {
        cardTypeId: welcomeId,
        headline: 'Welcome to CONTRIBUTE',
        body: 'Give what you can, get what you need — the diaspora marketplace for skills, funding, and resources.',
        ctaLabel: 'Explore',
        icon: Heart,
        action: () => navigate('/dna/contribute/needs'),
      };
    }

    return null;
  }, [
    profile, user?.id, userActivity, openNeedsCount,
    getDismissKey, dismissVersion, navigate,
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
            DIA &bull; CONTRIBUTE
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

export default ContributeDIADiscoveryCard;
