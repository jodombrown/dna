/**
 * DNA | DIA CONVEY Card Generators
 *
 * Generates intelligence cards for the Convey module:
 * - Content Performance
 * - Publishing Cadence
 *
 * Note: posts table has view_count only (no likes_count/comments_count/shares_count/hashtags).
 * Engagement metrics use view_count as proxy.
 */

import { supabase } from '@/integrations/supabase/client';
import type { DIACard } from '@/services/diaCardService';
const ACCENT = '#2A7A8C';

// ── Card Type 1: Content Performance ───────────────

async function generateContentPerformance(userId: string): Promise<DIACard | null> {
  try {
    const { data: posts } = await supabase
      .from('posts')
      .select('id, content, created_at, view_count')
      .eq('author_id', userId)
      .eq('is_deleted', false)
      .order('created_at', { ascending: false })
      .limit(10);

    if (!posts || posts.length < 2) return null;

    const scored = posts.map(p => ({
      id: p.id,
      content: p.content,
      created_at: p.created_at,
      views: p.view_count || 0,
    }));

    scored.sort((a, b) => b.views - a.views);
    const topPost = scored[0];

    if (topPost.views < 5) return null;

    const avgViews = scored.reduce((sum, p) => sum + p.views, 0) / scored.length;
    const multiplier = avgViews > 0 ? Math.round((topPost.views / avgViews) * 10) / 10 : 1;

    if (multiplier < 1.5) return null;

    const postPreview = topPost.content.slice(0, 50) + (topPost.content.length > 50 ? '...' : '');

    return {
      id: `convey-perf-${topPost.id}`,
      category: 'convey',
      cardType: 'content_performance',
      headline: `Your post reached ${topPost.views} views`,
      body: `"${postPreview}" performed ${multiplier}x above your average. What made it resonate?`,
      accentColor: ACCENT,
      icon: 'BarChart3',
      priority: 50,
      actions: [
        { label: 'View Post', type: 'navigate' as const, payload: { url: `/dna/feed/story/${topPost.id}` }, isPrimary: true },
      ],
      metadata: { postId: topPost.id, views: topPost.views, multiplier },
      dismissKey: `perf-${topPost.id}`,
    };
  } catch {
    return null;
  }
}

// ── Card Type 2: Publishing Cadence ────────────────

async function generatePublishingCadence(userId: string): Promise<DIACard | null> {
  try {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();

    const { data: recentPosts } = await supabase
      .from('posts')
      .select('id, created_at, view_count')
      .eq('author_id', userId)
      .eq('is_deleted', false)
      .order('created_at', { ascending: false })
      .limit(20);

    if (!recentPosts || recentPosts.length === 0) return null;

    const lastPostDate = new Date(recentPosts[0].created_at);
    const daysSinceLast = Math.floor((Date.now() - lastPostDate.getTime()) / (24 * 60 * 60 * 1000));

    if (daysSinceLast < 14) return null;

    const lastReach = recentPosts[0].view_count || 0;

    return {
      id: `convey-cadence-${userId}`,
      category: 'convey',
      cardType: 'publishing_cadence',
      headline: `You have not published in ${daysSinceLast} days`,
      body: lastReach > 0
        ? `Your last post reached ${lastReach} views. Your audience is waiting for more.`
        : 'Your diaspora community would love to hear from you. Share what you are working on.',
      accentColor: ACCENT,
      icon: 'PenLine',
      priority: 45,
      actions: [
        { label: 'Write Something', type: 'open_composer' as const, payload: {}, isPrimary: true },
        { label: 'Not now', type: 'dismiss' as const, payload: {}, isPrimary: false },
      ],
      metadata: {
        daysSinceLast,
        lastPostReach: lastReach,
        postsInLast30Days: recentPosts.filter(p => p.created_at >= thirtyDaysAgo).length,
      },
      dismissKey: `cadence-${new Date().toISOString().slice(0, 7)}`,
    };
  } catch {
    return null;
  }
}

// ── Export ──────────────────────────────────────────

export function generateConveyCards(): Array<(userId: string) => Promise<DIACard | null>> {
  return [generateContentPerformance, generatePublishingCadence];
}
