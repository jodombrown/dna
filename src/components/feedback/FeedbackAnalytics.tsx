import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Loader2, TrendingUp, Users, Clock, CheckCircle2 } from 'lucide-react';
import { useFeedbackAnalytics } from '@/hooks/useFeedbackAnalytics';
import { useFeedbackMembership } from '@/hooks/useFeedbackMembership';
import {
  ADMIN_STATUS_LABELS,
  ADMIN_STATUS_COLORS,
  USER_TAG_LABELS,
} from '@/types/feedback';
import { cn } from '@/lib/utils';

interface FeedbackAnalyticsProps {
  className?: string;
}

export function FeedbackAnalytics({ className }: FeedbackAnalyticsProps) {
  const { channel, isAdmin } = useFeedbackMembership();
  const { data: analytics, isLoading } = useFeedbackAnalytics(
    channel?.id || null,
    isAdmin
  );

  if (!isAdmin) {
    return null;
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No analytics data available
      </div>
    );
  }

  return (
    <div className={cn('space-y-6', className)}>
      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-primary/10 rounded-lg">
                <TrendingUp className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{analytics.total_messages}</p>
                <p className="text-xs text-muted-foreground">Total Feedback</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Users className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{analytics.by_status.open}</p>
                <p className="text-xs text-muted-foreground">Open Issues</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle2 className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{analytics.resolution_rate.toFixed(0)}%</p>
                <p className="text-xs text-muted-foreground">Resolution Rate</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Clock className="h-5 w-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {analytics.avg_resolution_time_hours.toFixed(1)}h
                </p>
                <p className="text-xs text-muted-foreground">Avg Resolution</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* By Status */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">By Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Object.entries(analytics.by_status).map(([status, count]) => (
                <div key={status} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Badge className={cn('text-xs', ADMIN_STATUS_COLORS[status as keyof typeof ADMIN_STATUS_COLORS])}>
                      {ADMIN_STATUS_LABELS[status as keyof typeof ADMIN_STATUS_LABELS]}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-24 h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary transition-all"
                        style={{
                          width: `${analytics.total_messages > 0 ? (count / analytics.total_messages) * 100 : 0}%`,
                        }}
                      />
                    </div>
                    <span className="text-sm text-muted-foreground w-8 text-right">{count}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* By User Tag */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">By Tag</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Object.entries(analytics.by_user_tag).map(([tag, count]) => (
                <div key={tag} className="flex items-center justify-between">
                  <Badge variant="outline" className="text-xs">
                    #{USER_TAG_LABELS[tag as keyof typeof USER_TAG_LABELS]}
                  </Badge>
                  <div className="flex items-center gap-2">
                    <div className="w-24 h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary transition-all"
                        style={{
                          width: `${analytics.total_messages > 0 ? (count / analytics.total_messages) * 100 : 0}%`,
                        }}
                      />
                    </div>
                    <span className="text-sm text-muted-foreground w-8 text-right">{count}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Top Contributors */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium">Top Contributors</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {analytics.top_contributors.map((contributor, index) => (
              <div key={contributor.user_id} className="flex items-center gap-3">
                <span className="text-sm text-muted-foreground w-4">{index + 1}</span>
                <Avatar className="h-8 w-8">
                  <AvatarImage src={contributor.profile.avatar_url || undefined} />
                  <AvatarFallback>
                    {(contributor.profile.full_name || contributor.profile.username || 'U').slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">
                    {contributor.profile.full_name || contributor.profile.username || 'Anonymous'}
                  </p>
                </div>
                <Badge variant="secondary">{contributor.count} feedbacks</Badge>
              </div>
            ))}
            {analytics.top_contributors.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-2">
                No contributors yet
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Activity Over Time */}
      {analytics.messages_over_time.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Activity (Last 30 Days)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-end gap-1 h-20">
              {analytics.messages_over_time.map((day) => {
                const maxCount = Math.max(...analytics.messages_over_time.map(d => d.count));
                const height = maxCount > 0 ? (day.count / maxCount) * 100 : 0;
                return (
                  <div
                    key={day.date}
                    className="flex-1 bg-primary/20 hover:bg-primary/40 transition-colors rounded-t cursor-pointer"
                    style={{ height: `${Math.max(height, 5)}%` }}
                    title={`${day.date}: ${day.count} feedback${day.count !== 1 ? 's' : ''}`}
                  />
                );
              })}
            </div>
            <div className="flex justify-between mt-2 text-xs text-muted-foreground">
              <span>{analytics.messages_over_time[0]?.date}</span>
              <span>{analytics.messages_over_time[analytics.messages_over_time.length - 1]?.date}</span>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
