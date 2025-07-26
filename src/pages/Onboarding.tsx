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
  { id: 'identity', title: 'Identity', component: IdentityStep },
  { id: 'professional', title: 'Professional', component: ProfessionalStep },
  { id: 'goals', title: 'Goals & Bio', component: GoalsBioStep },
  { id: 'contribution', title: 'Contribution', component: ContributionStep },
];

const Onboarding = () => {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState({
    // Identity
    full_name: '',
    display_name: '',
    diaspora_origin: '',
    gender: '',
    profile_photo: null,
    
    // Professional
    current_role: '',
    company: '',
    industry: '',
    skills: [],
    experience_level: '',
    
    // Goals & Bio
    bio: '',
    goals: [],
    interests: [],
    
    // Contribution
    contribution_areas: [],
    availability: '',
    preferred_contribution_type: ''
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
    if (profile && profile.onboarding_completed) {
      navigate('/app');
    }
  }, [profile, navigate]);

  const updateFormData = (updates: Partial<typeof formData>) => {
    setFormData(prev => ({ ...prev, ...updates }));
  };

  const canProceedToNext = () => {
    switch (currentStep) {
      case 0: // Identity
        return formData.full_name && formData.display_name && formData.diaspora_origin && formData.gender;
      case 1: // Professional
        return formData.current_role && formData.company && formData.industry;
      case 2: // Goals
        return formData.bio && formData.goals.length > 0;
      case 3: // Contribution
        return formData.contribution_areas.length > 0 && formData.availability;
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
      // Create or update profile
      const profileData = {
        id: user.id,
        full_name: formData.full_name,
        display_name: formData.display_name,
        bio: formData.bio,
        diaspora_origin: formData.diaspora_origin,
        gender: formData.gender,
        current_role: formData.current_role,
        company: formData.company,
        industry: formData.industry,
        skills: formData.skills,
        experience_level: formData.experience_level,
        goals: formData.goals,
        interests: formData.interests,
        contribution_areas: formData.contribution_areas,
        availability: formData.availability,
        preferred_contribution_type: formData.preferred_contribution_type,
        onboarding_completed: true,
        is_public: true,
        updated_at: new Date().toISOString()
      };

      const { error } = await supabase
        .from('profiles')
        .upsert(profileData, { onConflict: 'id' });

      if (error) throw error;

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
      <div className="max-w-2xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-dna-forest mb-2">
            Welcome to DNA Community
          </h1>
          <p className="text-gray-600">
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
        <div className="flex justify-center mb-6">
          <div className="flex space-x-2">
            {STEPS.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <div className={`
                  w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium
                  ${index < currentStep 
                    ? 'bg-dna-emerald text-white' 
                    : index === currentStep 
                    ? 'bg-dna-copper text-white' 
                    : 'bg-gray-200 text-gray-500'
                  }
                `}>
                  {index < currentStep ? (
                    <CheckCircle className="w-4 h-4" />
                  ) : (
                    index + 1
                  )}
                </div>
                {index < STEPS.length - 1 && (
                  <div className={`w-12 h-0.5 mx-2 ${
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
        <div className="flex justify-between mt-8">
          <Button
            variant="outline"
            onClick={handlePrevious}
            disabled={currentStep === 0}
            className="flex items-center gap-2"
          >
            <ChevronLeft className="w-4 h-4" />
            Previous
          </Button>
          
          <Button
            onClick={handleNext}
            disabled={!canProceedToNext() || isSubmitting}
            className="bg-dna-copper hover:bg-dna-gold text-white flex items-center gap-2"
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