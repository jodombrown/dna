/**
 * DNA | Badge Service — Sprint 13C
 *
 * Evaluates badge eligibility and awards badges to users.
 * Piggybacks on impact score data to minimize extra queries.
 */

import { supabase } from '@/integrations/supabase/client';
import { createNotification, NOTIFICATION_TYPES } from '@/services/notificationService';
import { logger } from '@/lib/logger';

export interface BadgeDefinition {
  id: string;
  slug: string;
  name: string;
  description: string;
  icon: string;
  c_module: string | null;
  category: string;
  tier: string;
  sort_order: number;
}

export interface UserBadge {
  id: string;
  user_id: string;
  badge_id: string;
  earned_at: string;
  is_featured: boolean;
  badge?: BadgeDefinition;
}

interface ActivityData {
  connectionCount: number;
  countrySpan: number;
  eventsHosted: number;
  eventsAttended: number;
  spacesCreated: number;
  spacesJoined: number;
  opportunitiesPosted: number;
  opportunitiesFulfilled: number;
  postsPublished: number;
  totalEngagements: number;
  profileCompletionScore: number;
  activeCs: number;
  isBetaTester: boolean;
}

// Badge slug → evaluation function
const BADGE_CONDITIONS: Record<string, (data: ActivityData) => boolean> = {
  'first-10': (d) => d.connectionCount >= 10,
  'growing-network': (d) => d.connectionCount >= 50,
  'global-connector': (d) => d.countrySpan >= 10,
  'event-host': (d) => d.eventsHosted >= 1,
  'serial-host': (d) => d.eventsHosted >= 5,
  'community-gatherer': (d) => d.eventsAttended >= 20,
  'space-creator': (d) => d.spacesCreated >= 1,
  'team-player': (d) => d.spacesJoined >= 5,
  'first-offer': (d) => d.opportunitiesPosted >= 1,
  'skill-sharer': (d) => d.opportunitiesFulfilled >= 5,
  'storyteller': (d) => d.postsPublished >= 1,
  'thought-leader': (d) => d.totalEngagements >= 100,
  'five-cs-explorer': (d) => d.activeCs >= 5,
  'alpha-pioneer': (d) => d.isBetaTester,
  'profile-pro': (d) => d.profileCompletionScore >= 100,
};

/**
 * Gather activity data for badge evaluation
 */
export async function gatherActivityData(userId: string): Promise<ActivityData> {
  const [
    connectionResult,
    eventsHostedResult,
    eventsAttendedResult,
    spacesCreatedResult,
    spacesJoinedResult,
    oppsPostedResult,
    oppsFulfilledResult,
    postsResult,
    profileResult,
  ] = await Promise.all([
    supabase
      .from('connections')
      .select('*', { count: 'exact', head: true })
      .or(`requester_id.eq.${userId},recipient_id.eq.${userId}`)
      .eq('status', 'accepted'),
    supabase
      .from('events')
      .select('*', { count: 'exact', head: true })
      .eq('organizer_id', userId),
    supabase
      .from('event_attendees')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId),
    supabase
      .from('spaces')
      .select('*', { count: 'exact', head: true })
      .eq('created_by', userId),
    supabase
      .from('space_members')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId),
    supabase
      .from('opportunities')
      .select('*', { count: 'exact', head: true })
      .eq('created_by', userId),
    supabase
      .from('opportunities')
      .select('*', { count: 'exact', head: true })
      .eq('created_by', userId)
      .eq('status', 'fulfilled'),
    supabase
      .from('posts')
      .select('*', { count: 'exact', head: true })
      .eq('author_id', userId),
    supabase
      .from('profiles')
      .select('profile_completion_score, is_beta_tester')
      .eq('id', userId)
      .single(),
  ]);

  // Country span
  let countrySpan = 0;
  const { data: connUsers } = await supabase
    .from('connections')
    .select('requester_id, recipient_id')
    .or(`requester_id.eq.${userId},recipient_id.eq.${userId}`)
    .eq('status', 'accepted')
    .limit(200);

  if (connUsers && connUsers.length > 0) {
    const connectedIds = connUsers.map(c =>
      c.requester_id === userId ? c.recipient_id : c.requester_id
    );
    const { data: profiles } = await supabase
      .from('profiles')
      .select('current_country')
      .in('id', connectedIds.slice(0, 100));
    countrySpan = new Set(
      (profiles ?? []).map(p => p.current_country).filter(Boolean)
    ).size;
  }

  // Total engagements on posts
  let totalEngagements = 0;
  try {
    const { count: reactions } = await supabase
      .from('post_reactions')
      .select('*, posts!inner(author_id)', { count: 'exact', head: true })
      .eq('posts.author_id', userId);
    const { count: comments } = await supabase
      .from('post_comments')
      .select('*, posts!inner(author_id)', { count: 'exact', head: true })
      .eq('posts.author_id', userId);
    totalEngagements = (reactions ?? 0) + (comments ?? 0);
  } catch {
    // Skip
  }

  // Count active Cs
  const connectionCount = connectionResult.count ?? 0;
  const eventsHosted = eventsHostedResult.count ?? 0;
  const eventsAttended = eventsAttendedResult.count ?? 0;
  const spacesCreated = spacesCreatedResult.count ?? 0;
  const spacesJoined = spacesJoinedResult.count ?? 0;
  const oppsPosted = oppsPostedResult.count ?? 0;
  const postsPublished = postsResult.count ?? 0;

  let activeCs = 0;
  if (connectionCount > 0) activeCs++;
  if (eventsHosted > 0 || eventsAttended > 0) activeCs++;
  if (spacesCreated > 0 || spacesJoined > 0) activeCs++;
  if (oppsPosted > 0) activeCs++;
  if (postsPublished > 0) activeCs++;

  return {
    connectionCount,
    countrySpan,
    eventsHosted,
    eventsAttended,
    spacesCreated,
    spacesJoined,
    opportunitiesPosted: oppsPosted,
    opportunitiesFulfilled: oppsFulfilledResult.count ?? 0,
    postsPublished,
    totalEngagements,
    profileCompletionScore: profileResult.data?.profile_completion_score ?? 0,
    activeCs,
    isBetaTester: profileResult.data?.is_beta_tester ?? false,
  };
}

/**
 * Evaluate badges for a user and award any newly earned ones.
 * Returns list of newly earned badge slugs.
 */
export async function evaluateBadges(userId: string): Promise<string[]> {
  try {
    const activityData = await gatherActivityData(userId);

    // Get all badge definitions
    const { data: definitions } = await supabase
      .from('badge_definitions' as any)
      .select('*')
      .order('sort_order');

    if (!definitions || definitions.length === 0) return [];

    // Get user's existing badges
    const { data: existingBadges } = await supabase
      .from('user_badges' as any)
      .select('badge_id')
      .eq('user_id', userId);

    const existingBadgeIds = new Set(
      (existingBadges ?? []).map((b: any) => b.badge_id)
    );

    const newlyEarned: string[] = [];

    for (const def of definitions as unknown as BadgeDefinition[]) {
      // Skip if already earned
      if (existingBadgeIds.has(def.id)) continue;

      // Check condition
      const condition = BADGE_CONDITIONS[def.slug];
      if (!condition) continue;

      if (condition(activityData)) {
        // Award badge
        const { error } = await supabase
          .from('user_badges' as any)
          .insert({
            user_id: userId,
            badge_id: def.id,
          });

        if (!error) {
          newlyEarned.push(def.slug);

          // Send notification
          await createNotification({
            user_id: userId,
            type: 'badge_earned',
            title: `You earned the ${def.name} badge!`,
            message: def.description,
            link_url: '/dna/profile/edit',
            payload: {
              badge_slug: def.slug,
              badge_icon: def.icon,
            },
          });
        }
      }
    }

    return newlyEarned;
  } catch (err) {
    logger.warn('BadgeService', 'Failed to evaluate badges', err);
    return [];
  }
}

/**
 * Get all badges for a user with definitions
 */
export async function getUserBadges(userId: string): Promise<UserBadge[]> {
  try {
    const { data } = await supabase
      .from('user_badges' as any)
      .select(`
        *,
        badge:badge_definitions(*)
      `)
      .eq('user_id', userId)
      .order('earned_at', { ascending: false });

    return (data ?? []) as unknown as UserBadge[];
  } catch {
    return [];
  }
}

/**
 * Get all badge definitions
 */
export async function getAllBadgeDefinitions(): Promise<BadgeDefinition[]> {
  try {
    const { data } = await supabase
      .from('badge_definitions' as any)
      .select('*')
      .order('sort_order');

    return (data ?? []) as unknown as BadgeDefinition[];
  } catch {
    return [];
  }
}

/**
 * Toggle featured status on a badge (max 3 featured)
 */
export async function toggleBadgeFeatured(
  userId: string,
  userBadgeId: string,
  featured: boolean
): Promise<boolean> {
  try {
    if (featured) {
      // Check current featured count
      const { count } = await supabase
        .from('user_badges' as any)
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .eq('is_featured', true);

      if ((count ?? 0) >= 3) return false;
    }

    const { error } = await supabase
      .from('user_badges' as any)
      .update({ is_featured: featured })
      .eq('id', userBadgeId)
      .eq('user_id', userId);

    return !error;
  } catch {
    return false;
  }
}
