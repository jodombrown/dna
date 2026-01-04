import { supabase } from '@/integrations/supabase/client';
import { Space, SpaceStatus, SpaceType } from '@/types/spaceTypes';

/**
 * Space Health Status levels
 */
export type SpaceHealthStatus = 'healthy' | 'stalling' | 'at-risk' | 'inactive' | 'complete';

/**
 * Factors that contribute to space health score
 */
export interface SpaceHealthFactors {
  daysSinceLastActivity: number;
  taskCompletionRate: number;
  overdueTasksCount: number;
  memberEngagementRate: number;
  daysActive: number;
  totalTasks: number;
  completedTasks: number;
  totalMembers: number;
  activeMembers: number;
  lastActivityDate: string | null;
}

/**
 * Space health calculation result
 */
export interface SpaceHealthData {
  score: number; // 0-100
  status: SpaceHealthStatus;
  factors: SpaceHealthFactors;
  suggestedActions: string[];
}

/**
 * Space with health data for attention lists
 */
export interface SpaceNeedingAttention extends Space {
  healthData: SpaceHealthData;
  userRole: string;
}

/**
 * Nudge message data
 */
export interface SpaceHealthNudge {
  nudge_type: 'space_stalling' | 'space_at_risk' | 'space_almost_complete' | 'space_inactive_archive';
  message: string;
  priority: 'low' | 'medium' | 'high';
  action_url: string;
  payload: {
    space_id: string;
    space_name: string;
    space_slug: string;
    health_score: number;
    health_status: SpaceHealthStatus;
    factors: SpaceHealthFactors;
    suggested_actions: string[];
  };
}

/**
 * Space Health Service
 * Provides health monitoring and nudge generation for collaboration spaces
 */
export const spaceHealthService = {
  /**
   * Calculate health score and status for a space
   */
  async calculateSpaceHealth(spaceId: string): Promise<SpaceHealthData> {
    const now = new Date();
    const today = now.toISOString().split('T')[0];

    // Fetch space details
    const { data: space } = await supabase
      .from('spaces')
      .select('*')
      .eq('id', spaceId)
      .single();

    if (!space) {
      throw new Error('Space not found');
    }

    // Fetch task statistics
    const { data: tasks } = await supabase
      .from('space_tasks')
      .select('id, status, due_date, updated_at, created_at')
      .eq('space_id', spaceId);

    const allTasks = tasks || [];
    const totalTasks = allTasks.length;
    const completedTasks = allTasks.filter(t => t.status === 'done').length;
    const overdueTasksCount = allTasks.filter(t =>
      t.status !== 'done' &&
      t.due_date &&
      t.due_date < today
    ).length;

    // Calculate task completion rate
    const taskCompletionRate = totalTasks > 0
      ? (completedTasks / totalTasks) * 100
      : 0;

    // Fetch member statistics
    const { data: members } = await supabase
      .from('space_members')
      .select('user_id, joined_at')
      .eq('space_id', spaceId);

    const totalMembers = members?.length || 0;

    // Active members = joined in last 30 days or had activity
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString();
    const activeMembers = members?.filter(m => m.joined_at >= thirtyDaysAgo).length || 0;

    // Calculate member engagement rate
    const memberEngagementRate = totalMembers > 0
      ? (Math.max(activeMembers, 1) / totalMembers) * 100
      : 0;

    // Find last activity date
    // Check tasks, space updates, and member joins
    const activityDates: Date[] = [];

    // Task activity
    allTasks.forEach(t => {
      activityDates.push(new Date(t.updated_at || t.created_at));
    });

    // Check space_updates table for activity
    const { data: updates } = await supabase
      .from('space_updates')
      .select('created_at')
      .eq('space_id', spaceId)
      .order('created_at', { ascending: false })
      .limit(1);

    if (updates && updates.length > 0) {
      activityDates.push(new Date(updates[0].created_at));
    }

    // Member joins
    members?.forEach(m => {
      activityDates.push(new Date(m.joined_at));
    });

    // Space itself
    activityDates.push(new Date(space.updated_at || space.created_at));

    // Find the most recent activity
    const lastActivityDate = activityDates.length > 0
      ? new Date(Math.max(...activityDates.map(d => d.getTime())))
      : new Date(space.created_at);

    const daysSinceLastActivity = Math.floor(
      (now.getTime() - lastActivityDate.getTime()) / (1000 * 60 * 60 * 24)
    );

    // Days since creation
    const createdAt = new Date(space.created_at);
    const daysActive = Math.floor(
      (now.getTime() - createdAt.getTime()) / (1000 * 60 * 60 * 24)
    );

    const factors: SpaceHealthFactors = {
      daysSinceLastActivity,
      taskCompletionRate,
      overdueTasksCount,
      memberEngagementRate,
      daysActive,
      totalTasks,
      completedTasks,
      totalMembers,
      activeMembers,
      lastActivityDate: lastActivityDate.toISOString(),
    };

    // Calculate health score (0-100)
    let score = 100;

    // Activity penalty (up to -40 points)
    if (daysSinceLastActivity >= 30) {
      score -= 40;
    } else if (daysSinceLastActivity >= 14) {
      score -= 25;
    } else if (daysSinceLastActivity >= 7) {
      score -= 15;
    } else if (daysSinceLastActivity >= 3) {
      score -= 5;
    }

    // Overdue tasks penalty (up to -25 points)
    if (totalTasks > 0) {
      const overdueRatio = overdueTasksCount / totalTasks;
      if (overdueRatio > 0.5) {
        score -= 25;
      } else if (overdueRatio > 0.25) {
        score -= 15;
      } else if (overdueTasksCount > 0) {
        score -= 5;
      }
    }

    // Task completion bonus (up to +10 points)
    if (taskCompletionRate >= 80) {
      score += 10;
    } else if (taskCompletionRate >= 50) {
      score += 5;
    } else if (totalTasks > 0 && taskCompletionRate < 20) {
      score -= 10;
    }

    // Member engagement penalty (up to -15 points)
    if (totalMembers > 1) {
      if (memberEngagementRate < 25) {
        score -= 15;
      } else if (memberEngagementRate < 50) {
        score -= 10;
      }
    }

    // Clamp score to 0-100
    score = Math.max(0, Math.min(100, score));

    // Determine status
    let status: SpaceHealthStatus;

    // Special case: check if space is essentially complete
    if (totalTasks > 0 && taskCompletionRate === 100) {
      status = 'complete';
      score = 100;
    } else if (daysSinceLastActivity >= 30) {
      status = 'inactive';
    } else if (daysSinceLastActivity >= 14 || (overdueTasksCount / Math.max(totalTasks, 1)) > 0.5) {
      status = 'at-risk';
    } else if (daysSinceLastActivity >= 7) {
      status = 'stalling';
    } else {
      status = 'healthy';
    }

    // Generate suggested actions
    const suggestedActions: string[] = [];

    if (daysSinceLastActivity >= 30) {
      suggestedActions.push('Consider archiving this project or re-energizing the team');
    } else if (daysSinceLastActivity >= 14) {
      suggestedActions.push('Schedule a team check-in to get things moving again');
    } else if (daysSinceLastActivity >= 7) {
      suggestedActions.push('Post an update or assign new tasks to maintain momentum');
    }

    if (overdueTasksCount > 0) {
      suggestedActions.push(`Review and update ${overdueTasksCount} overdue task${overdueTasksCount > 1 ? 's' : ''}`);
    }

    if (totalTasks === 0) {
      suggestedActions.push('Add tasks to track project progress');
    }

    if (totalMembers === 1) {
      suggestedActions.push('Invite team members to collaborate');
    }

    if (taskCompletionRate >= 80 && status !== 'complete') {
      suggestedActions.push('Almost there! Complete the remaining tasks to finish the project');
    }

    return {
      score,
      status,
      factors,
      suggestedActions,
    };
  },

  /**
   * Get all spaces a user leads that need attention
   */
  async getSpacesNeedingAttention(userId: string): Promise<SpaceNeedingAttention[]> {
    // Get spaces where user is a lead
    const { data: memberships } = await supabase
      .from('space_members')
      .select('space_id, role')
      .eq('user_id', userId)
      .eq('role', 'lead');

    if (!memberships || memberships.length === 0) {
      return [];
    }

    const spaceIds = memberships.map(m => m.space_id);

    // Get space details
    const { data: spaces } = await supabase
      .from('spaces')
      .select('*')
      .in('id', spaceIds)
      .in('status', ['active', 'idea']); // Only active/idea spaces, not completed/paused

    if (!spaces || spaces.length === 0) {
      return [];
    }

    // Calculate health for each space
    const spacesNeedingAttention: SpaceNeedingAttention[] = [];

    for (const space of spaces) {
      try {
        const healthData = await this.calculateSpaceHealth(space.id);

        // Only include spaces that aren't healthy
        if (healthData.status !== 'healthy') {
          spacesNeedingAttention.push({
            ...space,
            space_type: space.space_type as SpaceType,
            healthData,
            userRole: 'lead',
          } as SpaceNeedingAttention);
        }
      } catch {
        // Skip spaces we can't calculate health for
      }
    }

    // Sort by severity (inactive > at-risk > stalling)
    const statusPriority: Record<SpaceHealthStatus, number> = {
      'inactive': 0,
      'at-risk': 1,
      'stalling': 2,
      'complete': 3,
      'healthy': 4,
    };

    spacesNeedingAttention.sort((a, b) =>
      statusPriority[a.healthData.status] - statusPriority[b.healthData.status]
    );

    return spacesNeedingAttention;
  },

  /**
   * Generate a contextual nudge message for a space based on health data
   */
  generateHealthNudge(space: Space, healthData: SpaceHealthData): SpaceHealthNudge | null {
    const { status, factors } = healthData;

    // Check for almost complete (80%+ done with remaining tasks)
    if (factors.taskCompletionRate >= 80 && factors.taskCompletionRate < 100 && factors.totalTasks > 0) {
      const remainingTasks = factors.totalTasks - factors.completedTasks;
      return {
        nudge_type: 'space_almost_complete',
        message: `"${space.name}" is ${Math.round(factors.taskCompletionRate)}% complete! Just ${remainingTasks} task${remainingTasks > 1 ? 's' : ''} remaining.`,
        priority: 'medium',
        action_url: `/dna/collaborate/spaces/${space.slug}`,
        payload: {
          space_id: space.id,
          space_name: space.name,
          space_slug: space.slug,
          health_score: healthData.score,
          health_status: status,
          factors,
          suggested_actions: healthData.suggestedActions,
        },
      };
    }

    switch (status) {
      case 'inactive':
        return {
          nudge_type: 'space_inactive_archive',
          message: `"${space.name}" has been inactive for ${factors.daysSinceLastActivity} days. Consider archiving or re-energizing the project?`,
          priority: 'high',
          action_url: `/dna/collaborate/spaces/${space.slug}`,
          payload: {
            space_id: space.id,
            space_name: space.name,
            space_slug: space.slug,
            health_score: healthData.score,
            health_status: status,
            factors,
            suggested_actions: healthData.suggestedActions,
          },
        };

      case 'at-risk':
        let atRiskMessage = `Your project "${space.name}" `;
        if (factors.overdueTasksCount > 0 && factors.daysSinceLastActivity >= 14) {
          atRiskMessage += `has ${factors.overdueTasksCount} overdue tasks and hasn't had activity in ${factors.daysSinceLastActivity} days.`;
        } else if (factors.overdueTasksCount > 0) {
          atRiskMessage += `has ${factors.overdueTasksCount} overdue tasks. Would you like to adjust timelines?`;
        } else {
          atRiskMessage += `hasn't had activity in ${factors.daysSinceLastActivity} days. Need help getting unstuck?`;
        }
        return {
          nudge_type: 'space_at_risk',
          message: atRiskMessage,
          priority: 'high',
          action_url: `/dna/collaborate/spaces/${space.slug}`,
          payload: {
            space_id: space.id,
            space_name: space.name,
            space_slug: space.slug,
            health_score: healthData.score,
            health_status: status,
            factors,
            suggested_actions: healthData.suggestedActions,
          },
        };

      case 'stalling':
        return {
          nudge_type: 'space_stalling',
          message: `Your project "${space.name}" hasn't had activity in ${factors.daysSinceLastActivity} days. Need help getting unstuck?`,
          priority: 'medium',
          action_url: `/dna/collaborate/spaces/${space.slug}`,
          payload: {
            space_id: space.id,
            space_name: space.name,
            space_slug: space.slug,
            health_score: healthData.score,
            health_status: status,
            factors,
            suggested_actions: healthData.suggestedActions,
          },
        };

      default:
        return null;
    }
  },

  /**
   * Create a health nudge in the database for a user
   */
  async createHealthNudge(
    userId: string,
    nudge: SpaceHealthNudge
  ): Promise<void> {
    // Check if there's already a recent nudge for this space
    const { data: existingNudge } = await supabase
      .from('adin_nudges')
      .select('id, created_at')
      .eq('user_id', userId)
      .eq('nudge_type', nudge.nudge_type)
      .eq('status', 'sent')
      .contains('payload', { space_id: nudge.payload.space_id })
      .single();

    // Don't create duplicate nudges within 7 days
    if (existingNudge) {
      const nudgeAge = Date.now() - new Date(existingNudge.created_at).getTime();
      const sevenDays = 7 * 24 * 60 * 60 * 1000;
      if (nudgeAge < sevenDays) {
        return;
      }
    }

    // Create the nudge
    // Use a placeholder connection_id since space nudges aren't connection-based
    await (supabase as any)
      .from('adin_nudges')
      .insert({
        user_id: userId,
        connection_id: nudge.payload.space_id, // Using space_id as the reference
        nudge_type: nudge.nudge_type,
        message: nudge.message,
        status: 'sent',
        payload: {
          ...nudge.payload,
          action_url: nudge.action_url,
          priority: nudge.priority,
        },
      });
  },

  /**
   * Process health nudges for all spaces a user leads
   * Typically called by a nightly job or on dashboard load
   */
  async processHealthNudgesForUser(userId: string): Promise<number> {
    const spacesNeedingAttention = await this.getSpacesNeedingAttention(userId);
    let nudgesCreated = 0;

    for (const space of spacesNeedingAttention) {
      const nudge = this.generateHealthNudge(space, space.healthData);
      if (nudge) {
        await this.createHealthNudge(userId, nudge);
        nudgesCreated++;
      }
    }

    return nudgesCreated;
  },

  /**
   * Archive a space with optional summary
   */
  async archiveSpace(
    spaceId: string,
    summary?: string,
    notifyMembers: boolean = true
  ): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    // Verify user is a lead
    const { data: membership } = await supabase
      .from('space_members')
      .select('role')
      .eq('space_id', spaceId)
      .eq('user_id', user.id)
      .single();

    if (!membership || membership.role !== 'lead') {
      throw new Error('Only space leads can archive spaces');
    }

    // Update space status to completed (archived)
    const updateData: Record<string, any> = {
      status: 'completed' as SpaceStatus,
      updated_at: new Date().toISOString(),
    };

    // Store summary in description if provided
    if (summary) {
      const { data: space } = await supabase
        .from('spaces')
        .select('description')
        .eq('id', spaceId)
        .single();

      const existingDesc = space?.description || '';
      updateData.description = `${existingDesc}\n\n---\n**Project Summary (Archived):**\n${summary}`;
    }

    const { error } = await supabase
      .from('spaces')
      .update(updateData)
      .eq('id', spaceId);

    if (error) throw error;

    // TODO: If notifyMembers is true, send notifications to all members
    // This would be implemented with the notification service
  },

  /**
   * Reactivate an archived space
   */
  async reactivateSpace(spaceId: string): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    // Verify user is a lead
    const { data: membership } = await supabase
      .from('space_members')
      .select('role')
      .eq('space_id', spaceId)
      .eq('user_id', user.id)
      .single();

    if (!membership || membership.role !== 'lead') {
      throw new Error('Only space leads can reactivate spaces');
    }

    const { error } = await supabase
      .from('spaces')
      .update({
        status: 'active' as SpaceStatus,
        updated_at: new Date().toISOString(),
      })
      .eq('id', spaceId);

    if (error) throw error;
  },

  /**
   * Mark a space as complete (not archived, but done)
   */
  async markSpaceComplete(spaceId: string): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    // Verify user is a lead
    const { data: membership } = await supabase
      .from('space_members')
      .select('role')
      .eq('space_id', spaceId)
      .eq('user_id', user.id)
      .single();

    if (!membership || membership.role !== 'lead') {
      throw new Error('Only space leads can mark spaces as complete');
    }

    const { error } = await supabase
      .from('spaces')
      .update({
        status: 'completed' as SpaceStatus,
        updated_at: new Date().toISOString(),
      })
      .eq('id', spaceId);

    if (error) throw error;
  },

  /**
   * Get health color based on status
   */
  getHealthColor(status: SpaceHealthStatus): string {
    switch (status) {
      case 'healthy':
      case 'complete':
        return 'green';
      case 'stalling':
        return 'yellow';
      case 'at-risk':
        return 'orange';
      case 'inactive':
        return 'red';
      default:
        return 'gray';
    }
  },

  /**
   * Get health label for display
   */
  getHealthLabel(status: SpaceHealthStatus): string {
    switch (status) {
      case 'healthy':
        return 'Healthy';
      case 'complete':
        return 'Complete';
      case 'stalling':
        return 'Needs Attention';
      case 'at-risk':
        return 'At Risk';
      case 'inactive':
        return 'Inactive';
      default:
        return 'Unknown';
    }
  },
};
