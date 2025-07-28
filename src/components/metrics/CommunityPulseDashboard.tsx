import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Users, MessageSquare, TrendingUp, Globe, Calendar, Target,
  Heart, Share2, Eye, UserPlus, Activity, Award, Clock
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { metricsService } from '@/services/metricsService';

interface PlatformMetrics {
  totalUsers: number;
  activeUsersThisWeek: number;
  totalPosts: number;
  totalConnections: number;
  totalCommunities: number;
  totalEvents: number;
  weeklyGrowthRate: number;
  engagementRate: number;
  averageSessionTime: string;
}

interface UserMetrics {
  connectionsCount: number;
  postsCount: number;
  communitiesJoined: number;
  eventsAttended: number;
  likesReceived: number;
  commentsReceived: number;
  profileViews: number;
  impactScore: number;
  weeklyActivity: number;
  joinDate: string;
}

const CommunityPulseDashboard: React.FC = () => {
  const { user } = useAuth();
  const [platformMetrics, setPlatformMetrics] = useState<PlatformMetrics | null>(null);
  const [userMetrics, setUserMetrics] = useState<UserMetrics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMetrics();
  }, [user]);

  const fetchMetrics = async () => {
    try {
      setLoading(true);
      const [platform, userMets] = await Promise.all([
        metricsService.getPlatformMetrics(),
        user ? metricsService.getUserMetrics(user.id) : Promise.resolve(null)
      ]);
      
      setPlatformMetrics(platform);
      setUserMetrics(userMets);
    } catch (error) {
      console.error('Error fetching metrics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-1/3"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="h-32 bg-gray-200 rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-6">
      {/* Header Section */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold text-dna-forest">Community Pulse</h1>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Real-time insights into our growing diaspora network and your personal impact within the community.
        </p>
      </div>

      <Tabs defaultValue="platform" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="platform">Platform Insights</TabsTrigger>
          <TabsTrigger value="personal">Your Impact</TabsTrigger>
        </TabsList>

        <TabsContent value="platform" className="space-y-6">
          {/* Key Platform Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="bg-gradient-to-br from-dna-emerald/10 to-dna-emerald/5">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Members</p>
                    <p className="text-3xl font-bold text-dna-forest">
                      {platformMetrics?.totalUsers.toLocaleString() || '0'}
                    </p>
                  </div>
                  <Users className="w-8 h-8 text-dna-emerald" />
                </div>
                <div className="mt-4">
                  <Badge variant="secondary" className="bg-dna-emerald/20 text-dna-emerald">
                    +{platformMetrics?.weeklyGrowthRate || 0}% this week
                  </Badge>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-dna-copper/10 to-dna-copper/5">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Active This Week</p>
                    <p className="text-3xl font-bold text-dna-forest">
                      {platformMetrics?.activeUsersThisWeek.toLocaleString() || '0'}
                    </p>
                  </div>
                  <Activity className="w-8 h-8 text-dna-copper" />
                </div>
                <div className="mt-4">
                  <Progress 
                    value={(platformMetrics?.activeUsersThisWeek || 0) / (platformMetrics?.totalUsers || 1) * 100} 
                    className="h-2"
                  />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-dna-gold/10 to-dna-gold/5">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Connections</p>
                    <p className="text-3xl font-bold text-dna-forest">
                      {platformMetrics?.totalConnections.toLocaleString() || '0'}
                    </p>
                  </div>
                  <Globe className="w-8 h-8 text-dna-gold" />
                </div>
                <div className="mt-4">
                  <span className="text-sm text-gray-600">
                    Bridging the diaspora globally
                  </span>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-dna-forest/10 to-dna-forest/5">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Engagement Rate</p>
                    <p className="text-3xl font-bold text-dna-forest">
                      {platformMetrics?.engagementRate || 0}%
                    </p>
                  </div>
                  <TrendingUp className="w-8 h-8 text-dna-forest" />
                </div>
                <div className="mt-4">
                  <span className="text-sm text-gray-600">
                    Avg. session: {platformMetrics?.averageSessionTime || '0m'}
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Detailed Platform Analytics */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="w-5 h-5" />
                  Community Activity
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Posts Created</span>
                    <span className="font-semibold">{platformMetrics?.totalPosts.toLocaleString() || '0'}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Communities</span>
                    <span className="font-semibold">{platformMetrics?.totalCommunities.toLocaleString() || '0'}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Events Hosted</span>
                    <span className="font-semibold">{platformMetrics?.totalEvents.toLocaleString() || '0'}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="w-5 h-5" />
                  Growth Insights
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm text-gray-600">Weekly Growth</span>
                      <span className="text-sm font-semibold text-dna-emerald">
                        +{platformMetrics?.weeklyGrowthRate || 0}%
                      </span>
                    </div>
                    <Progress value={platformMetrics?.weeklyGrowthRate || 0} className="h-2" />
                  </div>
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm text-gray-600">User Engagement</span>
                      <span className="text-sm font-semibold text-dna-copper">
                        {platformMetrics?.engagementRate || 0}%
                      </span>
                    </div>
                    <Progress value={platformMetrics?.engagementRate || 0} className="h-2" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="personal" className="space-y-6">
          {user ? (
            <>
              {/* Personal Impact Overview */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="bg-gradient-to-br from-blue-50 to-blue-100">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Your Connections</p>
                        <p className="text-2xl font-bold text-dna-forest">
                          {userMetrics?.connectionsCount || 0}
                        </p>
                      </div>
                      <UserPlus className="w-6 h-6 text-blue-600" />
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-green-50 to-green-100">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Posts Created</p>
                        <p className="text-2xl font-bold text-dna-forest">
                          {userMetrics?.postsCount || 0}
                        </p>
                      </div>
                      <MessageSquare className="w-6 h-6 text-green-600" />
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-purple-50 to-purple-100">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Communities Joined</p>
                        <p className="text-2xl font-bold text-dna-forest">
                          {userMetrics?.communitiesJoined || 0}
                        </p>
                      </div>
                      <Users className="w-6 h-6 text-purple-600" />
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-orange-50 to-orange-100">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Impact Score</p>
                        <p className="text-2xl font-bold text-dna-forest">
                          {userMetrics?.impactScore || 0}
                        </p>
                      </div>
                      <Award className="w-6 h-6 text-orange-600" />
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Personal Engagement Details */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Heart className="w-5 h-5" />
                      Your Engagement
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Likes Received</span>
                        <span className="font-semibold">{userMetrics?.likesReceived || 0}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Comments Received</span>
                        <span className="font-semibold">{userMetrics?.commentsReceived || 0}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Profile Views</span>
                        <span className="font-semibold">{userMetrics?.profileViews || 0}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Events Attended</span>
                        <span className="font-semibold">{userMetrics?.eventsAttended || 0}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Activity className="w-5 h-5" />
                      Activity Summary
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-3">
                      <div>
                        <div className="flex justify-between mb-2">
                          <span className="text-sm text-gray-600">Weekly Activity</span>
                          <span className="text-sm font-semibold">
                            {userMetrics?.weeklyActivity || 0} actions
                          </span>
                        </div>
                        <Progress value={Math.min((userMetrics?.weeklyActivity || 0) * 10, 100)} className="h-2" />
                      </div>
                      <div className="pt-3 border-t">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Clock className="w-4 h-4" />
                          Member since: {userMetrics?.joinDate ? new Date(userMetrics.joinDate).toLocaleDateString() : 'Recently'}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </>
          ) : (
            <Card>
              <CardContent className="p-8 text-center">
                <p className="text-gray-600">Please log in to view your personal metrics.</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CommunityPulseDashboard;