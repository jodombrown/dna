/**
 * DNA | DIA CONVEY Card Generators
 *
 * Generates intelligence cards for the Convey module:
 * - Content Performance
 * - Publishing Cadence
 * - Amplification Suggestion
 * - Trending Alignment
 *
 * Note: posts table has view_count and reshare_count. Like counts are derived
 * from the post_likes table. Hashtags use a separate junction table.
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

// ── Card Type 3: Amplification Suggestion ──────────

async function generateAmplificationSuggestion(userId: string): Promise<DIACard | null> {
  try {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();

    // Get user's recent posts with their like counts
    const { data: posts } = await supabase
      .from('posts')
      .select('id, content, created_at')
      .eq('author_id', userId)
      .eq('is_deleted', false)
      .gte('created_at', thirtyDaysAgo)
      .order('created_at', { ascending: false })
      .limit(20);

    if (!posts?.length) return null;

    // For each post, get the like count and reshare count
    const postsWithLikes = await Promise.all(
      posts.map(async (post) => {
        const [{ count: likeCount }, { count: reshareCount }] = await Promise.all([
          supabase
            .from('post_likes')
            .select('*', { count: 'exact', head: true })
            .eq('post_id', post.id),
          supabase
            .from('posts')
            .select('*', { count: 'exact', head: true })
            .eq('original_post_id', post.id),
        ]);

        return {
          ...post,
          likeCount: likeCount || 0,
          reshareCount: reshareCount || 0,
        };
      }),
    );

    // Find posts with high likes but low reshares
    const underAmplified = postsWithLikes
      .filter(p => p.likeCount > 5 && p.reshareCount < 2)
      .sort((a, b) => b.likeCount - a.likeCount);

    if (!underAmplified.length) return null;

    const post = underAmplified[0];
    const snippet = post.content?.substring(0, 60) || 'your recent post';

    return {
      id: `convey-amplify-${post.id}`,
      category: 'convey',
      cardType: 'amplification_suggestion',
      headline: 'This deserves more reach',
      body: `Your post "${snippet}..." got ${post.likeCount} likes but only ${post.reshareCount} shares. Share it again to reach more of your network.`,
      accentColor: ACCENT,
      icon: 'Share2',
      priority: 55,
      actions: [
        { label: 'Reshare', type: 'navigate' as const, payload: { route: '/dna/feed' }, isPrimary: true },
        { label: 'Not Now', type: 'dismiss' as const, payload: {}, isPrimary: false },
      ],
      metadata: { postId: post.id, likeCount: post.likeCount },
      dismissKey: `convey-amplify-${post.id}`,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    };
  } catch {
    return null;
  }
}

// ── Card Type 4: Trending Alignment ────────────────

async function generateTrendingAlignment(userId: string): Promise<DIACard | null> {
  try {
    // Get user's skills/interests
    const { data: profile } = await supabase
      .from('profiles')
      .select('skills, interests')
      .eq('id', userId)
      .single();

    if (!profile?.skills?.length && !profile?.interests?.length) return null;

    const userTopics = [...(profile.skills || []), ...(profile.interests || [])];

    // Get trending hashtags from recent posts (last 7 days)
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

    const { data: recentTagRows } = await supabase
      .from('post_hashtags')
      .select('hashtag_id')
      .gte('created_at', sevenDaysAgo)
      .limit(200);

    if (!recentTagRows?.length) return null;

    const uniqueHashtagIds = [...new Set(recentTagRows.map(r => r.hashtag_id))];
    const { data: hashtags } = await supabase
      .from('hashtags')
      .select('id, tag')
      .in('id', uniqueHashtagIds);

    if (!hashtags?.length) return null;

    const tagById = new Map(hashtags.map(h => [h.id, h.tag]));
    const hashtagCounts: Record<string, number> = {};
    for (const row of recentTagRows) {
      const tag = tagById.get(row.hashtag_id);
      if (tag) {
        hashtagCounts[tag] = (hashtagCounts[tag] || 0) + 1;
      }
    }

    // Find overlap between trending hashtags and user topics
    const trendingMatches = userTopics.filter(topic =>
      Object.keys(hashtagCounts).some(tag =>
        tag.toLowerCase().includes(topic.toLowerCase()) ||
        topic.toLowerCase().includes(tag.toLowerCase()),
      ),
    );

    if (!trendingMatches.length) return null;

    const topMatch = trendingMatches[0];

    return {
      id: `convey-trending-${topMatch}`,
      category: 'convey',
      cardType: 'trending_alignment',
      headline: `${topMatch} is trending`,
      body: `Your network is buzzing about ${topMatch} — and you have expertise here. Share your perspective?`,
      accentColor: ACCENT,
      icon: 'TrendingUp',
      priority: 60,
      actions: [
        { label: 'Share Your Take', type: 'open_composer' as const, payload: { mode: 'post' }, isPrimary: true },
        { label: 'Later', type: 'dismiss' as const, payload: {}, isPrimary: false },
      ],
      metadata: { topic: topMatch },
      dismissKey: `convey-trending-${topMatch}`,
      expiresAt: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
    };
  } catch {
    return null;
  }
}

// ── Export ──────────────────────────────────────────

export function generateConveyCards(): Array<(userId: string) => Promise<DIACard | null>> {
  return [generateContentPerformance, generatePublishingCadence, generateAmplificationSuggestion, generateTrendingAlignment];
}
