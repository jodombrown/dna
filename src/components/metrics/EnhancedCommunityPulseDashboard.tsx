import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuth } from '@/contexts/AuthContext';
import { 
  metricsService, 
  PlatformMetrics, 
  UserMetrics, 
  UserBadge, 
  NextBestAction,
  CommunityComparison,
  ActivityDay,
  LeaderboardEntry,
  WeeklyImpactStory
} from '@/services/metricsService';
import { 
  Trophy, 
  TrendingUp, 
  Users, 
  Calendar, 
  MessageSquare, 
  Heart, 
  Eye,
  Flame,
  Target,
  Share2,
  ChevronRight,
  Star,
  Crown,
  Zap
} from 'lucide-react';
import { useAnimatedCounter } from '@/hooks/useAnimatedCounter';

interface EnhancedCommunityPulseDashboardProps {
  className?: string;
}

const EnhancedCommunityPulseDashboard: React.FC<EnhancedCommunityPulseDashboardProps> = ({ className }) => {
  const { user } = useAuth();
  const [platformMetrics, setPlatformMetrics] = useState<PlatformMetrics | null>(null);
  const [userMetrics, setUserMetrics] = useState<UserMetrics | null>(null);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [weeklyStory, setWeeklyStory] = useState<WeeklyImpactStory | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('platform');

  const { count: totalUsersCount } = useAnimatedCounter({ 
    end: platformMetrics?.totalUsers || 0, 
    duration: 2000 
  });
  const { count: activeUsersCount } = useAnimatedCounter({ 
    end: platformMetrics?.activeUsersThisWeek || 0, 
    duration: 2000 
  });

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        setLoading(true);
        const [platform, userStats, leaders, story] = await Promise.all([
          metricsService.getPlatformMetrics(),
          user ? metricsService.getUserMetrics(user.id) : null,
          metricsService.getLeaderboard('total', 5),
          metricsService.getWeeklyImpactStory()
        ]);
        
        setPlatformMetrics(platform);
        setUserMetrics(userStats);
        setLeaderboard(leaders);
        setWeeklyStory(story);
      } catch (error) {
        console.error('Error fetching enhanced metrics:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchMetrics();
  }, [user]);

  // Component for Next Best Action
  const NextBestActionCard = ({ action }: { action: NextBestAction }) => (
    <Card className="bg-gradient-to-r from-dna-emerald/10 to-dna-copper/10 border-dna-emerald/20">
      <CardContent className="p-4">
        <div className="flex items-center gap-3">
          <div className="text-2xl">{action.icon}</div>
          <div className="flex-1">
            <h4 className="font-semibold text-dna-forest">{action.title}</h4>
            <p className="text-sm text-muted-foreground">{action.description}</p>
            {action.progress !== undefined && action.target && (
              <div className="mt-2">
                <Progress value={(action.progress / action.target) * 100} className="h-2" />
                <span className="text-xs text-dna-emerald">{action.progress}/{action.target}</span>
              </div>
            )}
          </div>
          <ChevronRight className="h-5 w-5 text-dna-emerald" />
        </div>
      </CardContent>
    </Card>
  );

  // Component for Community Comparison
  const CommunityComparisonCard = ({ comparison }: { comparison: CommunityComparison }) => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-dna-emerald" />
          You vs Community
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {Object.entries(comparison).map(([key, data]) => (
          <div key={key} className="space-y-1">
            <div className="flex justify-between text-sm">
              <span className="capitalize">{key.replace(/([A-Z])/g, ' $1')}</span>
              <span className="text-dna-emerald">Top {100 - data.percentile}%</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span>You: {data.user}</span>
              <span>•</span>
              <span>Avg: {data.avg}</span>
            </div>
            <Progress value={data.percentile} className="h-1.5" />
          </div>
        ))}
      </CardContent>
    </Card>
  );

  // Component for Activity Heatmap
  const ActivityHeatmapCard = ({ activities }: { activities: ActivityDay[] }) => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5 text-dna-emerald" />
          Activity Heatmap
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-53 gap-1">
          {activities.slice(-371).map((day, index) => (
            <div
              key={index}
              className={`w-2 h-2 rounded-sm ${
                day.level === 0 ? 'bg-muted' :
                day.level === 1 ? 'bg-dna-emerald/20' :
                day.level === 2 ? 'bg-dna-emerald/40' :
                day.level === 3 ? 'bg-dna-emerald/60' :
                'bg-dna-emerald'
              }`}
              title={`${day.date}: ${day.count} activities`}
            />
          ))}
        </div>
        <div className="flex justify-between text-xs text-muted-foreground mt-2">
          <span>Less</span>
          <span>More</span>
        </div>
      </CardContent>
    </Card>
  );

  // Component for Badge System
  const BadgeSystemCard = ({ badges }: { badges: UserBadge[] }) => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Crown className="h-5 w-5 text-dna-copper" />
          Your Badges
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {badges.slice(0, 6).map((badge) => (
            <div key={badge.id} className="text-center p-3 rounded-lg bg-gradient-to-b from-dna-copper/10 to-dna-gold/10 border border-dna-copper/20">
              <div className="text-2xl mb-1">{badge.icon}</div>
              <div className="text-xs font-medium text-dna-forest">{badge.badge_name}</div>
              <div className="text-xs text-muted-foreground">{badge.description}</div>
            </div>
          ))}
        </div>
        {badges.length > 6 && (
          <Button variant="outline" size="sm" className="w-full mt-3">
            View All {badges.length} Badges
          </Button>
        )}
      </CardContent>
    </Card>
  );

  // Component for Leaderboard
  const LeaderboardCard = ({ entries }: { entries: LeaderboardEntry[] }) => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy className="h-5 w-5 text-dna-gold" />
          Top Contributors
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {entries.map((entry, index) => (
          <div key={entry.userId} className="flex items-center gap-3">
            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
              index === 0 ? 'bg-dna-gold text-white' :
              index === 1 ? 'bg-gray-400 text-white' :
              index === 2 ? 'bg-dna-copper text-white' :
              'bg-muted text-muted-foreground'
            }`}>
              {entry.rank}
            </div>
            <Avatar className="w-8 h-8">
              <AvatarImage src={entry.avatarUrl} />
              <AvatarFallback>{entry.fullName?.charAt(0)}</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <div className="text-sm font-medium">{entry.fullName}</div>
              <div className="text-xs text-muted-foreground">{entry.location}</div>
            </div>
            <Badge variant="outline">{entry.score}</Badge>
          </div>
        ))}
      </CardContent>
    </Card>
  );

  // Component for Weekly Impact Story
  const WeeklyImpactCard = ({ story }: { story: WeeklyImpactStory }) => (
    <Card className="bg-gradient-to-br from-dna-forest/5 to-dna-emerald/5">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Star className="h-5 w-5 text-dna-emerald" />
          {story.title}
        </CardTitle>
        <p className="text-sm text-muted-foreground">{story.weekRange}</p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <h4 className="font-medium mb-2">Platform Highlights</h4>
          <div className="grid grid-cols-2 gap-2">
            {story.platformMetrics.map((metric, index) => (
              <div key={index} className="p-2 rounded bg-background">
                <div className="text-lg font-bold text-dna-emerald">{metric.value}</div>
                <div className="text-xs text-muted-foreground">{metric.label}</div>
                <div className="text-xs text-green-600">{metric.change}</div>
              </div>
            ))}
          </div>
        </div>
        <div>
          <h4 className="font-medium mb-2">Your Week</h4>
          <div className="flex flex-wrap gap-2">
            {story.userMetrics.map((metric, index) => (
              <Badge key={index} variant="secondary" className="gap-1">
                {metric.badge} {metric.value} {metric.label}
              </Badge>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );

  if (loading) {
    return (
      <div className={`space-y-6 p-6 ${className}`}>
        <Skeleton className="h-8 w-64" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="h-48" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-6 p-6 ${className}`}>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-dna-forest">Community Pulse</h1>
          <p className="text-muted-foreground">Real-time insights into our growing diaspora network</p>
        </div>
        <Button 
          variant="outline" 
          size="sm" 
          className="gap-2"
          onClick={() => {
            // Post to feed functionality
            console.log('Posting impact score to feed...');
          }}
        >
          <Share2 className="h-4 w-4" />
          Share My Impact
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="platform">Platform Insights</TabsTrigger>
          <TabsTrigger value="personal">Your Impact</TabsTrigger>
          <TabsTrigger value="community">Community</TabsTrigger>
        </TabsList>

        <TabsContent value="platform" className="space-y-6">
          {weeklyStory && <WeeklyImpactCard story={weeklyStory} />}
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-dna-emerald" />
                  <span className="text-sm font-medium">Total Members</span>
                </div>
                <div className="text-2xl font-bold text-dna-forest mt-1">
                  {totalUsersCount.toLocaleString()}
                </div>
                <div className="text-xs text-green-600">+{platformMetrics?.weeklyGrowthRate}% this week</div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <Zap className="h-5 w-5 text-dna-emerald" />
                  <span className="text-sm font-medium">Active This Week</span>
                </div>
                <div className="text-2xl font-bold text-dna-forest mt-1">
                  {activeUsersCount.toLocaleString()}
                </div>
                <div className="text-xs text-dna-emerald">{platformMetrics?.engagementRate}% engagement</div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5 text-dna-emerald" />
                  <span className="text-sm font-medium">Connections</span>
                </div>
                <div className="text-2xl font-bold text-dna-forest mt-1">
                  {platformMetrics?.totalConnections.toLocaleString()}
                </div>
                <div className="text-xs text-muted-foreground">Professional bonds</div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <Heart className="h-5 w-5 text-dna-emerald" />
                  <span className="text-sm font-medium">Communities</span>
                </div>
                <div className="text-2xl font-bold text-dna-forest mt-1">
                  {platformMetrics?.totalCommunities}
                </div>
                <div className="text-xs text-muted-foreground">Impact circles</div>
              </CardContent>
            </Card>
          </div>

          <LeaderboardCard entries={leaderboard} />
        </TabsContent>

        <TabsContent value="personal" className="space-y-6">
          {!user ? (
            <Card>
              <CardContent className="p-6 text-center">
                <p className="text-muted-foreground">Sign in to see your personal impact metrics</p>
              </CardContent>
            </Card>
          ) : (
            <>
              {userMetrics?.nextBestAction && (
                <NextBestActionCard action={userMetrics.nextBestAction} />
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2">
                      <Users className="h-5 w-5 text-dna-emerald" />
                      <span className="text-sm font-medium">Connections</span>
                    </div>
                    <div className="text-2xl font-bold text-dna-forest mt-1">
                      {userMetrics?.connectionsCount}
                    </div>
                    {userMetrics?.streak && userMetrics.streak > 0 && (
                      <div className="flex items-center gap-1 text-xs text-orange-600">
                        <Flame className="h-3 w-3" />
                        {userMetrics.streak} day streak
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2">
                      <MessageSquare className="h-5 w-5 text-dna-emerald" />
                      <span className="text-sm font-medium">Posts</span>
                    </div>
                    <div className="text-2xl font-bold text-dna-forest mt-1">
                      {userMetrics?.postsCount}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {userMetrics?.likesReceived} likes received
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2">
                      <Target className="h-5 w-5 text-dna-emerald" />
                      <span className="text-sm font-medium">Impact Score</span>
                    </div>
                    <div className="text-2xl font-bold text-dna-forest mt-1">
                      {userMetrics?.impactScore}
                    </div>
                    <div className="text-xs text-dna-emerald">DNA Points</div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2">
                      <Eye className="h-5 w-5 text-dna-emerald" />
                      <span className="text-sm font-medium">Profile Views</span>
                    </div>
                    <div className="text-2xl font-bold text-dna-forest mt-1">
                      {userMetrics?.profileViews}
                    </div>
                    <div className="text-xs text-muted-foreground">This month</div>
                  </CardContent>
                </Card>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {userMetrics?.badges && (
                  <BadgeSystemCard badges={userMetrics.badges} />
                )}
                
                {userMetrics?.communityComparison && (
                  <CommunityComparisonCard comparison={userMetrics.communityComparison} />
                )}
              </div>

              {userMetrics?.activityHeatmap && (
                <ActivityHeatmapCard activities={userMetrics.activityHeatmap} />
              )}
            </>
          )}
        </TabsContent>

        <TabsContent value="community" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <LeaderboardCard entries={leaderboard} />
            
            <Card>
              <CardHeader>
                <CardTitle>Community Pulse</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm">Weekly Growth</span>
                  <Badge variant="outline" className="text-green-600">
                    +{platformMetrics?.weeklyGrowthRate}%
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Engagement Rate</span>
                  <Badge variant="outline" className="text-dna-emerald">
                    {platformMetrics?.engagementRate}%
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Avg Session</span>
                  <Badge variant="outline">
                    {platformMetrics?.averageSessionTime}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default EnhancedCommunityPulseDashboard;