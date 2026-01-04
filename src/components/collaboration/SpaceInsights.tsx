import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Users, CheckCircle, AlertCircle, TrendingUp, Calendar, MessageSquare } from 'lucide-react';
import { supabaseClient } from '@/lib/supabaseHelpers';
import { subDays, format, startOfDay } from 'date-fns';

interface SpaceInsightsProps {
  spaceId: string;
  isLead: boolean;
}

interface ActivityMetrics {
  active_members: number;
  tasks_created: number;
  tasks_completed: number;
  updates_posted: number;
}

interface TaskHealth {
  total_open: number;
  total_overdue: number;
}

interface EngagementSignals {
  from_event: number;
  from_group: number;
  from_suggestions: number;
}

export function SpaceInsights({ spaceId, isLead }: SpaceInsightsProps) {
  const thirtyDaysAgo = subDays(new Date(), 30);

  // Activity metrics for last 30 days
  const { data: activityMetrics } = useQuery({
    queryKey: ['space-activity', spaceId],
    queryFn: async () => {
      const since = thirtyDaysAgo.toISOString();

      // Active members
      const { count: activeMembersCount } = await supabaseClient
        .from('space_members')
        .select('id', { count: 'exact' })
        .eq('space_id', spaceId)
        .or(`joined_at.gte.${since}`);

      // Tasks created
      const { count: tasksCreated } = await supabaseClient
        .from('space_tasks')
        .select('id', { count: 'exact' })
        .eq('space_id', spaceId)
        .gte('created_at', since);

      // Tasks completed
      const { count: tasksCompleted } = await supabaseClient
        .from('space_tasks')
        .select('id', { count: 'exact' })
        .eq('space_id', spaceId)
        .eq('status', 'done')
        .gte('updated_at', since);

      // Updates posted
      const { count: updatesPosted } = await supabaseClient
        .from('space_updates')
        .select('id', { count: 'exact' })
        .eq('space_id', spaceId)
        .gte('created_at', since);

      return {
        active_members: activeMembersCount || 0,
        tasks_created: tasksCreated || 0,
        tasks_completed: tasksCompleted || 0,
        updates_posted: updatesPosted || 0,
      } as ActivityMetrics;
    },
    enabled: isLead,
  });

  // Task health
  const { data: taskHealth } = useQuery({
    queryKey: ['space-task-health', spaceId],
    queryFn: async () => {
      const today = startOfDay(new Date()).toISOString();

      // Total open tasks
      const { count: totalOpen } = await supabaseClient
        .from('space_tasks')
        .select('id', { count: 'exact' })
        .eq('space_id', spaceId)
        .in('status', ['open', 'in_progress']);

      // Overdue tasks
      const { count: totalOverdue } = await supabaseClient
        .from('space_tasks')
        .select('id', { count: 'exact' })
        .eq('space_id', spaceId)
        .neq('status', 'done')
        .not('due_date', 'is', null)
        .lt('due_date', today);

      return {
        total_open: totalOpen || 0,
        total_overdue: totalOverdue || 0,
      } as TaskHealth;
    },
    enabled: isLead,
  });

  // Engagement signals from analytics
  const { data: engagementSignals } = useQuery({
    queryKey: ['space-engagement-signals', spaceId],
    queryFn: async () => {
      // Count joins from different sources
      const { data: eventJoins } = await supabaseClient
        .from('analytics_events')
        .select('id')
        .eq('event_name', 'space_joined_from_event_view')
        .contains('event_metadata', { space_id: spaceId });

      const { data: groupJoins } = await supabaseClient
        .from('analytics_events')
        .select('id')
        .eq('event_name', 'space_joined_from_group_view')
        .contains('event_metadata', { space_id: spaceId });

      const { data: suggestionJoins } = await supabaseClient
        .from('analytics_events')
        .select('id')
        .eq('event_name', 'space_joined_from_suggestions')
        .contains('event_metadata', { space_id: spaceId });

      return {
        from_event: eventJoins?.length || 0,
        from_group: groupJoins?.length || 0,
        from_suggestions: suggestionJoins?.length || 0,
      } as EngagementSignals;
    },
    enabled: isLead,
  });

  // Weekly completion trend (simplified)
  const { data: weeklyTrend = [] } = useQuery({
    queryKey: ['space-weekly-trend', spaceId],
    queryFn: async () => {
      const weeks = [];
      for (let i = 3; i >= 0; i--) {
        const weekStart = subDays(new Date(), i * 7 + 7);
        const weekEnd = subDays(new Date(), i * 7);

        const { count } = await supabaseClient
          .from('space_tasks')
          .select('id', { count: 'exact' })
          .eq('space_id', spaceId)
          .eq('status', 'done')
          .gte('updated_at', weekStart.toISOString())
          .lte('updated_at', weekEnd.toISOString());

        weeks.push({
          week: `Week ${i + 1}`,
          count: count || 0,
        });
      }
      return weeks;
    },
    enabled: isLead,
  });

  if (!isLead) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">
          Insights are only available to space leads.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Space Insights</h2>
        <p className="text-muted-foreground">Last 30 days</p>
      </div>

      {/* Activity Overview */}
      <div>
        <h3 className="text-lg font-semibold mb-3">Activity Overview</h3>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Members</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{activityMetrics?.active_members || 0}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Tasks Created</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{activityMetrics?.tasks_created || 0}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Tasks Completed</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{activityMetrics?.tasks_completed || 0}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Updates Posted</CardTitle>
              <MessageSquare className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{activityMetrics?.updates_posted || 0}</div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Task Health */}
      <div>
        <h3 className="text-lg font-semibold mb-3">Task Health</h3>
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Open Tasks</CardTitle>
              <CardDescription>Currently in progress or todo</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{taskHealth?.total_open || 0}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                Overdue Tasks
                {(taskHealth?.total_overdue || 0) > 0 && (
                  <AlertCircle className="h-4 w-4 text-destructive" />
                )}
              </CardTitle>
              <CardDescription>Past due date and not done</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-destructive">
                {taskHealth?.total_overdue || 0}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Completion Trend */}
      <div>
        <h3 className="text-lg font-semibold mb-3">Completion Trend</h3>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-end gap-4 h-32">
              {weeklyTrend.map((week, idx) => (
                <div key={idx} className="flex-1 flex flex-col items-center gap-2">
                  <div
                    className="w-full bg-primary rounded-t"
                    style={{
                      height: `${Math.max((week.count / Math.max(...weeklyTrend.map(w => w.count), 1)) * 100, 5)}%`,
                    }}
                  />
                  <div className="text-xs text-muted-foreground">{week.week}</div>
                  <div className="text-sm font-semibold">{week.count}</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Engagement Signals */}
      <div>
        <h3 className="text-lg font-semibold mb-3">Engagement Signals</h3>
        <Card>
          <CardHeader>
            <CardTitle>How members joined this space</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm">From Events</span>
              <Badge variant="secondary">{engagementSignals?.from_event || 0}</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">From Groups</span>
              <Badge variant="secondary">{engagementSignals?.from_group || 0}</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">From Suggestions</span>
              <Badge variant="secondary">{engagementSignals?.from_suggestions || 0}</Badge>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
