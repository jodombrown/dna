/**
 * DNA | DIA COLLABORATE Card Generators
 *
 * Generates intelligence cards for the Collaborate module:
 * - Stalled Space Alert
 * - Skill Match for Space
 * - Space Milestone
 * - Task Reminder
 */

import { supabase } from '@/integrations/supabase/client';
import type { DIACard, DIACardAction } from '@/services/diaCardService';
import { MODULE_ACCENT_COLORS } from '@/services/diaCardService';

const ACCENT = MODULE_ACCENT_COLORS.collaborate;

// ── Card Type 1: Stalled Space Alert ───────────────

async function generateStalledSpace(userId: string): Promise<DIACard | null> {
  try {
    // Get spaces the user is a member of
    const { data: memberships } = await supabase
      .from('space_members')
      .select('space_id')
      .eq('user_id', userId)
      .eq('status', 'active');

    if (!memberships || memberships.length === 0) return null;

    const spaceIds = memberships.map(m => m.space_id);
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

    // Find spaces with no recent activity
    const { data: spaces } = await supabase
      .from('spaces')
      .select('id, name, updated_at')
      .in('id', spaceIds)
      .lt('updated_at', sevenDaysAgo)
      .limit(5);

    if (!spaces || spaces.length === 0) return null;

    const space = spaces[0];
    const daysSinceUpdate = Math.floor(
      (Date.now() - new Date(space.updated_at).getTime()) / (24 * 60 * 60 * 1000)
    );

    return {
      id: `collab-stalled-${space.id}`,
      category: 'collaborate',
      cardType: 'stalled_space',
      headline: `${space.name} has been quiet`,
      body: `No activity in ${daysSinceUpdate} days. Check in with your team to keep the momentum going.`,
      accentColor: ACCENT,
      icon: 'AlertCircle',
      priority: 60,
      actions: [
        {
          label: 'Visit Space',
          type: 'navigate',
          payload: { url: `/dna/collaborate/spaces/${space.id}` },
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
        spaceId: space.id,
        spaceName: space.name,
        daysSinceUpdate,
      },
      dismissKey: `stalled-${space.id}`,
    };
  } catch {
    return null;
  }
}

// ── Card Type 2: Skill Match for Space ─────────────

async function generateSkillMatch(userId: string): Promise<DIACard | null> {
  try {
    const { data: profile } = await supabase
      .from('profiles')
      .select('skills')
      .eq('id', userId)
      .single();

    if (!profile) return null;

    const userSkills: string[] = (profile.skills as string[]) || [];
    if (userSkills.length === 0) return null;

    // Get user's current space memberships to exclude
    const { data: memberships } = await supabase
      .from('space_members')
      .select('space_id')
      .eq('user_id', userId);

    const memberSpaceIds = new Set((memberships || []).map(m => m.space_id));

    // Find spaces seeking skills the user has
    const { data: spaces } = await supabase
      .from('spaces')
      .select('id, name, description, focus_areas, status')
      .eq('status', 'active')
      .limit(20);

    if (!spaces || spaces.length === 0) return null;

    let bestSpace: typeof spaces[0] | null = null;
    let bestMatchSkills: string[] = [];

    for (const space of spaces) {
      if (memberSpaceIds.has(space.id)) continue;
      const focusAreas: string[] = (space.focus_areas as string[]) || [];
      const descLower = (space.description || '').toLowerCase();
      const matched = userSkills.filter(
        s => focusAreas.some(f => f.toLowerCase().includes(s.toLowerCase())) ||
          descLower.includes(s.toLowerCase())
      );
      if (matched.length > bestMatchSkills.length) {
        bestMatchSkills = matched;
        bestSpace = space;
      }
    }

    if (!bestSpace || bestMatchSkills.length === 0) return null;

    return {
      id: `collab-skill-${bestSpace.id}`,
      category: 'collaborate',
      cardType: 'skill_match',
      headline: `${bestSpace.name} needs your skills`,
      body: `This space is looking for expertise in ${bestMatchSkills.slice(0, 2).join(' and ')}. Your skills are a match.`,
      accentColor: ACCENT,
      icon: 'Wrench',
      priority: 65,
      actions: [
        {
          label: 'View Space',
          type: 'navigate',
          payload: { url: `/dna/collaborate/spaces/${bestSpace.id}` },
          isPrimary: true,
        },
        {
          label: 'Not interested',
          type: 'dismiss',
          payload: {},
          isPrimary: false,
        },
      ],
      metadata: {
        spaceId: bestSpace.id,
        spaceName: bestSpace.name,
        matchedSkills: bestMatchSkills,
      },
      dismissKey: `skill-match-${bestSpace.id}`,
    };
  } catch {
    return null;
  }
}

// ── Card Type 3: Space Milestone ───────────────────

async function generateSpaceMilestone(userId: string): Promise<DIACard | null> {
  try {
    const { data: memberships } = await supabase
      .from('space_members')
      .select('space_id')
      .eq('user_id', userId)
      .eq('status', 'active');

    if (!memberships || memberships.length === 0) return null;

    const spaceIds = memberships.map(m => m.space_id);

    // Check tasks in user's spaces
    for (const spaceId of spaceIds.slice(0, 5)) {
      const { count: totalTasks } = await supabase
        .from('space_tasks')
        .select('*', { count: 'exact', head: true })
        .eq('space_id', spaceId);

      const { count: completedTasks } = await supabase
        .from('space_tasks')
        .select('*', { count: 'exact', head: true })
        .eq('space_id', spaceId)
        .eq('status', 'completed');

      const total = totalTasks || 0;
      const completed = completedTasks || 0;
      if (total < 4) continue;

      const percentage = Math.round((completed / total) * 100);
      const milestones = [25, 50, 75, 100];
      const hitMilestone = milestones.find(m => percentage >= m && percentage < m + 10);

      if (!hitMilestone) continue;

      const { data: space } = await supabase
        .from('spaces')
        .select('name')
        .eq('id', spaceId)
        .single();

      if (!space) continue;

      return {
        id: `collab-milestone-${spaceId}-${hitMilestone}`,
        category: 'collaborate',
        cardType: 'space_milestone',
        headline: `${space.name} hit ${hitMilestone}% completion`,
        body: `${completed} of ${total} tasks done. ${hitMilestone === 100 ? 'Congratulations on finishing!' : 'Keep the momentum going.'}`,
        accentColor: ACCENT,
        icon: 'Trophy',
        priority: 45,
        actions: [
          {
            label: 'View Space',
            type: 'navigate',
            payload: { url: `/dna/collaborate/spaces/${spaceId}` },
            isPrimary: true,
          },
        ],
        metadata: {
          spaceId,
          spaceName: space.name,
          completedTasks: completed,
          totalTasks: total,
          percentage,
        },
        dismissKey: `milestone-${spaceId}-${hitMilestone}`,
      };
    }

    return null;
  } catch {
    return null;
  }
}

// ── Card Type 4: Task Reminder ─────────────────────

async function generateTaskReminder(userId: string): Promise<DIACard | null> {
  try {
    const twoDaysFromNow = new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString();
    const now = new Date().toISOString();

    // Find tasks assigned to user approaching deadline
    const { data: tasks } = await supabase
      .from('space_tasks')
      .select('id, title, due_date, space_id, status')
      .eq('assignee_id', userId)
      .neq('status', 'completed')
      .lte('due_date', twoDaysFromNow)
      .gte('due_date', now)
      .order('due_date', { ascending: true })
      .limit(3);

    if (!tasks || tasks.length === 0) return null;

    const task = tasks[0];

    const { data: space } = await supabase
      .from('spaces')
      .select('name')
      .eq('id', task.space_id)
      .single();

    const dueDate = new Date(task.due_date);
    const hoursUntilDue = Math.round((dueDate.getTime() - Date.now()) / (60 * 60 * 1000));
    const timeLabel = hoursUntilDue < 24 ? `${hoursUntilDue} hours` : `${Math.round(hoursUntilDue / 24)} days`;

    return {
      id: `collab-task-${task.id}`,
      category: 'collaborate',
      cardType: 'task_reminder',
      headline: `Task due in ${timeLabel}`,
      body: `"${task.title}" in ${space?.name || 'your space'} is approaching its deadline.`,
      accentColor: ACCENT,
      icon: 'Clock',
      priority: 80,
      actions: [
        {
          label: 'View Task',
          type: 'navigate',
          payload: { url: `/dna/collaborate/spaces/${task.space_id}` },
          isPrimary: true,
        },
      ],
      metadata: {
        taskId: task.id,
        taskTitle: task.title,
        spaceId: task.space_id,
        spaceName: space?.name,
        hoursUntilDue,
      },
      dismissKey: `task-${task.id}`,
    };
  } catch {
    return null;
  }
}

// ── Export ──────────────────────────────────────────

export function generateCollaborateCards(): Array<(userId: string) => Promise<DIACard | null>> {
  return [
    generateStalledSpace,
    generateSkillMatch,
    generateSpaceMilestone,
    generateTaskReminder,
  ];
}
