import React, { useState, useEffect, useCallback } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ChevronRight, ChevronLeft, CheckCircle, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useFeatureTour, type FeatureTourId } from '@/hooks/useFeatureTour';
import type { LucideIcon } from 'lucide-react';

export interface TourStep {
  id: string;
  title: string;
  description: string;
  icon: LucideIcon;
  content: React.ReactNode;
}

export interface FeatureTourProps {
  /** Unique identifier for this feature tour */
  featureId: FeatureTourId;
  /** Steps to display in the tour */
  steps: TourStep[];
  /** Whether the dialog is open */
  open: boolean;
  /** Callback when the dialog is closed */
  onClose: () => void;
  /** Whether to allow closing the dialog without completing (default: true) */
  allowSkip?: boolean;
  /** Custom completion button text (default: "Get Started") */
  completionText?: string;
  /** Custom completion button icon (default: CheckCircle) */
  completionIcon?: LucideIcon;
}

/**
 * Reusable Feature Tour Component
 *
 * A dialog-based step-by-step tour that can be used across different features.
 * Automatically persists progress and completion state.
 *
 * Usage:
 * ```tsx
 * const [showTour, setShowTour] = useState(false);
 *
 * <FeatureTour
 *   featureId="feedback-hub"
 *   steps={FEEDBACK_TOUR_STEPS}
 *   open={showTour}
 *   onClose={() => setShowTour(false)}
 * />
 * ```
 */
export function FeatureTour({
  featureId,
  steps,
  open,
  onClose,
  allowSkip = true,
  completionText = 'Get Started',
  completionIcon: CompletionIcon = CheckCircle,
}: FeatureTourProps) {
  const {
    currentStep: savedStep,
    markShown,
    updateStep,
    markComplete,
  } = useFeatureTour(featureId);

  const totalSteps = steps.length;

  // Ensure savedStep is within bounds
  const getValidStep = (step: number | undefined | null): number => {
    if (step === undefined || step === null || step < 0 || step >= totalSteps) {
      return 0;
    }
    return step;
  };

  const [currentStep, setCurrentStep] = useState(() => getValidStep(savedStep));

  // Safety: ensure step is always valid
  const safeStepIndex = currentStep >= 0 && currentStep < totalSteps ? currentStep : 0;
  const step = steps[safeStepIndex];

  // If no steps or step is undefined, don't render
  if (!step || totalSteps === 0) {
    return null;
  }

  const Icon = step.icon;

  // Mark tour as shown when opened
  useEffect(() => {
    if (open) {
      markShown();
    }
  }, [open, markShown]);

  // Sync local step with saved step on open
  useEffect(() => {
    if (open && savedStep > 0 && savedStep < totalSteps) {
      setCurrentStep(savedStep);
    }
  }, [open, savedStep, totalSteps]);

  // Reset to first step when closing without completing
  useEffect(() => {
    if (!open) {
      // Small delay to avoid visual glitch during close animation
      const timer = setTimeout(() => {
        setCurrentStep(0);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [open]);

  const handleNext = useCallback(() => {
    if (currentStep < totalSteps - 1) {
      const nextStep = currentStep + 1;
      setCurrentStep(nextStep);
      updateStep(nextStep);
    } else {
      // Completed last step
      markComplete();
      onClose();
    }
  }, [currentStep, totalSteps, updateStep, markComplete, onClose]);

  const handlePrevious = useCallback(() => {
    if (currentStep > 0) {
      const prevStep = currentStep - 1;
      setCurrentStep(prevStep);
      updateStep(prevStep);
    }
  }, [currentStep, updateStep]);

  const handleSkip = useCallback(() => {
    // Mark as complete and close
    markComplete();
    onClose();
  }, [markComplete, onClose]);

  const handleOpenChange = useCallback((isOpen: boolean) => {
    if (!isOpen && allowSkip) {
      onClose();
    }
    // If allowSkip is false, prevent closing via escape or clicking outside
  }, [allowSkip, onClose]);

  const isLastStep = currentStep === totalSteps - 1;
  const isFirstStep = currentStep === 0;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-md">
        {/* Close button (only if allowSkip) */}
        {allowSkip && (
          <button
            onClick={handleSkip}
            className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none"
          >
            <X className="h-4 w-4" />
            <span className="sr-only">Close</span>
          </button>
        )}

        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10">
              <Icon className="w-4 h-4 text-primary" />
            </div>
            {step.title}
          </DialogTitle>
        </DialogHeader>

        <DialogDescription className="space-y-3 pt-1" asChild>
          <div>
            <p className="text-muted-foreground">{step.description}</p>
            <div className="text-foreground">{step.content}</div>
          </div>
        </DialogDescription>

        {/* Progress dots */}
        <div className="flex justify-center gap-1.5 py-3">
          {steps.map((_, index) => (
            <button
              key={index}
              onClick={() => {
                setCurrentStep(index);
                updateStep(index);
              }}
              className={cn(
                'h-2 w-2 rounded-full transition-all duration-200',
                index === currentStep
                  ? 'bg-primary w-4'
                  : index < currentStep
                  ? 'bg-primary/50'
                  : 'bg-muted hover:bg-muted-foreground/30'
              )}
              aria-label={`Go to step ${index + 1}`}
            />
          ))}
        </div>

        {/* Navigation buttons */}
        <div className="flex items-center justify-between pt-2">
          <span className="text-xs text-muted-foreground">
            Step {currentStep + 1} of {totalSteps}
          </span>

          <div className="flex gap-2">
            {!isFirstStep && (
              <Button
                variant="outline"
                size="sm"
                onClick={handlePrevious}
              >
                <ChevronLeft className="h-4 w-4 mr-1" />
                Back
              </Button>
            )}
            <Button
              size="sm"
              onClick={handleNext}
              className="bg-primary hover:bg-primary/90"
            >
              {isLastStep ? (
                <>
                  <CompletionIcon className="h-4 w-4 mr-1" />
                  {completionText}
                </>
              ) : (
                <>
                  Next
                  <ChevronRight className="h-4 w-4 ml-1" />
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default FeatureTour;
