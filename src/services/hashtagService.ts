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
  async getTrending(limit: number = 10, timeframeHours: number = 24): Promise<TrendingHashtag[]> {
    const { data, error } = await supabase
      .rpc('get_trending_hashtags', {
        p_limit: limit,
        p_timeframe_hours: timeframeHours
      });

    if (error) {
      console.error('Error fetching trending hashtags:', error);
      return [];
    }

    return (data || []) as TrendingHashtag[];
  },

  /**
   * Get hashtag details
   */
  async getDetails(hashtagName: string, userId?: string): Promise<HashtagDetails | null> {
    const { data, error } = await supabase
      .rpc('get_hashtag_details', {
        p_hashtag_name: hashtagName,
        p_user_id: userId || null
      });

    if (error) {
      console.error('Error fetching hashtag details:', error);
      return null;
    }

    return data?.[0] || null;
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
    const { data, error } = await supabase
      .rpc('get_hashtag_posts', {
        p_hashtag_name: hashtagName,
        p_limit: limit,
        p_offset: offset,
        p_sort: sort
      });

    if (error) {
      console.error('Error fetching hashtag posts:', error);
      return [];
    }

    return (data || []) as HashtagPost[];
  },

  /**
   * Search hashtags (for autocomplete)
   */
  async search(query: string, limit: number = 10): Promise<Hashtag[]> {
    const { data, error } = await supabase
      .rpc('search_hashtags', {
        p_query: query,
        p_limit: limit
      });

    if (error) {
      console.error('Error searching hashtags:', error);
      return [];
    }

    return (data || []) as Hashtag[];
  },

  /**
   * Toggle follow/unfollow a hashtag
   */
  async toggleFollow(hashtagId: string, userId: string): Promise<boolean> {
    const { data, error } = await supabase
      .rpc('toggle_hashtag_follow', {
        p_hashtag_id: hashtagId,
        p_user_id: userId
      });

    if (error) {
      console.error('Error toggling hashtag follow:', error);
      throw error;
    }

    return data; // true if now following, false if unfollowed
  },

  /**
   * Check if a hashtag is reserved
   */
  async checkReserved(name: string): Promise<ReservedHashtagInfo> {
    const { data, error } = await supabase
      .rpc('is_hashtag_reserved', {
        p_name: name
      });

    if (error) {
      console.error('Error checking reserved hashtag:', error);
      return { is_reserved: false, category: null, reason: null, can_be_used: true };
    }

    return data?.[0] || { is_reserved: false, category: null, reason: null, can_be_used: true };
  },

  /**
   * Get hashtags a user is following
   */
  async getUserFollowedHashtags(userId: string): Promise<Hashtag[]> {
    const { data, error } = await supabase
      .from('hashtag_followers')
      .select(`
        hashtag:hashtags(*)
      `)
      .eq('user_id', userId);

    if (error) {
      console.error('Error fetching followed hashtags:', error);
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
