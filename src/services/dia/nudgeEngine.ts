/**
 * DIA | Nudge Engine Service
 *
 * Generates timely, contextual nudges based on user behavior patterns.
 * DIA's nudges are warm, not nagging — like a well-connected elder.
 *
 * Powers: Notifications, Composer (proactive suggestions), Feed (DIA Cards)
 *
 * Nudge philosophy:
 * - Progressive, not checklist — nudges appear when they matter
 * - Contextual — triggered by user actions, not on a schedule
 * - Value-first — every nudge explains why it benefits the user
 */

import { supabase } from '@/integrations/supabase/client';
import type {
  DIANudge,
  NudgeType,
  NudgePriority,
  NudgeTrigger,
  FiveCModule,
  SuggestionInteraction,
} from '@/types/dia';

/**
 * Profile completion nudge triggers — contextual, not nagging.
 */
const COMPLETION_TRIGGERS: Array<{
  trigger_action: string;
  field: string;
  title: string;
  message: string;
  value: string;
}> = [
  {
    trigger_action: 'browse_opportunities',
    field: 'skills',
    title: 'Add your skills to see match scores',
    message: 'You\'re browsing opportunities. Adding skills helps DIA find the best matches for you.',
    value: 'Immediate: better opportunity matching',
  },
  {
    trigger_action: 'attend_first_event',
    field: 'location',
    title: 'Add your location for local event recommendations',
    message: 'Great that you attended your first event! Share your location to discover more events nearby.',
    value: 'Better event discovery',
  },
  {
    trigger_action: 'make_5_connections',
    field: 'headline',
    title: 'Add a headline so connections know what you do',
    message: 'Your network is growing! A headline helps new connections understand your expertise.',
    value: 'Social proof for your growing network',
  },
  {
    trigger_action: 'create_first_space',
    field: 'professional_background',
    title: 'Add your professional background for credibility',
    message: 'As a space creator, your background builds trust with potential collaborators.',
    value: 'Better team recruitment',
  },
  {
    trigger_action: 'publish_first_story',
    field: 'interests',
    title: 'Add your interests to grow your audience',
    message: 'You\'ve shared your first story. Adding interests helps DIA recommend it to the right readers.',
    value: 'Content discoverability',
  },
];

/**
 * Generate nudges for a user based on their current context and activity.
 */
async function generateNudges(
  userId: string,
  context?: FiveCModule,
): Promise<DIANudge[]> {
  const nudges: DIANudge[] = [];

  // Fetch user profile for completeness check
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();

  if (!profile) return [];

  // Get existing undismissed nudges to avoid duplication
  const { data: existingNudges } = await supabase
    .from('adin_nudges')
    .select('nudge_type, status')
    .eq('user_id', userId)
    .in('status', ['sent', 'snoozed']);

  const existingTypes = new Set((existingNudges || []).map(n => n.nudge_type));

  // 1. Profile completion nudges (contextual)
  if (context) {
    const completionNudge = generateCompletionNudge(profile, context, existingTypes);
    if (completionNudge) nudges.push(completionNudge);
  }

  // 2. Connection suggestions
  if (!existingTypes.has('connection_suggestion')) {
    const connectionNudge = await generateConnectionNudge(userId, profile);
    if (connectionNudge) nudges.push(connectionNudge);
  }

  // 3. Engagement milestones
  const milestoneNudge = await generateMilestoneNudge(userId, existingTypes);
  if (milestoneNudge) nudges.push(milestoneNudge);

  // 4. Reactivation nudges (if user hasn't been active)
  if (!existingTypes.has('reactivation')) {
    const reactivationNudge = await generateReactivationNudge(userId);
    if (reactivationNudge) nudges.push(reactivationNudge);
  }

  return nudges;
}

/**
 * Generate a profile completion nudge based on current context.
 */
function generateCompletionNudge(
  profile: Record<string, unknown>,
  context: FiveCModule,
  existingTypes: Set<string>,
): DIANudge | null {
  if (existingTypes.has('profile_completion')) return null;

  const contextToTrigger: Record<FiveCModule, string> = {
    contribute: 'browse_opportunities',
    convene: 'attend_first_event',
    connect: 'make_5_connections',
    collaborate: 'create_first_space',
    convey: 'publish_first_story',
  };

  const triggerAction = contextToTrigger[context];
  const trigger = COMPLETION_TRIGGERS.find(t => t.trigger_action === triggerAction);
  if (!trigger) return null;

  // Check if the suggested field is already filled
  const fieldValue = profile[trigger.field];
  const isFilled = Array.isArray(fieldValue) ? fieldValue.length > 0 : fieldValue != null && fieldValue !== '';
  if (isFilled) return null;

  return {
    nudge_id: `completion-${trigger.field}-${Date.now()}`,
    user_id: profile.id as string,
    nudge_type: 'profile_completion',
    source_module: context,
    title: trigger.title,
    message: trigger.message,
    action_url: '/dna/settings/profile',
    action_label: 'Complete profile',
    priority: 'medium',
    trigger: {
      trigger_type: trigger.trigger_action,
      trigger_context: { field: trigger.field, value_proposition: trigger.value },
    },
    interaction: 'shown',
    created_at: new Date().toISOString(),
  };
}

/**
 * Generate a connection suggestion nudge.
 */
async function generateConnectionNudge(
  userId: string,
  profile: Record<string, unknown>,
): Promise<DIANudge | null> {
  const { count } = await supabase
    .from('connections')
    .select('*', { count: 'exact', head: true })
    .or(`user_id.eq.${userId},connected_user_id.eq.${userId}`);

  // Only suggest if user has some connections but could use more
  if ((count || 0) >= 20 || (count || 0) === 0) return null;

  return {
    nudge_id: `connection-suggest-${Date.now()}`,
    user_id: userId,
    nudge_type: 'connection_suggestion',
    source_module: 'connect',
    title: 'Expand your diaspora network',
    message: `You have ${count} connections. People with 20+ connections discover 3x more opportunities.`,
    action_url: '/dna/connect',
    action_label: 'Discover people',
    priority: 'low',
    trigger: {
      trigger_type: 'network_size',
      trigger_context: { current_count: count },
    },
    interaction: 'shown',
    created_at: new Date().toISOString(),
  };
}

/**
 * Generate milestone celebration nudges.
 */
async function generateMilestoneNudge(
  userId: string,
  existingTypes: Set<string>,
): Promise<DIANudge | null> {
  if (existingTypes.has('engagement_milestone')) return null;

  const { count: postCount } = await supabase
    .from('posts')
    .select('*', { count: 'exact', head: true })
    .eq('author_id', userId);

  const milestones = [1, 5, 10, 25, 50, 100];
  const hitMilestone = milestones.find(m => postCount === m);

  if (!hitMilestone) return null;

  return {
    nudge_id: `milestone-posts-${hitMilestone}-${Date.now()}`,
    user_id: userId,
    nudge_type: 'engagement_milestone',
    source_module: 'convey',
    title: `${hitMilestone} ${hitMilestone === 1 ? 'story' : 'stories'} shared!`,
    message: hitMilestone === 1
      ? 'You\'ve shared your first story with the diaspora. Your voice matters here.'
      : `You\'ve shared ${hitMilestone} stories. Your contributions are building the diaspora\'s knowledge base.`,
    priority: 'low',
    trigger: {
      trigger_type: 'post_milestone',
      trigger_context: { count: hitMilestone },
    },
    interaction: 'shown',
    created_at: new Date().toISOString(),
  };
}

/**
 * Generate reactivation nudge for dormant users.
 */
async function generateReactivationNudge(userId: string): Promise<DIANudge | null> {
  const { data: recentActivity } = await supabase
    .from('posts')
    .select('created_at')
    .eq('author_id', userId)
    .order('created_at', { ascending: false })
    .limit(1);

  if (!recentActivity || recentActivity.length === 0) return null;

  const lastPost = new Date(recentActivity[0].created_at);
  const daysSince = (Date.now() - lastPost.getTime()) / (24 * 60 * 60 * 1000);

  if (daysSince < 14) return null; // Not dormant

  return {
    nudge_id: `reactivation-${Date.now()}`,
    user_id: userId,
    nudge_type: 'reactivation',
    source_module: 'convey',
    title: 'The network missed your voice',
    message: `It's been ${Math.floor(daysSince)} days since your last post. There are new conversations you might want to join.`,
    action_url: '/dna/feed',
    action_label: 'See what\'s new',
    priority: 'medium',
    trigger: {
      trigger_type: 'dormancy',
      trigger_context: { days_since_last_activity: Math.floor(daysSince) },
    },
    interaction: 'shown',
    created_at: new Date().toISOString(),
  };
}

/**
 * Track user interaction with a nudge for DIA learning.
 */
async function trackNudgeInteraction(
  nudgeId: string,
  interaction: SuggestionInteraction,
): Promise<void> {
  await supabase
    .from('adin_nudges')
    .update({ status: interaction, updated_at: new Date().toISOString() })
    .eq('id', nudgeId);
}

export const nudgeEngineService = {
  generateNudges,
  trackNudgeInteraction,
};
