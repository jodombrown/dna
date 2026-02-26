/**
 * DNA | DIA CONNECT Card Generators
 *
 * Generates intelligence cards for the Connect module:
 * - Skill-Based Connection Suggestions
 * - Network Growth Milestone
 * - Connection Reactivation
 * - Mutual Connection Bridge
 */

import { supabase } from '@/integrations/supabase/client';
import type { DIACard } from '@/services/diaCardService';

const ACCENT = '#4A8D77';

// ── Card Type 1: Skill-Based Connection ────────────

async function generateSkillSuggestion(userId: string): Promise<DIACard | null> {
  try {
    const { data: profile } = await supabase
      .from('profiles')
      .select('skills, interests')
      .eq('id', userId)
      .single();

    if (!profile) return null;

    const userSkills: string[] = (profile.skills as string[]) || [];
    const userInterests: string[] = (profile.interests as string[]) || [];
    if (userSkills.length === 0 && userInterests.length === 0) return null;

    // Get existing connections to exclude
    const { data: connections } = await supabase
      .from('connections')
      .select('requester_id, recipient_id')
      .or(`requester_id.eq.${userId},recipient_id.eq.${userId}`)
      .eq('status', 'accepted');

    const connectedIds = new Set<string>();
    connectedIds.add(userId);
    for (const c of connections || []) {
      connectedIds.add(c.requester_id);
      connectedIds.add(c.recipient_id);
    }

    // Find users with overlapping skills who are NOT connected
    const { data: candidates } = await supabase
      .from('profiles')
      .select('id, username, full_name, headline, avatar_url, skills, interests')
      .not('id', 'in', `(${Array.from(connectedIds).join(',')})`)
      .limit(20);

    if (!candidates || candidates.length === 0) return null;

    // Score candidates by skill overlap
    let bestCandidate: typeof candidates[0] | null = null;
    let bestScore = 0;
    let sharedSkills: string[] = [];

    for (const candidate of candidates) {
      const candidateSkills: string[] = [
        ...((candidate.skills as string[]) || []),
        ...((candidate.interests as string[]) || []),
      ];
      let score = 0;
      const shared: string[] = [];

      for (const skill of [...userSkills, ...userInterests]) {
        if (candidateSkills.some(cs => cs.toLowerCase() === skill.toLowerCase())) {
          score += 1;
          shared.push(skill);
        }
      }

      if (score > bestScore) {
        bestScore = score;
        bestCandidate = candidate;
        sharedSkills = [...new Set(shared)];
      }
    }

    if (!bestCandidate || bestScore === 0) return null;

    return {
      id: `connect-skill-${bestCandidate.id}`,
      category: 'connect',
      cardType: 'skill_suggestion',
      headline: `You and ${bestCandidate.full_name || 'someone'} share ${sharedSkills.length} skill${sharedSkills.length > 1 ? 's' : ''}`,
      body: `${bestCandidate.headline || 'A fellow diaspora member'}. You both know ${sharedSkills.slice(0, 2).join(' and ')}. Worth connecting?`,
      accentColor: ACCENT,
      icon: 'UserPlus',
      priority: 60,
      actions: [
        {
          label: 'View Profile',
          type: 'navigate' as const,
          payload: { url: bestCandidate.username ? `/dna/${bestCandidate.username}` : `/dna/connect/discover` },
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
        suggestedUserId: bestCandidate.id,
        suggestedName: bestCandidate.full_name,
        sharedSkills,
      },
      dismissKey: `skill-${bestCandidate.id}`,
    };
  } catch {
    return null;
  }
}

// ── Card Type 2: Network Growth ────────────────────

async function generateNetworkGrowth(userId: string): Promise<DIACard | null> {
  try {
    const { count: totalConnections } = await supabase
      .from('connections')
      .select('*', { count: 'exact', head: true })
      .or(`requester_id.eq.${userId},recipient_id.eq.${userId}`)
      .eq('status', 'accepted');

    const total = totalConnections || 0;
    const milestones = [10, 25, 50, 100, 250, 500, 1000];
    const hitMilestone = milestones.find(m => total >= m && total < m + 5);

    if (!hitMilestone) return null;

    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
    const { count: recentCount } = await supabase
      .from('connections')
      .select('*', { count: 'exact', head: true })
      .or(`requester_id.eq.${userId},recipient_id.eq.${userId}`)
      .eq('status', 'accepted')
      .gte('created_at', thirtyDaysAgo);

    const recent = recentCount || 0;

    return {
      id: `connect-growth-${hitMilestone}`,
      category: 'connect',
      cardType: 'network_growth',
      headline: `${total} connections and growing`,
      body: `You've hit the ${hitMilestone} milestone${recent > 0 ? ` with ${recent} new connections this month` : ''}. Your diaspora network is expanding.`,
      accentColor: ACCENT,
      icon: 'TrendingUp',
      priority: 40,
      actions: [
        {
          label: 'Explore Network',
          type: 'navigate' as const,
          payload: { url: '/dna/connect' },
          isPrimary: true,
        },
      ],
      metadata: { total, hitMilestone, recentGrowth: recent },
      dismissKey: `growth-${hitMilestone}`,
    };
  } catch {
    return null;
  }
}

// ── Card Type 3: Connection Reactivation ───────────

async function generateConnectionReactivation(userId: string): Promise<DIACard | null> {
  try {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();

    // Get connections where last interaction was 30+ days ago
    const { data: connections } = await supabase
      .from('connections')
      .select('requester_id, recipient_id, created_at')
      .or(`requester_id.eq.${userId},recipient_id.eq.${userId}`)
      .eq('status', 'accepted')
      .lt('created_at', thirtyDaysAgo)
      .limit(10);

    if (!connections || connections.length === 0) return null;

    // Pick a random dormant connection
    const conn = connections[Math.floor(Math.random() * connections.length)];
    const otherUserId = conn.requester_id === userId ? conn.recipient_id : conn.requester_id;

      const { data: otherProfile } = await supabase
      .from('profiles')
      .select('full_name, avatar_url, headline, username')
      .eq('id', otherUserId)
      .single();

    if (!otherProfile) return null;

    return {
      id: `connect-reactivate-${otherUserId}`,
      category: 'connect',
      cardType: 'connection_reactivation',
      headline: `Reconnect with ${otherProfile.full_name || 'a connection'}`,
      body: `It's been a while since you connected with ${otherProfile.full_name || 'them'}. ${otherProfile.headline || 'Catch up on what they have been working on.'}`,
      accentColor: ACCENT,
      icon: 'RefreshCw',
      priority: 35,
      actions: [
        {
          label: 'Send Message',
          type: 'navigate' as const,
          payload: { url: `/dna/messages?to=${otherUserId}` },
          isPrimary: true,
        },
        {
          label: 'View Profile',
          type: 'navigate' as const,
          payload: { url: otherProfile.username ? `/dna/${otherProfile.username}` : `/dna/connect/discover` },
          isPrimary: false,
        },
      ],
      metadata: {
        connectedUserId: otherUserId,
        connectedName: otherProfile.full_name,
      },
      dismissKey: `reactivate-${otherUserId}`,
    };
  } catch {
    return null;
  }
}

// ── Card Type 4: Mutual Connection Bridge ──────────

async function generateMutualBridge(userId: string): Promise<DIACard | null> {
  try {
    // Get user's connections
    const { data: myConnections } = await supabase
      .from('connections')
      .select('requester_id, recipient_id')
      .or(`requester_id.eq.${userId},recipient_id.eq.${userId}`)
      .eq('status', 'accepted')
      .limit(50);

    if (!myConnections || myConnections.length < 2) return null;

    const myConnectionIds = myConnections.map(c =>
      c.requester_id === userId ? c.recipient_id : c.requester_id
    );

    // Pick two random connections and check if they're connected
    const shuffled = myConnectionIds.sort(() => Math.random() - 0.5);
    const personA = shuffled[0];
    const personB = shuffled[1];

    const { count } = await supabase
      .from('connections')
      .select('*', { count: 'exact', head: true })
      .or(
        `and(requester_id.eq.${personA},recipient_id.eq.${personB}),and(requester_id.eq.${personB},recipient_id.eq.${personA})`
      )
      .eq('status', 'accepted');

    // Only suggest if they're NOT yet connected
    if ((count || 0) > 0) return null;

    const { data: profiles } = await supabase
      .from('profiles')
      .select('id, full_name, headline, username')
      .in('id', [personA, personB]);

    if (!profiles || profiles.length < 2) return null;

    const profileA = profiles.find(p => p.id === personA);
    const profileB = profiles.find(p => p.id === personB);
    if (!profileA || !profileB) return null;

    return {
      id: `connect-bridge-${personA}-${personB}`,
      category: 'connect',
      cardType: 'mutual_bridge',
      headline: `Introduce ${profileA.full_name} and ${profileB.full_name}?`,
      body: `They're both in your network but don't know each other. A warm introduction could spark collaboration.`,
      accentColor: ACCENT,
      icon: 'GitBranch',
      priority: 50,
      actions: [
        {
          label: 'Make Introduction',
          type: 'custom' as const,
          payload: {
            action: 'open_introduction',
            personAId: personA,
            personBId: personB,
            personAName: profileA.full_name,
            personBName: profileB.full_name,
          },
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
        personAId: personA,
        personAName: profileA.full_name,
        personBId: personB,
        personBName: profileB.full_name,
      },
      dismissKey: `bridge-${personA}-${personB}`,
    };
  } catch {
    return null;
  }
}

// ── Export ──────────────────────────────────────────

export function generateConnectCards(): Array<(userId: string) => Promise<DIACard | null>> {
  return [
    generateSkillSuggestion,
    generateNetworkGrowth,
    generateConnectionReactivation,
    generateMutualBridge,
  ];
}
