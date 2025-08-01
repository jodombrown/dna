import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { Activity, MessageSquare, Calendar, Eye, FileText } from 'lucide-react';
import { Loader } from '@/components/ui/loader';

interface EngagementData {
  date: string;
  posts: number;
  events: number;
  messages: number;
  profile_views: number;
  comments: number;
  total: number;
}

interface EngagementMetrics {
  total_posts: number;
  total_events: number;
  total_messages: number;
  total_views: number;
  total_comments: number;
  daily_avg: number;
}

const EngagementHeatmap = () => {
  const [engagementData, setEngagementData] = useState<EngagementData[]>([]);
  const [metrics, setMetrics] = useState<EngagementMetrics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEngagementData();
  }, []);

  const fetchEngagementData = async () => {
    try {
      setLoading(true);
      
      // Get date range for last 30 days
      const endDate = new Date();
      const startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      
      // Fetch posts data
      const { data: posts, error: postsError } = await supabase
        .from('posts')
        .select('created_at')
        .gte('created_at', startDate.toISOString())
        .lte('created_at', endDate.toISOString());

      // Fetch events data
      const { data: events, error: eventsError } = await supabase
        .from('events')
        .select('created_at')
        .gte('created_at', startDate.toISOString())
        .lte('created_at', endDate.toISOString());

      // Fetch messages data (both conversations and group messages)
      const { data: messages, error: messagesError } = await supabase
        .from('messages')
        .select('created_at')
        .gte('created_at', startDate.toISOString())
        .lte('created_at', endDate.toISOString());

      // Fetch profile views
      const { data: profileViews, error: viewsError } = await supabase
        .from('profile_views')
        .select('viewed_at')
        .gte('viewed_at', startDate.toISOString())
        .lte('viewed_at', endDate.toISOString());

      // Fetch comments
      const { data: comments, error: commentsError } = await supabase
        .from('comments')
        .select('created_at')
        .gte('created_at', startDate.toISOString())
        .lte('created_at', endDate.toISOString());

      if (postsError || eventsError || messagesError || viewsError || commentsError) {
        throw new Error('Error fetching engagement data');
      }

      // Process data into daily buckets
      const dailyData: { [key: string]: EngagementData } = {};
      
      // Initialize all dates with zero values
      for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
        const dateStr = d.toISOString().split('T')[0];
        dailyData[dateStr] = {
          date: dateStr,
          posts: 0,
          events: 0,
          messages: 0,
          profile_views: 0,
          comments: 0,
          total: 0,
        };
      }

      // Count posts
      posts?.forEach(post => {
        const date = new Date(post.created_at).toISOString().split('T')[0];
        if (dailyData[date]) {
          dailyData[date].posts++;
          dailyData[date].total++;
        }
      });

      // Count events
      events?.forEach(event => {
        const date = new Date(event.created_at).toISOString().split('T')[0];
        if (dailyData[date]) {
          dailyData[date].events++;
          dailyData[date].total++;
        }
      });

      // Count messages
      messages?.forEach(message => {
        const date = new Date(message.created_at).toISOString().split('T')[0];
        if (dailyData[date]) {
          dailyData[date].messages++;
          dailyData[date].total++;
        }
      });

      // Count profile views
      profileViews?.forEach(view => {
        const date = new Date(view.viewed_at).toISOString().split('T')[0];
        if (dailyData[date]) {
          dailyData[date].profile_views++;
          dailyData[date].total++;
        }
      });

      // Count comments
      comments?.forEach(comment => {
        const date = new Date(comment.created_at).toISOString().split('T')[0];
        if (dailyData[date]) {
          dailyData[date].comments++;
          dailyData[date].total++;
        }
      });

      const chartData = Object.values(dailyData).sort((a, b) => a.date.localeCompare(b.date));
      setEngagementData(chartData);

      // Calculate metrics
      const totalPosts = posts?.length || 0;
      const totalEvents = events?.length || 0;
      const totalMessages = messages?.length || 0;
      const totalViews = profileViews?.length || 0;
      const totalComments = comments?.length || 0;
      const totalEngagement = totalPosts + totalEvents + totalMessages + totalViews + totalComments;
      const dailyAvg = totalEngagement / 30;

      setMetrics({
        total_posts: totalPosts,
        total_events: totalEvents,
        total_messages: totalMessages,
        total_views: totalViews,
        total_comments: totalComments,
        daily_avg: dailyAvg,
      });

    } catch (error) {
      console.error('Error fetching engagement data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <Loader label="Loading engagement analytics..." />;
  }

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      {metrics && (
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <FileText className="h-6 w-6 text-dna-forest" />
              <div>
                <p className="text-xl font-bold text-foreground">{metrics.total_posts}</p>
                <p className="text-xs text-muted-foreground">Posts</p>
              </div>
            </div>
          </Card>
          
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <Calendar className="h-6 w-6 text-dna-emerald" />
              <div>
                <p className="text-xl font-bold text-foreground">{metrics.total_events}</p>
                <p className="text-xs text-muted-foreground">Events</p>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center gap-3">
              <MessageSquare className="h-6 w-6 text-dna-copper" />
              <div>
                <p className="text-xl font-bold text-foreground">{metrics.total_messages}</p>
                <p className="text-xs text-muted-foreground">Messages</p>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center gap-3">
              <Eye className="h-6 w-6 text-dna-gold" />
              <div>
                <p className="text-xl font-bold text-foreground">{metrics.total_views}</p>
                <p className="text-xs text-muted-foreground">Views</p>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center gap-3">
              <MessageSquare className="h-6 w-6 text-dna-ivory" />
              <div>
                <p className="text-xl font-bold text-foreground">{metrics.total_comments}</p>
                <p className="text-xs text-muted-foreground">Comments</p>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center gap-3">
              <Activity className="h-6 w-6 text-dna-forest" />
              <div>
                <p className="text-xl font-bold text-foreground">{metrics.daily_avg.toFixed(1)}</p>
                <p className="text-xs text-muted-foreground">Daily Avg</p>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Engagement Heatmap */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4">Daily Engagement Activity (Last 30 Days)</h3>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={engagementData}>
              <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
              <XAxis 
                dataKey="date" 
                tick={{ fontSize: 10 }}
                tickFormatter={(value) => new Date(value).toLocaleDateString()}
              />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip 
                labelFormatter={(value) => new Date(value).toLocaleDateString()}
                formatter={(value: any, name: string) => [value, name.replace('_', ' ')]}
              />
              <Bar dataKey="posts" stackId="a" fill="hsl(var(--dna-forest))" name="Posts" />
              <Bar dataKey="events" stackId="a" fill="hsl(var(--dna-emerald))" name="Events" />
              <Bar dataKey="messages" stackId="a" fill="hsl(var(--dna-copper))" name="Messages" />
              <Bar dataKey="profile_views" stackId="a" fill="hsl(var(--dna-gold))" name="Profile Views" />
              <Bar dataKey="comments" stackId="a" fill="hsl(var(--dna-ivory))" name="Comments" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {/* Total Engagement Trend */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4">Total Engagement Trend</h3>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={engagementData}>
              <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
              <XAxis 
                dataKey="date" 
                tick={{ fontSize: 10 }}
                tickFormatter={(value) => new Date(value).toLocaleDateString()}
              />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip 
                labelFormatter={(value) => new Date(value).toLocaleDateString()}
                formatter={(value: any) => [value, 'Total Engagement']}
              />
              <Line 
                type="monotone" 
                dataKey="total" 
                stroke="hsl(var(--dna-forest))" 
                strokeWidth={3}
                name="Total Engagement"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </Card>
    </div>
  );
};

export default EngagementHeatmap;