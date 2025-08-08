import React, { useEffect, useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';

interface PostAnalyticsPanelProps {
  postId: string;
  createdAt?: string;
}

export const PostAnalyticsPanel: React.FC<PostAnalyticsPanelProps> = ({ postId, createdAt }) => {
  const [views, setViews] = useState<number | null>(null);
  const [likes, setLikes] = useState<number | null>(null);
  const [comments, setComments] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const [vRes, lRes, cRes] = await Promise.all([
          supabase.from('post_views').select('*', { count: 'exact', head: true }).eq('post_id', postId),
          supabase.from('post_likes').select('*', { count: 'exact', head: true }).eq('post_id', postId),
          supabase.from('comments').select('*', { count: 'exact', head: true }).eq('post_id', postId),
        ]);

        if (!cancelled) {
          if (vRes.error) throw vRes.error;
          if (lRes.error) throw lRes.error;
          if (cRes.error) throw cRes.error;
          setViews(vRes.count ?? 0);
          setLikes(lRes.count ?? 0);
          setComments(cRes.count ?? 0);
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

  const engagementRate = useMemo(() => {
    const v = views ?? 0;
    const l = likes ?? 0;
    const c = comments ?? 0;
    if (v <= 0) return 0;
    return Math.round(((l + c) / v) * 100);
  }, [views, likes, comments]);

  const trendingScore = useMemo(() => {
    const v = views ?? 0;
    const l = likes ?? 0;
    const c = comments ?? 0;
    const base = l * 2 + c * 3 + Math.min(Math.floor(v / 10), 50);
    if (!createdAt) return base;
    const ageHours = Math.max(1, (Date.now() - new Date(createdAt).getTime()) / (1000 * 60 * 60));
    return Math.round(base / (1 + ageHours / 24));
  }, [views, likes, comments, createdAt]);

  return (
    <Card className="border-dashed">
      <CardHeader className="py-3">
        <CardTitle className="text-sm">Post Performance</CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        {loading ? (
          <div className="text-sm text-muted-foreground">Loading…</div>
        ) : error ? (
          <div className="text-sm text-destructive">{error}</div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
            <div>
              <div className="text-muted-foreground">Views</div>
              <div className="text-lg font-semibold">{views ?? 0}</div>
            </div>
            <div>
              <div className="text-muted-foreground">Likes</div>
              <div className="text-lg font-semibold">{likes ?? 0}</div>
            </div>
            <div>
              <div className="text-muted-foreground">Comments</div>
              <div className="text-lg font-semibold">{comments ?? 0}</div>
            </div>
            <div>
              <div className="text-muted-foreground">Engagement</div>
              <div className="text-lg font-semibold">{engagementRate}%</div>
            </div>
            <div className="col-span-2 sm:col-span-4">
              <div className="text-muted-foreground">Trending score</div>
              <div className="text-lg font-semibold">{trendingScore}</div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
