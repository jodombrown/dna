import React, { useState } from 'react';
import { StepIndicator } from './StepIndicator';
import { Step1DiasporaIdentity } from './steps/Step1DiasporaIdentity';
import { Step2Professional } from './steps/Step2Professional';
import { Step3Causes } from './steps/Step3Causes';
import { Step4Availability } from './steps/Step4Availability';
import { useOnboarding } from '@/hooks/useOnboarding';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';

export const OnboardingWizard = () => {
  const {
    currentStep,
    setCurrentStep,
    formData,
    setFormData,
    saveStepData,
    completeOnboarding,
  } = useOnboarding();
  
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleStepComplete = async (stepData: any) => {
    try {
      await saveStepData(stepData);
      setFormData({ ...formData, ...stepData });
      setCurrentStep(currentStep + 1);
      
      toast({
        title: 'Progress saved',
        description: 'Your information has been saved.',
      });
    } catch (error: any) {
      toast({
        title: 'Error saving progress',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const handleComplete = async () => {
    setIsSubmitting(true);
    try {
      await saveStepData(formData);
      await completeOnboarding();
      
      toast({
        title: 'Profile complete!',
        description: 'Welcome to DNA Platform. Start exploring opportunities.',
      });
      
      navigate('/contribute');
    } catch (error: any) {
      toast({
        title: 'Error completing profile',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBack = () => {
    setCurrentStep(currentStep - 1);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container max-w-4xl mx-auto px-4 py-8">
        <StepIndicator currentStep={currentStep} totalSteps={4} />
        
        <div className="mt-8">
          {currentStep === 1 && (
            <Step1DiasporaIdentity
              data={formData}
              onChange={setFormData}
              onNext={() => handleStepComplete(formData)}
            />
          )}
          
          {currentStep === 2 && (
            <Step2Professional
              data={formData}
              onChange={setFormData}
              onNext={() => handleStepComplete(formData)}
              onBack={handleBack}
            />
          )}
          
          {currentStep === 3 && (
            <Step3Causes
              data={formData}
              onChange={setFormData}
              onNext={() => handleStepComplete(formData)}
              onBack={handleBack}
            />
          )}
          
          {currentStep === 4 && (
            <Step4Availability
              data={formData}
              onChange={setFormData}
              onComplete={handleComplete}
              onBack={handleBack}
              isSubmitting={isSubmitting}
            />
          )}
        </div>
      </div>
    </div>
  );
};
