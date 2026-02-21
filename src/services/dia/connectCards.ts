/**
 * DNA | DIA CONNECT Card Generators
 *
 * Generates intelligence cards for the Connect module:
 * - People You Should Know
 * - Network Growth Insight
 * - Connection Reactivation
 * - Mutual Connection Bridge
 */

import { supabase } from '@/integrations/supabase/client';
import type { DIACard, DIACardAction } from '@/services/diaCardService';
import { MODULE_ACCENT_COLORS } from '@/services/diaCardService';

const ACCENT = MODULE_ACCENT_COLORS.connect;

// ── Card Type 1: People You Should Know ─────────────

async function generatePeopleYouShouldKnow(userId: string): Promise<DIACard | null> {
  try {
    // Get user's skills and interests
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
      .select('user_id, connected_user_id')
      .or(`user_id.eq.${userId},connected_user_id.eq.${userId}`)
      .eq('status', 'accepted');

    const connectedIds = new Set<string>();
    connectedIds.add(userId);
    for (const c of connections || []) {
      connectedIds.add(c.user_id);
      connectedIds.add(c.connected_user_id);
    }

    // Find users with overlapping skills who are NOT connected
    const { data: candidates } = await supabase
      .from('profiles')
      .select('id, full_name, headline, avatar_url, skills, interests')
      .not('id', 'in', `(${Array.from(connectedIds).join(',')})`)
      .limit(20);

    if (!candidates || candidates.length === 0) return null;

    // Score candidates by skill/interest overlap
    let bestCandidate: typeof candidates[0] | null = null;
    let bestScore = 0;
    let sharedSkills: string[] = [];

    for (const candidate of candidates) {
      const cSkills: string[] = (candidate.skills as string[]) || [];
      const cInterests: string[] = (candidate.interests as string[]) || [];
      const overlap = [
        ...userSkills.filter(s => cSkills.includes(s)),
        ...userInterests.filter(i => cInterests.includes(i)),
      ];
      if (overlap.length > bestScore) {
        bestScore = overlap.length;
        bestCandidate = candidate;
        sharedSkills = overlap;
      }
    }

    if (!bestCandidate || bestScore === 0) return null;

    const actions: DIACardAction[] = [
      {
        label: 'View Profile',
        type: 'navigate',
        payload: { url: `/dna/profile/${bestCandidate.id}` },
        isPrimary: true,
      },
      {
        label: 'Not now',
        type: 'dismiss',
        payload: {},
        isPrimary: false,
      },
    ];

    return {
      id: `connect-pysk-${bestCandidate.id}`,
      category: 'connect',
      cardType: 'people_you_should_know',
      headline: `You should know ${bestCandidate.full_name || 'someone new'}`,
      body: `You both share expertise in ${sharedSkills.slice(0, 3).join(', ')}. ${bestCandidate.headline || 'A member of the diaspora community.'}`,
      accentColor: ACCENT,
      icon: 'UserPlus',
      priority: 75,
      actions,
      metadata: {
        candidateId: bestCandidate.id,
        candidateName: bestCandidate.full_name,
        candidateAvatar: bestCandidate.avatar_url,
        sharedSkills,
      },
      dismissKey: `pysk-${bestCandidate.id}`,
    };
  } catch {
    return null;
  }
}

// ── Card Type 2: Network Growth Insight ────────────

async function generateNetworkGrowthInsight(userId: string): Promise<DIACard | null> {
  try {
    const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
    const twoWeeksAgo = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString();

    // Count connections this week vs last week
    const { count: thisWeek } = await supabase
      .from('connections')
      .select('*', { count: 'exact', head: true })
      .or(`user_id.eq.${userId},connected_user_id.eq.${userId}`)
      .eq('status', 'accepted')
      .gte('created_at', oneWeekAgo);

    const { count: lastWeek } = await supabase
      .from('connections')
      .select('*', { count: 'exact', head: true })
      .or(`user_id.eq.${userId},connected_user_id.eq.${userId}`)
      .eq('status', 'accepted')
      .gte('created_at', twoWeeksAgo)
      .lt('created_at', oneWeekAgo);

    const thisWeekCount = thisWeek || 0;
    const lastWeekCount = lastWeek || 0;

    if (thisWeekCount === 0 && lastWeekCount === 0) return null;

    const growth = thisWeekCount - lastWeekCount;
    const headline = growth > 0
      ? `Your network grew by ${thisWeekCount} this week`
      : thisWeekCount > 0
        ? `${thisWeekCount} new connections this week`
        : 'Your network is waiting to grow';

    const body = growth > 0
      ? `That's ${growth} more than last week. Keep the momentum going.`
      : thisWeekCount > 0
        ? 'Steady growth builds strong networks. Keep connecting.'
        : `Last week you added ${lastWeekCount} connections. Reconnect with your network.`;

    return {
      id: `connect-ngi-${Date.now()}`,
      category: 'connect',
      cardType: 'network_growth_insight',
      headline,
      body,
      accentColor: ACCENT,
      icon: 'TrendingUp',
      priority: 40,
      actions: [
        {
          label: 'Discover People',
          type: 'navigate',
          payload: { url: '/dna/connect' },
          isPrimary: true,
        },
      ],
      metadata: { thisWeekCount, lastWeekCount, growth },
      dismissKey: `ngi-${new Date().toISOString().split('T')[0]}`,
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
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
      .select('user_id, connected_user_id, created_at')
      .or(`user_id.eq.${userId},connected_user_id.eq.${userId}`)
      .eq('status', 'accepted')
      .lt('created_at', thirtyDaysAgo)
      .limit(10);

    if (!connections || connections.length === 0) return null;

    // Pick a random dormant connection
    const conn = connections[Math.floor(Math.random() * connections.length)];
    const otherUserId = conn.user_id === userId ? conn.connected_user_id : conn.user_id;

    const { data: otherProfile } = await supabase
      .from('profiles')
      .select('full_name, avatar_url, headline')
      .eq('id', otherUserId)
      .single();

    if (!otherProfile) return null;

    return {
      id: `connect-reactivate-${otherUserId}`,
      category: 'connect',
      cardType: 'connection_reactivation',
      headline: `Reconnect with ${otherProfile.full_name || 'a connection'}`,
      body: `You and ${otherProfile.full_name || 'they'} haven't connected in a while. ${otherProfile.headline ? `They're working on: ${otherProfile.headline}` : 'Check in and see what they\'re up to.'}`,
      accentColor: ACCENT,
      icon: 'RefreshCw',
      priority: 50,
      actions: [
        {
          label: 'View Profile',
          type: 'navigate',
          payload: { url: `/dna/profile/${otherUserId}` },
          isPrimary: true,
        },
        {
          label: 'Not now',
          type: 'dismiss',
          payload: {},
          isPrimary: false,
        },
      ],
      metadata: {
        connectionId: otherUserId,
        connectionName: otherProfile.full_name,
        connectionAvatar: otherProfile.avatar_url,
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
      .select('user_id, connected_user_id')
      .or(`user_id.eq.${userId},connected_user_id.eq.${userId}`)
      .eq('status', 'accepted')
      .limit(50);

    if (!myConnections || myConnections.length < 2) return null;

    const myConnectionIds = myConnections.map(c =>
      c.user_id === userId ? c.connected_user_id : c.user_id
    );

    // Pick two random connections and check if they're connected
    const shuffled = myConnectionIds.sort(() => Math.random() - 0.5);
    const personA = shuffled[0];
    const personB = shuffled[1];

    const { count } = await supabase
      .from('connections')
      .select('*', { count: 'exact', head: true })
      .or(`and(user_id.eq.${personA},connected_user_id.eq.${personB}),and(user_id.eq.${personB},connected_user_id.eq.${personA})`)
      .eq('status', 'accepted');

    if ((count || 0) > 0) return null; // Already connected

    // Fetch both profiles
    const { data: profiles } = await supabase
      .from('profiles')
      .select('id, full_name, avatar_url, skills')
      .in('id', [personA, personB]);

    if (!profiles || profiles.length < 2) return null;

    const profileA = profiles.find(p => p.id === personA);
    const profileB = profiles.find(p => p.id === personB);
    if (!profileA || !profileB) return null;

    const skillsA: string[] = (profileA.skills as string[]) || [];
    const skillsB: string[] = (profileB.skills as string[]) || [];
    const sharedSkills = skillsA.filter(s => skillsB.includes(s));

    if (sharedSkills.length === 0) return null;

    return {
      id: `connect-bridge-${personA}-${personB}`,
      category: 'connect',
      cardType: 'mutual_bridge',
      headline: `Introduce ${profileA.full_name} and ${profileB.full_name}?`,
      body: `Your connections both work in ${sharedSkills.slice(0, 2).join(' and ')} but don't know each other. An introduction could spark something.`,
      accentColor: ACCENT,
      icon: 'GitBranch',
      priority: 55,
      actions: [
        {
          label: 'Make Introduction',
          type: 'open_composer',
          payload: { mentionIds: [personA, personB] },
          isPrimary: true,
        },
        {
          label: 'Not now',
          type: 'dismiss',
          payload: {},
          isPrimary: false,
        },
      ],
      metadata: {
        personA: { id: personA, name: profileA.full_name, avatar: profileA.avatar_url },
        personB: { id: personB, name: profileB.full_name, avatar: profileB.avatar_url },
        sharedSkills,
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
    generatePeopleYouShouldKnow,
    generateNetworkGrowthInsight,
    generateConnectionReactivation,
    generateMutualBridge,
  ];
}
