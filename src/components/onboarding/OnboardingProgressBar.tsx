import React from 'react';
import { Progress } from '@/components/ui/progress';

interface OnboardingProgressBarProps {
  currentStep: number;
  totalSteps: number;
  completionPercentage: number;
}

export const OnboardingProgressBar: React.FC<OnboardingProgressBarProps> = ({
  currentStep,
  totalSteps,
  completionPercentage
}) => {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-sm">
        <span className="text-muted-foreground">
          Step {currentStep} of {totalSteps}
        </span>
        <span className="font-medium text-dna-copper">
          {Math.round(completionPercentage)}% Complete
        </span>
      </div>
      <Progress value={completionPercentage} className="h-2" />
    </div>
  );
};
