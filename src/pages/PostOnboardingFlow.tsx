import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import FeedbackWidget from '@/components/onboarding/FeedbackWidget';
import { CommunityIntroduction } from '@/components/profile/CommunityIntroduction';

type FlowStep = 'feedback' | 'introduction' | 'complete';

export const PostOnboardingFlow: React.FC = () => {
  const [currentStep, setCurrentStep] = useState<FlowStep>('feedback');
  const { user, profile } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user should be in post-onboarding flow
    if (!user || !profile?.onboarding_completed_at) {
      navigate('/app/dashboard');
      return;
    }

    // Check if user already completed post-onboarding steps
    if (profile.intro_text || profile.intro_audio_url || profile.intro_video_url) {
      navigate('/app');
      return;
    }
  }, [user, profile, navigate]);

  const handleFeedbackComplete = () => {
    setCurrentStep('introduction');
  };

  const handleFeedbackSkip = () => {
    setCurrentStep('introduction');
  };

  const handleIntroductionComplete = () => {
    setCurrentStep('complete');
    setTimeout(() => navigate('/app'), 2000);
  };

  const handleIntroductionSkip = () => {
    navigate('/app');
  };

  if (!user || !profile) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-dna-forest/5 to-dna-sunshine/5 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        {/* Progress Indicator */}
        <div className="mb-8">
          <div className="flex items-center justify-center space-x-4">
            <div className={`h-3 w-3 rounded-full ${
              currentStep === 'feedback' ? 'bg-primary' : 'bg-primary/30'
            }`} />
            <div className={`h-1 w-16 ${
              currentStep === 'introduction' || currentStep === 'complete' ? 'bg-primary' : 'bg-muted'
            }`} />
            <div className={`h-3 w-3 rounded-full ${
              currentStep === 'introduction' || currentStep === 'complete' ? 'bg-primary' : 'bg-muted'
            }`} />
            <div className={`h-1 w-16 ${
              currentStep === 'complete' ? 'bg-primary' : 'bg-muted'
            }`} />
            <div className={`h-3 w-3 rounded-full ${
              currentStep === 'complete' ? 'bg-primary' : 'bg-muted'
            }`} />
          </div>
          <div className="text-center mt-4">
            <p className="text-sm text-muted-foreground">
              {currentStep === 'feedback' && 'Step 1 of 2: Share your feedback'}
              {currentStep === 'introduction' && 'Step 2 of 2: Introduce yourself'}
              {currentStep === 'complete' && 'All done! Welcome to DNA 🎉'}
            </p>
          </div>
        </div>

        {/* Content */}
        {currentStep === 'feedback' && (
          <FeedbackWidget
            onComplete={handleFeedbackComplete}
            onSkip={handleFeedbackSkip}
          />
        )}

        {currentStep === 'introduction' && (
          <CommunityIntroduction
            currentIntro={{
              intro_text: profile.intro_text,
              intro_audio_url: profile.intro_audio_url,
              intro_video_url: profile.intro_video_url,
            }}
            onComplete={handleIntroductionComplete}
            onSkip={handleIntroductionSkip}
          />
        )}

        {currentStep === 'complete' && (
          <div className="text-center space-y-6">
            <div className="text-6xl">🎉</div>
            <div>
              <h1 className="text-3xl font-bold text-dna-forest mb-2">
                Welcome to DNA!
              </h1>
              <p className="text-muted-foreground">
                You're all set up and ready to connect with the community.
              </p>
            </div>
            <div className="animate-pulse">
              <p className="text-sm text-muted-foreground">
                Redirecting to your dashboard...
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};