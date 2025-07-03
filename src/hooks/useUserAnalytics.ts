
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/CleanAuthContext';

interface UserStats {
  posts_created: number;
  followers_gained: number;
  events_joined: number;
  communities_joined: number;
  content_bookmarked: number;
  people_followed: number;
}

export const useUserAnalytics = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUserStats = async () => {
    if (!user) return;

    try {
      setLoading(true);
      
      // Fetch posts created
      const { count: postsCount } = await supabase
        .from('posts')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id);

      // Fetch followers (people following this user)
      const { count: followersCount } = await supabase
        .from('follows')
        .select('*', { count: 'exact', head: true })
        .eq('target_id', user.id)
        .eq('target_type', 'user');

      // Fetch events joined (this would need an event_attendees table, using 0 for now)
      const eventsJoined = 0;

      // Fetch communities joined
      const { count: communitiesCount } = await supabase
        .from('community_memberships')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id);

      // Fetch content bookmarked
      const { count: bookmarkedCount } = await supabase
        .from('saved_items')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id);

      // Fetch people followed
      const { count: followingCount } = await supabase
        .from('follows')
        .select('*', { count: 'exact', head: true })
        .eq('follower_id', user.id)
        .eq('target_type', 'user');

      setStats({
        posts_created: postsCount || 0,
        followers_gained: followersCount || 0,
        events_joined: eventsJoined,
        communities_joined: communitiesCount || 0,
        content_bookmarked: bookmarkedCount || 0,
        people_followed: followingCount || 0,
      });

      setError(null);
    } catch (err: any) {
      console.error('Error fetching user stats:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserStats();
  }, [user]);

  return {
    stats,
    loading,
    error,
    refetch: fetchUserStats,
  };
};
