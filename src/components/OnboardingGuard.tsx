
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/CleanAuthContext';
import { useOnboardingStatus } from '@/hooks/useOnboardingStatus';

interface OnboardingGuardProps {
  children: React.ReactNode;
}

const OnboardingGuard: React.FC<OnboardingGuardProps> = ({ children }) => {
  const { user, loading } = useAuth();
  const { needsOnboarding, checkingOnboarding } = useOnboardingStatus();

  if (loading || checkingOnboarding) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/functional-auth" replace />;
  }

  if (needsOnboarding) {
    return <Navigate to="/onboarding" replace />;
  }

  return <>{children}</>;
};

export default OnboardingGuard;
