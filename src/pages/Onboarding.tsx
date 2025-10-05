import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { OnboardingWizard } from '@/components/onboarding/OnboardingWizard';

const Onboarding = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const { data: profile } = useQuery({
    queryKey: ['profile-completion-check', user?.id],
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
    if (profile?.onboarding_completed_at) {
      // Already completed - redirect to profile if username exists
      if ((profile as any).username) {
        console.log('Onboarding complete, redirecting to /profile/' + (profile as any).username);
        navigate(`/profile/${(profile as any).username}`, { replace: true });
      } else {
        navigate('/contribute', { replace: true });
      }
    }
  }, [profile, navigate]);

  return <OnboardingWizard />;
};

export default Onboarding;