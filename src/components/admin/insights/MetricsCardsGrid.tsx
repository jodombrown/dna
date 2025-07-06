import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Users, 
  UserPlus, 
  Activity, 
  MessageSquare, 
  Flag, 
  Building, 
  Calendar,
  TrendingUp,
  TrendingDown
} from 'lucide-react';

interface MetricsCardsGridProps {
  stats: {
    totalUsers: number;
    newSignupsToday: number;
    activeUsersThisWeek: number;
    postsToday: number;
    flaggedContent: number;
    totalCommunities: number;
    totalEvents: number;
  };
}

export function MetricsCardsGrid({ stats }: MetricsCardsGridProps) {
  const metrics = [
    {
      title: 'Total Users',
      value: stats.totalUsers.toLocaleString(),
      icon: Users,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      trend: '+12%',
      trendUp: true
    },
    {
      title: 'New Signups Today',
      value: stats.newSignupsToday.toLocaleString(),
      icon: UserPlus,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      trend: '+5%',
      trendUp: true
    },
    {
      title: 'Active This Week',
      value: stats.activeUsersThisWeek.toLocaleString(),
      icon: Activity,
      color: 'text-dna-emerald',
      bgColor: 'bg-emerald-50',
      trend: '+8%',
      trendUp: true
    },
    {
      title: 'Posts Today',
      value: stats.postsToday.toLocaleString(),
      icon: MessageSquare,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      trend: '+3%',
      trendUp: true
    },
    {
      title: 'Communities',
      value: stats.totalCommunities.toLocaleString(),
      icon: Building,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
      trend: '+15%',
      trendUp: true
    },
    {
      title: 'Events',
      value: stats.totalEvents.toLocaleString(),
      icon: Calendar,
      color: 'text-cyan-600',
      bgColor: 'bg-cyan-50',
      trend: '+7%',
      trendUp: true
    },
    {
      title: 'Flagged Content',
      value: stats.flaggedContent.toLocaleString(),
      icon: Flag,
      color: 'text-red-600',
      bgColor: 'bg-red-50',
      trend: '-20%',
      trendUp: false
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {metrics.map((metric) => (
        <Card key={metric.title} className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">
              {metric.title}
            </CardTitle>
            <div className={`p-2 rounded-lg ${metric.bgColor}`}>
              <metric.icon className={`h-4 w-4 ${metric.color}`} />
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-2xl font-bold text-gray-900">
                {metric.value}
              </div>
              <div className={`flex items-center text-xs font-medium ${
                metric.trendUp ? 'text-green-600' : 'text-red-600'
              }`}>
                {metric.trendUp ? (
                  <TrendingUp className="h-3 w-3 mr-1" />
                ) : (
                  <TrendingDown className="h-3 w-3 mr-1" />
                )}
                {metric.trend}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}