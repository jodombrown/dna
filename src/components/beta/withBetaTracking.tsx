import React, { useEffect, useState } from 'react';
import { useBetaStatus } from '@/hooks/useBetaStatus';
import BetaFeedbackPrompt from './BetaFeedbackPrompt';

interface BetaTrackingOptions {
  featureName: string;
  triggerAfterDelay?: number; // milliseconds
  triggerOnAction?: boolean;
  promptType?: 'prompt_response' | 'bug_report' | 'suggestion' | 'completion';
  customPrompt?: string;
}

export const withBetaTracking = <P extends object>(
  WrappedComponent: React.ComponentType<P>,
  options: BetaTrackingOptions
) => {
  const BetaTrackedComponent: React.FC<P> = (props) => {
    const { betaProfile, markFeatureTested } = useBetaStatus();
    const [showFeedbackPrompt, setShowFeedbackPrompt] = useState(false);
    const [hasTriggered, setHasTriggered] = useState(false);

    const {
      featureName,
      triggerAfterDelay = 10000, // Default 10 seconds
      triggerOnAction = false,
      promptType = 'prompt_response',
      customPrompt
    } = options;

    // Check if user is beta tester and hasn't tested this feature yet
    const shouldTrack = betaProfile?.is_beta_tester && 
                       !betaProfile.beta_features_tested?.includes(featureName) &&
                       betaProfile.beta_status === 'active';

    useEffect(() => {
      if (!shouldTrack || hasTriggered) return;

      // Mark feature as tested immediately when component mounts
      markFeatureTested(featureName);

      // Auto-trigger feedback prompt after delay (if not action-based)
      if (!triggerOnAction) {
        const timer = setTimeout(() => {
          setShowFeedbackPrompt(true);
          setHasTriggered(true);
        }, triggerAfterDelay);

        return () => clearTimeout(timer);
      }
    }, [shouldTrack, hasTriggered, featureName, markFeatureTested, triggerAfterDelay, triggerOnAction]);

    const triggerFeedback = () => {
      if (shouldTrack && !hasTriggered) {
        setShowFeedbackPrompt(true);
        setHasTriggered(true);
      }
    };

    const enhancedProps = {
      ...props,
      ...(triggerOnAction && { onBetaFeedbackTrigger: triggerFeedback })
    } as P;

    return (
      <>
        <WrappedComponent {...enhancedProps} />
        {shouldTrack && (
          <BetaFeedbackPrompt
            isOpen={showFeedbackPrompt}
            onClose={() => setShowFeedbackPrompt(false)}
            featureName={featureName}
            promptType={promptType}
            customPrompt={customPrompt}
          />
        )}
      </>
    );
  };

  BetaTrackedComponent.displayName = `withBetaTracking(${WrappedComponent.displayName || WrappedComponent.name})`;

  return BetaTrackedComponent;
};

// Hook for manual beta tracking
export const useBetaFeatureTracking = (featureName: string) => {
  const { betaProfile, markFeatureTested } = useBetaStatus();
  const [showFeedbackPrompt, setShowFeedbackPrompt] = useState(false);

  const shouldTrack = betaProfile?.is_beta_tester && 
                     !betaProfile.beta_features_tested?.includes(featureName) &&
                     betaProfile.beta_status === 'active';

  const trackFeature = (promptType: 'prompt_response' | 'bug_report' | 'suggestion' | 'completion' = 'prompt_response') => {
    if (shouldTrack) {
      markFeatureTested(featureName);
      setShowFeedbackPrompt(true);
    }
  };

  return {
    trackFeature,
    shouldTrack,
    showFeedbackPrompt,
    setShowFeedbackPrompt,
    BetaFeedbackPrompt: (props: { promptType?: any; customPrompt?: string }) => (
      <BetaFeedbackPrompt
        isOpen={showFeedbackPrompt}
        onClose={() => setShowFeedbackPrompt(false)}
        featureName={featureName}
        promptType={props.promptType || 'prompt_response'}
        customPrompt={props.customPrompt}
      />
    )
  };
};