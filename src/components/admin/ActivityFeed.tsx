import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  UserPlus, 
  MessageSquare, 
  Flag, 
  Building, 
  Calendar,
  AlertTriangle 
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface ActivityItem {
  id: string;
  type: 'user_signup' | 'new_post' | 'flagged_content' | 'community_request' | 'event_created' | 'system_alert';
  title: string;
  description: string;
  timestamp: string;
  user?: {
    name: string;
    avatar?: string;
    email: string;
  };
  metadata?: Record<string, any>;
}

export function ActivityFeed() {
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRecentActivity = async () => {
      try {
        // Fetch recent user signups
        const { data: profiles } = await supabase
          .from('profiles')
          .select('id, full_name, email, avatar_url, created_at')
          .order('created_at', { ascending: false })
          .limit(5);

        // Fetch recent posts
        const { data: posts } = await supabase
          .from('posts')
          .select(`
            id, 
            content, 
            created_at,
            profiles:author_id (full_name, email, avatar_url)
          `)
          .order('created_at', { ascending: false })
          .limit(5);

        // Fetch recent communities
        const { data: communities } = await supabase
          .from('communities')
          .select(`
            id, 
            name, 
            created_at,
            profiles:created_by (full_name, email, avatar_url)
          `)
          .order('created_at', { ascending: false })
          .limit(3);

        // Combine and format activities
        const allActivities: ActivityItem[] = [];

        // Add user signups
        profiles?.forEach(profile => {
          allActivities.push({
            id: `signup-${profile.id}`,
            type: 'user_signup',
            title: 'New User Registration',
            description: `${profile.full_name || 'New user'} joined the platform`,
            timestamp: profile.created_at,
            user: {
              name: profile.full_name || 'Anonymous',
              avatar: profile.avatar_url,
              email: profile.email || ''
            }
          });
        });

        // Add posts
        posts?.forEach(post => {
          allActivities.push({
            id: `post-${post.id}`,
            type: 'new_post',
            title: 'New Post Created',
            description: post.content?.slice(0, 100) + (post.content && post.content.length > 100 ? '...' : '') || 'New post published',
            timestamp: post.created_at,
            user: {
              name: (post.profiles as any)?.full_name || 'Anonymous',
              avatar: (post.profiles as any)?.avatar_url,
              email: (post.profiles as any)?.email || ''
            }
          });
        });

        // Add communities
        communities?.forEach(community => {
          allActivities.push({
            id: `community-${community.id}`,
            type: 'community_request',
            title: 'New Community Created',
            description: `Community "${community.name}" was created`,
            timestamp: community.created_at,
            user: {
              name: (community.profiles as any)?.full_name || 'Anonymous',
              avatar: (community.profiles as any)?.avatar_url,
              email: (community.profiles as any)?.email || ''
            }
          });
        });

        // Sort by timestamp
        allActivities.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
        
        setActivities(allActivities.slice(0, 10));
      } catch (error) {
        console.error('Error fetching activity:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchRecentActivity();
  }, []);

  const getActivityIcon = (type: ActivityItem['type']) => {
    switch (type) {
      case 'user_signup':
        return <UserPlus className="w-4 h-4 text-green-600" />;
      case 'new_post':
        return <MessageSquare className="w-4 h-4 text-blue-600" />;
      case 'flagged_content':
        return <Flag className="w-4 h-4 text-red-600" />;
      case 'community_request':
        return <Building className="w-4 h-4 text-purple-600" />;
      case 'event_created':
        return <Calendar className="w-4 h-4 text-orange-600" />;
      case 'system_alert':
        return <AlertTriangle className="w-4 h-4 text-yellow-600" />;
      default:
        return <MessageSquare className="w-4 h-4 text-gray-600" />;
    }
  };

  const getActivityBadgeColor = (type: ActivityItem['type']) => {
    switch (type) {
      case 'user_signup':
        return 'bg-green-100 text-green-800';
      case 'new_post':
        return 'bg-blue-100 text-blue-800';
      case 'flagged_content':
        return 'bg-red-100 text-red-800';
      case 'community_request':
        return 'bg-purple-100 text-purple-800';
      case 'event_created':
        return 'bg-orange-100 text-orange-800';
      case 'system_alert':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>Latest platform events and user actions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center space-x-3 animate-pulse">
                <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
                <div className="flex-1">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          Recent Activity
          <Badge variant="outline" className="text-xs">
            Live
          </Badge>
        </CardTitle>
        <CardDescription>Latest platform events and user actions</CardDescription>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-96">
          <div className="space-y-4">
            {activities.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <MessageSquare className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p>No recent activity</p>
              </div>
            ) : (
              activities.map((activity) => (
                <div key={activity.id} className="flex items-start space-x-3 p-3 hover:bg-gray-50 rounded-lg transition-colors">
                  <div className="flex-shrink-0">
                    {activity.user?.avatar ? (
                      <Avatar className="w-8 h-8">
                        <AvatarImage src={activity.user.avatar} />
                        <AvatarFallback>
                          {activity.user.name.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                    ) : (
                      <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                        {getActivityIcon(activity.type)}
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h4 className="text-sm font-medium text-gray-900 truncate">
                        {activity.title}
                      </h4>
                      <Badge className={`${getActivityBadgeColor(activity.type)} text-xs ml-2`}>
                        {activity.type.replace('_', ' ')}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600 line-clamp-2">
                      {activity.description}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      {formatDistanceToNow(new Date(activity.timestamp), { addSuffix: true })}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}