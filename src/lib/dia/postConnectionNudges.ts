/**
 * Post-Connection Nudge Generator — Sprint: CONNECT Circulation Fix
 *
 * After a connection is accepted, generates 2-3 contextual DIA suggestions
 * that bridge the new connection into CONVENE, COLLABORATE, and CONTRIBUTE.
 */

import { supabase } from '@/integrations/supabase/client';

export interface PostConnectionNudge {
  type:
    | 'shared_event'
    | 'matching_opportunity'
    | 'shared_space'
    | 'suggest_introduction'
    | 'start_conversation';
  title: string;
  description: string;
  targetC: 'CONVENE' | 'COLLABORATE' | 'CONTRIBUTE' | 'CONNECT' | 'MESSAGING';
  ctaLabel: string;
  ctaRoute: string;
  entityId?: string;
  priority: number;
  icon: string;
}

/**
 * Query shared context between two users and return 1-3 actionable nudges.
 * Runs 5 queries in parallel and returns the top 3 by priority.
 * Always returns at least one (the fallback "Start Conversation").
 */
export async function generatePostConnectionNudges(
  userId: string,
  connectedUserId: string,
  connectedUserName: string,
): Promise<PostConnectionNudge[]> {
  const results = await Promise.allSettled([
    findSharedEvents(userId, connectedUserId, connectedUserName),
    findMatchingOpportunities(userId, connectedUserId, connectedUserName),
    findSharedSpaces(userId, connectedUserId, connectedUserName),
    findMutualConnections(userId, connectedUserId, connectedUserName),
    Promise.resolve(fallbackStartConversation(userId, connectedUserId, connectedUserName)),
  ]);

  const nudges: PostConnectionNudge[] = [];

  for (const result of results) {
    if (result.status === 'fulfilled' && result.value) {
      nudges.push(result.value);
    }
  }

  // Sort by priority (lower number = higher priority)
  nudges.sort((a, b) => a.priority - b.priority);

  // Return top 3, always at least 1 (the fallback)
  return nudges.slice(0, 3);
}

// ── Query 1: Shared Events (priority 1) ──────────────────────────

async function findSharedEvents(
  userId: string,
  connectedUserId: string,
  connectedUserName: string,
): Promise<PostConnectionNudge | null> {
  try {
    // Find events where both users are attending (via event_attendees)
    const { data: userEvents } = await supabase
      .from('event_attendees')
      .select('event_id')
      .eq('user_id', userId);

    if (!userEvents || userEvents.length === 0) return null;

    const userEventIds = userEvents.map((e) => e.event_id);

    const { data: sharedAttendances } = await supabase
      .from('event_attendees')
      .select('event_id')
      .eq('user_id', connectedUserId)
      .in('event_id', userEventIds);

    if (!sharedAttendances || sharedAttendances.length === 0) return null;

    // Get the event details for the first shared event in the future
    const { data: futureEvent } = await supabase
      .from('events')
      .select('id, title, slug')
      .in(
        'id',
        sharedAttendances.map((a) => a.event_id),
      )
      .gte('start_time', new Date().toISOString())
      .order('start_time')
      .limit(1)
      .maybeSingle();

    if (!futureEvent) return null;

    return {
      type: 'shared_event',
      title: 'Shared Event',
      description: `You and ${connectedUserName} are both attending "${futureEvent.title}"`,
      targetC: 'CONVENE',
      ctaLabel: 'View Event',
      ctaRoute: `/dna/convene/events/${futureEvent.slug || futureEvent.id}`,
      entityId: futureEvent.id,
      priority: 1,
      icon: 'Calendar',
    };
  } catch {
    return null;
  }
}

// ── Query 2: Matching Opportunities (priority 2) ─────────────────

async function findMatchingOpportunities(
  userId: string,
  connectedUserId: string,
  connectedUserName: string,
): Promise<PostConnectionNudge | null> {
  try {
    // Get skills of the current user
    const { data: userProfile } = await supabase
      .from('profiles')
      .select('skills')
      .eq('id', userId)
      .single();

    const userSkills: string[] = (userProfile?.skills as string[]) || [];
    if (userSkills.length === 0) return null;

    // Find open opportunities posted by the connected user
    const { data: opportunities } = await supabase
      .from('contribution_needs')
      .select('id, title, type, skills_needed')
      .eq('created_by', connectedUserId)
      .eq('status', 'open')
      .limit(5);

    if (!opportunities || opportunities.length === 0) return null;

    // Check for skill overlap
    for (const opp of opportunities) {
      const oppSkills: string[] = (opp.skills_needed as string[]) || [];
      const overlap = userSkills.filter((s) =>
        oppSkills.some((os) => os.toLowerCase() === s.toLowerCase()),
      );
      if (overlap.length > 0) {
        return {
          type: 'matching_opportunity',
          title: 'Skills Match',
          description: `${connectedUserName} posted a need for ${overlap[0]} — matches your expertise`,
          targetC: 'CONTRIBUTE',
          ctaLabel: 'View Opportunity',
          ctaRoute: `/dna/contribute/${opp.id}`,
          entityId: opp.id,
          priority: 2,
          icon: 'Lightbulb',
        };
      }
    }

    return null;
  } catch {
    return null;
  }
}

// ── Query 3: Shared Spaces (priority 3) ──────────────────────────

async function findSharedSpaces(
  userId: string,
  connectedUserId: string,
  connectedUserName: string,
): Promise<PostConnectionNudge | null> {
  try {
    // Find spaces the connected user is in but the current user is NOT
    const { data: connectedUserSpaces } = await supabase
      .from('space_members')
      .select('space_id')
      .eq('user_id', connectedUserId);

    if (!connectedUserSpaces || connectedUserSpaces.length === 0) return null;

    const { data: userSpaces } = await supabase
      .from('space_members')
      .select('space_id')
      .eq('user_id', userId);

    const userSpaceIds = new Set((userSpaces || []).map((s) => s.space_id));
    const newSpaceIds = connectedUserSpaces
      .map((s) => s.space_id)
      .filter((id) => !userSpaceIds.has(id));

    if (newSpaceIds.length === 0) return null;

    const { data: space } = await supabase
      .from('spaces')
      .select('id, name, slug')
      .in('id', newSpaceIds)
      .limit(1)
      .maybeSingle();

    if (!space) return null;

    return {
      type: 'shared_space',
      title: 'Explore Together',
      description: `${connectedUserName} is in "${space.name}" — join to collaborate`,
      targetC: 'COLLABORATE',
      ctaLabel: 'View Space',
      ctaRoute: `/dna/collaborate/spaces/${space.slug || space.id}`,
      entityId: space.id,
      priority: 3,
      icon: 'Users',
    };
  } catch {
    return null;
  }
}

// ── Query 4: Mutual Connections / Suggest Introduction (priority 4) ──

async function findMutualConnections(
  userId: string,
  connectedUserId: string,
  connectedUserName: string,
): Promise<PostConnectionNudge | null> {
  try {
    // Get user's connections
    const { data: userConns } = await supabase
      .from('connections')
      .select('requester_id, recipient_id')
      .eq('status', 'accepted')
      .or(`requester_id.eq.${userId},recipient_id.eq.${userId}`);

    const userConnIds = new Set<string>();
    (userConns || []).forEach((c) => {
      if (c.requester_id !== userId) userConnIds.add(c.requester_id);
      if (c.recipient_id !== userId) userConnIds.add(c.recipient_id);
    });

    // Get connected user's connections
    const { data: otherConns } = await supabase
      .from('connections')
      .select('requester_id, recipient_id')
      .eq('status', 'accepted')
      .or(
        `requester_id.eq.${connectedUserId},recipient_id.eq.${connectedUserId}`,
      );

    const otherConnIds = new Set<string>();
    (otherConns || []).forEach((c) => {
      if (c.requester_id !== connectedUserId) otherConnIds.add(c.requester_id);
      if (c.recipient_id !== connectedUserId) otherConnIds.add(c.recipient_id);
    });

    // Find mutual
    const mutualIds = [...userConnIds].filter(
      (id) => otherConnIds.has(id) && id !== connectedUserId,
    );
    if (mutualIds.length === 0) return null;

    const { data: mutualProfile } = await supabase
      .from('profiles')
      .select('id, full_name')
      .eq('id', mutualIds[0])
      .single();

    if (!mutualProfile) return null;

    return {
      type: 'suggest_introduction',
      title: 'Mutual Connection',
      description: `You and ${connectedUserName} both know ${mutualProfile.full_name}`,
      targetC: 'MESSAGING',
      ctaLabel: `Message ${mutualProfile.full_name.split(' ')[0]}`,
      ctaRoute: `/dna/messages?thread=${mutualProfile.id}`,
      entityId: mutualProfile.id,
      priority: 4,
      icon: 'UserPlus',
    };
  } catch {
    return null;
  }
}

// ── Query 5: Fallback — Start Conversation (priority 5) ──────────

function fallbackStartConversation(
  _userId: string,
  connectedUserId: string,
  connectedUserName: string,
): PostConnectionNudge {
  return {
    type: 'start_conversation',
    title: 'Say Hello',
    description: `Send ${connectedUserName} a welcome message`,
    targetC: 'MESSAGING',
    ctaLabel: 'Start Conversation',
    ctaRoute: `/dna/messages?thread=${connectedUserId}`,
    priority: 5,
    icon: 'MessageSquare',
  };
}
