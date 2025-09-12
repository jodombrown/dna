import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Eye, Heart, MessageCircle, Share, TrendingUp, Calendar } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { format, subDays, parseISO } from 'date-fns';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';

interface PostAnalytics {
  post_id: string;
  event_type: string;
  event_date: string;
  count: number;
  post_title?: string;
}

interface PostAnalyticsProps {
  postId?: string;
  showAllPosts?: boolean;
}

export const PostAnalytics: React.FC<PostAnalyticsProps> = ({ 
  postId, 
  showAllPosts = false 
}) => {
  const { user } = useAuth();
  const [analytics, setAnalytics] = useState<PostAnalytics[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('7d');

  useEffect(() => {
    if (!user) return;

    const fetchAnalytics = async () => {
      try {
        const days = timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : 1;
        const startDate = subDays(new Date(), days);

        let query = supabase
          .from('post_analytics')
          .select(`
            post_id,
            event_type,
            event_date,
            count,
            posts!inner(
              content,
              author_id
            )
          `)
          .gte('event_date', format(startDate, 'yyyy-MM-dd'))
          .eq('posts.author_id', user.id);

        if (postId && !showAllPosts) {
          query = query.eq('post_id', postId);
        }

        const { data, error } = await query.order('event_date', { ascending: false });

        if (error) throw error;

        const processedData = data?.map(item => ({
          post_id: item.post_id,
          event_type: item.event_type,
          event_date: item.event_date,
          count: item.count,
          post_title: item.posts?.content?.substring(0, 50) + '...' || 'Untitled Post'
        })) || [];

        setAnalytics(processedData);
      } catch (error) {
        console.error('Error fetching post analytics:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, [user, postId, showAllPosts, timeRange]);

  const aggregateByType = (eventType: string) => {
    return analytics
      .filter(item => item.event_type === eventType)
      .reduce((sum, item) => sum + item.count, 0);
  };

  const getChartData = () => {
    const days = timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : 1;
    const dateRange = Array.from({ length: days }, (_, i) => {
      const date = subDays(new Date(), days - 1 - i);
      return format(date, 'yyyy-MM-dd');
    });

    return dateRange.map(date => {
      const dayData = analytics.filter(item => item.event_date === date);
      return {
        date: format(parseISO(date), 'MMM dd'),
        views: dayData.filter(item => item.event_type === 'view').reduce((sum, item) => sum + item.count, 0),
        likes: dayData.filter(item => item.event_type === 'like').reduce((sum, item) => sum + item.count, 0),
        comments: dayData.filter(item => item.event_type === 'comment').reduce((sum, item) => sum + item.count, 0),
        shares: dayData.filter(item => item.event_type === 'share').reduce((sum, item) => sum + item.count, 0),
      };
    });
  };

  const getTopPosts = () => {
    const postGroups = analytics.reduce((acc, item) => {
      if (!acc[item.post_id]) {
        acc[item.post_id] = {
          post_id: item.post_id,
          title: item.post_title || 'Untitled',
          total_engagement: 0,
          views: 0,
          likes: 0,
          comments: 0,
          shares: 0
        };
      }
      
      acc[item.post_id][item.event_type] = item.count;
      acc[item.post_id].total_engagement += item.count;
      
      return acc;
    }, {} as Record<string, any>);

    return Object.values(postGroups)
      .sort((a: any, b: any) => b.total_engagement - a.total_engagement)
      .slice(0, 5);
  };

  const getEventIcon = (eventType: string) => {
    switch (eventType) {
      case 'view': return <Eye className="w-4 h-4" />;
      case 'like': return <Heart className="w-4 h-4" />;
      case 'comment': return <MessageCircle className="w-4 h-4" />;
      case 'share': return <Share className="w-4 h-4" />;
      default: return <TrendingUp className="w-4 h-4" />;
    }
  };

  const totalViews = aggregateByType('view');
  const totalLikes = aggregateByType('like');
  const totalComments = aggregateByType('comment');
  const totalShares = aggregateByType('share');
  const chartData = getChartData();
  const topPosts = getTopPosts();

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-20 bg-muted rounded-lg animate-pulse" />
              ))}
            </div>
            <div className="h-64 bg-muted rounded-lg animate-pulse" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Eye className="w-4 h-4 text-blue-500" />
              <div>
                <p className="text-sm text-muted-foreground">Views</p>
                <p className="text-2xl font-bold">{totalViews}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Heart className="w-4 h-4 text-red-500" />
              <div>
                <p className="text-sm text-muted-foreground">Likes</p>
                <p className="text-2xl font-bold">{totalLikes}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <MessageCircle className="w-4 h-4 text-green-500" />
              <div>
                <p className="text-sm text-muted-foreground">Comments</p>
                <p className="text-2xl font-bold">{totalComments}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Share className="w-4 h-4 text-purple-500" />
              <div>
                <p className="text-sm text-muted-foreground">Shares</p>
                <p className="text-2xl font-bold">{totalShares}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              Content Performance
            </CardTitle>
            <Tabs value={timeRange} onValueChange={setTimeRange}>
              <TabsList>
                <TabsTrigger value="1d">Today</TabsTrigger>
                <TabsTrigger value="7d">7 Days</TabsTrigger>
                <TabsTrigger value="30d">30 Days</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </CardHeader>
        <CardContent>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="views" stroke="#3b82f6" strokeWidth={2} />
                <Line type="monotone" dataKey="likes" stroke="#ef4444" strokeWidth={2} />
                <Line type="monotone" dataKey="comments" stroke="#22c55e" strokeWidth={2} />
                <Line type="monotone" dataKey="shares" stroke="#a855f7" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {showAllPosts && topPosts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Top Performing Posts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {topPosts.map((post, index) => (
                <div key={post.post_id} className="flex items-center gap-3 p-3 border rounded-lg">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <span className="text-sm font-bold">#{index + 1}</span>
                  </div>
                  <div className="flex-1">
                    <p className="font-medium truncate">{post.title}</p>
                    <div className="flex gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Eye className="w-3 h-3" />
                        {post.views}
                      </span>
                      <span className="flex items-center gap-1">
                        <Heart className="w-3 h-3" />
                        {post.likes}
                      </span>
                      <span className="flex items-center gap-1">
                        <MessageCircle className="w-3 h-3" />
                        {post.comments}
                      </span>
                      <span className="flex items-center gap-1">
                        <Share className="w-3 h-3" />
                        {post.shares}
                      </span>
                    </div>
                  </div>
                  <Badge variant="secondary">
                    {post.total_engagement} total
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};