
import React from 'react';
import { useUserAnalytics } from '@/hooks/useUserAnalytics';
import UserAnalyticsCard from './UserAnalyticsCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Users, FileText, Calendar, Users2, Bookmark, UserPlus } from 'lucide-react';

const UserDashboard: React.FC = () => {
  const { stats, loading, error } = useUserAnalytics();

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
              </CardHeader>
              <CardContent>
                <div className="h-8 bg-gray-200 rounded animate-pulse"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-red-600">
            <p>Error loading analytics: {error}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!stats) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-gray-500">
            <p>No analytics data available</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-dna-forest">Your Impact Dashboard</h1>
          <p className="text-gray-600 mt-1">Track your engagement and contributions to the DNA community</p>
        </div>
        <Badge variant="outline" className="text-dna-copper border-dna-copper">
          Live Analytics
        </Badge>
      </div>

      {/* Analytics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <UserAnalyticsCard
          title="Posts Created"
          value={stats.posts_created}
          icon={FileText}
          description="Content you've shared with the community"
        />
        
        <UserAnalyticsCard
          title="Followers Gained"
          value={stats.followers_gained}
          icon={Users}
          description="People following your journey"
        />
        
        <UserAnalyticsCard
          title="Events Joined"
          value={stats.events_joined}
          icon={Calendar}
          description="Community events you've participated in"
        />
        
        <UserAnalyticsCard
          title="Communities Joined"
          value={stats.communities_joined}
          icon={Users2}
          description="Groups you're actively part of"
        />
        
        <UserAnalyticsCard
          title="Content Bookmarked"
          value={stats.content_bookmarked}
          icon={Bookmark}
          description="Items you've saved for later"
        />
        
        <UserAnalyticsCard
          title="People Followed"
          value={stats.people_followed}
          icon={UserPlus}
          description="Connections you're following"
        />
      </div>

      {/* Impact Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="text-dna-forest">Your DNA Impact Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-dna-copper mb-2">
                {stats.posts_created + stats.communities_joined}
              </div>
              <div className="text-sm text-gray-600">Total Contributions</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-dna-emerald mb-2">
                {stats.followers_gained + stats.people_followed}
              </div>
              <div className="text-sm text-gray-600">Network Connections</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-dna-gold mb-2">
                {stats.content_bookmarked + stats.events_joined}
              </div>
              <div className="text-sm text-gray-600">Engagement Actions</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default UserDashboard;
