// src/services/collaborateService.ts
// DNA COLLABORATE Phase 1: Service Layer

import { supabase } from '@/integrations/supabase/client';
import type {
  CollaborateSpace,
  SpaceTemplate,
  SpaceMember,
  SpaceRole,
  Initiative,
  Milestone,
  CollaborateTask,
  CollaborateNudge,
  SpaceActivityLog,
  CreateSpaceInput,
  CreateInitiativeInput,
  CreateMilestoneInput,
  CreateTaskInput,
  SendNudgeInput,
  CreateRoleInput,
  DefaultRole,
  SpaceFilters,
  TaskFilters,
  SpaceStats,
} from '@/types/collaborate';

// ============================================
// TEMPLATES
// ============================================

export async function getSpaceTemplates(): Promise<SpaceTemplate[]> {
  const { data, error } = await supabase
    .from('space_templates')
    .select('*')
    .eq('is_active', true)
    .order('category');

  if (error) throw error;
  return (data || []) as SpaceTemplate[];
}

export async function getSpaceTemplate(id: string): Promise<SpaceTemplate | null> {
  const { data, error } = await supabase
    .from('space_templates')
    .select('*')
    .eq('id', id)
    .single();

  if (error) throw error;
  return data as SpaceTemplate;
}

export async function getTemplatesByCategory(category: string): Promise<SpaceTemplate[]> {
  const { data, error } = await supabase
    .from('space_templates')
    .select('*')
    .eq('category', category)
    .eq('is_active', true)
    .order('name');

  if (error) throw error;
  return (data || []) as SpaceTemplate[];
}

// ============================================
// SPACES
// ============================================

export async function createSpace(input: CreateSpaceInput, userId: string): Promise<CollaborateSpace> {
  // Generate slug from name if not provided
  const slug = input.slug || input.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

  const { data, error } = await supabase
    .from('spaces')
    .insert({
      name: input.name,
      slug,
      tagline: input.tagline,
      description: input.description,
      space_type: input.space_type || 'project',
      template_id: input.template_id,
      privacy_level: input.privacy_level || 'public',
      visibility: input.visibility || 'public',
      cover_image_url: input.cover_image_url,
      source_type: input.source_type,
      source_id: input.source_id,
      focus_areas: input.focus_areas || [],
      region: input.region,
      created_by: userId,
    })
    .select()
    .single();

  if (error) throw error;
  return data as CollaborateSpace;
}

export async function createSpaceFromTemplate(
  templateId: string,
  input: Omit<CreateSpaceInput, 'template_id'>,
  userId: string
): Promise<CollaborateSpace> {
  // Get template
  const template = await getSpaceTemplate(templateId);
  if (!template) throw new Error('Template not found');

  // Create space
  const space = await createSpace(
    { ...input, template_id: templateId },
    userId
  );

  // Create default roles from template
  if (template.default_roles && template.default_roles.length > 0) {
    const roles = template.default_roles.map((role: DefaultRole, index: number) => ({
      space_id: space.id,
      title: role.title,
      description: role.description,
      permissions: role.permissions,
      is_lead: role.is_lead,
      order_index: index,
    }));

    const { error: rolesError } = await supabase
      .from('space_roles')
      .insert(roles);

    if (rolesError) console.error('Error creating roles:', rolesError);

    // Assign creator to lead role
    const leadRole = roles.find(r => r.is_lead);
    if (leadRole) {
      const { data: createdRoles } = await supabase
        .from('space_roles')
        .select('id')
        .eq('space_id', space.id)
        .eq('is_lead', true)
        .single();

      if (createdRoles) {
        await supabase
          .from('space_members')
          .update({ role_id: createdRoles.id })
          .eq('space_id', space.id)
          .eq('user_id', userId);
      }
    }
  }

  // Log activity
  await logActivity(space.id, userId, 'space_created', 'space', space.id, {
    template_id: templateId,
    template_name: template.name,
  });

  return space;
}

export async function getSpace(id: string): Promise<CollaborateSpace | null> {
  const { data, error } = await supabase
    .from('spaces')
    .select(`
      *,
      template:space_templates(*)
    `)
    .eq('id', id)
    .single();

  if (error) throw error;

  // Get counts separately
  const [membersResult, initiativesResult] = await Promise.all([
    supabase.from('space_members').select('id', { count: 'exact' }).eq('space_id', id),
    supabase.from('initiatives').select('id', { count: 'exact' }).eq('space_id', id),
  ]);

  return {
    ...data,
    member_count: membersResult.count || 0,
    initiative_count: initiativesResult.count || 0,
  } as CollaborateSpace;
}

export async function getSpaceBySlug(slug: string): Promise<CollaborateSpace | null> {
  const { data, error } = await supabase
    .from('spaces')
    .select(`
      *,
      template:space_templates(*)
    `)
    .eq('slug', slug)
    .single();

  if (error) throw error;
  return data as CollaborateSpace;
}

export async function getUserSpaces(userId: string): Promise<CollaborateSpace[]> {
  // Get spaces where user is a member
  const { data: memberships, error: membershipsError } = await supabase
    .from('space_members')
    .select('space_id')
    .eq('user_id', userId)
    .eq('status', 'active');

  if (membershipsError) throw membershipsError;
  if (!memberships || memberships.length === 0) return [];

  const spaceIds = memberships.map(m => m.space_id);

  const { data, error } = await supabase
    .from('spaces')
    .select(`
      *,
      template:space_templates(name, icon)
    `)
    .in('id', spaceIds)
    .neq('status', 'archived')
    .order('last_activity_at', { ascending: false });

  if (error) throw error;
  return (data || []) as CollaborateSpace[];
}

export async function updateSpace(id: string, updates: Partial<CollaborateSpace>): Promise<CollaborateSpace> {
  const { data, error } = await supabase
    .from('spaces')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data as CollaborateSpace;
}

export async function getPublicSpaces(filters?: SpaceFilters): Promise<CollaborateSpace[]> {
  let query = supabase
    .from('spaces')
    .select(`
      *,
      template:space_templates(name, icon, category)
    `)
    .eq('visibility', 'public')
    .eq('status', 'active');

  if (filters?.search) {
    query = query.or(`name.ilike.%${filters.search}%,description.ilike.%${filters.search}%`);
  }

  const { data, error } = await query.order('last_activity_at', { ascending: false });

  if (error) throw error;

  // Filter by category in memory if needed (since it's on joined table)
  let results = data || [];
  if (filters?.category) {
    results = results.filter((s: any) => s.template?.category === filters.category);
  }

  return results as CollaborateSpace[];
}

export async function getSpaceStats(spaceId: string): Promise<SpaceStats> {
  const [membersResult, initiativesResult, tasksResult] = await Promise.all([
    supabase.from('space_members').select('id', { count: 'exact' }).eq('space_id', spaceId).eq('status', 'active'),
    supabase.from('initiatives').select('id, status').eq('space_id', spaceId),
    supabase.from('collaborate_tasks').select('id, status, due_date').eq('space_id', spaceId),
  ]);

  const initiatives = initiativesResult.data || [];
  const tasks = tasksResult.data || [];
  const now = new Date().toISOString();

  return {
    total_members: membersResult.count || 0,
    active_initiatives: initiatives.filter(i => i.status === 'active').length,
    completed_initiatives: initiatives.filter(i => i.status === 'completed').length,
    total_tasks: tasks.length,
    completed_tasks: tasks.filter(t => t.status === 'done').length,
    overdue_tasks: tasks.filter(t => t.due_date && t.due_date < now && t.status !== 'done').length,
  };
}

// ============================================
// SPACE MEMBERS
// ============================================

export async function getSpaceMembers(spaceId: string): Promise<SpaceMember[]> {
  const { data, error } = await supabase
    .from('space_members')
    .select(`
      *,
      user:profiles(id, full_name, avatar_url, username),
      space_role:space_roles(*)
    `)
    .eq('space_id', spaceId)
    .eq('status', 'active');

  if (error) throw error;
  return (data || []) as SpaceMember[];
}

export async function inviteMember(
  spaceId: string,
  userId: string,
  roleId?: string,
  invitedBy?: string
): Promise<SpaceMember> {
  const { data, error } = await supabase
    .from('space_members')
    .insert({
      space_id: spaceId,
      user_id: userId,
      role_id: roleId,
      role: 'contributor',
      status: 'invited',
      invited_by: invitedBy,
    })
    .select()
    .single();

  if (error) throw error;

  if (invitedBy) {
    await logActivity(spaceId, invitedBy, 'member_invited', 'member', data.id, { invited_user_id: userId });
  }

  return data as SpaceMember;
}

export async function acceptInvite(spaceId: string, userId: string): Promise<SpaceMember> {
  const { data, error } = await supabase
    .from('space_members')
    .update({ status: 'active', joined_at: new Date().toISOString() })
    .eq('space_id', spaceId)
    .eq('user_id', userId)
    .select()
    .single();

  if (error) throw error;

  await logActivity(spaceId, userId, 'member_joined', 'member', data.id);

  return data as SpaceMember;
}

export async function removeMember(spaceId: string, userId: string): Promise<void> {
  const { error } = await supabase
    .from('space_members')
    .update({ status: 'removed' })
    .eq('space_id', spaceId)
    .eq('user_id', userId);

  if (error) throw error;
}

export async function getUserMembership(spaceId: string, userId: string): Promise<SpaceMember | null> {
  const { data, error } = await supabase
    .from('space_members')
    .select(`
      *,
      space_role:space_roles(*)
    `)
    .eq('space_id', spaceId)
    .eq('user_id', userId)
    .single();

  if (error && error.code !== 'PGRST116') throw error;
  return data as SpaceMember | null;
}

// ============================================
// SPACE ROLES
// ============================================

export async function getSpaceRoles(spaceId: string): Promise<SpaceRole[]> {
  const { data, error } = await supabase
    .from('space_roles')
    .select('*')
    .eq('space_id', spaceId)
    .order('order_index');

  if (error) throw error;
  return (data || []) as SpaceRole[];
}

export async function createSpaceRole(input: CreateRoleInput): Promise<SpaceRole> {
  const { data, error } = await supabase
    .from('space_roles')
    .insert({
      space_id: input.space_id,
      title: input.title,
      description: input.description,
      required_skills: input.required_skills,
      permissions: {
        can_edit_space: false,
        can_invite_members: false,
        can_create_initiatives: false,
        can_assign_tasks: false,
        can_send_nudges: false,
        can_manage_roles: false,
        ...input.permissions,
      },
      is_lead: input.is_lead || false,
      order_index: input.order_index || 0,
    })
    .select()
    .single();

  if (error) throw error;
  return data as SpaceRole;
}

export async function assignRole(spaceId: string, userId: string, roleId: string): Promise<void> {
  const { error } = await supabase
    .from('space_members')
    .update({ role_id: roleId })
    .eq('space_id', spaceId)
    .eq('user_id', userId);

  if (error) throw error;
}

// ============================================
// INITIATIVES
// ============================================

export async function createInitiative(input: CreateInitiativeInput, userId: string): Promise<Initiative> {
  const { data, error } = await supabase
    .from('initiatives')
    .insert({
      space_id: input.space_id,
      title: input.title,
      description: input.description,
      target_date: input.target_date,
      created_by: userId,
    })
    .select()
    .single();

  if (error) throw error;

  await logActivity(input.space_id, userId, 'initiative_created', 'initiative', data.id, { title: input.title });

  return data as Initiative;
}

export async function getSpaceInitiatives(spaceId: string): Promise<Initiative[]> {
  const { data, error } = await supabase
    .from('initiatives')
    .select(`
      *,
      milestones(*)
    `)
    .eq('space_id', spaceId)
    .order('order_index');

  if (error) throw error;

  // Get task counts for each initiative
  const initiativeIds = (data || []).map(i => i.id);
  if (initiativeIds.length > 0) {
    const { data: tasks } = await supabase
      .from('collaborate_tasks')
      .select('initiative_id, status')
      .in('initiative_id', initiativeIds);

    const taskCounts = (tasks || []).reduce((acc: Record<string, { total: number; completed: number }>, task) => {
      if (!acc[task.initiative_id]) {
        acc[task.initiative_id] = { total: 0, completed: 0 };
      }
      acc[task.initiative_id].total++;
      if (task.status === 'done') {
        acc[task.initiative_id].completed++;
      }
      return acc;
    }, {});

    return (data || []).map(initiative => ({
      ...initiative,
      task_count: taskCounts[initiative.id]?.total || 0,
      completed_task_count: taskCounts[initiative.id]?.completed || 0,
    })) as Initiative[];
  }

  return (data || []) as Initiative[];
}

export async function getInitiative(id: string): Promise<Initiative | null> {
  const { data, error } = await supabase
    .from('initiatives')
    .select(`
      *,
      milestones(*),
      tasks:collaborate_tasks(*)
    `)
    .eq('id', id)
    .single();

  if (error) throw error;
  return data as Initiative;
}

export async function updateInitiative(id: string, updates: Partial<Initiative>): Promise<Initiative> {
  const { data, error } = await supabase
    .from('initiatives')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data as Initiative;
}

export async function completeInitiative(id: string, userId: string): Promise<Initiative> {
  const initiative = await updateInitiative(id, {
    status: 'completed',
    completed_at: new Date().toISOString(),
  });

  await logActivity(initiative.space_id, userId, 'initiative_completed', 'initiative', id);

  return initiative;
}

// ============================================
// MILESTONES
// ============================================

export async function createMilestone(input: CreateMilestoneInput): Promise<Milestone> {
  const { data, error } = await supabase
    .from('milestones')
    .insert({
      initiative_id: input.initiative_id,
      title: input.title,
      description: input.description,
      target_date: input.target_date,
    })
    .select()
    .single();

  if (error) throw error;
  return data as Milestone;
}

export async function getInitiativeMilestones(initiativeId: string): Promise<Milestone[]> {
  const { data, error } = await supabase
    .from('milestones')
    .select('*')
    .eq('initiative_id', initiativeId)
    .order('order_index');

  if (error) throw error;
  return (data || []) as Milestone[];
}

export async function updateMilestone(id: string, updates: Partial<Milestone>): Promise<Milestone> {
  const { data, error } = await supabase
    .from('milestones')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data as Milestone;
}

export async function completeMilestone(id: string): Promise<Milestone> {
  return updateMilestone(id, {
    status: 'completed',
    completion_date: new Date().toISOString(),
  });
}

// ============================================
// TASKS
// ============================================

export async function createTask(input: CreateTaskInput, userId: string): Promise<CollaborateTask> {
  const { data, error } = await supabase
    .from('collaborate_tasks')
    .insert({
      space_id: input.space_id,
      initiative_id: input.initiative_id,
      milestone_id: input.milestone_id,
      title: input.title,
      description: input.description,
      priority: input.priority || 'medium',
      due_date: input.due_date,
      assigned_to: input.assigned_to,
      assigned_by: input.assigned_to ? userId : null,
      created_by: userId,
    })
    .select()
    .single();

  if (error) throw error;

  await logActivity(input.space_id, userId, 'task_created', 'task', data.id, { title: input.title });

  return data as CollaborateTask;
}

export async function getSpaceTasks(spaceId: string, filters?: TaskFilters): Promise<CollaborateTask[]> {
  let query = supabase
    .from('collaborate_tasks')
    .select(`
      *,
      assignee:profiles!collaborate_tasks_assigned_to_fkey(id, full_name, avatar_url, username)
    `)
    .eq('space_id', spaceId);

  if (filters?.initiative_id) {
    query = query.eq('initiative_id', filters.initiative_id);
  }
  if (filters?.milestone_id) {
    query = query.eq('milestone_id', filters.milestone_id);
  }
  if (filters?.status) {
    query = query.eq('status', filters.status);
  }
  if (filters?.priority) {
    query = query.eq('priority', filters.priority);
  }
  if (filters?.assigned_to) {
    query = query.eq('assigned_to', filters.assigned_to);
  }
  if (filters?.overdue) {
    const now = new Date().toISOString();
    query = query.lt('due_date', now).neq('status', 'done');
  }

  const { data, error } = await query.order('order_index');

  if (error) throw error;
  return (data || []) as CollaborateTask[];
}

export async function getUserTasks(userId: string): Promise<CollaborateTask[]> {
  const { data, error } = await supabase
    .from('collaborate_tasks')
    .select(`
      *,
      space:spaces(id, name, slug)
    `)
    .eq('assigned_to', userId)
    .neq('status', 'done')
    .order('due_date', { ascending: true, nullsFirst: false });

  if (error) throw error;
  return (data || []) as CollaborateTask[];
}

export async function updateTask(id: string, updates: Partial<CollaborateTask>): Promise<CollaborateTask> {
  const updateData: Partial<CollaborateTask> & { updated_at: string } = {
    ...updates,
    updated_at: new Date().toISOString(),
  };

  if (updates.status === 'done' && !updates.completed_at) {
    updateData.completed_at = new Date().toISOString();
  }

  const { data, error } = await supabase
    .from('collaborate_tasks')
    .update(updateData)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data as CollaborateTask;
}

export async function assignTask(taskId: string, userId: string, assignedBy: string): Promise<CollaborateTask> {
  const task = await updateTask(taskId, {
    assigned_to: userId,
    assigned_by: assignedBy,
  });

  await logActivity(task.space_id, assignedBy, 'task_assigned', 'task', taskId, { assigned_to: userId });

  return task;
}

// ============================================
// NUDGES
// ============================================

export async function sendNudge(input: SendNudgeInput, sentBy: string): Promise<CollaborateNudge> {
  const { data, error } = await supabase
    .from('collaborate_nudges')
    .insert({
      space_id: input.space_id,
      task_id: input.task_id,
      target_user_id: input.target_user_id,
      sent_by: sentBy,
      type: input.type || 'manual',
      tone: input.tone || 'gentle',
      message: input.message,
    })
    .select()
    .single();

  if (error) throw error;

  // Update task nudge count if task-specific
  if (input.task_id) {
    const { data: task } = await supabase
      .from('collaborate_tasks')
      .select('nudge_count')
      .eq('id', input.task_id)
      .single();

    await supabase
      .from('collaborate_tasks')
      .update({
        nudge_count: (task?.nudge_count || 0) + 1,
        last_nudge_at: new Date().toISOString(),
      })
      .eq('id', input.task_id);
  }

  return data as CollaborateNudge;
}

export async function getUserNudges(userId: string): Promise<CollaborateNudge[]> {
  const { data, error } = await supabase
    .from('collaborate_nudges')
    .select(`
      *,
      task:collaborate_tasks(*),
      sender:profiles!collaborate_nudges_sent_by_fkey(id, full_name, avatar_url)
    `)
    .eq('target_user_id', userId)
    .is('acknowledged_at', null)
    .order('sent_at', { ascending: false });

  if (error) throw error;
  return (data || []) as CollaborateNudge[];
}

export async function acknowledgeNudge(nudgeId: string): Promise<void> {
  const { error } = await supabase
    .from('collaborate_nudges')
    .update({ acknowledged_at: new Date().toISOString() })
    .eq('id', nudgeId);

  if (error) throw error;
}

export async function canUserNudge(
  spaceId: string,
  userId: string,
  targetUserId: string,
  taskId?: string
): Promise<boolean> {
  // Check if user has nudge permission in this space
  const { data: member } = await supabase
    .from('space_members')
    .select(`
      space_role:space_roles(permissions)
    `)
    .eq('space_id', spaceId)
    .eq('user_id', userId)
    .single();

  const permissions = (member?.space_role as any)?.permissions;
  if (!permissions?.can_send_nudges) {
    return false;
  }

  // Check rate limit: 1 nudge per person per task per 48 hours
  const cutoff = new Date();
  cutoff.setHours(cutoff.getHours() - 48);

  let query = supabase
    .from('collaborate_nudges')
    .select('id')
    .eq('space_id', spaceId)
    .eq('sent_by', userId)
    .eq('target_user_id', targetUserId)
    .gte('sent_at', cutoff.toISOString());

  if (taskId) {
    query = query.eq('task_id', taskId);
  }

  const { data: recentNudges } = await query;

  return !recentNudges || recentNudges.length === 0;
}

// ============================================
// ACTIVITY LOG
// ============================================

export async function logActivity(
  spaceId: string,
  userId: string,
  actionType: string,
  entityType?: string,
  entityId?: string,
  metadata?: Record<string, unknown>
): Promise<void> {
  const { error } = await supabase
    .from('space_activity_log')
    .insert({
      space_id: spaceId,
      user_id: userId,
      action_type: actionType,
      entity_type: entityType,
      entity_id: entityId,
      metadata,
    });

  if (error) console.error('Error logging activity:', error);
}

export async function getSpaceActivity(
  spaceId: string,
  limit = 20
): Promise<SpaceActivityLog[]> {
  const { data, error } = await supabase
    .from('space_activity_log')
    .select(`
      *,
      user:profiles(id, full_name, avatar_url)
    `)
    .eq('space_id', spaceId)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) throw error;
  return (data || []) as SpaceActivityLog[];
}

// ============================================
// OVERDUE TASKS (for automated nudges)
// ============================================

export async function getOverdueTasks(spaceId?: string): Promise<CollaborateTask[]> {
  const now = new Date().toISOString();

  let query = supabase
    .from('collaborate_tasks')
    .select(`
      *,
      space:spaces(id, name, slug),
      assignee:profiles!collaborate_tasks_assigned_to_fkey(id, full_name, avatar_url)
    `)
    .lt('due_date', now)
    .neq('status', 'done')
    .not('assigned_to', 'is', null);

  if (spaceId) {
    query = query.eq('space_id', spaceId);
  }

  const { data, error } = await query;

  if (error) throw error;
  return (data || []) as CollaborateTask[];
}
