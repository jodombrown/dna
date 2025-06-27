
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import IdentityStep from './steps/IdentityStep';
import ProfessionalStep from './steps/ProfessionalStep';
import ContributionStep from './steps/ContributionStep';
import GoalsBioStep from './steps/GoalsBioStep';

interface OnboardingData {
  // Identity
  full_name: string;
  display_name: string;
  profile_photo: File | null;
  diaspora_origin: string;
  gender: string;
  
  // Professional
  industry: string;
  skills: string[];
  years_experience: number;
  current_role: string;
  linkedin_url: string;
  
  // Contribution
  contribution_types: string[];
  
  // Goals & Bio
  headline: string;
  bio: string;
  personal_goals: string;
}

const MultiStepOnboardingWizard: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState<OnboardingData>({
    full_name: '',
    display_name: '',
    profile_photo: null,
    diaspora_origin: '',
    gender: '',
    industry: '',
    skills: [],
    years_experience: 0,
    current_role: '',
    linkedin_url: '',
    contribution_types: [],
    headline: '',
    bio: '',
    personal_goals: '',
  });

  const updateFormData = (data: Partial<OnboardingData>) => {
    setFormData(prev => ({ ...prev, ...data }));
  };

  const validateStep = (step: number): boolean => {
    switch (step) {
      case 1:
        return !!(formData.full_name && formData.display_name && formData.diaspora_origin && formData.gender);
      case 2:
        return !!(formData.industry && formData.current_role && formData.skills.length > 0);
      case 3:
        return formData.contribution_types.length > 0;
      case 4:
        return !!(formData.headline && formData.bio);
      default:
        return false;
    }
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => prev + 1);
    } else {
      toast({
        title: "Please complete all required fields",
        variant: "destructive",
      });
    }
  };

  const handleBack = () => {
    setCurrentStep(prev => prev - 1);
  };

  const handleSubmit = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      let avatar_url = '';
      
      // Upload profile photo if provided
      if (formData.profile_photo) {
        const fileExt = formData.profile_photo.name.split('.').pop();
        const fileName = `${user.id}/avatar-${Date.now()}.${fileExt}`;
        
        const { data, error } = await supabase.storage
          .from('profile-images')
          .upload(fileName, formData.profile_photo);
          
        if (!error && data) {
          const { data: urlData } = supabase.storage
            .from('profile-images')
            .getPublicUrl(data.path);
          avatar_url = urlData.publicUrl;
        }
      }

      // Update profile with onboarding data
      const { error } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          full_name: formData.full_name,
          display_name: formData.display_name,
          avatar_url,
          diaspora_origin: formData.diaspora_origin,
          gender: formData.gender,
          industry: formData.industry,
          skills: formData.skills,
          years_experience: formData.years_experience,
          professional_role: formData.current_role,
          linkedin_url: formData.linkedin_url,
          available_for: formData.contribution_types,
          headline: formData.headline,
          bio: formData.bio,
          my_dna_statement: formData.personal_goals,
          profile_completed_at: new Date().toISOString(),
          onboarding_status: { profile_completed: true },
          updated_at: new Date().toISOString(),
        });

      if (error) throw error;

      toast({
        title: "Profile Created Successfully!",
        description: "Welcome to the DNA community!",
      });

      // Redirect to profile or dashboard
      window.location.href = '/my-profile';
    } catch (error: any) {
      console.error('Onboarding error:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to complete onboarding",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const progress = (currentStep / 4) * 100;

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return <IdentityStep data={formData} updateData={updateFormData} />;
      case 2:
        return <ProfessionalStep data={formData} updateData={updateFormData} />;
      case 3:
        return <ContributionStep data={formData} updateData={updateFormData} />;
      case 4:
        return <GoalsBioStep data={formData} updateData={updateFormData} />;
      default:
        return null;
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-dna-forest text-center">
            Join the DNA Community
          </CardTitle>
          <div className="space-y-2">
            <div className="flex justify-between text-sm text-gray-600">
              <span>Step {currentStep} of 4</span>
              <span>{Math.round(progress)}% Complete</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {renderStep()}
          
          <div className="flex justify-between pt-6">
            <Button
              variant="outline"
              onClick={handleBack}
              disabled={currentStep === 1}
            >
              Back
            </Button>
            
            {currentStep === 4 ? (
              <Button
                onClick={handleSubmit}
                disabled={loading || !validateStep(currentStep)}
                className="bg-dna-copper hover:bg-dna-gold text-white"
              >
                {loading ? 'Creating Profile...' : 'Complete Onboarding'}
              </Button>
            ) : (
              <Button
                onClick={handleNext}
                disabled={!validateStep(currentStep)}
                className="bg-dna-copper hover:bg-dna-gold text-white"
              >
                Next
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default MultiStepOnboardingWizard;
