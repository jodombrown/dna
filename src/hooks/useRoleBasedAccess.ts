import { useAuth } from '@/contexts/AuthContext';

export default function useRoleBasedAccess() {
  const { user, profile } = useAuth();

  return {
    profile: profile ? {
      id: profile.id,
      full_name: profile.full_name,
      username: profile.username,
      role: profile.role,
      headline: profile.headline,
      avatar_url: profile.avatar_url,
      impact_score: profile.impact_score || 0,
      profile_completion: profile.profile_completion || 0
    } : null,
    user
  };
}