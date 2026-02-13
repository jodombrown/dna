/**
 * DIA | Trend Intelligence Service
 *
 * Identifies what's trending in the network, by region, or globally.
 * Powers: Feed (trending sort), DIA Insight Cards, Convey Hub
 *
 * Data sources:
 * - Post engagement velocity (view_count over time)
 * - Hashtag frequency
 * - Event registration rates
 * - Opportunity creation rates
 * - External: Perplexity API for global diaspora trends (future)
 */

import { supabase } from '@/integrations/supabase/client';
import type { TrendItem, TrendQuery, TrendType, FiveCModule } from '@/types/dia';

/** Time window to milliseconds mapping */
const TIME_WINDOWS: Record<string, number> = {
  day: 24 * 60 * 60 * 1000,
  week: 7 * 24 * 60 * 60 * 1000,
  month: 30 * 24 * 60 * 60 * 1000,
};

/**
 * Get trending items based on the query parameters.
 */
async function getTrends(query: TrendQuery): Promise<TrendItem[]> {
  const { scope, time_window, limit = 20 } = query;
  const since = new Date(Date.now() - TIME_WINDOWS[time_window]).toISOString();

  const [topicTrends, hashtagTrends, eventTrends] = await Promise.all([
    getTopicTrends(since, limit),
    getHashtagTrends(since, limit),
    getEventCategoryTrends(since, limit),
  ]);

  const allTrends = [...topicTrends, ...hashtagTrends, ...eventTrends]
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);

  return allTrends;
}

/**
 * Get trending topics based on post content engagement.
 * Note: posts table has view_count but no like_count/comment_count/share_count
 */
async function getTopicTrends(since: string, limit: number): Promise<TrendItem[]> {
  // Get recent highly-viewed posts
  const { data: posts } = await supabase
    .from('posts')
    .select('id, content, title, view_count, created_at')
    .gte('created_at', since)
    .order('view_count', { ascending: false })
    .limit(100);

  if (!posts || posts.length === 0) return [];

  // Extract and count topics from high-engagement posts
  const topicScores = new Map<string, { score: number; posts: number; velocity: number }>();

  const TOPIC_KEYWORDS: Record<string, string[]> = {
    'fintech': ['fintech', 'mobile money', 'digital payment', 'banking'],
    'technology': ['tech', 'software', 'ai', 'blockchain', 'coding'],
    'investment': ['invest', 'funding', 'startup', 'vc', 'capital'],
    'entrepreneurship': ['founder', 'startup', 'business', 'entrepreneur'],
    'education': ['education', 'university', 'learning', 'scholarship'],
    'healthcare': ['health', 'medical', 'healthcare', 'wellness'],
    'agriculture': ['agriculture', 'farming', 'agritech', 'food'],
    'energy': ['energy', 'solar', 'renewable', 'power', 'climate'],
    'diaspora': ['diaspora', 'remittance', 'heritage', 'homeland'],
    'culture': ['culture', 'art', 'music', 'film', 'creative'],
  };

  for (const post of posts) {
    const text = `${post.title || ''} ${post.content || ''}`.toLowerCase();
    const engagement = (post.view_count || 0);

    for (const [topic, keywords] of Object.entries(TOPIC_KEYWORDS)) {
      if (keywords.some(kw => text.includes(kw))) {
        const existing = topicScores.get(topic) || { score: 0, posts: 0, velocity: 0 };
        existing.score += engagement;
        existing.posts += 1;
        topicScores.set(topic, existing);
      }
    }
  }

  return Array.from(topicScores.entries())
    .map(([topic, data]) => ({
      trend_id: `topic-${topic}`,
      trend_type: 'topic' as TrendType,
      title: topic.charAt(0).toUpperCase() + topic.slice(1),
      description: `${data.posts} posts with ${data.score} total views`,
      score: data.score,
      velocity: data.posts, // Posts per time window
      regions: [],
      related_modules: ['convey'] as FiveCModule[],
      related_entity_ids: [],
      detected_at: new Date().toISOString(),
      peak_at: null,
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
}

/**
 * Get trending hashtags from recent posts.
 */
async function getHashtagTrends(since: string, limit: number): Promise<TrendItem[]> {
  const { data: posts } = await supabase
    .from('posts')
    .select('content, view_count')
    .gte('created_at', since)
    .limit(200);

  if (!posts) return [];

  const hashtagScores = new Map<string, { count: number; engagement: number }>();

  for (const post of posts) {
    const hashtags = (post.content || '').match(/#(\w{2,30})/g);
    if (!hashtags) continue;

    const engagement = (post.view_count || 0);

    for (const tag of hashtags) {
      const normalized = tag.toLowerCase();
      const existing = hashtagScores.get(normalized) || { count: 0, engagement: 0 };
      existing.count += 1;
      existing.engagement += engagement;
      hashtagScores.set(normalized, existing);
    }
  }

  return Array.from(hashtagScores.entries())
    .filter(([, data]) => data.count >= 2) // Minimum threshold
    .map(([hashtag, data]) => ({
      trend_id: `hashtag-${hashtag}`,
      trend_type: 'hashtag' as TrendType,
      title: hashtag,
      description: `Used ${data.count} times`,
      score: data.engagement + data.count * 5,
      velocity: data.count,
      regions: [],
      related_modules: ['convey'] as FiveCModule[],
      related_entity_ids: [],
      detected_at: new Date().toISOString(),
      peak_at: null,
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
}

/**
 * Get trending event categories based on registration rates.
 * Events use 'tags' (string[]) and 'start_time', not 'category'/'start_date'.
 */
async function getEventCategoryTrends(since: string, limit: number): Promise<TrendItem[]> {
  const { data: events } = await supabase
    .from('events')
    .select('id, title, tags')
    .gte('start_time', new Date().toISOString())
    .order('start_time', { ascending: true })
    .limit(50);

  if (!events || events.length === 0) return [];

  const categoryScores = new Map<string, { count: number; eventIds: string[] }>();

  for (const event of events) {
    const tags = event.tags || ['general'];
    const category = tags[0] || 'general';
    const existing = categoryScores.get(category) || { count: 0, eventIds: [] };
    existing.count += 1;
    existing.eventIds.push(event.id);
    categoryScores.set(category, existing);
  }

  return Array.from(categoryScores.entries())
    .map(([category, data]) => ({
      trend_id: `event-cat-${category}`,
      trend_type: 'event_category' as TrendType,
      title: `${category} events`,
      description: `${data.count} upcoming events`,
      score: data.count * 10,
      velocity: data.count,
      regions: [],
      related_modules: ['convene'] as FiveCModule[],
      related_entity_ids: data.eventIds,
      detected_at: new Date().toISOString(),
      peak_at: null,
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
}

export const trendIntelligenceService = {
  getTrends,
  getTopicTrends,
  getHashtagTrends,
  getEventCategoryTrends,
};
