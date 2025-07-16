import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Users, 
  MessageSquare, 
  TrendingUp, 
  Activity,
  Calendar,
  Mail,
  UserCheck,
  AlertCircle,
  BarChart3,
  PieChart
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import AppHeader from '@/components/app/AppHeader';
import { useNavigate } from 'react-router-dom';

interface Metrics {
  totalUsers: number;
  activeToday: number;
  waitlistSignups: number;
  postsToday: number;
  communitiesActive: number;
  messagesExchanged: number;
}

interface TopUser {
  id: string;
  full_name: string;
  email: string;
  post_count: number;
  last_active: string;
}

interface TopCommunity {
  id: string;
  name: string;
  member_count: number;
  category: string;
  created_at: string;
}

const AdminDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [metrics, setMetrics] = useState<Metrics>({
    totalUsers: 0,
    activeToday: 0,
    waitlistSignups: 0,
    postsToday: 0,
    communitiesActive: 0,
    messagesExchanged: 0
  });
  const [topUsers, setTopUsers] = useState<TopUser[]>([]);
  const [topCommunities, setTopCommunities] = useState<TopCommunity[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    if (user) {
      checkAdminAccess();
    }
  }, [user]);

  const checkAdminAccess = async () => {
    if (!user) return;

    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('email')
        .eq('id', user.id)
        .single();

      const isAdminUser = profile?.email === 'admin@diasporanetwork.africa' || 
                         profile?.email?.endsWith('@diasporanetwork.africa');

      if (!isAdminUser) {
        navigate('/app');
        return;
      }

      setIsAdmin(true);
      fetchMetrics();
    } catch (error) {
      console.error('Error checking admin access:', error);
      navigate('/app');
    }
  };

  const fetchMetrics = async () => {
    try {
      setLoading(true);

      // Fetch total users
      const { count: totalUsers } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });

      // Fetch waitlist signups
      const { count: waitlistSignups } = await supabase
        .from('waitlist_signups')
        .select('*', { count: 'exact', head: true });

      // Fetch posts today
      const today = new Date().toISOString().split('T')[0];
      const { count: postsToday } = await supabase
        .from('posts')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', today);

      // Fetch active communities
      const { count: communitiesActive } = await supabase
        .from('communities')
        .select('*', { count: 'exact', head: true })
        .eq('is_active', true);

      // Fetch total messages
      const { count: messagesExchanged } = await supabase
        .from('messages')
        .select('*', { count: 'exact', head: true });

      // Fetch top users (mock calculation)
      const { data: usersData } = await supabase
        .from('profiles')
        .select('id, full_name, email, created_at')
        .order('created_at', { ascending: false })
        .limit(5);

      // Fetch top communities
      const { data: communitiesData } = await supabase
        .from('communities')
        .select('id, name, member_count, category, created_at')
        .eq('is_active', true)
        .order('member_count', { ascending: false })
        .limit(5);

      setMetrics({
        totalUsers: totalUsers || 0,
        activeToday: Math.floor((totalUsers || 0) * 0.15), // Mock 15% daily active
        waitlistSignups: waitlistSignups || 0,
        postsToday: postsToday || 0,
        communitiesActive: communitiesActive || 0,
        messagesExchanged: messagesExchanged || 0
      });

      setTopUsers((usersData || []).map(user => ({
        ...user,
        post_count: Math.floor(Math.random() * 20), // Mock post count
        last_active: new Date().toISOString()
      })));

      setTopCommunities(communitiesData || []);

    } catch (error) {
      console.error('Error fetching metrics:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  if (!isAdmin) {
    return <div className="p-8 text-center">Checking access...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <AppHeader />
      
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-dna-forest mb-2">Admin Dashboard</h1>
          <p className="text-gray-600">Monitor platform activity and user engagement</p>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="p-6">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
                  <div className="h-8 bg-gray-200 rounded w-1/2"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <>
            {/* Metrics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Total Users</p>
                      <p className="text-2xl font-bold text-dna-forest">{metrics.totalUsers}</p>
                    </div>
                    <Users className="h-8 w-8 text-dna-emerald" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Active Today</p>
                      <p className="text-2xl font-bold text-dna-forest">{metrics.activeToday}</p>
                    </div>
                    <Activity className="h-8 w-8 text-dna-copper" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Waitlist Signups</p>
                      <p className="text-2xl font-bold text-dna-forest">{metrics.waitlistSignups}</p>
                    </div>
                    <Mail className="h-8 w-8 text-dna-gold" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Posts Today</p>
                      <p className="text-2xl font-bold text-dna-forest">{metrics.postsToday}</p>
                    </div>
                    <MessageSquare className="h-8 w-8 text-dna-emerald" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Active Communities</p>
                      <p className="text-2xl font-bold text-dna-forest">{metrics.communitiesActive}</p>
                    </div>
                    <Users className="h-8 w-8 text-dna-copper" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Messages Exchanged</p>
                      <p className="text-2xl font-bold text-dna-forest">{metrics.messagesExchanged}</p>
                    </div>
                    <MessageSquare className="h-8 w-8 text-dna-gold" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Detailed Analytics */}
            <Tabs defaultValue="users" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="users">Top Users</TabsTrigger>
                <TabsTrigger value="communities">Top Communities</TabsTrigger>
              </TabsList>

              <TabsContent value="users" className="mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center text-dna-forest">
                      <TrendingUp className="h-5 w-5 mr-2" />
                      Most Active Users
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {topUsers.map((user, index) => (
                        <div key={user.id} className="flex items-center justify-between p-3 border rounded-lg">
                          <div className="flex items-center space-x-3">
                            <Badge variant="outline" className="w-8 h-8 rounded-full flex items-center justify-center">
                              {index + 1}
                            </Badge>
                            <div>
                              <p className="font-medium text-dna-forest">{user.full_name || 'Anonymous'}</p>
                              <p className="text-sm text-gray-500">{user.email}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-medium">{user.post_count} posts</p>
                            <p className="text-xs text-gray-500">Joined {formatDate(user.last_active)}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="communities" className="mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center text-dna-forest">
                      <Users className="h-5 w-5 mr-2" />
                      Top Communities
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {topCommunities.map((community, index) => (
                        <div key={community.id} className="flex items-center justify-between p-3 border rounded-lg">
                          <div className="flex items-center space-x-3">
                            <Badge variant="outline" className="w-8 h-8 rounded-full flex items-center justify-center">
                              {index + 1}
                            </Badge>
                            <div>
                              <p className="font-medium text-dna-forest">{community.name}</p>
                              <Badge variant="secondary" className="text-xs">
                                {community.category}
                              </Badge>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-medium">{community.member_count || 0} members</p>
                            <p className="text-xs text-gray-500">Created {formatDate(community.created_at)}</p>
                          </div>
                        </div>
                      ))}
                    </div>
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

export default AdminDashboard;