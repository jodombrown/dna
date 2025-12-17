import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useProfile } from '@/hooks/useProfile';

export default function Welcome() {
  const { user, loading: authLoading } = useAuth();
  const { data: profile, isLoading: profileLoading } = useProfile();
  const navigate = useNavigate();

  useEffect(() => {
    // Wait for both auth and profile to finish loading
    if (authLoading || profileLoading) {
      return;
    }

    // If not authenticated, redirect to auth page
    if (!user) {
      navigate('/auth', { replace: true });
      return;
    }

    // If user has completed onboarding (has username), go directly to feed
    if (profile?.username) {
      navigate('/dna/feed', { replace: true });
      return;
    }

    // If user doesn't have username yet, redirect to onboarding
    navigate('/onboarding', { replace: true });
  }, [user, profile, authLoading, profileLoading, navigate]);

  // Show loading while checking auth/profile state
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
    </div>
  );
}
