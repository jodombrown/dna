import { supabase } from '@/integrations/supabase/client';

// Types
export interface Hashtag {
  id: string;
  name: string;
  display_name: string;
  type: 'community' | 'personal';
  owner_id: string | null;
  description: string | null;
  status: 'active' | 'archived' | 'suspended' | 'reserved';
  is_verified: boolean;
  usage_count: number;
  follower_count: number;
  created_at: string;
}

export interface HashtagDetails extends Hashtag {
  owner_name: string | null;
  owner_username: string | null;
  owner_avatar: string | null;
  is_following: boolean;
}

export interface TrendingHashtag {
  id: string;
  name: string;
  display_name: string;
  type: 'community' | 'personal';
  usage_count: number;
  follower_count: number;
  recent_uses: number;
  trending_score: number;
}

export interface HashtagPost {
  post_id: string;
  content: string;
  media_urls: string[] | null;
  author_id: string;
  author_name: string;
  author_username: string;
  author_avatar: string | null;
  author_headline: string | null;
  like_count: number;
  comment_count: number;
  reshare_count: number;
  created_at: string;
}

export interface ReservedHashtagInfo {
  is_reserved: boolean;
  category: string | null;
  reason: string | null;
  can_be_used: boolean;
}

export const hashtagService = {
  /**
   * Get trending hashtags
   */
  async getTrending(limit: number = 10, days: number = 7): Promise<TrendingHashtag[]> {
    const { data, error } = await supabase
      .rpc('get_trending_hashtags', {
        p_limit: limit,
        p_days: days
      });

    if (error) {
      return [];
    }

    // Map the database response to our interface
    return ((data as unknown as any[]) || []).map(item => ({
      id: item.id || '',
      name: item.name || item.tag || '',
      display_name: item.display_name || item.name || '',
      type: item.type || 'community',
      usage_count: item.usage_count || item.post_count || 0,
      follower_count: item.follower_count || 0,
      recent_uses: item.recent_uses || item.recent_post_count || 0,
      trending_score: item.trending_score || 0,
    }));
  },

  /**
   * Get hashtag details
   */
  async getDetails(hashtagName: string, userId?: string): Promise<HashtagDetails | null> {
    const { data, error } = await (supabase.rpc as any)('get_hashtag_details', {
      p_hashtag_name: hashtagName,
      p_user_id: userId || null
    });

    if (error) {
      return null;
    }

    const result = Array.isArray(data) ? data[0] : data;
    return result || null;
  },

  /**
   * Get posts for a hashtag
   */
  async getPosts(
    hashtagName: string,
    limit: number = 20,
    offset: number = 0,
    sort: 'recent' | 'top' = 'recent'
  ): Promise<HashtagPost[]> {
    const { data, error } = await (supabase.rpc as any)('get_hashtag_posts', {
      p_hashtag_name: hashtagName,
      p_limit: limit,
      p_offset: offset,
      p_sort: sort
    });

    if (error) {
      return [];
    }

    return (data || []) as HashtagPost[];
  },

  /**
   * Search hashtags (for autocomplete)
   */
  async search(query: string, limit: number = 10): Promise<Hashtag[]> {
    const { data, error } = await (supabase.rpc as any)('search_hashtags', {
      p_query: query,
      p_limit: limit
    });

    if (error) {
      return [];
    }

    return (data || []) as Hashtag[];
  },

  /**
   * Toggle follow/unfollow a hashtag
   */
  async toggleFollow(hashtagId: string, userId: string): Promise<boolean> {
    const { data, error } = await (supabase.rpc as any)('toggle_hashtag_follow', {
      p_hashtag_id: hashtagId,
      p_user_id: userId
    });

    if (error) {
      throw error;
    }

    return Boolean(data);
  },

  /**
   * Check if a hashtag is reserved
   */
  async checkReserved(name: string): Promise<ReservedHashtagInfo> {
    const { data, error } = await (supabase.rpc as any)('is_hashtag_reserved', {
      p_name: name
    });

    if (error) {
      return { is_reserved: false, category: null, reason: null, can_be_used: true };
    }

    const result = Array.isArray(data) ? data[0] : data;
    return result || { is_reserved: false, category: null, reason: null, can_be_used: true };
  },

  /**
   * Get hashtags a user is following
   */
  async getUserFollowedHashtags(userId: string): Promise<Hashtag[]> {
    const { data, error } = await (supabase.from as any)('hashtag_followers')
      .select(`
        hashtag:hashtags(*)
      `)
      .eq('user_id', userId);

    if (error) {
      return [];
    }

    return (data?.map((d: any) => d.hashtag).filter(Boolean) || []) as Hashtag[];
  },

  /**
   * Extract hashtags from text (client-side helper)
   */
  extractHashtags(content: string): string[] {
    const matches = content.match(/#(\w+)/g);
    if (!matches) return [];
    return [...new Set(matches.map(m => m.slice(1).toLowerCase()))];
  }
};
