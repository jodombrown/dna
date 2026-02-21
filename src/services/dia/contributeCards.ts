/**
 * DNA | DIA CONTRIBUTE Card Generators
 *
 * Generates intelligence cards for the Contribute module:
 * - Opportunity Match
 * - Your Listing Activity
 * - Contribution Pattern
 * - Unmet Need in Network
 *
 * Uses contribution_needs and contribution_offers tables.
 */

import { supabase } from '@/integrations/supabase/client';
import type { DIACard } from '@/services/diaCardService';
const ACCENT = '#B87333';

// ── Card Type 1: Opportunity Match ─────────────────

async function generateOpportunityMatch(userId: string): Promise<DIACard | null> {
  try {
    const { data: profile } = await supabase
      .from('profiles')
      .select('skills, interests')
      .eq('id', userId)
      .single();

    if (!profile) return null;

    const userSkills: string[] = [
      ...((profile.skills as string[]) || []),
      ...((profile.interests as string[]) || []),
    ];
    if (userSkills.length === 0) return null;

    // Find open contribution needs
    const { data: opportunities } = await supabase
      .from('contribution_needs')
      .select('id, title, description, focus_areas, created_by')
      .eq('status', 'open')
      .neq('created_by', userId)
      .order('created_at', { ascending: false })
      .limit(20);

    if (!opportunities || opportunities.length === 0) return null;

    let bestOpp: typeof opportunities[0] | null = null;
    let bestScore = 0;
    let matchedSkills: string[] = [];

    for (const opp of opportunities) {
      const focusAreas: string[] = (opp.focus_areas as string[]) || [];
      const descLower = (opp.description || '').toLowerCase();

      let score = 0;
      const matched: string[] = [];
      for (const skill of userSkills) {
        const sLower = skill.toLowerCase();
        if (focusAreas.some(f => f.toLowerCase().includes(sLower))) {
          score += 3;
          matched.push(skill);
        } else if (descLower.includes(sLower)) {
          score += 1;
          matched.push(skill);
        }
      }

      if (score > bestScore) {
        bestScore = score;
        bestOpp = opp;
        matchedSkills = [...new Set(matched)];
      }
    }

    if (!bestOpp || bestScore === 0) return null;

    const matchPercent = Math.min(95, Math.round((bestScore / (userSkills.length * 3)) * 100));

    const { data: poster } = await supabase
      .from('profiles')
      .select('full_name')
      .eq('id', bestOpp.created_by)
      .single();

    return {
      id: `contribute-match-${bestOpp.id}`,
      category: 'contribute',
      cardType: 'opportunity_match',
      headline: `${matchPercent}% match: ${bestOpp.title}`,
      body: `${poster?.full_name || 'Someone'} posted a need that matches your expertise in ${matchedSkills.slice(0, 2).join(' and ')}.`,
      accentColor: ACCENT,
      icon: 'Target',
      priority: 70,
      actions: [
        {
          label: 'View Opportunity',
          type: 'navigate' as const,
          payload: { url: `/dna/contribute/opportunities/${bestOpp.id}` },
          isPrimary: true,
        },
        {
          label: 'Not interested',
          type: 'dismiss' as const,
          payload: {},
          isPrimary: false,
        },
      ],
      metadata: {
        opportunityId: bestOpp.id,
        opportunityTitle: bestOpp.title,
        matchPercent,
        matchedSkills,
        posterName: poster?.full_name,
      },
      dismissKey: `opp-match-${bestOpp.id}`,
    };
  } catch {
    return null;
  }
}

// ── Card Type 2: Your Listing Activity ─────────────

async function generateListingActivity(userId: string): Promise<DIACard | null> {
  try {
    const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

    const { data: myNeeds } = await supabase
      .from('contribution_needs')
      .select('id, title, created_at')
      .eq('created_by', userId)
      .eq('status', 'open')
      .order('created_at', { ascending: false })
      .limit(5);

    if (!myNeeds || myNeeds.length === 0) return null;

    const need = myNeeds[0];

    const { count: responseCount } = await supabase
      .from('contribution_offers')
      .select('*', { count: 'exact', head: true })
      .eq('need_id', need.id)
      .gte('created_at', oneWeekAgo);

    const responses = responseCount || 0;
    if (responses === 0) return null;

    return {
      id: `contribute-listing-${need.id}`,
      category: 'contribute',
      cardType: 'listing_activity',
      headline: `${responses} new response${responses > 1 ? 's' : ''} to your listing`,
      body: `Your opportunity "${need.title}" has new interest this week. Review the responses.`,
      accentColor: ACCENT,
      icon: 'Activity',
      priority: 55,
      actions: [
        {
          label: 'View Responses',
          type: 'navigate' as const,
          payload: { url: `/dna/contribute/opportunities/${need.id}` },
          isPrimary: true,
        },
      ],
      metadata: {
        needId: need.id,
        needTitle: need.title,
        responseCount: responses,
      },
      dismissKey: `listing-${need.id}-${new Date().toISOString().split('T')[0]}`,
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    };
  } catch {
    return null;
  }
}

// ── Card Type 3: Contribution Pattern ──────────────

async function generateContributionPattern(userId: string): Promise<DIACard | null> {
  try {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();

    const { count: contributionCount } = await supabase
      .from('contribution_offers')
      .select('*', { count: 'exact', head: true })
      .eq('created_by', userId)
      .gte('created_at', thirtyDaysAgo);

    const contributions = contributionCount || 0;
    if (contributions < 2) return null;

    return {
      id: `contribute-pattern-${userId}`,
      category: 'contribute',
      cardType: 'contribution_pattern',
      headline: `You've contributed ${contributions} times this month`,
      body: 'Your generosity strengthens the diaspora. The community thanks you for showing up.',
      accentColor: ACCENT,
      icon: 'Heart',
      priority: 30,
      actions: [
        {
          label: 'View My Contributions',
          type: 'navigate' as const,
          payload: { url: '/dna/contribute/my' },
          isPrimary: true,
        },
      ],
      metadata: { contributionCount: contributions },
      dismissKey: `pattern-${new Date().toISOString().slice(0, 7)}`,
    };
  } catch {
    return null;
  }
}

// ── Card Type 4: Unmet Need in Network ─────────────

async function generateUnmetNeed(userId: string): Promise<DIACard | null> {
  try {
    const { data: profile } = await supabase
      .from('profiles')
      .select('skills')
      .eq('id', userId)
      .single();

    if (!profile) return null;

    const userSkills: string[] = (profile.skills as string[]) || [];
    if (userSkills.length === 0) return null;

    const { data: connections } = await supabase
      .from('connections')
      .select('requester_id, recipient_id')
      .or(`requester_id.eq.${userId},recipient_id.eq.${userId}`)
      .eq('status', 'accepted')
      .limit(100);

    if (!connections || connections.length === 0) return null;

    const connectionIds = connections.map(c =>
      c.requester_id === userId ? c.recipient_id : c.requester_id
    );

    const { data: connectionNeeds } = await supabase
      .from('contribution_needs')
      .select('id, title, description, focus_areas, created_by')
      .in('created_by', connectionIds)
      .eq('status', 'open')
      .order('created_at', { ascending: false })
      .limit(10);

    if (!connectionNeeds || connectionNeeds.length === 0) return null;

    for (const need of connectionNeeds) {
      const focusAreas: string[] = (need.focus_areas as string[]) || [];
      const descLower = (need.description || '').toLowerCase();
      const matchingSkill = userSkills.find(
        s => focusAreas.some(f => f.toLowerCase().includes(s.toLowerCase())) ||
          descLower.includes(s.toLowerCase())
      );

      if (!matchingSkill) continue;

      const { data: poster } = await supabase
        .from('profiles')
        .select('full_name')
        .eq('id', need.created_by)
        .single();

      return {
        id: `contribute-unmet-${need.id}`,
        category: 'contribute',
        cardType: 'unmet_need',
        headline: `${poster?.full_name || 'A connection'} needs your help`,
        body: `They posted a need that matches your ${matchingSkill} skills. You could make a difference.`,
        accentColor: ACCENT,
        icon: 'Handshake',
        priority: 65,
        actions: [
          {
            label: 'See How You Can Help',
            type: 'navigate' as const,
            payload: { url: `/dna/contribute/opportunities/${need.id}` },
            isPrimary: true,
          },
          {
            label: 'Not now',
            type: 'dismiss' as const,
            payload: {},
            isPrimary: false,
          },
        ],
        metadata: {
          needId: need.id,
          needTitle: need.title,
          posterName: poster?.full_name,
          matchingSkill,
        },
        dismissKey: `unmet-${need.id}`,
      };
    }

    return null;
  } catch {
    return null;
  }
}

// ── Export ──────────────────────────────────────────

export function generateContributeCards(): Array<(userId: string) => Promise<DIACard | null>> {
  return [
    generateOpportunityMatch,
    generateListingActivity,
    generateContributionPattern,
    generateUnmetNeed,
  ];
}
