/**
 * DIA | Platform Event Type Definitions — Sprint 4B
 *
 * Every meaningful action on the platform is an "event" that DIA can react to.
 * These events are emitted from mutation handlers (after successful API calls)
 * and processed by the Nudge Engine to generate proactive DIA cards.
 *
 * Event categories map to the Five C's + Cross-C:
 * - CONNECT: Connection lifecycle events
 * - CONVENE: Event/gathering lifecycle events
 * - COLLABORATE: Space & task lifecycle events
 * - CONTRIBUTE: Opportunity lifecycle events
 * - CONVEY: Content engagement events
 * - CROSS-C: Platform-wide events (digests, profile health)
 */

// ── CONNECT Events ────────────────────────────────────────

interface NewConnectionEvent {
  type: 'new_connection';
  userId: string;
  connectedUserId: string;
}

interface ConnectionRequestReceivedEvent {
  type: 'connection_request_received';
  userId: string;
  fromUserId: string;
}

interface NewMemberInSectorEvent {
  type: 'new_member_in_sector';
  userId: string;
  newMemberId: string;
  sector: string;
}

// ── CONVENE Events ────────────────────────────────────────

interface EventRsvpEvent {
  type: 'event_rsvp';
  eventId: string;
  attendeeId: string;
  hostId: string;
}

interface EventStartingSoonEvent {
  type: 'event_starting_soon';
  eventId: string;
  hostId: string;
  startsIn: number; // minutes until start
}

interface EventEndedEvent {
  type: 'event_ended';
  eventId: string;
  hostId: string;
  attendeeCount: number;
}

type EventMilestone = '10_rsvps' | '25_rsvps' | '50_rsvps';

interface EventMilestoneEvent {
  type: 'event_milestone';
  eventId: string;
  hostId: string;
  milestone: EventMilestone;
}

// ── COLLABORATE Events ────────────────────────────────────

interface SpaceInactiveEvent {
  type: 'space_inactive';
  spaceId: string;
  creatorId: string;
  daysSinceActivity: number;
}

interface TaskOverdueEvent {
  type: 'task_overdue';
  taskId: string;
  assigneeId: string;
  spaceId: string;
}

interface TaskCompletedEvent {
  type: 'task_completed';
  taskId: string;
  completedById: string;
  spaceId: string;
}

interface SpaceMemberJoinedEvent {
  type: 'space_member_joined';
  spaceId: string;
  newMemberId: string;
  creatorId: string;
}

type SpaceMilestone = '50_pct' | '75_pct' | '100_pct';

interface SpaceMilestoneEvent {
  type: 'space_milestone';
  spaceId: string;
  creatorId: string;
  milestone: SpaceMilestone;
}

// ── CONTRIBUTE Events ─────────────────────────────────────

interface OpportunityResponseEvent {
  type: 'opportunity_response';
  opportunityId: string;
  ownerId: string;
  responderId: string;
}

interface OpportunityMatchFoundEvent {
  type: 'opportunity_match_found';
  opportunityId: string;
  matchedUserId: string;
  matchScore: number;
}

interface OpportunityExpiringEvent {
  type: 'opportunity_expiring';
  opportunityId: string;
  ownerId: string;
  daysLeft: number;
}

// ── CONVEY Events ─────────────────────────────────────────

type ContentMilestone = '10_likes' | '50_likes' | '100_views';

interface ContentMilestoneEvent {
  type: 'content_milestone';
  contentId: string;
  authorId: string;
  milestone: ContentMilestone;
}

interface ContentSharedEvent {
  type: 'content_shared';
  contentId: string;
  authorId: string;
  sharedById: string;
}

// ── CROSS-C Events ────────────────────────────────────────

interface WeeklyDigestDueEvent {
  type: 'weekly_digest_due';
  userId: string;
}

interface ProfileCompletionStallEvent {
  type: 'profile_completion_stall';
  userId: string;
  completionPct: number;
  daysSinceProgress: number;
}

// ── Union Type ────────────────────────────────────────────

export type DIAPlatformEvent =
  // CONNECT events
  | NewConnectionEvent
  | ConnectionRequestReceivedEvent
  | NewMemberInSectorEvent
  // CONVENE events
  | EventRsvpEvent
  | EventStartingSoonEvent
  | EventEndedEvent
  | EventMilestoneEvent
  // COLLABORATE events
  | SpaceInactiveEvent
  | TaskOverdueEvent
  | TaskCompletedEvent
  | SpaceMemberJoinedEvent
  | SpaceMilestoneEvent
  // CONTRIBUTE events
  | OpportunityResponseEvent
  | OpportunityMatchFoundEvent
  | OpportunityExpiringEvent
  // CONVEY events
  | ContentMilestoneEvent
  | ContentSharedEvent
  // CROSS-C events
  | WeeklyDigestDueEvent
  | ProfileCompletionStallEvent;

/** All possible event type strings for type-safe lookups */
export type DIAPlatformEventType = DIAPlatformEvent['type'];
