import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useProfile } from '@/hooks/useProfile';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import UnifiedHeader from '@/components/UnifiedHeader';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2, Eye, Users, MessageSquare, TrendingUp } from 'lucide-react';
import { 
  AreaChart, Area, BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer 
} from 'recharts';
import { formatDistanceToNow, format, subDays } from 'date-fns';

const COLORS = ['hsl(var(--primary))', 'hsl(var(--secondary))', 'hsl(var(--accent))', 'hsl(var(--muted))'];

const Analytics = () => {
  const { user } = useAuth();
  const { data: profile } = useProfile();
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d'>('30d');

  // Fetch analytics data
  const { data: profileViewsData, isLoading: viewsLoading } = useQuery({
    queryKey: ['analytics-profile-views', user?.id, timeRange],
    queryFn: async () => {
      if (!user?.id) return null;

      const days = timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : 90;
      
      const { data, error } = await supabase
        .from('profile_views')
        .select('viewed_at, viewer_id')
        .eq('profile_id', user.id)
        .gte('viewed_at', subDays(new Date(), days).toISOString())
        .order('viewed_at', { ascending: true });

      if (error) throw error;

      // Group by day
      const viewsByDay = data?.reduce((acc: any, view) => {
        const day = format(new Date(view.viewed_at), 'MMM dd');
        acc[day] = (acc[day] || 0) + 1;
        return acc;
      }, {});

      return {
        total: data?.length || 0,
        byDay: Object.entries(viewsByDay || {}).map(([date, views]) => ({
          date,
          views,
        })),
        uniqueViewers: new Set(data?.map(v => v.viewer_id)).size,
      };
    },
    enabled: !!user?.id,
  });

  const { data: connectionsData, isLoading: connectionsLoading } = useQuery({
    queryKey: ['analytics-connections', user?.id, timeRange],
    queryFn: async () => {
      if (!user?.id) return null;

      const days = timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : 90;

      const { data, error } = await supabase
        .from('connections')
        .select('created_at, status')
        .or(`requester_id.eq.${user.id},recipient_id.eq.${user.id}`)
        .eq('status', 'accepted')
        .gte('created_at', subDays(new Date(), days).toISOString())
        .order('created_at', { ascending: true });

      if (error) throw error;

      const connectionsByDay = data?.reduce((acc: any, conn) => {
        const day = format(new Date(conn.created_at), 'MMM dd');
        acc[day] = (acc[day] || 0) + 1;
        return acc;
      }, {});

      return {
        total: data?.length || 0,
        byDay: Object.entries(connectionsByDay || {}).map(([date, connections]) => ({
          date,
          connections,
        })),
      };
    },
    enabled: !!user?.id,
  });

  const { data: messagesData, isLoading: messagesLoading } = useQuery({
    queryKey: ['analytics-messages', user?.id, timeRange],
    queryFn: async () => {
      if (!user?.id) return null;

      const days = timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : 90;

      const { data, error } = await supabase
        .from('messages_new')
        .select('created_at')
        .eq('sender_id', user.id)
        .gte('created_at', subDays(new Date(), days).toISOString())
        .order('created_at', { ascending: true });

      if (error) throw error;

      const messagesByDay = data?.reduce((acc: any, msg) => {
        const day = format(new Date(msg.created_at), 'MMM dd');
        acc[day] = (acc[day] || 0) + 1;
        return acc;
      }, {});

      return {
        total: data?.length || 0,
        byDay: Object.entries(messagesByDay || {}).map(([date, messages]) => ({
          date,
          messages,
        })),
      };
    },
    enabled: !!user?.id,
  });

  const { data: engagementData } = useQuery({
    queryKey: ['analytics-engagement', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;

      // Get total connections
      const { count: totalConnections } = await supabase
        .from('connections')
        .select('*', { count: 'exact', head: true })
        .or(`requester_id.eq.${user.id},recipient_id.eq.${user.id}`)
        .eq('status', 'accepted');

      // Get total conversations
      const { data: conversations } = await supabase.rpc('get_user_conversations', {
        p_user_id: user.id,
        p_limit: 1000,
        p_offset: 0,
      });

      return {
        totalConnections: totalConnections || 0,
        totalConversations: conversations?.length || 0,
        profileCompleteness: calculateProfileCompleteness(profile),
      };
    },
    enabled: !!user?.id,
  });

  const calculateProfileCompleteness = (prof: any) => {
    if (!prof) return 0;
    const fields = [
      prof.full_name,
      prof.headline,
      prof.bio,
      prof.avatar_url,
      prof.city,
      prof.country,
      prof.skills?.length > 0,
      prof.interests?.length > 0,
    ];
    const completed = fields.filter(Boolean).length;
    return Math.round((completed / fields.length) * 100);
  };

  const isLoading = viewsLoading || connectionsLoading || messagesLoading;

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Please log in to view analytics</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <UnifiedHeader />
      
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Analytics Dashboard</h1>
          <p className="text-muted-foreground">
            Track your profile performance and engagement metrics
          </p>
        </div>

        {/* Time Range Selector */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setTimeRange('7d')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
              timeRange === '7d'
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted text-muted-foreground hover:bg-muted/80'
            }`}
          >
            Last 7 Days
          </button>
          <button
            onClick={() => setTimeRange('30d')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
              timeRange === '30d'
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted text-muted-foreground hover:bg-muted/80'
            }`}
          >
            Last 30 Days
          </button>
          <button
            onClick={() => setTimeRange('90d')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
              timeRange === '90d'
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted text-muted-foreground hover:bg-muted/80'
            }`}
          >
            Last 90 Days
          </button>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : (
          <>
            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Profile Views</CardTitle>
                  <Eye className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{profileViewsData?.total || 0}</div>
                  <p className="text-xs text-muted-foreground">
                    {profileViewsData?.uniqueViewers || 0} unique viewers
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">New Connections</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{connectionsData?.total || 0}</div>
                  <p className="text-xs text-muted-foreground">
                    {engagementData?.totalConnections || 0} total
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Messages Sent</CardTitle>
                  <MessageSquare className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{messagesData?.total || 0}</div>
                  <p className="text-xs text-muted-foreground">
                    {engagementData?.totalConversations || 0} conversations
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Profile Strength</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{engagementData?.profileCompleteness || 0}%</div>
                  <p className="text-xs text-muted-foreground">Completeness</p>
                </CardContent>
              </Card>
            </div>

            {/* Charts */}
            <Tabs defaultValue="views" className="space-y-6">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="views">Profile Views</TabsTrigger>
                <TabsTrigger value="connections">Connections</TabsTrigger>
                <TabsTrigger value="messages">Messages</TabsTrigger>
              </TabsList>

              <TabsContent value="views" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Profile Views Over Time</CardTitle>
                    <CardDescription>
                      Daily profile view activity for the selected period
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <AreaChart data={profileViewsData?.byDay || []}>
                        <defs>
                          <linearGradient id="colorViews" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.8}/>
                            <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                        <XAxis dataKey="date" className="text-xs" />
                        <YAxis className="text-xs" />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: 'hsl(var(--card))',
                            border: '1px solid hsl(var(--border))',
                            borderRadius: '8px',
                          }}
                        />
                        <Area
                          type="monotone"
                          dataKey="views"
                          stroke="hsl(var(--primary))"
                          fillOpacity={1}
                          fill="url(#colorViews)"
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="connections" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Connection Growth</CardTitle>
                    <CardDescription>
                      New connections made during the selected period
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={connectionsData?.byDay || []}>
                        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                        <XAxis dataKey="date" className="text-xs" />
                        <YAxis className="text-xs" />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: 'hsl(var(--card))',
                            border: '1px solid hsl(var(--border))',
                            borderRadius: '8px',
                          }}
                        />
                        <Bar dataKey="connections" fill="hsl(var(--primary))" radius={[8, 8, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="messages" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Message Activity</CardTitle>
                    <CardDescription>
                      Messages sent during the selected period
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <LineChart data={messagesData?.byDay || []}>
                        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                        <XAxis dataKey="date" className="text-xs" />
                        <YAxis className="text-xs" />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: 'hsl(var(--card))',
                            border: '1px solid hsl(var(--border))',
                            borderRadius: '8px',
                          }}
                        />
                        <Line
                          type="monotone"
                          dataKey="messages"
                          stroke="hsl(var(--primary))"
                          strokeWidth={2}
                          dot={{ fill: 'hsl(var(--primary))' }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </>
        )}
      </div>
    </div>
  );
};

export default Analytics;
