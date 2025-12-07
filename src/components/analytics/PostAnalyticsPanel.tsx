import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { Eye, Heart, MessageCircle, Share2, TrendingUp, Users, Globe2, Briefcase } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

interface PostAnalytics {
  total_views: number;
  unique_viewers: number;
  views_today: number;
  views_this_week: number;
  total_reactions: number;
  reaction_breakdown: Record<string, number>;
  total_comments: number;
  total_reshares: number;
  engagement_rate: number;
  virality_score: number;
  viewer_connections: number;
  viewer_non_connections: number;
  top_viewer_industries: Array<{ industry: string; count: number }>;
  top_viewer_regions: Array<{ region: string; count: number }>;
}

interface PostAnalyticsPanelProps {
  postId: string;
  createdAt?: string;
}

export const PostAnalyticsPanel: React.FC<PostAnalyticsPanelProps> = ({ postId, createdAt }) => {
  const [analytics, setAnalytics] = useState<PostAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const { data, error: rpcError } = await supabase.rpc('get_post_analytics', {
          p_post_id: postId,
        });

        if (!cancelled) {
          if (rpcError) throw rpcError;
          if (data && data.length > 0) {
            setAnalytics(data[0] as PostAnalytics);
          }
        }
      } catch (e: any) {
        if (!cancelled) setError(e?.message || 'Failed to load analytics');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [postId]);

  if (loading) {
    return (
      <Card className="border-dashed">
        <CardHeader className="py-3">
          <CardTitle className="text-sm">Post Analytics</CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="text-sm text-muted-foreground">Loading analytics...</div>
        </CardContent>
      </Card>
    );
  }

  if (error || !analytics) {
    return (
      <Card className="border-dashed">
        <CardHeader className="py-3">
          <CardTitle className="text-sm">Post Analytics</CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="text-sm text-destructive">{error || 'No data available'}</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-dashed">
      <CardHeader className="py-3">
        <CardTitle className="text-sm flex items-center justify-between">
          <span>Post Analytics</span>
          <Badge variant="secondary" className="flex items-center gap-1">
            <TrendingUp className="w-3 h-3" />
            {analytics.virality_score.toFixed(1)} virality
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0 space-y-4">
        {/* Core Metrics */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="flex flex-col">
            <div className="text-xs text-muted-foreground flex items-center gap-1">
              <Eye className="w-3 h-3" />
              Views
            </div>
            <div className="text-lg font-semibold">{analytics.total_views.toLocaleString()}</div>
            <div className="text-xs text-muted-foreground">
              {analytics.unique_viewers.toLocaleString()} unique
            </div>
          </div>

          <div className="flex flex-col">
            <div className="text-xs text-muted-foreground flex items-center gap-1">
              <Heart className="w-3 h-3" />
              Reactions
            </div>
            <div className="text-lg font-semibold">{analytics.total_reactions.toLocaleString()}</div>
            {Object.keys(analytics.reaction_breakdown).length > 0 && (
              <div className="text-xs flex gap-0.5 mt-1">
                {Object.entries(analytics.reaction_breakdown).slice(0, 5).map(([emoji, count]) => (
                  <span key={emoji} className="text-sm" title={`${emoji} ${count}`}>
                    {emoji}
                  </span>
                ))}
              </div>
            )}
          </div>

          <div className="flex flex-col">
            <div className="text-xs text-muted-foreground flex items-center gap-1">
              <MessageCircle className="w-3 h-3" />
              Comments
            </div>
            <div className="text-lg font-semibold">{analytics.total_comments.toLocaleString()}</div>
          </div>

          <div className="flex flex-col">
            <div className="text-xs text-muted-foreground flex items-center gap-1">
              <Share2 className="w-3 h-3" />
              Reshares
            </div>
            <div className="text-lg font-semibold">{analytics.total_reshares.toLocaleString()}</div>
          </div>
        </div>

        <Separator />

        {/* Performance Metrics */}
        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col">
            <div className="text-xs text-muted-foreground">Engagement Rate</div>
            <div className="text-2xl font-semibold text-primary">{analytics.engagement_rate.toFixed(1)}%</div>
          </div>

          <div className="flex flex-col">
            <div className="text-xs text-muted-foreground">Reach</div>
            <div className="text-sm">
              <span className="font-semibold">{analytics.views_today}</span> today, {' '}
              <span className="font-semibold">{analytics.views_this_week}</span> this week
            </div>
          </div>
        </div>

        {/* Demographics */}
        {(analytics.viewer_connections > 0 || analytics.viewer_non_connections > 0) && (
          <>
            <Separator />
            <div className="space-y-2">
              <div className="text-xs font-semibold flex items-center gap-1">
                <Users className="w-3 h-3" />
                Viewer Demographics
              </div>

              <div className="flex gap-2">
                <Badge variant="outline" className="flex items-center gap-1">
                  <Users className="w-3 h-3" />
                  {analytics.viewer_connections} connections
                </Badge>
                <Badge variant="outline">
                  {analytics.viewer_non_connections} non-connections
                </Badge>
              </div>

              {analytics.top_viewer_industries && analytics.top_viewer_industries.length > 0 && (
                <div className="space-y-1">
                  <div className="text-xs text-muted-foreground flex items-center gap-1">
                    <Briefcase className="w-3 h-3" />
                    Top Industries
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {analytics.top_viewer_industries.slice(0, 3).map((item, idx) => (
                      <Badge key={idx} variant="secondary" className="text-xs">
                        {item.industry} ({item.count})
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {analytics.top_viewer_regions && analytics.top_viewer_regions.length > 0 && (
                <div className="space-y-1">
                  <div className="text-xs text-muted-foreground flex items-center gap-1">
                    <Globe2 className="w-3 h-3" />
                    Top Regions
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {analytics.top_viewer_regions.slice(0, 3).map((item, idx) => (
                      <Badge key={idx} variant="secondary" className="text-xs">
                        {item.region} ({item.count})
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};
