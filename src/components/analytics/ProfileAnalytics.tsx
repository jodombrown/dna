import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Eye, TrendingUp, Calendar, Users } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { format, subDays, isToday, isYesterday } from 'date-fns';

interface ProfileView {
  id: string;
  viewer_id: string;
  viewed_at: string;
  view_type: string;
  viewer?: {
    display_name: string;
    avatar_url: string;
    profession: string;
  };
}

interface ProfileAnalyticsProps {
  userId?: string;
}

export const ProfileAnalytics: React.FC<ProfileAnalyticsProps> = ({ userId }) => {
  const { user } = useAuth();
  const [views, setViews] = useState<ProfileView[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('7d');
  
  const profileId = userId || user?.id;

  useEffect(() => {
    if (!profileId) return;
    
    const fetchAnalytics = async () => {
      try {
        const days = timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : 1;
        const startDate = subDays(new Date(), days);
        
        const { data: viewsData, error } = await supabase
          .from('profile_views')
          .select(`
            id,
            viewer_id,
            viewed_at,
            view_type
          `)
          .eq('profile_id', profileId)
          .gte('viewed_at', startDate.toISOString())
          .order('viewed_at', { ascending: false });

        if (error) throw error;

        // Get viewer profiles separately
        const viewerIds = [...new Set(viewsData?.map(view => view.viewer_id) || [])];
        const { data: profilesData, error: profilesError } = await supabase
          .from('profiles')
          .select('id, display_name, avatar_url, profession')
          .in('id', viewerIds);

        if (profilesError) throw profilesError;

        const enrichedViews = viewsData?.map(view => {
          const viewerProfile = profilesData?.find(profile => profile.id === view.viewer_id);
          return {
            ...view,
            viewer: {
              display_name: viewerProfile?.display_name || 'Anonymous User',
              avatar_url: viewerProfile?.avatar_url || '',
              profession: viewerProfile?.profession || ''
            }
          };
        }) || [];

        setViews(enrichedViews);
      } catch (error) {
        console.error('Error fetching profile analytics:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, [profileId, timeRange]);

  const formatViewTime = (timestamp: string) => {
    const date = new Date(timestamp);
    if (isToday(date)) return `Today at ${format(date, 'h:mm a')}`;
    if (isYesterday(date)) return `Yesterday at ${format(date, 'h:mm a')}`;
    return format(date, 'MMM d, h:mm a');
  };

  const totalViews = views.length;
  const uniqueViewers = new Set(views.map(v => v.viewer_id)).size;
  const todayViews = views.filter(v => isToday(new Date(v.viewed_at))).length;

  if (!user || (userId && userId !== user.id)) {
    return (
      <Card>
        <CardContent className="p-6 text-center text-muted-foreground">
          Profile analytics are private
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Eye className="w-4 h-4 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground">Total Views</p>
                <p className="text-2xl font-bold">{totalViews}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground">Unique Viewers</p>
                <p className="text-2xl font-bold">{uniqueViewers}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground">Today</p>
                <p className="text-2xl font-bold">{todayViews}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Eye className="w-5 h-5" />
              Profile Views
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
          {loading ? (
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex items-center gap-3 p-3 rounded-lg bg-muted/30 animate-pulse">
                  <div className="w-10 h-10 rounded-full bg-muted" />
                  <div className="flex-1 space-y-2">
                    <div className="w-32 h-4 bg-muted rounded" />
                    <div className="w-24 h-3 bg-muted rounded" />
                  </div>
                </div>
              ))}
            </div>
          ) : views.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Eye className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No profile views in the selected time range</p>
            </div>
          ) : (
            <div className="space-y-2">
              {views.map((view) => (
                <div key={view.id} className="flex items-center gap-3 p-3 rounded-lg border hover:bg-muted/30 transition-colors">
                  <Avatar className="w-10 h-10">
                    <AvatarImage src={view.viewer?.avatar_url} />
                    <AvatarFallback>
                      {view.viewer?.display_name?.charAt(0) || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <p className="font-medium">{view.viewer?.display_name}</p>
                    {view.viewer?.profession && (
                      <p className="text-sm text-muted-foreground">{view.viewer.profession}</p>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">{formatViewTime(view.viewed_at)}</p>
                    <Badge variant="secondary" className="text-xs">
                      {view.view_type.replace('_', ' ')}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};