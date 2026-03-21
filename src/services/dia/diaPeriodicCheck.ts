/**
 * DIA | Periodic Check Service — Sprint 4B
 *
 * Time-based event detection for conditions that aren't triggered by
 * explicit user actions. Runs on app load and every 30 minutes while
 * the app is open.
 *
 * Checks:
 * - Stalled spaces (no activity in 7+ days)
 * - Overdue tasks (past due_date, not completed)
 * - Expiring opportunities (within 7 days of valid_until)
 * - Upcoming events (starting within 60 minutes)
 */

import { supabase } from '@/integrations/supabase/client';
import { diaEventBus } from './diaEventBus';

// ── Types for query results ───────────────────────────────

interface StalledSpace {
  id: string;
  created_by: string;
  daysSinceActivity: number;
}

interface OverdueTask {
  id: string;
  assignee_id: string;
  space_id: string;
}

interface ExpiringOpportunity {
  id: string;
  created_by: string;
  daysLeft: number;
}

interface UpcomingEvent {
  id: string;
  organizer_id: string;
  minutesUntilStart: number;
}

// ── Check: Stalled Spaces ─────────────────────────────────

async function checkStalledSpaces(userId: string): Promise<StalledSpace[]> {
  // Get spaces where user is a member
  const { data: memberships } = await supabase
    .from('space_members')
    .select('space_id')
    .eq('user_id', userId)
    .eq('status', 'active');

  if (!memberships || memberships.length === 0) return [];

  const spaceIds = memberships.map(m => m.space_id);
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

  // Find spaces with no recent activity that user created
  const { data: spaces } = await supabase
    .from('spaces')
    .select('id, created_by, updated_at')
    .in('id', spaceIds)
    .eq('created_by', userId)
    .lt('updated_at', sevenDaysAgo)
    .limit(5);

  if (!spaces) return [];

  return spaces.map(space => ({
    id: space.id as string,
    created_by: space.created_by as string,
    daysSinceActivity: Math.floor(
      (Date.now() - new Date(space.updated_at as string).getTime()) / (24 * 60 * 60 * 1000),
    ),
  }));
}

// ── Check: Overdue Tasks ──────────────────────────────────

async function checkOverdueTasks(userId: string): Promise<OverdueTask[]> {
  const now = new Date().toISOString();

  const { data: tasks } = await supabase
    .from('space_tasks')
    .select('id, assignee_id, space_id')
    .eq('assignee_id', userId)
    .neq('status', 'done')
    .lt('due_date', now)
    .limit(10);

  if (!tasks) return [];

  return tasks.map(task => ({
    id: task.id as string,
    assignee_id: task.assignee_id as string,
    space_id: task.space_id as string,
  }));
}

// ── Check: Expiring Opportunities ─────────────────────────

async function checkExpiringOpportunities(userId: string): Promise<ExpiringOpportunity[]> {
  // opportunities table has no valid_until/deadline column
  // Use updated_at as a proxy — flag opportunities not updated in 14+ days as potentially stale
  const now = new Date();
  const fourteenDaysAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000).toISOString();

  const { data: opportunities } = await supabase
    .from('opportunities')
    .select('id, created_by, updated_at')
    .eq('created_by', userId)
    .eq('status', 'open')
    .lt('updated_at', fourteenDaysAgo)
    .limit(5);

  if (!opportunities) return [];

  return opportunities.map(opp => ({
    id: opp.id,
    created_by: opp.created_by,
    daysLeft: Math.floor(
      (now.getTime() - new Date(opp.updated_at).getTime()) / (24 * 60 * 60 * 1000),
    ),
  }));
}

// ── Check: Upcoming Events ────────────────────────────────

async function checkUpcomingEvents(userId: string): Promise<UpcomingEvent[]> {
  const now = new Date();
  const oneHourFromNow = new Date(now.getTime() + 60 * 60 * 1000).toISOString();

  const { data: events } = await supabase
    .from('events')
    .select('id, organizer_id, start_time')
    .eq('organizer_id', userId)
    .eq('is_cancelled', false)
    .gt('start_time', now.toISOString())
    .lt('start_time', oneHourFromNow)
    .limit(5);

  if (!events) return [];

  return events.map(event => ({
    id: event.id as string,
    organizer_id: event.organizer_id as string,
    minutesUntilStart: Math.round(
      (new Date(event.start_time as string).getTime() - now.getTime()) / (60 * 1000),
    ),
  }));
}

// ── Main Periodic Check Runner ────────────────────────────

async function runPeriodicChecks(userId: string): Promise<void> {
  // Run all checks concurrently
  const [stalledSpaces, overdueTasks, expiringOpps, upcomingEvents] = await Promise.all([
    checkStalledSpaces(userId).catch(() => [] as StalledSpace[]),
    checkOverdueTasks(userId).catch(() => [] as OverdueTask[]),
    checkExpiringOpportunities(userId).catch(() => [] as ExpiringOpportunity[]),
    checkUpcomingEvents(userId).catch(() => [] as UpcomingEvent[]),
  ]);

  // Emit events for stalled spaces
  for (const space of stalledSpaces) {
    diaEventBus.emit({
      type: 'space_inactive',
      spaceId: space.id,
      creatorId: space.created_by,
      daysSinceActivity: space.daysSinceActivity,
    });
  }

  // Emit events for overdue tasks
  for (const task of overdueTasks) {
    diaEventBus.emit({
      type: 'task_overdue',
      taskId: task.id,
      assigneeId: task.assignee_id,
      spaceId: task.space_id,
    });
  }

  // Emit events for expiring opportunities
  for (const opp of expiringOpps) {
    diaEventBus.emit({
      type: 'opportunity_expiring',
      opportunityId: opp.id,
      ownerId: opp.created_by,
      daysLeft: opp.daysLeft,
    });
  }

  // Emit events for upcoming events
  for (const event of upcomingEvents) {
    diaEventBus.emit({
      type: 'event_starting_soon',
      eventId: event.id,
      hostId: event.organizer_id,
      startsIn: event.minutesUntilStart,
    });
  }
}

// ── Initialization ────────────────────────────────────────

const CHECK_INTERVAL_MS = 30 * 60 * 1000; // 30 minutes

/**
 * Initialize periodic checks for a user.
 * Runs immediately on call, then every 30 minutes.
 * Returns a cleanup function to stop the interval.
 */
export function initDIAPeriodicChecks(userId: string): () => void {
  // Defer initial check so it doesn't compete with page navigation queries
  const initialTimeout = setTimeout(() => {
    runPeriodicChecks(userId).catch(() => {
      // Silently fail — periodic checks are non-critical
    });
  }, 10_000); // 10 second delay after mount

  // Set up recurring interval
  const interval = setInterval(() => {
    runPeriodicChecks(userId).catch(() => {
      // Silently fail — periodic checks are non-critical
    });
  }, CHECK_INTERVAL_MS);

  // Return cleanup function
  return () => {
    clearTimeout(initialTimeout);
    clearInterval(interval);
  };
}

export const diaPeriodicCheck = {
  initDIAPeriodicChecks,
  runPeriodicChecks,
  checkStalledSpaces,
  checkOverdueTasks,
  checkExpiringOpportunities,
  checkUpcomingEvents,
};
