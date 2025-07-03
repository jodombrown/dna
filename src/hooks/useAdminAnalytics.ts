
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface AdminStats {
  total_users: number;
  active_users_weekly: number;
  posts_created: number;
  top_hashtags: Array<{ tag: string; count: number }>;
  top_contributors: Array<{ user_id: string; full_name: string; posts_count: number }>;
  users_by_country: Array<{ country: string; count: number }>;
}

export const useAdminAnalytics = () => {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAdminStats = async () => {
    try {
      setLoading(true);

      // Get total users
      const { count: totalUsers } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });

      // Get active users (posted in last 7 days)
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      
      const { count: activeUsers } = await supabase
        .from('posts')
        .select('user_id', { count: 'exact', head: true })
        .gte('created_at', sevenDaysAgo.toISOString());

      // Get total posts
      const { count: totalPosts } = await supabase
        .from('posts')
        .select('*', { count: 'exact', head: true });

      // Get posts with hashtags for analysis
      const { data: postsWithHashtags } = await supabase
        .from('posts')
        .select('hashtags')
        .not('hashtags', 'is', null);

      // Process hashtags
      const hashtagCounts: { [key: string]: number } = {};
      postsWithHashtags?.forEach(post => {
        if (post.hashtags && Array.isArray(post.hashtags)) {
          post.hashtags.forEach((tag: string) => {
            hashtagCounts[tag] = (hashtagCounts[tag] || 0) + 1;
          });
        }
      });

      const topHashtags = Object.entries(hashtagCounts)
        .map(([tag, count]) => ({ tag, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);

      // Get top contributors
      const { data: contributors } = await supabase
        .from('posts')
        .select(`
          user_id,
          profiles!inner(full_name)
        `)
        .limit(100);

      const contributorCounts: { [key: string]: { full_name: string; count: number } } = {};
      contributors?.forEach(post => {
        const userId = post.user_id;
        const fullName = (post.profiles as any)?.full_name || 'Unknown User';
        
        if (!contributorCounts[userId]) {
          contributorCounts[userId] = { full_name: fullName, count: 0 };
        }
        contributorCounts[userId].count++;
      });

      const topContributors = Object.entries(contributorCounts)
        .map(([user_id, data]) => ({
          user_id,
          full_name: data.full_name,
          posts_count: data.count
        }))
        .sort((a, b) => b.posts_count - a.posts_count)
        .slice(0, 5);

      // Get users by country (using current_country from profiles)
      const { data: usersByCountry } = await supabase
        .from('profiles')
        .select('current_country')
        .not('current_country', 'is', null);

      const countryCounts: { [key: string]: number } = {};
      usersByCountry?.forEach(profile => {
        if (profile.current_country) {
          countryCounts[profile.current_country] = (countryCounts[profile.current_country] || 0) + 1;
        }
      });

      const usersByCountryArray = Object.entries(countryCounts)
        .map(([country, count]) => ({ country, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10);

      setStats({
        total_users: totalUsers || 0,
        active_users_weekly: activeUsers || 0,
        posts_created: totalPosts || 0,
        top_hashtags: topHashtags,
        top_contributors: topContributors,
        users_by_country: usersByCountryArray,
      });

      setError(null);
    } catch (err: any) {
      console.error('Error fetching admin stats:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminStats();
  }, []);

  return {
    stats,
    loading,
    error,
    refetch: fetchAdminStats,
  };
};
