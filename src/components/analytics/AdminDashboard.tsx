
import React from 'react';
import { useAdminAnalytics } from '@/hooks/useAdminAnalytics';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Users, Activity, FileText, Hash, Trophy, Globe } from 'lucide-react';
import UserAnalyticsCard from './UserAnalyticsCard';

const AdminDashboard: React.FC = () => {
  const { stats, loading, error } = useAdminAnalytics();

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
            <p>Error loading admin analytics: {error}</p>
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
          <h1 className="text-3xl font-bold text-dna-forest">Admin Analytics Dashboard</h1>
          <p className="text-gray-600 mt-1">Platform-wide engagement and user metrics</p>
        </div>
        <Badge variant="outline" className="text-dna-copper border-dna-copper">
          Admin View
        </Badge>
      </div>

      {/* Main Analytics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <UserAnalyticsCard
          title="Total Users"
          value={stats.total_users}
          icon={Users}
          description="Registered members on the platform"
        />
        
        <UserAnalyticsCard
          title="Active Users (Weekly)"
          value={stats.active_users_weekly}
          icon={Activity}
          description="Users who posted in the last 7 days"
        />
        
        <UserAnalyticsCard
          title="Posts Created"
          value={stats.posts_created}
          icon={FileText}
          description="Total content shared on the platform"
        />
      </div>

      {/* Detailed Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Hashtags */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-dna-forest">
              <Hash className="h-5 w-5" />
              Top Hashtags
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {stats.top_hashtags.length > 0 ? (
                stats.top_hashtags.map((hashtag, index) => (
                  <div key={hashtag.tag} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-dna-copper">#{index + 1}</span>
                      <span className="text-dna-forest">#{hashtag.tag}</span>
                    </div>
                    <Badge variant="secondary">{hashtag.count} posts</Badge>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 text-sm">No hashtags data available</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Top Contributors */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-dna-forest">
              <Trophy className="h-5 w-5" />
              Top Contributors
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {stats.top_contributors.length > 0 ? (
                stats.top_contributors.map((contributor, index) => (
                  <div key={contributor.user_id} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-dna-copper">#{index + 1}</span>
                      <span className="text-dna-forest">{contributor.full_name}</span>
                    </div>
                    <Badge variant="secondary">{contributor.posts_count} posts</Badge>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 text-sm">No contributors data available</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Geographic Distribution */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-dna-forest">
            <Globe className="h-5 w-5" />
            User Distribution by Country
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {stats.users_by_country.length > 0 ? (
              stats.users_by_country.map((country) => (
                <div key={country.country} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="font-medium text-dna-forest">{country.country}</span>
                  <Badge variant="outline">{country.count} users</Badge>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-sm col-span-full">No geographic data available</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminDashboard;
