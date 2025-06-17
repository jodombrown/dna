
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';

export const useRecommendations = () => {
  const { user } = useAuth();
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const refreshRecommendations = async () => {
    if (!user) return;
    
    setLoading(true);
    // Placeholder - return empty array since tables are removed
    setRecommendations([]);
    setLoading(false);
  };

  useEffect(() => {
    refreshRecommendations();
  }, [user]);

  return {
    recommendations,
    loading,
    refreshRecommendations
  };
};
