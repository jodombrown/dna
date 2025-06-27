
import React from 'react';
import Header from '@/components/Header';
import MultiStepOnboardingWizard from '@/components/onboarding/MultiStepOnboardingWizard';
import ProtectedRoute from '@/components/ProtectedRoute';

const OnboardingWizard = () => {
  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="py-8">
          <MultiStepOnboardingWizard />
        </div>
      </div>
    </ProtectedRoute>
  );
};

export default OnboardingWizard;
