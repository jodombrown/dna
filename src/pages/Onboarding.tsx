import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChevronLeft, ChevronRight, CheckCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

// Import existing onboarding steps
import IdentityStep from '@/components/onboarding/steps/IdentityStep';
import ProfessionalStep from '@/components/onboarding/steps/ProfessionalStep';
import GoalsBioStep from '@/components/onboarding/steps/GoalsBioStep';
import ContributionStep from '@/components/onboarding/steps/ContributionStep';

const STEPS = [
  { id: 'step1_identity', title: 'Identity', component: IdentityStep },
  { id: 'step2_contribution', title: 'Skills & Contribution', component: ProfessionalStep },
  { id: 'step3_links', title: 'Links & Identity', component: GoalsBioStep },
  { id: 'step4_agreement', title: 'Community Agreement', component: ContributionStep },
];

const Onboarding = () => {
  const { user, profile, refreshProfile } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState({
    // Step 1: Identity
    full_name: user?.user_metadata?.full_name || '',
    username: '',
    country_of_origin: '',
    current_country: '',
    
    // Step 2: Skills & Contribution
    skills: [],
    sectors: [],
    contribution_style: '',
    
    // Step 3: Links & Identity
    linkedin_url: user?.user_metadata?.linkedin_url || '',
    twitter_url: '',
    website_url: '',
    avatar_url: user?.user_metadata?.picture || '',
    
    // Step 4: Community Agreement
    agrees_to_values: false
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Redirect if user is not authenticated
  useEffect(() => {
    if (!user) {
      navigate('/auth');
    }
  }, [user, navigate]);

  // If profile already exists and is complete, redirect to app
  useEffect(() => {
    if (profile && profile.onboarding_completed_at) {
      navigate('/app');
    }
  }, [profile, navigate]);

  const updateFormData = (updates: Partial<typeof formData>) => {
    setFormData(prev => ({ ...prev, ...updates }));
  };

  const canProceedToNext = () => {
    switch (currentStep) {
      case 0: // Identity
        return formData.full_name && formData.username && formData.country_of_origin;
      case 1: // Skills & Contribution
        return formData.skills.length > 0 && formData.sectors.length > 0 && formData.contribution_style;
      case 2: // Links & Identity
        return true; // All fields optional
      case 3: // Community Agreement
        return formData.agrees_to_values;
      default:
        return false;
    }
  };

  const handleNext = () => {
    if (currentStep < STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleSubmit();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    if (!user) return;

    setIsSubmitting(true);
    
    try {
      // Create or update profile with new schema
      const profileData = {
        id: user.id,
        email: user.email,
        full_name: formData.full_name,
        username: formData.username,
        country_of_origin: formData.country_of_origin,
        current_country: formData.current_country,
        skills: formData.skills,
        sectors: formData.sectors,
        contribution_style: formData.contribution_style,
        linkedin_url: formData.linkedin_url,
        twitter_url: formData.twitter_url,
        website_url: formData.website_url,
        avatar_url: formData.avatar_url,
        agrees_to_values: formData.agrees_to_values,
        onboarding_stage: 'completed',
        is_public: true,
        updated_at: new Date().toISOString()
      };

      const { error } = await supabase
        .from('profiles')
        .upsert(profileData, { onConflict: 'id' });

      if (error) throw error;

      // Refresh the profile to get the updated data
      await refreshProfile();

      toast({
        title: "Welcome to DNA!",
        description: "Your profile has been created successfully.",
      });

      // Redirect to main app
      navigate('/app');
    } catch (error) {
      console.error('Error creating profile:', error);
      toast({
        title: "Error",
        description: "Failed to complete onboarding. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!user) {
    return null;
  }

  const CurrentStepComponent = STEPS[currentStep].component;
  const progress = ((currentStep + 1) / STEPS.length) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-dna-mint/20 via-white to-dna-emerald/10">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
        {/* Header */}
        <div className="text-center mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-dna-forest mb-2">
            Welcome to DNA Community
          </h1>
          <p className="text-sm sm:text-base text-gray-600 px-4">
            Let's set up your profile to connect you with the diaspora network
          </p>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between mb-2">
            <span className="text-sm text-gray-600">
              Step {currentStep + 1} of {STEPS.length}
            </span>
            <span className="text-sm text-gray-600">
              {Math.round(progress)}% Complete
            </span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {/* Step Cards */}
        <div className="flex justify-center mb-6 overflow-x-auto px-4">
          <div className="flex space-x-2 min-w-max">
            {STEPS.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <div className={`
                  w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center text-xs sm:text-sm font-medium
                  ${index < currentStep 
                    ? 'bg-dna-emerald text-white' 
                    : index === currentStep 
                    ? 'bg-dna-copper text-white' 
                    : 'bg-gray-200 text-gray-500'
                  }
                `}>
                  {index < currentStep ? (
                    <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4" />
                  ) : (
                    index + 1
                  )}
                </div>
                {index < STEPS.length - 1 && (
                  <div className={`w-8 sm:w-12 h-0.5 mx-2 ${
                    index < currentStep ? 'bg-dna-emerald' : 'bg-gray-200'
                  }`} />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Main Content Card */}
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="text-xl text-dna-forest">
              {STEPS[currentStep].title}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <CurrentStepComponent 
              data={formData} 
              updateData={updateFormData}
            />
          </CardContent>
        </Card>

        {/* Navigation Buttons */}
        <div className="flex flex-col sm:flex-row justify-between gap-4 sm:gap-0 mt-6 sm:mt-8">
          <Button
            variant="outline"
            onClick={handlePrevious}
            disabled={currentStep === 0}
            className="flex items-center justify-center gap-2 h-12 sm:h-10"
            size="lg"
          >
            <ChevronLeft className="w-4 h-4" />
            Previous
          </Button>
          
          <Button
            onClick={handleNext}
            disabled={!canProceedToNext() || isSubmitting}
            className="bg-dna-copper hover:bg-dna-gold text-white flex items-center justify-center gap-2 h-12 sm:h-10"
            size="lg"
          >
            {isSubmitting ? (
              "Creating Profile..."
            ) : currentStep === STEPS.length - 1 ? (
              "Complete Setup"
            ) : (
              <>
                Next
                <ChevronRight className="w-4 h-4" />
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Onboarding;