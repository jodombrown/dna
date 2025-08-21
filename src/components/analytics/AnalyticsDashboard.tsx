import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  BarChart3, 
  Users, 
  TrendingUp, 
  Target, 
  Calendar,
  MessageSquare,
  Award,
  Globe,
  Activity,
  Download
} from 'lucide-react';
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar } from 'recharts';

interface AnalyticsData {
  totalConnections: number;
  totalPosts: number;
  totalEvents: number;
  impactScore: number;
  profileViews: number;
  engagementRate: number;
  growthRate: number;
}

interface ActivityData {
  date: string;
  connections: number;
  posts: number;
  events: number;
  engagement: number;
}

interface RegionData {
  region: string;
  users: number;
  percentage: number;
}

const AnalyticsDashboard = () => {
  const { user, profile } = useAuth();
  const [analytics, setAnalytics] = useState<AnalyticsData>({
    totalConnections: 0,
    totalPosts: 0,
    totalEvents: 0,
    impactScore: 0,
    profileViews: 0,
    engagementRate: 0,
    growthRate: 0
  });
  const [activityData, setActivityData] = useState<ActivityData[]>([]);
  const [regionData, setRegionData] = useState<RegionData[]>([]);
  const [timeRange, setTimeRange] = useState('30d');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchAnalyticsData();
    }
  }, [user, timeRange]);

  const fetchAnalyticsData = async () => {
    if (!user) return;

    try {
      setLoading(true);

      // Fetch user's basic stats
      const [connectionsRes, postsRes, eventsRes] = await Promise.all([
        supabase
          .from('connections')
          .select('id')
          .or(`a.eq.${user.id},b.eq.${user.id}`)
          .eq('status', 'accepted'),
        supabase
          .from('posts')
          .select('id')
          .eq('author_id', user.id),
        supabase
          .from('event_registrations')
          .select('id')
          .eq('user_id', user.id)
      ]);

      // Generate mock activity data for the chart
      const mockActivityData = generateMockActivityData(timeRange);
      const mockRegionData = generateMockRegionData();

      setAnalytics({
        totalConnections: connectionsRes.data?.length || 0,
        totalPosts: postsRes.data?.length || 0,
        totalEvents: eventsRes.data?.length || 0,
        impactScore: profile?.impact_score || 0,
        profileViews: Math.floor(Math.random() * 100) + 50, // Mock data
        engagementRate: Math.floor(Math.random() * 40) + 60, // Mock data
        growthRate: Math.floor(Math.random() * 20) + 10 // Mock data
      });

      setActivityData(mockActivityData);
      setRegionData(mockRegionData);
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateMockActivityData = (range: string) => {
    const days = range === '7d' ? 7 : range === '30d' ? 30 : 90;
    const data = [];
    
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      
      data.push({
        date: date.toISOString().split('T')[0],
        connections: Math.floor(Math.random() * 5),
        posts: Math.floor(Math.random() * 3),
        events: Math.floor(Math.random() * 2),
        engagement: Math.floor(Math.random() * 50) + 25
      });
    }
    
    return data;
  };

  const generateMockRegionData = (): RegionData[] => [
    { region: 'North America', users: 45, percentage: 45 },
    { region: 'Europe', users: 25, percentage: 25 },
    { region: 'Africa', users: 20, percentage: 20 },
    { region: 'Other', users: 10, percentage: 10 }
  ];

  const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff7c7c'];

  const exportData = () => {
    const data = {
      analytics,
      activityData,
      regionData,
      exportDate: new Date().toISOString(),
      timeRange
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `dna-analytics-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(8)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-20 bg-muted rounded" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Analytics Dashboard</h1>
          <p className="text-muted-foreground">
            Track your impact and engagement in the DNA community
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={exportData}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Connections</p>
                <p className="text-2xl font-bold">{analytics.totalConnections}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center">
                <Users className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
              <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
              <span className="text-green-600">+{analytics.growthRate}% growth</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Posts Shared</p>
                <p className="text-2xl font-bold">{analytics.totalPosts}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900/20 rounded-lg flex items-center justify-center">
                <MessageSquare className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
            </div>
            <div className="mt-4">
              <Progress value={analytics.engagementRate} className="h-2" />
              <p className="text-sm text-muted-foreground mt-1">
                {analytics.engagementRate}% engagement rate
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Events Attended</p>
                <p className="text-2xl font-bold">{analytics.totalEvents}</p>
              </div>
              <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/20 rounded-lg flex items-center justify-center">
                <Calendar className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
            </div>
            <div className="mt-4">
              <Badge variant="secondary">Active participant</Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Impact Score</p>
                <p className="text-2xl font-bold">{analytics.impactScore}</p>
              </div>
              <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/20 rounded-lg flex items-center justify-center">
                <Award className="w-6 h-6 text-orange-600 dark:text-orange-400" />
              </div>
            </div>
            <div className="mt-4">
              <Progress value={(analytics.impactScore / 1000) * 100} className="h-2" />
              <p className="text-sm text-muted-foreground mt-1">
                Next milestone: {Math.ceil(analytics.impactScore / 100) * 100}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <Tabs defaultValue="activity" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="activity">Activity Trends</TabsTrigger>
          <TabsTrigger value="engagement">Engagement</TabsTrigger>
          <TabsTrigger value="community">Community</TabsTrigger>
        </TabsList>

        <TabsContent value="activity" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Activity className="h-5 w-5" />
                <span>Activity Over Time</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={activityData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="date" 
                      tickFormatter={(value) => new Date(value).toLocaleDateString()}
                    />
                    <YAxis />
                    <Tooltip 
                      labelFormatter={(value) => new Date(value).toLocaleDateString()}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="connections" 
                      stroke="#8884d8" 
                      strokeWidth={2}
                      name="Connections"
                    />
                    <Line 
                      type="monotone" 
                      dataKey="posts" 
                      stroke="#82ca9d" 
                      strokeWidth={2}
                      name="Posts"
                    />
                    <Line 
                      type="monotone" 
                      dataKey="events" 
                      stroke="#ffc658" 
                      strokeWidth={2}
                      name="Events"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="engagement" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <TrendingUp className="h-5 w-5" />
                <span>Engagement Metrics</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={activityData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="date" 
                      tickFormatter={(value) => new Date(value).toLocaleDateString()}
                    />
                    <YAxis />
                    <Tooltip 
                      labelFormatter={(value) => new Date(value).toLocaleDateString()}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="engagement" 
                      stroke="#8884d8" 
                      fill="#8884d8" 
                      fillOpacity={0.3}
                      name="Engagement %"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="community" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Globe className="h-5 w-5" />
                  <span>Community Distribution</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={regionData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ region, percentage }) => `${region}: ${percentage}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="users"
                      >
                        {regionData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <BarChart3 className="h-5 w-5" />
                  <span>Growth by Region</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={regionData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="region" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="users" fill="#8884d8" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Insights */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Target className="h-5 w-5" />
            <span>Key Insights</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <h3 className="font-semibold text-lg">Most Active Day</h3>
              <p className="text-2xl font-bold text-primary">Wednesday</p>
              <p className="text-sm text-muted-foreground">
                Your highest engagement happens mid-week
              </p>
            </div>
            <div className="space-y-2">
              <h3 className="font-semibold text-lg">Top Content Type</h3>
              <p className="text-2xl font-bold text-primary">Professional Updates</p>
              <p className="text-sm text-muted-foreground">
                Career-focused posts get the most engagement
              </p>
            </div>
            <div className="space-y-2">
              <h3 className="font-semibold text-lg">Network Growth</h3>
              <p className="text-2xl font-bold text-primary">+{analytics.growthRate}%</p>
              <p className="text-sm text-muted-foreground">
                Your network is growing faster than average
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AnalyticsDashboard;