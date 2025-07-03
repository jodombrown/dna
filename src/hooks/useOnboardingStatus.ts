
import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/CleanAuthContext';

export const useOnboardingStatus = () => {
  const { user, profile, loading } = useAuth();
  const [needsOnboarding, setNeedsOnboarding] = useState(false);
  const [checkingOnboarding, setCheckingOnboarding] = useState(true);

  useEffect(() => {
    if (loading) {
      setCheckingOnboarding(true);
      return;
    }

    if (!user) {
      setNeedsOnboarding(false);
      setCheckingOnboarding(false);
      return;
    }

    // User needs onboarding if they don't have onboarding_completed_at set
    const needsSetup = !profile?.onboarding_completed_at;
    setNeedsOnboarding(needsSetup);
    setCheckingOnboarding(false);
  }, [user, profile, loading]);

  return {
    needsOnboarding,
    checkingOnboarding
  };
};
