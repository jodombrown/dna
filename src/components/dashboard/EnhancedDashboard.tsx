import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { 
  TrendingUp, 
  Users, 
  MessageSquare, 
  Calendar,
  Star,
  Award,
  Target,
  Activity,
  ChevronRight,
  Plus
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';

interface DashboardStats {
  connections_count: number;
  posts_count: number;
  events_attended: number;
  profile_views: number;
  impact_score: number;
}

interface RecentActivity {
  id: string;
  type: 'connection' | 'post' | 'event' | 'profile_update';
  title: string;
  description: string;
  created_at: string;
  icon?: string;
}

const EnhancedDashboard = () => {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState<DashboardStats>({
    connections_count: 0,
    posts_count: 0,
    events_attended: 0,
    profile_views: 12,
    impact_score: 0
  });
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, [user?.id]);

  const fetchDashboardData = async () => {
    if (!user?.id) return;

    try {
      // Fetch user stats
      const { data: connections } = await supabase
        .from('connections')
        .select('id')
        .or(`a.eq.${user.id},b.eq.${user.id}`)
        .eq('status', 'accepted');

      const { data: posts } = await supabase
        .from('posts')
        .select('id')
        .eq('author_id', user.id);

      const { data: events } = await supabase
        .from('event_registrations')
        .select('id')
        .eq('user_id', user.id);

      setStats({
        connections_count: connections?.length || 0,
        posts_count: posts?.length || 0,
        events_attended: events?.length || 0,
        profile_views: 12, // Mock data
        impact_score: profile?.impact_score || 0
      });

      // Fetch recent activity from contributions
      const { data: contributions } = await supabase
        .from('user_contributions')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(5);

      const activities: RecentActivity[] = contributions?.map(contrib => ({
        id: contrib.id,
        type: contrib.type as any,
        title: getActivityTitle(contrib.type, contrib.description),
        description: contrib.description || '',
        created_at: contrib.created_at
      })) || [];

      setRecentActivity(activities);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getActivityTitle = (type: string, description: string) => {
    switch (type) {
      case 'post': return 'New Post Published';
      case 'event': return 'Event Registration';
      case 'task': return 'Task Activity';
      case 'milestone': return 'Milestone Update';
      default: return description?.split(':')[0] || 'Activity';
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'post': return MessageSquare;
      case 'event': return Calendar;
      case 'connection': return Users;
      default: return Activity;
    }
  };

  const profileCompletion = profile?.profile_completeness_score || 0;
  const nextMilestone = profileCompletion < 50 ? 50 : profileCompletion < 80 ? 80 : 100;

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(8)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-20 bg-gray-200 rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
      {/* Welcome Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-dna-forest">
            Welcome back, {profile?.full_name?.split(' ')[0] || 'Member'}!
          </h1>
          <p className="text-gray-600">
            Here's what's happening in your DNA network
          </p>
        </div>
        <Button onClick={() => navigate('/dna/connect')} className="bg-dna-copper hover:bg-dna-copper/90">
          <Plus className="w-4 h-4 mr-2" />
          Connect with Members
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="hover:shadow-lg transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Connections</p>
                <p className="text-2xl font-bold text-dna-forest">{stats.connections_count}</p>
              </div>
              <div className="w-12 h-12 bg-dna-emerald/10 rounded-lg flex items-center justify-center">
                <Users className="w-6 h-6 text-dna-emerald" />
              </div>
            </div>
            <div className="mt-4 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-green-500" />
              <span className="text-sm text-green-600">Growing network</span>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Posts Shared</p>
                <p className="text-2xl font-bold text-dna-forest">{stats.posts_count}</p>
              </div>
              <div className="w-12 h-12 bg-dna-gold/10 rounded-lg flex items-center justify-center">
                <MessageSquare className="w-6 h-6 text-dna-gold" />
              </div>
            </div>
            <div className="mt-4">
              <Button 
                variant="ghost" 
                size="sm" 
                className="text-dna-gold hover:text-dna-gold/80 p-0"
                onClick={() => navigate('/dna/dashboard')}
              >
                Share something new
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Events Joined</p>
                <p className="text-2xl font-bold text-dna-forest">{stats.events_attended}</p>
              </div>
              <div className="w-12 h-12 bg-dna-copper/10 rounded-lg flex items-center justify-center">
                <Calendar className="w-6 h-6 text-dna-copper" />
              </div>
            </div>
            <div className="mt-4">
              <Button 
                variant="ghost" 
                size="sm" 
                className="text-dna-copper hover:text-dna-copper/80 p-0"
                onClick={() => navigate('/dna/events')}
              >
                Discover events
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Impact Score</p>
                <p className="text-2xl font-bold text-dna-forest">{stats.impact_score}</p>
              </div>
              <div className="w-12 h-12 bg-dna-mint/10 rounded-lg flex items-center justify-center">
                <Star className="w-6 h-6 text-dna-mint" />
              </div>
            </div>
            <div className="mt-4">
              <Badge variant="outline" className="text-xs">
                Keep contributing!
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Profile Completion & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Profile Completion */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="w-5 h-5 text-dna-copper" />
              Profile Completion
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium">Current Progress</span>
                <span className="text-sm text-gray-600">{profileCompletion}%</span>
              </div>
              <Progress value={profileCompletion} className="h-3" />
            </div>
            
            <div className="space-y-3">
              <p className="text-sm text-gray-600">
                {profileCompletion < 50 
                  ? "Complete your basic profile to unlock networking features"
                  : profileCompletion < 80 
                  ? "Add more details to maximize your visibility"
                  : "Your profile is looking great! Keep engaging with the community"
                }
              </p>
              
              <Button 
                variant="outline" 
                onClick={() => navigate('/dna/profile/edit')}
                className="w-full"
              >
                {profileCompletion < 100 ? 'Complete Profile' : 'Update Profile'}
                <ChevronRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button 
              variant="outline" 
              className="w-full justify-start" 
              onClick={() => navigate('/dna/connect')}
            >
              <Users className="w-4 h-4 mr-3" />
              Find New Connections
            </Button>
            
            <Button 
              variant="outline" 
              className="w-full justify-start" 
              onClick={() => navigate('/dna/events')}
            >
              <Calendar className="w-4 h-4 mr-3" />
              Explore Events
            </Button>
            
            <Button 
              variant="outline" 
              className="w-full justify-start" 
              onClick={() => navigate('/dna/opportunities')}
            >
              <Award className="w-4 h-4 mr-3" />
              Browse Opportunities
            </Button>
            
            <Button 
              variant="outline" 
              className="w-full justify-start" 
              onClick={() => navigate('/dna/spaces')}
            >
              <Target className="w-4 h-4 mr-3" />
              Join Collaborations
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-dna-emerald" />
            Recent Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          {recentActivity.length === 0 ? (
            <div className="text-center py-8">
              <Activity className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No recent activity</h3>
              <p className="text-gray-600 mb-4">
                Start engaging with the community to see your activity here
              </p>
              <Button onClick={() => navigate('/dna/dashboard')}>
                Share Your First Post
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {recentActivity.map((activity) => {
                const IconComponent = getActivityIcon(activity.type);
                return (
                  <div key={activity.id} className="flex items-center gap-4 p-3 rounded-lg hover:bg-gray-50">
                    <div className="w-10 h-10 bg-dna-emerald/10 rounded-lg flex items-center justify-center">
                      <IconComponent className="w-5 h-5 text-dna-emerald" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900">{activity.title}</h4>
                      <p className="text-sm text-gray-600">{activity.description}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        {new Date(activity.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default EnhancedDashboard;