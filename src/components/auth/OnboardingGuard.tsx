import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const OnboardingGuard = ({ children }: { children: React.ReactNode }) => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  const { data: profile, isLoading: profileLoading } = useQuery({
    queryKey: ['profile-onboarding-check', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      const { data } = await supabase
        .from('profiles')
        .select('onboarding_completed_at, username')
        .eq('id', user.id)
        .maybeSingle();
      return data;
    },
    enabled: !!user?.id,
  });

  useEffect(() => {
    // Wait for both auth and profile to load
    if (authLoading || profileLoading) return;

    // If not authenticated, let AuthGuard handle it
    if (!user) return;

    // If onboarding incomplete and not already on onboarding page
    if (!profile?.onboarding_completed_at && location.pathname !== '/onboarding') {
      console.log('OnboardingGuard: Redirecting to /onboarding');
      navigate('/onboarding', { replace: true });
    }
  }, [profile, authLoading, profileLoading, user, navigate, location.pathname]);

  // Show loading while checking
  if (authLoading || profileLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};
