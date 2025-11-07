import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Users, UserPlus, Activity, AlertCircle, CheckCircle, TrendingUp } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface HealthMetrics {
  totalUsers: number;
  activeUsersToday: number;
  activeUsersWeek: number;
  waitlistTotal: number;
  waitlistPending: number;
  newSignupsToday: number;
  newSignupsWeek: number;
}

export default function PlatformHealth() {
  const { data: metrics, isLoading } = useQuery({
    queryKey: ['platform-health'],
    queryFn: async () => {
      // Waitlist metrics
      const { count: waitlistTotal } = await supabase
        .from('beta_waitlist')
        .select('id', { count: 'exact', head: true });

      const { count: waitlistPending } = await supabase
        .from('beta_waitlist')
        .select('id', { count: 'exact', head: true })
        .eq('status', 'pending');

      // For now, return placeholder values for user metrics until user_profiles table exists
      return {
        totalUsers: 0,
        activeUsersToday: 0,
        activeUsersWeek: 0,
        waitlistTotal: waitlistTotal || 0,
        waitlistPending: waitlistPending || 0,
        newSignupsToday: 0,
        newSignupsWeek: 0,
      } as HealthMetrics;
    },
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const healthStatus = metrics ? (
    metrics.activeUsersWeek > 0 ? 'healthy' : 'warning'
  ) : 'error';

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Platform Health</h1>
          <p className="text-muted-foreground">Real-time monitoring of DNA platform metrics</p>
        </div>
        <Badge variant={healthStatus === 'healthy' ? 'default' : 'destructive'} className="h-8 px-3">
          {healthStatus === 'healthy' ? (
            <>
              <CheckCircle className="h-4 w-4 mr-1" />
              Healthy
            </>
          ) : (
            <>
              <AlertCircle className="h-4 w-4 mr-1" />
              Needs Attention
            </>
          )}
        </Badge>
      </div>

      {/* Key Metrics Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{metrics?.totalUsers || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">Registered platform users</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Today</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{metrics?.activeUsersToday || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {metrics?.totalUsers ? Math.round(((metrics.activeUsersToday || 0) / metrics.totalUsers) * 100) : 0}% of total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active This Week</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{metrics?.activeUsersWeek || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {metrics?.totalUsers ? Math.round(((metrics.activeUsersWeek || 0) / metrics.totalUsers) * 100) : 0}% of total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">New Signups Today</CardTitle>
            <UserPlus className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{metrics?.newSignupsToday || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">{metrics?.newSignupsWeek || 0} this week</p>
          </CardContent>
        </Card>
      </div>

      {/* Waitlist & Growth */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Waitlist Status</CardTitle>
            <CardDescription>Beta waitlist metrics</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Total Entries</span>
              <span className="text-2xl font-bold text-foreground">{metrics?.waitlistTotal || 0}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Pending Review</span>
              <span className="text-2xl font-bold text-amber-500">{metrics?.waitlistPending || 0}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Approved</span>
              <span className="text-2xl font-bold text-green-500">
                {(metrics?.waitlistTotal || 0) - (metrics?.waitlistPending || 0)}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Growth Metrics</CardTitle>
            <CardDescription>User acquisition and engagement</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Daily Active Rate</span>
              <span className="text-lg font-bold text-foreground">
                {metrics?.totalUsers ? Math.round(((metrics.activeUsersToday || 0) / metrics.totalUsers) * 100) : 0}%
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Weekly Active Rate</span>
              <span className="text-lg font-bold text-foreground">
                {metrics?.totalUsers ? Math.round(((metrics.activeUsersWeek || 0) / metrics.totalUsers) * 100) : 0}%
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Weekly Signups</span>
              <span className="text-lg font-bold text-foreground">{metrics?.newSignupsWeek || 0}</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
