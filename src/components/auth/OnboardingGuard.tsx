import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface OnboardingGuardProps {
  children: React.ReactNode;
}

export const OnboardingGuard = ({ children }: OnboardingGuardProps) => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  const { data: profile, isLoading: profileLoading } = useQuery({
    queryKey: ['onboarding-check', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      
      const { data, error } = await supabase
        .from('profiles')
        .select('onboarding_completed_at, username')
        .eq('id', user.id)
        .single();
      
      if (error) {
        console.error('OnboardingGuard profile fetch error:', error);
        return null;
      }
      
      return data;
    },
    enabled: !!user?.id,
  });

  useEffect(() => {
    // Wait for auth and profile to load
    if (authLoading || profileLoading) return;

    // If not authenticated, redirect to auth page
    if (!user) {
      console.log('OnboardingGuard: No user, redirecting to /auth');
      navigate('/auth', { replace: true });
      return;
    }

    // If onboarding incomplete and not already on onboarding page
    if (!profile?.onboarding_completed_at && location.pathname !== '/onboarding') {
      console.log('OnboardingGuard: Onboarding incomplete, redirecting to /onboarding');
      navigate('/onboarding', { replace: true });
      return;
    }

    // If onboarding complete but trying to access onboarding page, redirect to dashboard
    if (profile?.onboarding_completed_at && location.pathname === '/onboarding') {
      console.log('OnboardingGuard: Onboarding complete, redirecting to /dna/me');
      navigate('/dna/me', { replace: true });
    }
  }, [profile, user, authLoading, profileLoading, navigate, location.pathname]);

  // Show loading spinner while checking
  if (authLoading || profileLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-sm text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // Render children if all checks pass
  return <>{children}</>;
};
