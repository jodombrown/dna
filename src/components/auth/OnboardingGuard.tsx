import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const OnboardingGuard = ({ children }: { children: React.ReactNode }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const { data: profile, isLoading } = useQuery({
    queryKey: ['profile-completion', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      const { data } = await (supabase as any)
        .from('profiles')
        .select('onboarding_completed_at')
        .eq('id', user.id)
        .maybeSingle();
      return data;
    },
    enabled: !!user?.id,
  });

  useEffect(() => {
    if (!isLoading && user && !profile?.onboarding_completed_at) {
      // Block access to protected routes until onboarding complete
      if (window.location.pathname !== '/onboarding') {
        navigate('/onboarding');
      }
    }
  }, [profile, isLoading, user, navigate]);

  if (isLoading) {
    return <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
        <p className="mt-4 text-muted-foreground">Loading...</p>
      </div>
    </div>;
  }

  return <>{children}</>;
};
