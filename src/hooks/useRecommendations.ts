
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { getProfileRecommendations, searchProfilesByRelevance, RecommendationProfile } from '@/services/recommendationsService';
import { supabase } from '@/integrations/supabase/client';

export const useRecommendations = () => {
  const { user } = useAuth();
  const [recommendations, setRecommendations] = useState<RecommendationProfile[]>([]);
  const [searchResults, setSearchResults] = useState<RecommendationProfile[]>([]);
  const [loading, setLoading] = useState(false);
  const [userProfile, setUserProfile] = useState<any>(null);

  // Fetch user profile
  useEffect(() => {
    const fetchUserProfile = async () => {
      if (!user) return;

      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();

        if (error) throw error;
        setUserProfile(data);
      } catch (error) {
        console.error('Error fetching user profile:', error);
      }
    };

    fetchUserProfile();
  }, [user]);

  // Load initial recommendations
  useEffect(() => {
    const loadRecommendations = async () => {
      if (!user || !userProfile) return;

      setLoading(true);
      try {
        const recs = await getProfileRecommendations(user.id, 10);
        setRecommendations(recs);
      } catch (error) {
        console.error('Error loading recommendations:', error);
      } finally {
        setLoading(false);
      }
    };

    loadRecommendations();
  }, [user, userProfile]);

  const searchWithRelevance = async (searchTerm: string, filters: any = {}) => {
    if (!userProfile) return;

    setLoading(true);
    try {
      const results = await searchProfilesByRelevance(searchTerm, userProfile, filters);
      setSearchResults(results);
    } catch (error) {
      console.error('Error in relevance search:', error);
    } finally {
      setLoading(false);
    }
  };

  const refreshRecommendations = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const recs = await getProfileRecommendations(user.id, 10);
      setRecommendations(recs);
    } catch (error) {
      console.error('Error refreshing recommendations:', error);
    } finally {
      setLoading(false);
    }
  };

  return {
    recommendations,
    searchResults,
    loading,
    userProfile,
    searchWithRelevance,
    refreshRecommendations
  };
};
