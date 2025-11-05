import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/contexts/AuthContext';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { AreaChart, Area, BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Eye, Users, MessageSquare, TrendingUp, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState } from 'react';

export const DashboardAnalyticsColumn = () => {
  const { user } = useAuth();
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d'>('7d');

  // Calculate date range
  const getDateRange = () => {
    const endDate = new Date();
    const startDate = new Date();
    const days = timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : 90;
    startDate.setDate(startDate.getDate() - days);
    return { startDate, endDate };
  };

  const { startDate, endDate } = getDateRange();

  // Fetch profile views
  const { data: profileViewsData, isLoading: viewsLoading } = useQuery({
    queryKey: ['profile-views-analytics', user?.id, timeRange],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profile_views')
        .select('viewed_at')
        .eq('profile_id', user?.id)
        .gte('viewed_at', startDate.toISOString())
        .lte('viewed_at', endDate.toISOString())
        .order('viewed_at', { ascending: true });

      if (error) throw error;
      return data || [];
    },
    enabled: !!user,
  });

  // Fetch connections
  const { data: connectionsData, isLoading: connectionsLoading } = useQuery({
    queryKey: ['connections-analytics', user?.id, timeRange],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('connections')
        .select('created_at')
        .or(`user_id.eq.${user?.id},connected_user_id.eq.${user?.id}`)
        .eq('status', 'accepted')
        .gte('created_at', startDate.toISOString())
        .lte('created_at', endDate.toISOString())
        .order('created_at', { ascending: true });

      if (error) throw error;
      return data || [];
    },
    enabled: !!user,
  });

  // Fetch messages sent
  const { data: messagesData, isLoading: messagesLoading } = useQuery({
    queryKey: ['messages-analytics', user?.id, timeRange],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('messages_new')
        .select('created_at')
        .eq('sender_id', user?.id)
        .gte('created_at', startDate.toISOString())
        .lte('created_at', endDate.toISOString())
        .order('created_at', { ascending: true });

      if (error) throw error;
      return data || [];
    },
    enabled: !!user,
  });

  // Fetch engagement data
  const { data: engagementData, isLoading: engagementLoading } = useQuery({
    queryKey: ['engagement-analytics', user?.id],
    queryFn: async () => {
      const [connectionsCount, conversationsCount, profile] = await Promise.all([
        supabase
          .from('connections')
          .select('id', { count: 'exact', head: true })
          .or(`user_id.eq.${user?.id},connected_user_id.eq.${user?.id}`)
          .eq('status', 'accepted'),
        supabase.rpc('get_user_conversations', { p_user_id: user?.id }),
        supabase
          .from('profiles')
          .select('*')
          .eq('id', user?.id)
          .single(),
      ]);

      return {
        totalConnections: connectionsCount.count || 0,
        totalConversations: conversationsCount.data?.length || 0,
        profileCompleteness: calculateProfileCompleteness(profile.data),
      };
    },
    enabled: !!user,
  });

  const calculateProfileCompleteness = (profile: any) => {
    if (!profile) return 0;
    const fields = [
      profile.full_name,
      profile.headline,
      profile.bio,
      profile.location,
      profile.avatar_url,
      profile.skills?.length > 0,
      profile.interests?.length > 0,
    ];
    const completed = fields.filter(Boolean).length;
    return Math.round((completed / fields.length) * 100);
  };

  // Process data for charts
  const processViewsData = () => {
    if (!profileViewsData) return [];
    const grouped = profileViewsData.reduce((acc: any, view) => {
      const date = new Date(view.viewed_at).toLocaleDateString();
      acc[date] = (acc[date] || 0) + 1;
      return acc;
    }, {});
    return Object.entries(grouped).map(([date, views]) => ({ date, views }));
  };

  const processConnectionsData = () => {
    if (!connectionsData) return [];
    const grouped = connectionsData.reduce((acc: any, conn) => {
      const date = new Date(conn.created_at).toLocaleDateString();
      acc[date] = (acc[date] || 0) + 1;
      return acc;
    }, {});
    return Object.entries(grouped).map(([date, connections]) => ({ date, connections }));
  };

  const processMessagesData = () => {
    if (!messagesData) return [];
    const grouped = messagesData.reduce((acc: any, msg) => {
      const date = new Date(msg.created_at).toLocaleDateString();
      acc[date] = (acc[date] || 0) + 1;
      return acc;
    }, {});
    return Object.entries(grouped).map(([date, messages]) => ({ date, messages }));
  };

  const isLoading = viewsLoading || connectionsLoading || messagesLoading || engagementLoading;

  if (!user) {
    return (
      <Card className="p-8 text-center">
        <p className="text-muted-foreground">Please log in to view your analytics</p>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Your Analytics</h1>
        <p className="text-muted-foreground">
          Track your profile performance and engagement over time
        </p>
      </div>

      {/* Time Range Selector */}
      <div className="flex gap-2">
        <Button
          variant={timeRange === '7d' ? 'default' : 'outline'}
          onClick={() => setTimeRange('7d')}
        >
          7 Days
        </Button>
        <Button
          variant={timeRange === '30d' ? 'default' : 'outline'}
          onClick={() => setTimeRange('30d')}
        >
          30 Days
        </Button>
        <Button
          variant={timeRange === '90d' ? 'default' : 'outline'}
          onClick={() => setTimeRange('90d')}
        >
          90 Days
        </Button>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : (
        <>
          {/* Key Metrics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Profile Views</p>
                  <p className="text-2xl font-bold">{profileViewsData?.length || 0}</p>
                </div>
                <Eye className="h-8 w-8 text-primary" />
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">New Connections</p>
                  <p className="text-2xl font-bold">{connectionsData?.length || 0}</p>
                </div>
                <Users className="h-8 w-8 text-primary" />
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Messages Sent</p>
                  <p className="text-2xl font-bold">{messagesData?.length || 0}</p>
                </div>
                <MessageSquare className="h-8 w-8 text-primary" />
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Profile Strength</p>
                  <p className="text-2xl font-bold">{engagementData?.profileCompleteness || 0}%</p>
                </div>
                <TrendingUp className="h-8 w-8 text-primary" />
              </div>
            </Card>
          </div>

          {/* Charts */}
          <Tabs defaultValue="views" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="views">Profile Views</TabsTrigger>
              <TabsTrigger value="connections">Connections</TabsTrigger>
              <TabsTrigger value="messages">Messages</TabsTrigger>
            </TabsList>

            <TabsContent value="views">
              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4">Profile Views Over Time</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={processViewsData()}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Area type="monotone" dataKey="views" stroke="hsl(var(--primary))" fill="hsl(var(--primary))" fillOpacity={0.3} />
                  </AreaChart>
                </ResponsiveContainer>
              </Card>
            </TabsContent>

            <TabsContent value="connections">
              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4">New Connections Over Time</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={processConnectionsData()}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="connections" fill="hsl(var(--primary))" />
                  </BarChart>
                </ResponsiveContainer>
              </Card>
            </TabsContent>

            <TabsContent value="messages">
              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4">Messages Sent Over Time</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={processMessagesData()}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="messages" stroke="hsl(var(--primary))" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </Card>
            </TabsContent>
          </Tabs>
        </>
      )}
    </div>
  );
};
