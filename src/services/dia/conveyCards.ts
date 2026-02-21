/**
 * DNA | DIA CONVEY Card Generators
 *
 * Generates intelligence cards for the Convey module:
 * - Content Performance
 * - Amplification Suggestion
 * - Trending Topic Alignment
 * - Publishing Cadence
 */

import { supabase } from '@/integrations/supabase/client';
import type { DIACard, DIACardAction } from '@/services/diaCardService';
import { MODULE_ACCENT_COLORS } from '@/services/diaCardService';

const ACCENT = MODULE_ACCENT_COLORS.convey;

// ── Card Type 1: Content Performance ───────────────

async function generateContentPerformance(userId: string): Promise<DIACard | null> {
  try {
    // Get user's recent posts with engagement
    const { data: posts } = await supabase
      .from('posts')
      .select('id, content, created_at, likes_count, comments_count, shares_count')
      .eq('author_id', userId)
      .order('created_at', { ascending: false })
      .limit(10);

    if (!posts || posts.length < 2) return null;

    // Find the best-performing recent post
    const scored = posts.map(p => ({
      ...p,
      engagement: (p.likes_count || 0) + (p.comments_count || 0) * 2 + (p.shares_count || 0) * 3,
    }));

    scored.sort((a, b) => b.engagement - a.engagement);
    const topPost = scored[0];

    if (topPost.engagement < 3) return null;

    // Calculate average engagement
    const avgEngagement = scored.reduce((sum, p) => sum + p.engagement, 0) / scored.length;
    const multiplier = avgEngagement > 0 ? Math.round((topPost.engagement / avgEngagement) * 10) / 10 : 1;

    if (multiplier < 1.5) return null;

    const postPreview = (topPost.content || '').slice(0, 50) + ((topPost.content || '').length > 50 ? '...' : '');

    return {
      id: `convey-perf-${topPost.id}`,
      category: 'convey',
      cardType: 'content_performance',
      headline: `Your post reached ${topPost.likes_count + topPost.comments_count + topPost.shares_count} people`,
      body: `"${postPreview}" performed ${multiplier}x above your average. What made it resonate?`,
      accentColor: ACCENT,
      icon: 'BarChart3',
      priority: 50,
      actions: [
        {
          label: 'View Post',
          type: 'navigate',
          payload: { url: `/dna/feed/story/${topPost.id}` },
          isPrimary: true,
        },
      ],
      metadata: {
        postId: topPost.id,
        engagement: topPost.engagement,
        multiplier,
        likes: topPost.likes_count,
        comments: topPost.comments_count,
        shares: topPost.shares_count,
      },
      dismissKey: `perf-${topPost.id}`,
    };
  } catch {
    return null;
  }
}

// ── Card Type 2: Amplification Suggestion ──────────

async function generateAmplificationSuggestion(userId: string): Promise<DIACard | null> {
  try {
    const { data: posts } = await supabase
      .from('posts')
      .select('id, content, likes_count, shares_count, created_at')
      .eq('author_id', userId)
      .order('likes_count', { ascending: false })
      .limit(5);

    if (!posts || posts.length === 0) return null;

    // Find post with high likes but low shares
    const underShared = posts.find(p =>
      (p.likes_count || 0) >= 5 && (p.shares_count || 0) <= 1
    );

    if (!underShared) return null;

    const postPreview = (underShared.content || '').slice(0, 40) + '...';

    return {
      id: `convey-amplify-${underShared.id}`,
      category: 'convey',
      cardType: 'amplification_suggestion',
      headline: 'This post deserves more reach',
      body: `"${postPreview}" got ${underShared.likes_count} likes but only ${underShared.shares_count || 0} shares. Re-share it to extend its reach.`,
      accentColor: ACCENT,
      icon: 'Share2',
      priority: 40,
      actions: [
        {
          label: 'View Post',
          type: 'navigate',
          payload: { url: `/dna/feed/story/${underShared.id}` },
          isPrimary: true,
        },
        {
          label: 'Not now',
          type: 'dismiss',
          payload: {},
          isPrimary: false,
        },
      ],
      metadata: {
        postId: underShared.id,
        likes: underShared.likes_count,
        shares: underShared.shares_count,
      },
      dismissKey: `amplify-${underShared.id}`,
    };
  } catch {
    return null;
  }
}

// ── Card Type 3: Trending Topic Alignment ──────────

async function generateTrendingAlignment(userId: string): Promise<DIACard | null> {
  try {
    const { data: profile } = await supabase
      .from('profiles')
      .select('skills, interests')
      .eq('id', userId)
      .single();

    if (!profile) return null;

    const expertise: string[] = [
      ...((profile.skills as string[]) || []),
      ...((profile.interests as string[]) || []),
    ];
    if (expertise.length === 0) return null;

    // Get trending hashtags from recent posts
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    const { data: recentPosts } = await supabase
      .from('posts')
      .select('hashtags')
      .gte('created_at', oneDayAgo)
      .limit(100);

    if (!recentPosts || recentPosts.length === 0) return null;

    // Count hashtag frequency
    const tagCounts: Record<string, number> = {};
    for (const post of recentPosts) {
      const tags: string[] = (post.hashtags as string[]) || [];
      for (const tag of tags) {
        tagCounts[tag] = (tagCounts[tag] || 0) + 1;
      }
    }

    // Find trending tags that match user's expertise
    const matchingTrends: Array<{ tag: string; count: number }> = [];
    for (const [tag, count] of Object.entries(tagCounts)) {
      if (count < 3) continue;
      const tagLower = tag.toLowerCase();
      if (expertise.some(e => tagLower.includes(e.toLowerCase()) || e.toLowerCase().includes(tagLower))) {
        matchingTrends.push({ tag, count });
      }
    }

    if (matchingTrends.length === 0) return null;

    matchingTrends.sort((a, b) => b.count - a.count);
    const topTrend = matchingTrends[0];

    return {
      id: `convey-trend-${topTrend.tag}`,
      category: 'convey',
      cardType: 'trending_alignment',
      headline: `#${topTrend.tag} is trending in your network`,
      body: `${topTrend.count} posts today. You have expertise here — share your perspective.`,
      accentColor: ACCENT,
      icon: 'TrendingUp',
      priority: 55,
      actions: [
        {
          label: 'Write a Post',
          type: 'open_composer',
          payload: { hashtag: topTrend.tag },
          isPrimary: true,
        },
        {
          label: 'See Posts',
          type: 'navigate',
          payload: { url: `/dna/feed/hashtag/${topTrend.tag}` },
          isPrimary: false,
        },
      ],
      metadata: {
        hashtag: topTrend.tag,
        postCount: topTrend.count,
        matchingTrends,
      },
      dismissKey: `trend-${topTrend.tag}-${new Date().toISOString().split('T')[0]}`,
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    };
  } catch {
    return null;
  }
}

// ── Card Type 4: Publishing Cadence ────────────────

async function generatePublishingCadence(userId: string): Promise<DIACard | null> {
  try {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();

    const { data: recentPosts } = await supabase
      .from('posts')
      .select('id, created_at, likes_count, comments_count')
      .eq('author_id', userId)
      .order('created_at', { ascending: false })
      .limit(20);

    if (!recentPosts) return null;

    // Calculate days since last post
    if (recentPosts.length === 0) return null;

    const lastPostDate = new Date(recentPosts[0].created_at);
    const daysSinceLast = Math.floor(
      (Date.now() - lastPostDate.getTime()) / (24 * 60 * 60 * 1000)
    );

    if (daysSinceLast < 14) return null;

    // Count total reach of last post
    const lastPost = recentPosts[0];
    const lastReach = (lastPost.likes_count || 0) + (lastPost.comments_count || 0);

    return {
      id: `convey-cadence-${userId}`,
      category: 'convey',
      cardType: 'publishing_cadence',
      headline: `You haven't published in ${daysSinceLast} days`,
      body: lastReach > 0
        ? `Your last post reached ${lastReach} people. Your audience is waiting for more.`
        : 'Your diaspora community would love to hear from you. Share what you\'re working on.',
      accentColor: ACCENT,
      icon: 'PenLine',
      priority: 45,
      actions: [
        {
          label: 'Write Something',
          type: 'open_composer',
          payload: {},
          isPrimary: true,
        },
        {
          label: 'Not now',
          type: 'dismiss',
          payload: {},
          isPrimary: false,
        },
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
  return [
    generateContentPerformance,
    generateAmplificationSuggestion,
    generateTrendingAlignment,
    generatePublishingCadence,
  ];
}
