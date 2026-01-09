// supabase/functions/process-automated-nudges/index.ts
// DNA COLLABORATE: Automated Nudge Processing

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsHeaders } from '../_shared/cors.ts';

interface OverdueTask {
  id: string;
  space_id: string;
  title: string;
  assigned_to: string;
  due_date: string;
  last_nudge_at: string | null;
  nudge_count: number;
}

interface NudgeToSend {
  space_id: string;
  task_id: string;
  target_user_id: string;
  type: 'automated';
  tone: 'gentle' | 'checkin' | 'urgent';
  message: string;
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Initialize Supabase client with service role key for admin operations
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const now = new Date();
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    // Get overdue tasks that haven't been nudged recently
    const { data: overdueTasks, error: tasksError } = await supabaseClient
      .from('collaborate_tasks')
      .select(`
        id,
        space_id,
        title,
        assigned_to,
        due_date,
        last_nudge_at,
        nudge_count
      `)
      .lt('due_date', now.toISOString())
      .neq('status', 'done')
      .not('assigned_to', 'is', null);

    if (tasksError) {
      throw new Error(`Error fetching overdue tasks: ${tasksError.message}`);
    }

    const nudgesToSend: NudgeToSend[] = [];

    for (const task of (overdueTasks || []) as OverdueTask[]) {
      const dueDate = new Date(task.due_date);
      const daysSinceDue = Math.floor((now.getTime() - dueDate.getTime()) / (24 * 60 * 60 * 1000));

      // Determine if we should nudge
      let shouldNudge = false;
      let tone: 'gentle' | 'checkin' | 'urgent' = 'gentle';
      let message = '';

      // First day overdue - gentle nudge (if not nudged in last 24 hours)
      if (daysSinceDue === 1 && (!task.last_nudge_at || new Date(task.last_nudge_at) < oneDayAgo)) {
        shouldNudge = true;
        tone = 'gentle';
        message = `Your task "${task.title}" is now 1 day overdue. Need any help completing it?`;
      }
      // 3 days overdue - check-in nudge (if not nudged in last 3 days)
      else if (daysSinceDue >= 3 && daysSinceDue < 7) {
        const threeDaysAgo = new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000);
        if (!task.last_nudge_at || new Date(task.last_nudge_at) < threeDaysAgo) {
          shouldNudge = true;
          tone = 'checkin';
          message = `Your task "${task.title}" is ${daysSinceDue} days overdue. Please update the team on its status or let us know if you need support.`;
        }
      }
      // 7+ days overdue - urgent nudge (if not nudged in last 7 days)
      else if (daysSinceDue >= 7 && (!task.last_nudge_at || new Date(task.last_nudge_at) < sevenDaysAgo)) {
        shouldNudge = true;
        tone = 'urgent';
        message = `Your task "${task.title}" is ${daysSinceDue} days overdue. This may be blocking progress. Please update the team on status or reassign if needed.`;
      }

      if (shouldNudge) {
        nudgesToSend.push({
          space_id: task.space_id,
          task_id: task.id,
          target_user_id: task.assigned_to,
          type: 'automated',
          tone,
          message,
        });
      }
    }

    // Insert nudges in batch
    if (nudgesToSend.length > 0) {
      const { error: nudgeError } = await supabaseClient
        .from('collaborate_nudges')
        .insert(nudgesToSend);

      if (nudgeError) {
        console.error('Error inserting nudges:', nudgeError);
        throw new Error(`Error inserting nudges: ${nudgeError.message}`);
      }

      // Update last_nudge_at on tasks
      for (const nudge of nudgesToSend) {
        const { data: taskData } = await supabaseClient
          .from('collaborate_tasks')
          .select('nudge_count')
          .eq('id', nudge.task_id)
          .single();

        await supabaseClient
          .from('collaborate_tasks')
          .update({
            last_nudge_at: now.toISOString(),
            nudge_count: (taskData?.nudge_count || 0) + 1,
          })
          .eq('id', nudge.task_id);
      }

      // Log activity for each nudge sent
      const activityLogs = nudgesToSend.map(nudge => ({
        space_id: nudge.space_id,
        user_id: null, // System-generated
        action_type: 'automated_nudge_sent',
        entity_type: 'task',
        entity_id: nudge.task_id,
        metadata: {
          target_user_id: nudge.target_user_id,
          tone: nudge.tone,
        },
      }));

      await supabaseClient
        .from('space_activity_log')
        .insert(activityLogs);
    }

    // Also check for stalling spaces and send space-level nudges
    const { data: stallingSpaces, error: spacesError } = await supabaseClient
      .from('spaces')
      .select(`
        id,
        name,
        slug,
        created_by,
        last_activity_at,
        stall_threshold_days
      `)
      .eq('status', 'active');

    if (spacesError) {
      console.error('Error fetching spaces:', spacesError);
    }

    const spaceNudges: NudgeToSend[] = [];

    for (const space of (stallingSpaces || [])) {
      const lastActivity = new Date(space.last_activity_at);
      const daysSinceActivity = Math.floor((now.getTime() - lastActivity.getTime()) / (24 * 60 * 60 * 1000));
      const threshold = space.stall_threshold_days || 14;

      // Check if space is stalling (past threshold)
      if (daysSinceActivity >= threshold) {
        // Check if we already sent a stall nudge in the last 7 days
        const { data: recentNudge } = await supabaseClient
          .from('collaborate_nudges')
          .select('id')
          .eq('space_id', space.id)
          .eq('target_user_id', space.created_by)
          .is('task_id', null)
          .gte('sent_at', sevenDaysAgo.toISOString())
          .limit(1);

        if (!recentNudge || recentNudge.length === 0) {
          spaceNudges.push({
            space_id: space.id,
            task_id: '', // Empty string for space-level nudges
            target_user_id: space.created_by,
            type: 'automated',
            tone: daysSinceActivity >= threshold * 2 ? 'urgent' : 'checkin',
            message: `Your space "${space.name}" hasn't had activity in ${daysSinceActivity} days. Consider posting an update or archiving if the project is complete.`,
          });
        }
      }
    }

    // Insert space-level nudges (need to handle null task_id separately)
    if (spaceNudges.length > 0) {
      const spaceNudgesForInsert = spaceNudges.map(n => ({
        ...n,
        task_id: null, // Actually null for space-level
      }));

      const { error: spaceNudgeError } = await supabaseClient
        .from('collaborate_nudges')
        .insert(spaceNudgesForInsert);

      if (spaceNudgeError) {
        console.error('Error inserting space nudges:', spaceNudgeError);
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        task_nudges_sent: nudgesToSend.length,
        space_nudges_sent: spaceNudges.length,
        timestamp: now.toISOString(),
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('Error processing automated nudges:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});
