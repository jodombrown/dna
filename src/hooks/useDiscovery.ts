import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Tables } from '@/integrations/supabase/types';

type User = Tables<'users'>;
type Post = Tables<'posts'>;

interface DiscoveredPerson {
  id: string;
  full_name: string;
  bio?: string;
  avatar_url?: string;
  location?: string;
  causes?: string[];
  match_score: number;
  match_reason: string;
}

interface DiscoveredPost {
  id: string;
  content: string;
  pillar: string;
  created_at: string;
  author_name?: string;
  engagement_score: number;
  match_reason: string;
}

interface TrendingHashtag {
  tag: string;
  count: number;
  growth: 'up' | 'stable' | 'down';
}

export const useDiscovery = (currentUserId?: string) => {
  const [suggestedPeople, setSuggestedPeople] = useState<DiscoveredPerson[]>([]);
  const [suggestedPosts, setSuggestedPosts] = useState<DiscoveredPost[]>([]);
  const [trendingHashtags, setTrendingHashtags] = useState<TrendingHashtag[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const calculateMatchScore = (user: User, currentUser?: User): number => {
    if (!currentUser) return 1; // Default score for non-authenticated users
    
    let score = 0;
    
    // Shared causes (highest weight)
    if (user.causes && currentUser.causes) {
      const sharedCauses = user.causes.filter(cause => 
        currentUser.causes?.includes(cause)
      );
      score += sharedCauses.length * 3;
    }
    
    // Shared region/location (medium weight)
    if (user.origin_country === currentUser.origin_country) {
      score += 2;
    }
    
    // Shared diaspora tags (low weight)
    if (user.diaspora_tags && currentUser.diaspora_tags) {
      const sharedTags = user.diaspora_tags.filter(tag => 
        currentUser.diaspora_tags?.includes(tag)
      );
      score += sharedTags.length * 1;
    }
    
    return Math.max(score, 1); // Minimum score of 1
  };

  const getMatchReason = (user: User, currentUser?: User): string => {
    if (!currentUser) return 'Active community member';
    
    const reasons = [];
    
    if (user.causes && currentUser.causes) {
      const sharedCauses = user.causes.filter(cause => 
        currentUser.causes?.includes(cause)
      );
      if (sharedCauses.length > 0) {
        reasons.push(`Shared interest: ${sharedCauses[0]}`);
      }
    }
    
    if (user.origin_country === currentUser.origin_country) {
      reasons.push(`From ${user.origin_country}`);
    }
    
    if (user.diaspora_tags && currentUser.diaspora_tags) {
      const sharedTags = user.diaspora_tags.filter(tag => 
        currentUser.diaspora_tags?.includes(tag)
      );
      if (sharedTags.length > 0) {
        reasons.push(`${sharedTags[0]} community`);
      }
    }
    
    return reasons.length > 0 ? reasons[0] : 'Active community member';
  };

  const fetchSuggestedPeople = async () => {
    try {
      let currentUser: User | null = null;
      
      if (currentUserId) {
        const { data: userData } = await supabase
          .from('users')
          .select('*')
          .eq('id', currentUserId)
          .single();
        currentUser = userData;
      }

      // Fetch other users with public profiles
      const { data: users, error } = await supabase
        .from('users')
        .select('*')
        .neq('id', currentUserId || '')
        .not('bio', 'is', null)
        .limit(10);

      if (error) throw error;

      const scoredUsers = users
        ?.map(user => ({
          id: user.id,
          full_name: user.full_name || 'DNA Member',
          bio: user.bio,
          avatar_url: user.avatar_url,
          location: user.location,
          causes: user.causes,
          match_score: calculateMatchScore(user, currentUser),
          match_reason: getMatchReason(user, currentUser)
        }))
        .sort((a, b) => b.match_score - a.match_score)
        .slice(0, 5) || [];

      setSuggestedPeople(scoredUsers);
    } catch (error) {
      console.error('Error fetching suggested people:', error);
    }
  };

  const fetchSuggestedPosts = async () => {
    try {
      // Fetch high-engagement posts from the last 7 days
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

      const { data: posts, error } = await supabase
        .from('posts')
        .select(`
          *,
          reactions:reactions(count),
          comments:comments(count)
        `)
        .eq('visibility', 'public')
        .gte('created_at', sevenDaysAgo.toISOString())
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) throw error;

      // Calculate engagement scores and sort
      const scoredPosts = posts
        ?.map(post => ({
          id: post.id,
          content: post.content || '',
          pillar: post.pillar,
          created_at: post.created_at || '',
          author_name: 'DNA Member', // Would be populated from join in real app
          engagement_score: (post.reactions?.length || 0) * 2 + (post.comments?.length || 0) * 3,
          match_reason: `High engagement in ${post.pillar}`
        }))
        .sort((a, b) => b.engagement_score - a.engagement_score)
        .slice(0, 3) || [];

      setSuggestedPosts(scoredPosts);
    } catch (error) {
      console.error('Error fetching suggested posts:', error);
    }
  };

  const fetchTrendingHashtags = async () => {
    try {
      // For now, return mock trending hashtags since hashtag extraction isn't implemented
      const mockTrending: TrendingHashtag[] = [
        { tag: 'AfricaTech2024', count: 142, growth: 'up' },
        { tag: 'DiasporaInvestment', count: 89, growth: 'up' },
        { tag: 'YouthEmpowerment', count: 67, growth: 'stable' },
        { tag: 'SustainableAgriculture', count: 45, growth: 'up' },
        { tag: 'AfricanStartups', count: 38, growth: 'stable' }
      ];
      
      setTrendingHashtags(mockTrending);
    } catch (error) {
      console.error('Error fetching trending hashtags:', error);
    }
  };

  const refreshDiscovery = async () => {
    try {
      setLoading(true);
      await Promise.all([
        fetchSuggestedPeople(),
        fetchSuggestedPosts(),
        fetchTrendingHashtags()
      ]);
    } catch (error) {
      console.error('Error refreshing discovery:', error);
      toast({
        title: "Error",
        description: "Failed to load discovery content.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshDiscovery();
  }, [currentUserId]);

  return {
    suggestedPeople,
    suggestedPosts,
    trendingHashtags,
    loading,
    refreshDiscovery
  };
};