import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Clock, 
  Users, 
  MessageSquare, 
  Building, 
  ChevronDown, 
  ChevronUp,
  Zap
} from 'lucide-react';
import { useUserActivity, RecentActivity } from '@/hooks/useUserActivity';
import { formatDistanceToNow } from 'date-fns';

const RecentActivitySummary = () => {
  const { summary, recentActivities, loading } = useUserActivity();
  const [expanded, setExpanded] = useState(false);

  const getActivityIcon = (type: RecentActivity['type']) => {
    switch (type) {
      case 'connection':
        return Users;
      case 'post':
        return MessageSquare;
      case 'community':
        return Building;
      case 'comment':
        return MessageSquare;
      default:
        return Zap;
    }
  };

  const getPillarColor = (pillar?: string) => {
    switch (pillar) {
      case 'connect':
        return 'text-dna-emerald';
      case 'collaborate':
        return 'text-dna-copper';
      case 'contribute':
        return 'text-dna-forest';
      default:
        return 'text-gray-500';
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
            <div className="h-3 bg-gray-200 rounded w-1/2"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const displayedActivities = expanded ? recentActivities : recentActivities.slice(0, 2);
  const hasMoreActivities = recentActivities.length > 2;

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center">
          <Clock className="h-5 w-5 mr-2 text-dna-emerald" />
          Recent Activity
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Activity Summary */}
        <div className="grid grid-cols-3 gap-2 text-center">
          <div className="p-2 bg-dna-emerald/5 rounded">
            <div className="text-sm font-semibold text-dna-emerald">{summary.recentConnections}</div>
            <div className="text-xs text-gray-600">Connections</div>
          </div>
          <div className="p-2 bg-dna-copper/5 rounded">
            <div className="text-sm font-semibold text-dna-copper">{summary.recentPosts}</div>
            <div className="text-xs text-gray-600">Posts</div>
          </div>
          <div className="p-2 bg-dna-forest/5 rounded">
            <div className="text-sm font-semibold text-dna-forest">{summary.recentCommunities}</div>
            <div className="text-xs text-gray-600">Communities</div>
          </div>
        </div>

        {/* Recent Activities */}
        {recentActivities.length > 0 && (
          <div className="space-y-2">
            {displayedActivities.map((activity) => {
              const Icon = getActivityIcon(activity.type);
              return (
                <div key={activity.id} className="flex items-start space-x-3 p-2 rounded hover:bg-gray-50">
                  <div className={`p-1 rounded ${getPillarColor(activity.pillar)}`}>
                    <Icon className="h-3 w-3" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-gray-900">{activity.title}</div>
                    <div className="text-xs text-gray-500 truncate">{activity.description}</div>
                    <div className="text-xs text-gray-400">
                      {formatDistanceToNow(new Date(activity.timestamp), { addSuffix: true })}
                    </div>
                  </div>
                  {activity.pillar && (
                    <Badge variant="outline" className="text-xs">
                      {activity.pillar}
                    </Badge>
                  )}
                </div>
              );
            })}

            {hasMoreActivities && (
              <Button
                variant="ghost"
                size="sm"
                className="w-full h-8 text-xs"
                onClick={() => setExpanded(!expanded)}
              >
                {expanded ? (
                  <>
                    <ChevronUp className="h-3 w-3 mr-1" />
                    Show Less
                  </>
                ) : (
                  <>
                    <ChevronDown className="h-3 w-3 mr-1" />
                    Show More ({recentActivities.length - 2} more)
                  </>
                )}
              </Button>
            )}
          </div>
        )}

        {recentActivities.length === 0 && (
          <div className="text-center py-4">
            <Clock className="h-8 w-8 mx-auto mb-2 text-gray-300" />
            <p className="text-sm text-gray-500">No recent activity</p>
            <p className="text-xs text-gray-400">Start engaging to see your activity here</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default RecentActivitySummary;