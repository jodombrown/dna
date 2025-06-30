
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Users, 
  MessageSquare, 
  Calendar, 
  TrendingUp,
  Activity,
  AlertTriangle,
  Eye,
  UserPlus
} from 'lucide-react';
import { useAnalytics } from '@/hooks/useAnalytics';

const AnalyticsDashboard: React.FC = () => {
  const { stats, loading } = useAnalytics();

  if (loading) {
    return <div className="p-6">Loading analytics...</div>;
  }

  if (!stats) {
    return <div className="p-6">No analytics data available</div>;
  }

  const statCards = [
    {
      title: "Total Users",
      value: stats.total_users,
      icon: Users,
      color: "text-blue-600",
      description: "Registered users"
    },
    {
      title: "Active Profiles",
      value: stats.total_profiles,
      icon: UserPlus,
      color: "text-green-600",
      description: "Complete profiles"
    },
    {
      title: "Total Posts",
      value: stats.total_posts,
      icon: MessageSquare,
      color: "text-purple-600",
      description: "Published posts"
    },
    {
      title: "Communities",
      value: stats.total_communities,
      icon: Users,
      color: "text-orange-600",
      description: "Active communities"
    },
    {
      title: "Events",
      value: stats.total_events,
      icon: Calendar,
      color: "text-indigo-600",
      description: "Total events"
    },
    {
      title: "Active Users (7d)",
      value: stats.active_users_last_7_days,
      icon: Activity,
      color: "text-emerald-600",
      description: "Last 7 days"
    }
  ];

  const alertCards = [
    {
      title: "Pending Communities",
      value: stats.pending_communities,
      icon: AlertTriangle,
      color: "text-yellow-600",
      description: "Awaiting review"
    },
    {
      title: "Pending Flags",
      value: stats.pending_flags,
      icon: Eye,
      color: "text-red-600",
      description: "Need attention"
    }
  ];

  return (
    <div className="space-y-6">
      {/* Main Statistics */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Platform Overview</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {statCards.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <Card key={index}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">
                    {stat.title}
                  </CardTitle>
                  <Icon className={`w-4 h-4 ${stat.color}`} />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
                  <p className="text-xs text-gray-500">{stat.description}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Alerts & Actions Needed */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Actions Needed</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {alertCards.map((alert, index) => {
            const Icon = alert.icon;
            return (
              <Card key={index} className="border-l-4 border-yellow-400">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">
                    {alert.title}
                  </CardTitle>
                  <Icon className={`w-4 h-4 ${alert.color}`} />
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="text-2xl font-bold text-gray-900">{alert.value}</div>
                    {alert.value > 0 && (
                      <Badge variant="outline" className={alert.color}>
                        Action Required
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs text-gray-500">{alert.description}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Growth Metrics */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Recent Activity</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">Posts (30 days)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats.posts_last_30_days}</div>
              <p className="text-xs text-gray-500">New posts this month</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">Upcoming Events</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{stats.events_next_30_days}</div>
              <p className="text-xs text-gray-500">Next 30 days</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsDashboard;
