/**
 * DIA | Nudge Engine V2
 *
 * The expanded nudge engine with:
 * - Trigger rules across all Five C's
 * - Suppression logic (rate limits, cooldowns, preferences)
 * - Delivery routing (feed, notification, push, email)
 * - Status tracking and feedback loop
 *
 * Nudge philosophy:
 * - Warm, not nagging — like a well-connected elder
 * - Progressive, not checklist — nudges appear when they matter
 * - Contextual — triggered by user actions, not on a schedule
 * - Value-first — every nudge explains why it benefits the user
 */

import { supabase } from '@/integrations/supabase/client';
import { CModule } from '@/types/composer';
import {
  NudgeType,
  NudgeCategory,
  NudgePriority,
  NudgeDeliveryChannel,
  NudgeStatus,
  NudgeFrequency,
  type Nudge,
  type NudgeTiming,
  type TimeWindow,
  type UserNudgeState,
  type PeopleMatchResult,
  type OpportunityMatchResult,
} from '@/types/diaEngine';

// ============================================================
// TRIGGER RULE DEFINITIONS
// ============================================================

interface TriggerRule {
  trigger: string;
  nudgeType: NudgeType;
  category: NudgeCategory;
  cModule: CModule;
  condition: (data: Record<string, unknown>) => boolean;
  generateNudge: (data: Record<string, unknown>) => Omit<Nudge, 'id' | 'userId' | 'nudgeType' | 'category' | 'cModule' | 'status' | 'deliveredAt' | 'actedOnAt' | 'dismissedAt' | 'createdAt'>;
}

const TRIGGER_RULES: TriggerRule[] = [
  // ── CONNECT NUDGES ─────────────────────────────────────
  {
    trigger: 'high_quality_match_computed',
    nudgeType: NudgeType.CONNECTION_SUGGESTION,
    category: NudgeCategory.DISCOVERY,
    cModule: CModule.CONNECT,
    condition: (data) => (data.matchScore as number) >= 0.7,
    generateNudge: (data) => ({
      headline: 'Someone you should know',
      body: `${(data.reason1 as string) || 'Strong network overlap'}. ${(data.reason2 as string) || ''}`.trim(),
      action: { type: 'navigate', label: 'View Profile', payload: { userId: data.matchedUserId } },
      priority: NudgePriority.HIGH,
      deliveryChannel: NudgeDeliveryChannel.FEED_CARD,
      timing: { optimalDeliveryWindow: { startHour: 9, endHour: 21, daysOfWeek: [1, 2, 3, 4, 5] }, frequency: NudgeFrequency.DAILY_MAX, cooldownMinutes: 480, expiresAfterMinutes: 10080 },
      triggerEvent: 'high_quality_match_computed',
      matchId: (data.matchId as string) || null,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    }),
  },
  {
    trigger: 'connection_inactive_90_days',
    nudgeType: NudgeType.RECONNECT,
    category: NudgeCategory.RETENTION,
    cModule: CModule.CONNECT,
    condition: (data) => (data.relationshipStrength as number) > 0.5,
    generateNudge: (data) => ({
      headline: `Reconnect with ${data.displayName as string}`,
      body: `You haven't interacted in a while. They recently ${data.lastActivity as string}.`,
      action: { type: 'navigate', label: 'Send Message', payload: { userId: data.connectedUserId } },
      priority: NudgePriority.LOW,
      deliveryChannel: NudgeDeliveryChannel.NOTIFICATION_CENTER,
      timing: { optimalDeliveryWindow: { startHour: 10, endHour: 18, daysOfWeek: [1, 2, 3, 4, 5] }, frequency: NudgeFrequency.WEEKLY_MAX, cooldownMinutes: 10080, expiresAfterMinutes: 43200 },
      triggerEvent: 'connection_inactive_90_days',
      matchId: null,
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    }),
  },

  // ── CONVENE NUDGES ─────────────────────────────────────
  {
    trigger: 'event_connections_attending',
    nudgeType: NudgeType.EVENT_RECOMMENDATION,
    category: NudgeCategory.DISCOVERY,
    cModule: CModule.CONVENE,
    condition: (data) => (data.connectionCount as number) >= 3,
    generateNudge: (data) => ({
      headline: `${data.connectionCount} connections attending ${data.eventTitle as string}`,
      body: 'Your network is gathering. Don\'t miss out.',
      action: { type: 'navigate', label: 'View Event', payload: { eventId: data.eventId } },
      priority: NudgePriority.HIGH,
      deliveryChannel: NudgeDeliveryChannel.FEED_CARD,
      timing: { optimalDeliveryWindow: { startHour: 8, endHour: 20, daysOfWeek: [0, 1, 2, 3, 4, 5, 6] }, frequency: NudgeFrequency.ON_TRIGGER, cooldownMinutes: 1440, expiresAfterMinutes: null },
      triggerEvent: 'event_connections_attending',
      matchId: null,
      expiresAt: null,
    }),
  },
  {
    trigger: 'event_ended',
    nudgeType: NudgeType.POST_EVENT_FOLLOWUP,
    category: NudgeCategory.CREATION,
    cModule: CModule.CONVENE,
    condition: (data) => data.attended === true,
    generateNudge: (data) => ({
      headline: `Share your ${data.eventTitle as string} experience`,
      body: 'Write a recap Story to share insights with your network.',
      action: { type: 'open_composer', label: 'Write Recap', payload: { mode: 'story', prefill: { title: `Reflections from ${data.eventTitle as string}` } } },
      priority: NudgePriority.MEDIUM,
      deliveryChannel: NudgeDeliveryChannel.NOTIFICATION_CENTER,
      timing: { optimalDeliveryWindow: { startHour: 9, endHour: 20, daysOfWeek: [0, 1, 2, 3, 4, 5, 6] }, frequency: NudgeFrequency.ONCE, cooldownMinutes: 0, expiresAfterMinutes: 4320 },
      triggerEvent: 'event_ended',
      matchId: null,
      expiresAt: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
    }),
  },

  // ── COLLABORATE NUDGES ─────────────────────────────────
  {
    trigger: 'space_inactive_14_days',
    nudgeType: NudgeType.SPACE_STALL_ALERT,
    category: NudgeCategory.ENGAGEMENT,
    cModule: CModule.COLLABORATE,
    condition: (data) => (data.memberCount as number) >= 3,
    generateNudge: (data) => ({
      headline: `${data.spaceName as string} needs attention`,
      body: 'No activity in 2 weeks. Post an update or assign a task to keep momentum.',
      action: { type: 'navigate', label: 'Open Space', payload: { spaceId: data.spaceId } },
      priority: NudgePriority.MEDIUM,
      deliveryChannel: NudgeDeliveryChannel.NOTIFICATION_CENTER,
      timing: { optimalDeliveryWindow: { startHour: 9, endHour: 17, daysOfWeek: [1, 2, 3, 4, 5] }, frequency: NudgeFrequency.WEEKLY_MAX, cooldownMinutes: 10080, expiresAfterMinutes: 20160 },
      triggerEvent: 'space_inactive_14_days',
      matchId: null,
      expiresAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
    }),
  },

  // ── CONTRIBUTE NUDGES ──────────────────────────────────
  {
    trigger: 'opportunity_match_found',
    nudgeType: NudgeType.OPPORTUNITY_MATCH,
    category: NudgeCategory.DISCOVERY,
    cModule: CModule.CONTRIBUTE,
    condition: (data) => (data.matchScore as number) >= 0.6,
    generateNudge: (data) => ({
      headline: `${Math.round((data.matchScore as number) * 100)}% match for your skills`,
      body: (data.reason as string) || 'An opportunity that matches your expertise.',
      action: { type: 'navigate', label: 'View Opportunity', payload: { opportunityId: data.opportunityId } },
      priority: NudgePriority.HIGH,
      deliveryChannel: NudgeDeliveryChannel.FEED_CARD,
      timing: { optimalDeliveryWindow: { startHour: 8, endHour: 20, daysOfWeek: [1, 2, 3, 4, 5] }, frequency: NudgeFrequency.ON_TRIGGER, cooldownMinutes: 240, expiresAfterMinutes: 10080 },
      triggerEvent: 'opportunity_match_found',
      matchId: (data.matchId as string) || null,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    }),
  },
  {
    trigger: 'skills_in_demand',
    nudgeType: NudgeType.OFFER_PROMPT,
    category: NudgeCategory.CREATION,
    cModule: CModule.CONTRIBUTE,
    condition: (data) => (data.demandCount as number) >= 5,
    generateNudge: (data) => ({
      headline: `${data.demandCount} people need your ${data.skillName as string} expertise`,
      body: 'Consider posting an Offer to help the diaspora.',
      action: { type: 'open_composer', label: 'Create Offer', payload: { mode: 'opportunity', prefill: { direction: 'offer', category: 'skills_expertise' } } },
      priority: NudgePriority.MEDIUM,
      deliveryChannel: NudgeDeliveryChannel.FEED_CARD,
      timing: { optimalDeliveryWindow: { startHour: 10, endHour: 18, daysOfWeek: [1, 2, 3, 4, 5] }, frequency: NudgeFrequency.WEEKLY_MAX, cooldownMinutes: 10080, expiresAfterMinutes: 43200 },
      triggerEvent: 'skills_in_demand',
      matchId: null,
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    }),
  },

  // ── CONVEY NUDGES ──────────────────────────────────────
  {
    trigger: 'post_high_engagement',
    nudgeType: NudgeType.STORY_PROMPT,
    category: NudgeCategory.CREATION,
    cModule: CModule.CONVEY,
    condition: (data) => (data.engagementCount as number) >= 20,
    generateNudge: (data) => ({
      headline: 'Your post is resonating',
      body: `${data.engagementCount} engagements and counting. Expand it into a full Story for even more reach.`,
      action: { type: 'open_composer', label: 'Write Story', payload: { mode: 'story', prefill: { body: data.postContent as string } } },
      priority: NudgePriority.MEDIUM,
      deliveryChannel: NudgeDeliveryChannel.NOTIFICATION_CENTER,
      timing: { optimalDeliveryWindow: { startHour: 9, endHour: 20, daysOfWeek: [0, 1, 2, 3, 4, 5, 6] }, frequency: NudgeFrequency.ONCE, cooldownMinutes: 0, expiresAfterMinutes: 4320 },
      triggerEvent: 'post_high_engagement',
      matchId: null,
      expiresAt: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
    }),
  },

  // ── CROSS-C NUDGES ─────────────────────────────────────
  {
    trigger: 'active_in_three_cs',
    nudgeType: NudgeType.FIVE_C_ACTIVATION,
    category: NudgeCategory.GROWTH,
    cModule: CModule.CONNECT,
    condition: (data) => ((data.activeCs as string[]) || []).length >= 3,
    generateNudge: (data) => {
      const activeCs = (data.activeCs as string[]) || [];
      const inactiveCs = (data.inactiveCs as string[]) || [];
      return {
        headline: `You're active in ${activeCs.length} of the Five C's`,
        body: `Try ${inactiveCs[0] || 'a new module'} to unlock the full power of DNA.`,
        action: { type: 'navigate', label: `Explore ${inactiveCs[0] || 'more'}`, payload: { hub: (inactiveCs[0] || '').toLowerCase() } },
        priority: NudgePriority.LOW,
        deliveryChannel: NudgeDeliveryChannel.FEED_CARD,
        timing: { optimalDeliveryWindow: { startHour: 10, endHour: 18, daysOfWeek: [1, 2, 3, 4, 5] }, frequency: NudgeFrequency.ONCE, cooldownMinutes: 0, expiresAfterMinutes: 43200 },
        triggerEvent: 'active_in_three_cs',
        matchId: null,
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      };
    },
  },
];

// ============================================================
// NUDGE ENGINE
// ============================================================

/**
 * Process a trigger event and generate nudges if conditions are met.
 */
async function processTrigger(
  userId: string,
  trigger: string,
  data: Record<string, unknown>,
): Promise<Nudge | null> {
  const rule = TRIGGER_RULES.find(r => r.trigger === trigger);
  if (!rule) return null;

  // Check condition
  if (!rule.condition(data)) return null;

  // Check suppression
  const userState = await getUserNudgeState(userId);
  const partialNudge = rule.generateNudge(data);

  const nudge: Nudge = {
    id: crypto.randomUUID(),
    userId,
    nudgeType: rule.nudgeType,
    category: rule.category,
    cModule: rule.cModule,
    status: NudgeStatus.QUEUED,
    deliveredAt: null,
    actedOnAt: null,
    dismissedAt: null,
    createdAt: new Date(),
    ...partialNudge,
  };

  if (shouldSuppress(nudge, userState)) {
    // Store as suppressed for analytics
    await storeNudge({ ...nudge, status: NudgeStatus.SUPPRESSED });
    return null;
  }

  // Store and deliver
  await storeNudge(nudge);
  await updateNudgeState(userId, nudge);

  return nudge;
}

/**
 * Get pending nudges for a user, filtered by delivery channel.
 */
async function getPendingNudges(
  userId: string,
  channel?: NudgeDeliveryChannel,
  limit = 10,
): Promise<Nudge[]> {
  let query = (supabase as any)
    .from('dia_nudges')
    .select('*')
    .eq('user_id', userId)
    .in('status', ['queued', 'delivered'])
    .order('created_at', { ascending: false })
    .limit(limit);

  if (channel) {
    query = query.eq('delivery_channel', channel);
  }

  const { data } = await query;
  return ((data || []) as Record<string, unknown>[]).map(mapDbNudge);
}

/**
 * Mark a nudge as acted on.
 */
async function actOnNudge(nudgeId: string): Promise<void> {
  await (supabase as any)
    .from('dia_nudges')
    .update({
      status: 'acted_on',
      acted_on_at: new Date().toISOString(),
    })
    .eq('id', nudgeId);
}

/**
 * Dismiss a nudge.
 */
async function dismissNudge(nudgeId: string, userId: string): Promise<void> {
  // Update nudge status
  await (supabase as any)
    .from('dia_nudges')
    .update({
      status: 'dismissed',
      dismissed_at: new Date().toISOString(),
    })
    .eq('id', nudgeId);

  // Get nudge type for dismiss count tracking
  const { data: nudge } = await (supabase as any)
    .from('dia_nudges')
    .select('nudge_type')
    .eq('id', nudgeId)
    .single();

  if (nudge) {
    await incrementDismissCount(userId, (nudge as any).nudge_type);
  }
}

/**
 * Expire old nudges.
 */
async function expireOldNudges(): Promise<number> {
  const { data } = await (supabase as any)
    .from('dia_nudges')
    .update({ status: 'expired' })
    .in('status', ['queued', 'delivered'])
    .lt('expires_at', new Date().toISOString())
    .select('id');

  return ((data || []) as unknown[]).length;
}

// ============================================================
// SUPPRESSION LOGIC
// ============================================================

/**
 * Determine if a nudge should be suppressed based on rate limits,
 * cooldowns, and user preferences.
 */
function shouldSuppress(nudge: Nudge, userState: UserNudgeState): boolean {
  // Global rate limit: max 5 nudges per day
  if (userState.nudgesToday >= 5) return true;

  // Per-type cooldown
  const lastSameType = userState.lastNudgeByType[nudge.nudgeType];
  if (lastSameType) {
    const minutesSince = (Date.now() - new Date(lastSameType).getTime()) / (1000 * 60);
    if (minutesSince < nudge.timing.cooldownMinutes) return true;
  }

  // User has dismissed this nudge type 3+ times → stop showing it
  if ((userState.dismissCountByType[nudge.nudgeType] || 0) >= 3) return true;

  // Quiet hours check
  const userHour = getUserLocalHour(userState.timezone);
  const window = nudge.timing.optimalDeliveryWindow;
  if (userHour < window.startHour || userHour > window.endHour) return true;

  // Day of week check
  const userDay = new Date().getDay();
  if (!window.daysOfWeek.includes(userDay)) return true;

  // User preference: DIA frequency setting
  if (userState.diaFrequency === 'off') return true;
  if (userState.diaFrequency === 'minimal' && nudge.priority !== NudgePriority.URGENT) return true;

  return false;
}

// ============================================================
// USER NUDGE STATE MANAGEMENT
// ============================================================

async function getUserNudgeState(userId: string): Promise<UserNudgeState> {
  const { data } = await (supabase as any)
    .from('user_nudge_state')
    .select('*')
    .eq('user_id', userId)
    .single();

  if (!data) {
    // Create default state
    const defaultState: UserNudgeState = {
      userId,
      nudgesToday: 0,
      nudgesTodayResetAt: new Date(),
      lastNudgeByType: {},
      dismissCountByType: {},
      diaFrequency: 'normal',
      timezone: 'UTC',
    };

    await (supabase as any).from('user_nudge_state').insert({
      user_id: userId,
      nudges_today: 0,
      nudges_today_reset_at: new Date().toISOString(),
      last_nudge_by_type: {},
      dismiss_count_by_type: {},
      dia_frequency: 'normal',
      timezone: 'UTC',
    });

    return defaultState;
  }

  // Reset daily count if needed
  const record = data as Record<string, unknown>;
  const resetAt = new Date(record.nudges_today_reset_at as string);
  const now = new Date();
  if (now.getDate() !== resetAt.getDate() || now.getMonth() !== resetAt.getMonth()) {
    await (supabase as any)
      .from('user_nudge_state')
      .update({ nudges_today: 0, nudges_today_reset_at: now.toISOString() })
      .eq('user_id', userId);
    (record as any).nudges_today = 0;
  }

  return {
    userId,
    nudgesToday: record.nudges_today as number,
    nudgesTodayResetAt: new Date(record.nudges_today_reset_at as string),
    lastNudgeByType: (record.last_nudge_by_type || {}) as Record<string, Date>,
    dismissCountByType: (record.dismiss_count_by_type || {}) as Record<string, number>,
    diaFrequency: (record.dia_frequency as 'frequent' | 'normal' | 'minimal' | 'off') || 'normal',
    timezone: (record.timezone as string) || 'UTC',
  };
}

async function updateNudgeState(userId: string, nudge: Nudge): Promise<void> {
  const state = await getUserNudgeState(userId);

  const lastNudgeByType = { ...state.lastNudgeByType };
  lastNudgeByType[nudge.nudgeType] = new Date();

  await (supabase as any)
    .from('user_nudge_state')
    .update({
      nudges_today: state.nudgesToday + 1,
      last_nudge_by_type: lastNudgeByType,
    })
    .eq('user_id', userId);
}

async function incrementDismissCount(userId: string, nudgeType: string): Promise<void> {
  const state = await getUserNudgeState(userId);
  const counts = { ...state.dismissCountByType };
  counts[nudgeType] = (counts[nudgeType] || 0) + 1;

  await (supabase as any)
    .from('user_nudge_state')
    .update({ dismiss_count_by_type: counts })
    .eq('user_id', userId);
}

/**
 * Update user's DIA frequency preference.
 */
async function updateDiaFrequency(
  userId: string,
  frequency: 'frequent' | 'normal' | 'minimal' | 'off',
): Promise<void> {
  await (supabase as any)
    .from('user_nudge_state')
    .upsert({
      user_id: userId,
      dia_frequency: frequency,
      nudges_today: 0,
      nudges_today_reset_at: new Date().toISOString(),
    });
}

// ============================================================
// HELPERS
// ============================================================

async function storeNudge(nudge: Nudge): Promise<void> {
  await (supabase as any).from('dia_nudges').insert({
    id: nudge.id,
    user_id: nudge.userId,
    nudge_type: nudge.nudgeType,
    category: nudge.category,
    c_module: nudge.cModule,
    headline: nudge.headline,
    body: nudge.body,
    action: nudge.action,
    priority: nudge.priority,
    delivery_channel: nudge.deliveryChannel,
    timing: nudge.timing,
    trigger_event: nudge.triggerEvent,
    match_id: nudge.matchId,
    status: nudge.status,
    expires_at: nudge.expiresAt?.toISOString() || null,
  });
}

function mapDbNudge(row: Record<string, unknown>): Nudge {
  return {
    id: row.id as string,
    userId: row.user_id as string,
    nudgeType: row.nudge_type as NudgeType,
    category: row.category as NudgeCategory,
    cModule: row.c_module as CModule,
    headline: row.headline as string,
    body: row.body as string,
    action: row.action as Nudge['action'],
    priority: row.priority as NudgePriority,
    deliveryChannel: row.delivery_channel as NudgeDeliveryChannel,
    timing: row.timing as NudgeTiming,
    triggerEvent: row.trigger_event as string,
    matchId: (row.match_id as string) || null,
    status: row.status as NudgeStatus,
    deliveredAt: row.delivered_at ? new Date(row.delivered_at as string) : null,
    actedOnAt: row.acted_on_at ? new Date(row.acted_on_at as string) : null,
    dismissedAt: row.dismissed_at ? new Date(row.dismissed_at as string) : null,
    createdAt: new Date(row.created_at as string),
    expiresAt: row.expires_at ? new Date(row.expires_at as string) : null,
  };
}

function getUserLocalHour(timezone: string): number {
  try {
    const now = new Date();
    const formatter = new Intl.DateTimeFormat('en-US', {
      hour: 'numeric',
      hour12: false,
      timeZone: timezone,
    });
    return parseInt(formatter.format(now), 10);
  } catch {
    return new Date().getUTCHours();
  }
}

export const nudgeEngineV2Service = {
  processTrigger,
  getPendingNudges,
  actOnNudge,
  dismissNudge,
  expireOldNudges,
  shouldSuppress,
  getUserNudgeState,
  updateDiaFrequency,
  TRIGGER_RULES,
};
