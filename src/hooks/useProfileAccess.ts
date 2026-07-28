import { useMemo } from 'react';
import { useProfile } from '@/hooks/useProfile';
import { calculateProfileCompletionPts } from '@/lib/profileCompletion';

export const useProfileAccess = () => {
  // BD276: Score the SAME hydrated profile shape ProfileEdit scores via
  // useProfile(). AuthContext's profile is fetched with PROFILE_SELECT_COLUMNS,
  // which cannot include `primary_origin_country` — that field does not exist
  // on the `profiles` table (it is derived from member_heritage). useProfile()
  // hydrates it back onto the object, so scoring here no longer caps at 95.
  const { data: profile } = useProfile();

  // Memoize the score using canonical calculation function - single source of truth
  const completenessScore = useMemo(() => {
    return calculateProfileCompletionPts(profile);
  }, [profile]);

  return {
    completenessScore,
  };
};
