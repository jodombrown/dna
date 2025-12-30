import { supabase } from '@/integrations/supabase/client';
import type { SupabaseClient } from '@supabase/supabase-js';

// Helper type for RPC calls that aren't in generated types
type SupabaseRpc = SupabaseClient['rpc'];

export interface UserHashtagLimits {
  max_hashtags: number;
  active_count: number;
  archived_count: number;
  available_slots: number;
}

export interface OwnedHashtag {
  id: string;
  tag: string;
  description: string | null;
  status: string;
  usage_count: number;
  follower_count: number;
  pending_requests: number;
  created_at: string;
  archived_at: string | null;
}

export interface HashtagRequest {
  request_id: string;
  hashtag_id: string;
  hashtag_tag: string;
  post_id: string;
  post_content: string;
  requester_id: string;
  requester_name: string;
  requester_avatar: string | null;
  created_at: string;
}

export interface CreateHashtagResult {
  success: boolean;
  hashtag_id: string | null;
  error_message: string | null;
}

export interface ActionResult {
  success: boolean;
  error_message: string | null;
}

export const hashtagOwnershipService = {
  /**
   * Get user's hashtag limits and counts
   */
  async getUserLimits(userId: string): Promise<UserHashtagLimits | null> {
    const { data, error } = await (supabase.rpc as SupabaseRpc)('get_user_hashtag_limits', {
      p_user_id: userId
    });

    if (error) {
      return null;
    }

    return Array.isArray(data) ? data[0] : data;
  },

  /**
   * Create a personal hashtag
   */
  async createPersonalHashtag(
    userId: string,
    tag: string,
    description?: string
  ): Promise<CreateHashtagResult> {
    const { data, error } = await (supabase.rpc as SupabaseRpc)('create_personal_hashtag', {
      p_user_id: userId,
      p_tag: tag,
      p_description: description || null
    });

    if (error) {
      return { success: false, hashtag_id: null, error_message: error.message };
    }

    const result = Array.isArray(data) ? data[0] : data;
    return result || { success: false, hashtag_id: null, error_message: 'Unknown error' };
  },

  /**
   * Archive a personal hashtag
   */
  async archiveHashtag(userId: string, hashtagId: string): Promise<ActionResult> {
    const { data, error } = await (supabase.rpc as SupabaseRpc)('archive_personal_hashtag', {
      p_user_id: userId,
      p_hashtag_id: hashtagId
    });

    if (error) {
      return { success: false, error_message: error.message };
    }

    const result = Array.isArray(data) ? data[0] : data;
    return result || { success: false, error_message: 'Unknown error' };
  },

  /**
   * Reactivate an archived hashtag
   */
  async reactivateHashtag(userId: string, hashtagId: string): Promise<ActionResult> {
    const { data, error } = await (supabase.rpc as SupabaseRpc)('reactivate_personal_hashtag', {
      p_user_id: userId,
      p_hashtag_id: hashtagId
    });

    if (error) {
      return { success: false, error_message: error.message };
    }

    const result = Array.isArray(data) ? data[0] : data;
    return result || { success: false, error_message: 'Unknown error' };
  },

  /**
   * Get user's owned hashtags
   */
  async getOwnedHashtags(userId: string): Promise<OwnedHashtag[]> {
    const { data, error } = await (supabase.rpc as SupabaseRpc)('get_user_owned_hashtags', {
      p_user_id: userId
    });

    if (error) {
      return [];
    }

    return (data || []) as OwnedHashtag[];
  },

  /**
   * Get pending requests for owner
   */
  async getPendingRequests(ownerId: string): Promise<HashtagRequest[]> {
    const { data, error } = await (supabase.rpc as SupabaseRpc)('get_pending_hashtag_requests', {
      p_owner_id: ownerId
    });

    if (error) {
      return [];
    }

    return (data || []) as HashtagRequest[];
  },

  /**
   * Approve or deny a request
   */
  async reviewRequest(
    ownerId: string,
    requestId: string,
    approved: boolean,
    note?: string
  ): Promise<ActionResult> {
    const { data, error } = await (supabase.rpc as SupabaseRpc)('review_hashtag_request', {
      p_owner_id: ownerId,
      p_request_id: requestId,
      p_approved: approved,
      p_note: note || null
    });

    if (error) {
      return { success: false, error_message: error.message };
    }

    const result = Array.isArray(data) ? data[0] : data;
    return result || { success: false, error_message: 'Unknown error' };
  }
};
