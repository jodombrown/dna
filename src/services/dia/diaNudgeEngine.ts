/**
 * DIA | Proactive Nudge Engine — Sprint 4B
 *
 * Processes platform events and generates DIA nudges (which become cards
 * or notifications). Each event type maps to a nudge generator that
 * creates contextual, actionable DIA cards.
 *
 * Throttle rules prevent nudge fatigue:
 * - Max 8 nudges/day total
 * - Max 3 notification-channel nudges/hour
 * - Max 3 feed cards visible at once
 * - Min 24h between same event type
 * - Quiet hours: 10pm–7am (user local time)
 */

import { supabase } from '@/integrations/supabase/client';
import type { DIACard, DIACardAction } from '@/services/diaCardService';
import { MODULE_ACCENT_COLORS } from '@/services/diaCardService';
import type { DIAPlatformEvent, DIAPlatformEventType } from './diaEventTypes';
import {
  storeNudge,
  countNudgesToday,
  countRecentNudgesByType,
  countNotificationsLastHour,
  type DIAProactiveNudge,
} from './diaNudgeStorage';

// ── Throttle Configuration ────────────────────────────────

const THROTTLE_RULES = {
  maxNudgesPerDay: 8,
  maxNotificationsPerHour: 3,
  maxFeedCardsVisible: 3,
  minTimeBetweenSameTypeHours: 24,
  quietHoursStart: 22, // 10pm
  quietHoursEnd: 7,    // 7am
} as const;

// ── Internal Nudge Creation Config ────────────────────────

interface NudgeConfig {
  recipientId?: string;
  headline: string;
  body: string;
  actions: DIACardAction[];
  channel: 'feed' | 'notification' | 'both';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  expiresInDays: number;
  category: DIACard['category'];
  cardType: string;
  icon: string;
  metadata?: Record<string, unknown>;
}

// ── Helper: Create a nudge from event + config ────────────

function createNudge(
  event: DIAPlatformEvent,
  config: NudgeConfig,
): DIAProactiveNudge {
  const now = new Date();
  const expiresAt = new Date(now.getTime() + config.expiresInDays * 24 * 60 * 60 * 1000);

  const card: DIACard = {
    id: `dia-nudge-${event.type}-${now.getTime()}`,
    category: config.category,
    cardType: config.cardType,
    headline: config.headline,
    body: config.body,
    accentColor: MODULE_ACCENT_COLORS[config.category],
    icon: config.icon,
    priority: config.priority === 'urgent' ? 100 : config.priority === 'high' ? 80 : config.priority === 'medium' ? 60 : 40,
    actions: config.actions,
    metadata: config.metadata ?? {},
    dismissKey: `nudge-${event.type}-${now.getTime()}`,
    expiresAt: expiresAt.toISOString(),
  };

  // Determine recipientId from the config override or the event
  const recipientId = config.recipientId ?? getRecipientFromEvent(event);

  return {
    id: crypto.randomUUID(),
    recipientId,
    event,
    card,
    channel: config.channel,
    priority: config.priority,
    createdAt: now.toISOString(),
    expiresAt: expiresAt.toISOString(),
    status: 'pending',
  };
}

/**
 * Extract the primary recipient from an event.
 * Each event type has a natural recipient.
 */
function getRecipientFromEvent(event: DIAPlatformEvent): string {
  switch (event.type) {
    case 'new_connection':
      return event.userId;
    case 'connection_accepted':
      return event.userId;
    case 'connection_request_received':
      return event.userId;
    case 'new_member_in_sector':
      return event.userId;
    case 'event_rsvp':
      return event.hostId;
    case 'event_starting_soon':
      return event.hostId;
    case 'event_ended':
      return event.hostId;
    case 'event_milestone':
      return event.hostId;
    case 'space_inactive':
      return event.creatorId;
    case 'task_overdue':
      return event.assigneeId;
    case 'task_completed':
      return event.completedById;
    case 'space_member_joined':
      return event.creatorId;
    case 'space_milestone':
      return event.creatorId;
    case 'opportunity_response':
      return event.ownerId;
    case 'opportunity_match_found':
      return event.matchedUserId;
    case 'opportunity_expiring':
      return event.ownerId;
    case 'content_milestone':
      return event.authorId;
    case 'content_shared':
      return event.authorId;
    case 'weekly_digest_due':
      return event.userId;
    case 'profile_completion_stall':
      return event.userId;
  }
}

// ── Helper: Fetch profile name safely ─────────────────────

async function fetchProfileName(userId: string): Promise<string> {
  const { data } = await supabase
    .from('profiles')
    .select('full_name')
    .eq('id', userId)
    .single();
  return (data?.full_name as string) || 'Someone';
}

// ── Helper: Fetch event title safely ──────────────────────

async function fetchEventTitle(eventId: string): Promise<string> {
  const { data } = await supabase
    .from('events')
    .select('title')
    .eq('id', eventId)
    .single();
  return (data?.title as string) || 'your event';
}

// ── Helper: Fetch space name safely ───────────────────────

async function fetchSpaceName(spaceId: string): Promise<string> {
  const { data } = await supabase
    .from('spaces')
    .select('name')
    .eq('id', spaceId)
    .single();
  return (data?.name as string) || 'your space';
}

// ── Helper: Fetch opportunity title safely ────────────────

async function fetchOpportunityTitle(opportunityId: string): Promise<string> {
  const { data } = await supabase
    .from('opportunities')
    .select('title')
    .eq('id', opportunityId)
    .single();
  return (data?.title as string) || 'your opportunity';
}

// ── Event-to-Nudge Handlers ──────────────────────────────

type EventHandler = (event: DIAPlatformEvent) => Promise<DIAProactiveNudge | null>;

const EVENT_HANDLERS: Partial<Record<DIAPlatformEventType, EventHandler>> = {

  // ── CONNECT ─────────────────────────────────────────────

  new_connection: async (event) => {
    if (event.type !== 'new_connection') return null;
    const name = await fetchProfileName(event.connectedUserId);
    return createNudge(event, {
      headline: 'New connection made!',
      body: `You connected with ${name}. Explore what you can build together.`,
      actions: [
        { label: 'View Profile', type: 'navigate', payload: { url: `/dna/profile/${event.connectedUserId}` }, isPrimary: true },
        { label: 'Message', type: 'navigate', payload: { url: `/dna/messages?thread=${event.connectedUserId}` }, isPrimary: false },
      ],
      channel: 'notification',
      priority: 'low',
      expiresInDays: 3,
      category: 'connect',
      cardType: 'new_connection_nudge',
      icon: 'UserPlus',
    });
  },

  new_member_in_sector: async (event) => {
    if (event.type !== 'new_member_in_sector') return null;
    const name = await fetchProfileName(event.newMemberId);
    return createNudge(event, {
      headline: 'New arrival in your sector',
      body: `${name} just joined DNA. They work in ${event.sector} — see if you align.`,
      actions: [
        { label: 'View Profile', type: 'navigate', payload: { url: `/dna/profile/${event.newMemberId}` }, isPrimary: true },
      ],
      channel: 'feed',
      priority: 'low',
      expiresInDays: 7,
      category: 'connect',
      cardType: 'new_member_sector_nudge',
      icon: 'UserCheck',
    });
  },

  // ── CONVENE ─────────────────────────────────────────────

  event_rsvp: async (event) => {
    if (event.type !== 'event_rsvp') return null;
    const [name, title] = await Promise.all([
      fetchProfileName(event.attendeeId),
      fetchEventTitle(event.eventId),
    ]);
    return createNudge(event, {
      recipientId: event.hostId,
      headline: 'New RSVP!',
      body: `${name} just registered for ${title}.`,
      actions: [
        { label: 'View Attendees', type: 'navigate', payload: { url: `/dna/convene/events/${event.eventId}` }, isPrimary: true },
      ],
      channel: 'notification',
      priority: 'medium',
      expiresInDays: 1,
      category: 'convene',
      cardType: 'event_rsvp_nudge',
      icon: 'CalendarCheck',
    });
  },

  event_starting_soon: async (event) => {
    if (event.type !== 'event_starting_soon') return null;
    const title = await fetchEventTitle(event.eventId);
    return createNudge(event, {
      recipientId: event.hostId,
      headline: 'Event starting soon!',
      body: `${title} starts in ${event.startsIn} minutes. Make sure everything is ready.`,
      actions: [
        { label: 'View Event', type: 'navigate', payload: { url: `/dna/convene/events/${event.eventId}` }, isPrimary: true },
      ],
      channel: 'both',
      priority: 'urgent',
      expiresInDays: 1,
      category: 'convene',
      cardType: 'event_starting_soon_nudge',
      icon: 'Clock',
    });
  },

  event_ended: async (event) => {
    if (event.type !== 'event_ended') return null;
    const title = await fetchEventTitle(event.eventId);
    return createNudge(event, {
      recipientId: event.hostId,
      headline: 'Your event just wrapped up!',
      body: `${event.attendeeCount} people attended ${title}. Follow up while the energy is fresh.`,
      actions: [
        { label: 'Thank Attendees', type: 'navigate', payload: { url: `/dna/convene/events/${event.eventId}` }, isPrimary: true },
        { label: 'Create Follow-Up Space', type: 'open_composer', payload: { mode: 'space' }, isPrimary: false },
      ],
      channel: 'both',
      priority: 'high',
      expiresInDays: 7,
      category: 'convene',
      cardType: 'event_ended_nudge',
      icon: 'PartyPopper',
    });
  },

  event_milestone: async (event) => {
    if (event.type !== 'event_milestone') return null;
    return createNudge(event, {
      recipientId: event.hostId,
      headline: `Milestone: ${event.milestone.replace('_', ' ')} RSVPs!`,
      body: 'Your event is gaining momentum. Share it with your network to keep growing.',
      actions: [
        { label: 'Share Event', type: 'navigate', payload: { url: `/dna/convene/events/${event.eventId}` }, isPrimary: true },
      ],
      channel: 'notification',
      priority: 'medium',
      expiresInDays: 3,
      category: 'convene',
      cardType: 'event_milestone_nudge',
      icon: 'TrendingUp',
    });
  },

  // ── COLLABORATE ─────────────────────────────────────────

  space_inactive: async (event) => {
    if (event.type !== 'space_inactive') return null;
    return createNudge(event, {
      recipientId: event.creatorId,
      headline: 'Space needs attention',
      body: `Your space has been quiet for ${event.daysSinceActivity} days. A quick check-in can reignite momentum.`,
      actions: [
        { label: 'Visit Space', type: 'navigate', payload: { url: `/dna/collaborate/spaces/${event.spaceId}` }, isPrimary: true },
        { label: 'Post Update', type: 'open_composer', payload: { mode: 'post', context: { relatedSpaceId: event.spaceId } }, isPrimary: false },
      ],
      channel: 'both',
      priority: 'high',
      expiresInDays: 7,
      category: 'collaborate',
      cardType: 'space_inactive_nudge',
      icon: 'AlertCircle',
    });
  },

  task_overdue: async (event) => {
    if (event.type !== 'task_overdue') return null;
    const spaceName = await fetchSpaceName(event.spaceId);
    return createNudge(event, {
      recipientId: event.assigneeId,
      headline: 'Task overdue',
      body: `Your task in ${spaceName} was due. Need help? Ask your team.`,
      actions: [
        { label: 'View Task', type: 'navigate', payload: { url: `/dna/collaborate/spaces/${event.spaceId}` }, isPrimary: true },
      ],
      channel: 'notification',
      priority: 'high',
      expiresInDays: 3,
      category: 'collaborate',
      cardType: 'task_overdue_nudge',
      icon: 'AlertTriangle',
    });
  },

  task_completed: async (event) => {
    if (event.type !== 'task_completed') return null;
    const spaceName = await fetchSpaceName(event.spaceId);
    return createNudge(event, {
      recipientId: event.completedById,
      headline: 'Task completed!',
      body: `Great work finishing your task in ${spaceName}. Keep the momentum going.`,
      actions: [
        { label: 'View Space', type: 'navigate', payload: { url: `/dna/collaborate/spaces/${event.spaceId}` }, isPrimary: true },
      ],
      channel: 'notification',
      priority: 'low',
      expiresInDays: 1,
      category: 'collaborate',
      cardType: 'task_completed_nudge',
      icon: 'CheckCircle',
    });
  },

  space_member_joined: async (event) => {
    if (event.type !== 'space_member_joined') return null;
    const [name, spaceName] = await Promise.all([
      fetchProfileName(event.newMemberId),
      fetchSpaceName(event.spaceId),
    ]);
    return createNudge(event, {
      recipientId: event.creatorId,
      headline: 'New space member!',
      body: `${name} just joined ${spaceName}. Welcome them and assign tasks.`,
      actions: [
        { label: 'View Space', type: 'navigate', payload: { url: `/dna/collaborate/spaces/${event.spaceId}` }, isPrimary: true },
      ],
      channel: 'notification',
      priority: 'medium',
      expiresInDays: 3,
      category: 'collaborate',
      cardType: 'space_member_joined_nudge',
      icon: 'Users',
    });
  },

  space_milestone: async (event) => {
    if (event.type !== 'space_milestone') return null;
    return createNudge(event, {
      recipientId: event.creatorId,
      headline: `${event.milestone.replace('_pct', '%')} complete!`,
      body: 'Your space is making real progress. Share this milestone with your team.',
      actions: [
        { label: 'Celebrate', type: 'navigate', payload: { url: `/dna/collaborate/spaces/${event.spaceId}` }, isPrimary: true },
      ],
      channel: 'both',
      priority: 'medium',
      expiresInDays: 7,
      category: 'collaborate',
      cardType: 'space_milestone_nudge',
      icon: 'Award',
    });
  },

  // ── CONTRIBUTE ──────────────────────────────────────────

  opportunity_response: async (event) => {
    if (event.type !== 'opportunity_response') return null;
    const [name, title] = await Promise.all([
      fetchProfileName(event.responderId),
      fetchOpportunityTitle(event.opportunityId),
    ]);
    return createNudge(event, {
      recipientId: event.ownerId,
      headline: 'New response!',
      body: `${name} expressed interest in ${title}. Review their profile.`,
      actions: [
        { label: 'View Response', type: 'navigate', payload: { url: `/dna/contribute/opportunities/${event.opportunityId}` }, isPrimary: true },
      ],
      channel: 'notification',
      priority: 'high',
      expiresInDays: 3,
      category: 'contribute',
      cardType: 'opportunity_response_nudge',
      icon: 'MessageSquare',
    });
  },

  opportunity_match_found: async (event) => {
    if (event.type !== 'opportunity_match_found') return null;
    return createNudge(event, {
      recipientId: event.matchedUserId,
      headline: 'Opportunity match',
      body: `DIA found an opportunity that's a ${event.matchScore}% match for your skills. Take a look.`,
      actions: [
        { label: 'View Opportunity', type: 'navigate', payload: { url: `/dna/contribute/opportunities/${event.opportunityId}` }, isPrimary: true },
      ],
      channel: 'both',
      priority: 'medium',
      expiresInDays: 7,
      category: 'contribute',
      cardType: 'opportunity_match_nudge',
      icon: 'Target',
    });
  },

  opportunity_expiring: async (event) => {
    if (event.type !== 'opportunity_expiring') return null;
    const title = await fetchOpportunityTitle(event.opportunityId);
    return createNudge(event, {
      recipientId: event.ownerId,
      headline: 'Opportunity expiring soon',
      body: `${title} expires in ${event.daysLeft} days. Extend or close it.`,
      actions: [
        { label: 'View Opportunity', type: 'navigate', payload: { url: `/dna/contribute/opportunities/${event.opportunityId}` }, isPrimary: true },
      ],
      channel: 'notification',
      priority: 'medium',
      expiresInDays: event.daysLeft,
      category: 'contribute',
      cardType: 'opportunity_expiring_nudge',
      icon: 'Clock',
    });
  },

  // ── CONVEY ──────────────────────────────────────────────

  content_milestone: async (event) => {
    if (event.type !== 'content_milestone') return null;
    return createNudge(event, {
      recipientId: event.authorId,
      headline: 'Your content is resonating!',
      body: `Your post just reached ${event.milestone.replace('_', ' ')}. Keep the momentum going.`,
      actions: [
        { label: 'View Post', type: 'navigate', payload: { url: '/dna/feed' }, isPrimary: true },
      ],
      channel: 'notification',
      priority: 'low',
      expiresInDays: 3,
      category: 'convey',
      cardType: 'content_milestone_nudge',
      icon: 'Star',
    });
  },

  content_shared: async (event) => {
    if (event.type !== 'content_shared') return null;
    const name = await fetchProfileName(event.sharedById);
    return createNudge(event, {
      recipientId: event.authorId,
      headline: 'Your content was shared!',
      body: `${name} shared your post with their network. Your ideas are spreading.`,
      actions: [
        { label: 'View Post', type: 'navigate', payload: { url: '/dna/feed' }, isPrimary: true },
      ],
      channel: 'notification',
      priority: 'low',
      expiresInDays: 3,
      category: 'convey',
      cardType: 'content_shared_nudge',
      icon: 'Share2',
    });
  },

  // ── CROSS-C ─────────────────────────────────────────────

  profile_completion_stall: async (event) => {
    if (event.type !== 'profile_completion_stall') return null;
    return createNudge(event, {
      recipientId: event.userId,
      headline: 'Complete your profile',
      body: `Your profile is ${event.completionPct}% complete. A complete profile gets 3x more connections.`,
      actions: [
        { label: 'Edit Profile', type: 'navigate', payload: { url: '/dna/profile/edit' }, isPrimary: true },
      ],
      channel: 'feed',
      priority: 'low',
      expiresInDays: 14,
      category: 'cross_c',
      cardType: 'profile_completion_nudge',
      icon: 'User',
    });
  },

  weekly_digest_due: async (event) => {
    if (event.type !== 'weekly_digest_due') return null;
    return createNudge(event, {
      recipientId: event.userId,
      headline: 'Your weekly DNA digest',
      body: 'See what happened across your network this week.',
      actions: [
        { label: 'View Feed', type: 'navigate', payload: { url: '/dna/feed' }, isPrimary: true },
      ],
      channel: 'feed',
      priority: 'low',
      expiresInDays: 7,
      category: 'cross_c',
      cardType: 'weekly_digest_nudge',
      icon: 'BookOpen',
    });
  },
};

// ── Throttle Check ────────────────────────────────────────

function isInQuietHours(): boolean {
  const hour = new Date().getHours();
  // Quiet hours: 10pm (22) to 7am (7)
  return hour >= THROTTLE_RULES.quietHoursStart || hour < THROTTLE_RULES.quietHoursEnd;
}

function shouldThrottle(
  recipientId: string,
  event: DIAPlatformEvent,
  channel: 'feed' | 'notification' | 'both',
): boolean {
  // Quiet hours — suppress notification-channel nudges
  if (isInQuietHours() && (channel === 'notification' || channel === 'both')) {
    return true;
  }

  // Max nudges per day
  if (countNudgesToday(recipientId) >= THROTTLE_RULES.maxNudgesPerDay) {
    return true;
  }

  // Max notifications per hour
  if (
    (channel === 'notification' || channel === 'both') &&
    countNotificationsLastHour(recipientId) >= THROTTLE_RULES.maxNotificationsPerHour
  ) {
    return true;
  }

  // Min time between same event type
  if (
    countRecentNudgesByType(
      recipientId,
      event.type,
      THROTTLE_RULES.minTimeBetweenSameTypeHours,
    ) > 0
  ) {
    return true;
  }

  return false;
}

// ── Main Entry Point ──────────────────────────────────────

/**
 * Process a platform event and generate nudges if the event type
 * has a handler and throttle rules allow delivery.
 */
export async function processEvent(
  event: DIAPlatformEvent,
): Promise<DIAProactiveNudge[]> {
  const handler = EVENT_HANDLERS[event.type];
  if (!handler) return [];

  try {
    const nudge = await handler(event);
    if (!nudge) return [];

    // Check throttle rules
    if (shouldThrottle(nudge.recipientId, event, nudge.channel)) {
      return [];
    }

    // Store and return
    storeNudge(nudge);
    return [nudge];
  } catch {
    // Silently fail — DIA nudges are non-critical
    return [];
  }
}

/**
 * Get the count of registered event handlers (for verification).
 */
export function getRegisteredHandlerCount(): number {
  return Object.keys(EVENT_HANDLERS).length;
}

export const diaNudgeEngine = {
  processEvent,
  getRegisteredHandlerCount,
  isInQuietHours,
};
