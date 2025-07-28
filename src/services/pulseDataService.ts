import { supabase } from '@/integrations/supabase/client';

export interface PulseDataResponse {
  totalUsers: number;
  activeUsersThisWeek: number;
  totalConnections: number;
  totalPosts: number;
  totalEvents: number;
  engagementRate: number;
  myConnections: number;
  myPosts: number;
  myCommunities: number;
  myViews: number;
  impactScore: number;
}

export const pulseDataService = {
  async fetchPulseData(userId: string): Promise<PulseDataResponse> {
    try {
      // Fetch platform-wide statistics using existing RPC functions
      const [
        totalUsersResult,
        activeUsersResult,
        totalConnectionsResult,
        totalPostsResult,
        totalEventsResult,
        engagementRateResult
      ] = await Promise.all([
        supabase.rpc('get_total_users'),
        supabase.rpc('get_active_users_this_week'),
        supabase.rpc('get_total_connections'),
        supabase.rpc('get_total_posts'),
        supabase.rpc('get_total_events'),
        supabase.rpc('get_engagement_rate')
      ]);

      // Fetch user-specific statistics
      const [
        myConnectionsResult,
        myPostsResult,
        myCommunitiesResult,
        impactScoreResult
      ] = await Promise.all([
        supabase
          .from('contact_requests')
          .select('id', { count: 'exact' })
          .or(`sender_id.eq.${userId},receiver_id.eq.${userId}`)
          .eq('status', 'accepted'),
        supabase
          .from('posts')
          .select('id', { count: 'exact' })
          .eq('author_id', userId),
        supabase
          .from('community_memberships')
          .select('id', { count: 'exact' })
          .eq('user_id', userId)
          .eq('status', 'approved'),
        supabase.rpc('calculate_impact_score', { target_user_id: userId })
      ]);

      // Check for errors
      const errors = [
        totalUsersResult.error,
        activeUsersResult.error,
        totalConnectionsResult.error,
        totalPostsResult.error,
        totalEventsResult.error,
        engagementRateResult.error,
        myConnectionsResult.error,
        myPostsResult.error,
        myCommunitiesResult.error,
        impactScoreResult.error
      ].filter(Boolean);

      if (errors.length > 0) {
        throw new Error(`Failed to fetch pulse data: ${errors[0]?.message}`);
      }

      return {
        // Platform stats
        totalUsers: totalUsersResult.data || 0,
        activeUsersThisWeek: activeUsersResult.data || 0,
        totalConnections: totalConnectionsResult.data || 0,
        totalPosts: totalPostsResult.data || 0,
        totalEvents: totalEventsResult.data || 0,
        engagementRate: engagementRateResult.data || 0,
        
        // Personal stats
        myConnections: myConnectionsResult.count || 0,
        myPosts: myPostsResult.count || 0,
        myCommunities: myCommunitiesResult.count || 0,
        myViews: 0, // TODO: Implement profile view tracking
        impactScore: impactScoreResult.data || 0
      };
    } catch (error) {
      console.error('Error fetching pulse data:', error);
      throw error;
    }
  }
};