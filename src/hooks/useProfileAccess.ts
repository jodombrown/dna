import { useMemo } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { calculateProfileCompletionPts } from '@/lib/profileCompletion';

export const useProfileAccess = () => {
  const { profile } = useAuth();

  // Memoize the score using canonical calculation function - single source of truth
  const completenessScore = useMemo(() => {
    return calculateProfileCompletionPts(profile);
  }, [profile]);

  return {
    completenessScore,
  };
};
