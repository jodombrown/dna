import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useProfile } from '@/hooks/useProfile';
import { WelcomeWizard } from '@/components/onboarding/WelcomeWizard';
import { useScrollToTop } from '@/hooks/useScrollToTop';

export default function Welcome() {
  useScrollToTop();
  const { user } = useAuth();
  const { data: profile, isLoading } = useProfile();
  const navigate = useNavigate();

  useEffect(() => {
    // If user already has a role set, redirect to feed
    if (!isLoading && profile?.user_role) {
      navigate('/dna/feed', { replace: true });
    }
  }, [profile, isLoading, navigate]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    navigate('/login', { replace: true });
    return null;
  }

  return <WelcomeWizard />;
}
