/**
 * DNA | DIA Cross-C Card Generators
 *
 * Generates intelligence cards that bridge multiple C modules:
 * - C-to-C Bridge (activity in one C suggests action in another)
 * - Five C's Weekly Activity Summary
 */

import { supabase } from '@/integrations/supabase/client';
import type { DIACard, DIACardAction } from '@/services/diaCardService';
import { MODULE_ACCENT_COLORS } from '@/services/diaCardService';

const ACCENT = MODULE_ACCENT_COLORS.cross_c;

// ── Card Type 1: C-to-C Bridge ─────────────────────

async function generateCToCBridge(userId: string): Promise<DIACard | null> {
  try {
    // Check for events with many attendees that could become spaces
    const { data: myRsvps } = await supabase
      .from('event_rsvps')
      .select('event_id')
      .eq('user_id', userId)
      .eq('status', 'going');

    if (!myRsvps || myRsvps.length === 0) return null;

    const eventIds = myRsvps.map(r => r.event_id);

    // Find events with 10+ attendees
    for (const eventId of eventIds.slice(0, 5)) {
      const { count: attendeeCount } = await supabase
        .from('event_rsvps')
        .select('*', { count: 'exact', head: true })
        .eq('event_id', eventId)
        .eq('status', 'going');

      if ((attendeeCount || 0) < 10) continue;

      // Check if a space already exists for this event
      const { count: existingSpaces } = await supabase
        .from('spaces')
        .select('*', { count: 'exact', head: true })
        .eq('origin_event_id', eventId);

      if ((existingSpaces || 0) > 0) continue;

      const { data: event } = await supabase
        .from('events')
        .select('id, title')
        .eq('id', eventId)
        .single();

      if (!event) continue;

      return {
        id: `crossc-bridge-event-space-${eventId}`,
        category: 'cross_c',
        cardType: 'c_to_c_bridge',
        headline: `Turn ${event.title} into ongoing collaboration`,
        body: `${attendeeCount} people attended this event. Create a Space to keep the conversation and collaboration going.`,
        accentColor: ACCENT,
        icon: 'ArrowRightLeft',
        priority: 60,
        actions: [
          {
            label: 'Create Space',
            type: 'navigate',
            payload: { url: `/dna/collaborate/create?from_event=${eventId}` },
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
          sourceModule: 'convene',
          targetModule: 'collaborate',
          eventId,
          eventTitle: event.title,
          attendeeCount,
        },
        dismissKey: `bridge-event-${eventId}`,
      };
    }

    return null;
  } catch {
    return null;
  }
}

// ── Card Type 2: Five C's Weekly Activity Summary ──

async function generateWeeklyDigest(userId: string): Promise<DIACard | null> {
  try {
    const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

    // Count activity across all Five C's concurrently
    const [connectResult, conveneResult, collaborateResult, contributeResult, conveyResult] =
      await Promise.allSettled([
        // Connect: new connections this week
        supabase
          .from('connections')
          .select('*', { count: 'exact', head: true })
          .or(`user_id.eq.${userId},connected_user_id.eq.${userId}`)
          .eq('status', 'accepted')
          .gte('created_at', oneWeekAgo),

        // Convene: events attended
        supabase
          .from('event_rsvps')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', userId)
          .eq('status', 'going')
          .gte('created_at', oneWeekAgo),

        // Collaborate: tasks completed
        supabase
          .from('space_tasks')
          .select('*', { count: 'exact', head: true })
          .eq('assignee_id', userId)
          .eq('status', 'completed')
          .gte('updated_at', oneWeekAgo),

        // Contribute: contributions made
        supabase
          .from('need_responses')
          .select('*', { count: 'exact', head: true })
          .eq('responder_id', userId)
          .gte('created_at', oneWeekAgo),

        // Convey: posts published
        supabase
          .from('posts')
          .select('*', { count: 'exact', head: true })
          .eq('author_id', userId)
          .gte('created_at', oneWeekAgo),
      ]);

    const connections = connectResult.status === 'fulfilled' ? (connectResult.value.count || 0) : 0;
    const events = conveneResult.status === 'fulfilled' ? (conveneResult.value.count || 0) : 0;
    const tasks = collaborateResult.status === 'fulfilled' ? (collaborateResult.value.count || 0) : 0;
    const contributions = contributeResult.status === 'fulfilled' ? (contributeResult.value.count || 0) : 0;
    const posts = conveyResult.status === 'fulfilled' ? (conveyResult.value.count || 0) : 0;

    const totalActivity = connections + events + tasks + contributions + posts;
    if (totalActivity === 0) return null;

    // Build summary parts
    const parts: string[] = [];
    if (connections > 0) parts.push(`${connections} connection${connections > 1 ? 's' : ''}`);
    if (events > 0) parts.push(`${events} event${events > 1 ? 's' : ''}`);
    if (tasks > 0) parts.push(`${tasks} task${tasks > 1 ? 's' : ''} completed`);
    if (contributions > 0) parts.push(`${contributions} contribution${contributions > 1 ? 's' : ''}`);
    if (posts > 0) parts.push(`${posts} post${posts > 1 ? 's' : ''} published`);

    return {
      id: `crossc-digest-${new Date().toISOString().split('T')[0]}`,
      category: 'cross_c',
      cardType: 'weekly_digest',
      headline: 'Your week across the Five C\'s',
      body: `This week: ${parts.join(', ')}. ${totalActivity >= 5 ? 'You\'re building real momentum.' : 'Every action strengthens the diaspora.'}`,
      accentColor: ACCENT,
      icon: 'LayoutGrid',
      priority: 35,
      actions: [
        {
          label: 'View Dashboard',
          type: 'navigate',
          payload: { url: '/dna/dashboard' },
          isPrimary: true,
        },
      ],
      metadata: {
        connections,
        events,
        tasks,
        contributions,
        posts,
        totalActivity,
      },
      dismissKey: `digest-${new Date().toISOString().split('T')[0]}`,
      expiresAt: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
    };
  } catch {
    return null;
  }
}

// ── Export ──────────────────────────────────────────

export function generateCrossCCards(): Array<(userId: string) => Promise<DIACard | null>> {
  return [
    generateCToCBridge,
    generateWeeklyDigest,
  ];
}
