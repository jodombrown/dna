import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useOnboardingForm } from '@/components/onboarding/hooks/useOnboardingForm';
import { OnboardingProgressBar } from '@/components/onboarding/OnboardingProgressBar';
import UserTypeStep from '@/components/onboarding/steps/UserTypeStep';
import IdentityStep from '@/components/onboarding/steps/IdentityStep';
import ProfessionalStep from '@/components/onboarding/steps/ProfessionalStep';
import DiasporaImpactStep from '@/components/onboarding/steps/DiasporaImpactStep';
import DiscoveryStep from '@/components/onboarding/steps/DiscoveryStep';
import { validateStep } from '@/components/onboarding/validation/onboardingStepValidation';
import { ArrowLeft, ArrowRight } from 'lucide-react';

const Onboarding = () => {
  const { user, profile, refreshProfile } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Initialize form with any existing profile data
  const { formData, updateField } = useOnboardingForm({
    user_type: (profile as any)?.user_type || 'individual',
    organization_name: (profile as any)?.organization_name || '',
    organization_category: (profile as any)?.organization_category || '',
    first_name: profile?.first_name || user?.user_metadata?.full_name?.split(' ')[0] || '',
    last_name: profile?.last_name || user?.user_metadata?.full_name?.split(' ').slice(1).join(' ') || '',
    avatar_url: profile?.avatar_url || user?.user_metadata?.picture || '',
    current_country: profile?.current_country || '',
    headline: profile?.headline || '',
    profession: profile?.profession || '',
    professional_role: profile?.professional_role || '',
    professional_sectors: profile?.professional_sectors || [],
    skills: profile?.skills || [],
    years_experience: profile?.years_experience?.toString() || '',
    country_of_origin: profile?.country_of_origin || '',
    diaspora_origin: profile?.diaspora_origin || '',
    interests: profile?.interests || [],
    my_dna_statement: profile?.my_dna_statement || '',
    focus_areas: profile?.focus_areas || [],
    regional_expertise: profile?.regional_expertise || [],
    industries: profile?.industries || [],
    engagement_intentions: profile?.engagement_intentions || [],
  });

  // Redirect if user is not authenticated
  useEffect(() => {
    if (!user) {
      navigate('/auth');
    }
  }, [user, navigate]);

  // If profile already has onboarding_completed_at, redirect to dashboard
  useEffect(() => {
    if (profile?.onboarding_completed_at) {
      navigate('/dna/feed');
    }
  }, [profile, navigate]);

  const handleNext = async () => {
    // Validate current step
    const validationErrors = validateStep(currentStep, formData);
    
    if (validationErrors.length > 0) {
      const errorMap: Record<string, string> = {};
      validationErrors.forEach(err => {
        errorMap[err.field] = err.message;
      });
      setErrors(errorMap);
      
      toast({
        title: "Please complete required fields",
        description: `Step ${currentStep} has missing or invalid information.`,
        variant: "destructive"
      });
      return;
    }

    // Clear errors
    setErrors({});

    // If not on last step, advance
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    // On final step, submit the profile
    await handleSubmit();
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
      setErrors({});
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleSkip = async () => {
    // Only allow skipping step 4 (Discovery)
    if (currentStep === 4) {
      await handleSubmit();
    }
  };

  const handleSubmit = async () => {
    if (!user) return;

    setIsSubmitting(true);
    
    try {
      // Generate username from full name
      const fullName = `${formData.first_name.trim()} ${formData.last_name.trim()}`.trim();
      const baseUsername = fullName
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .trim();

      // Check if username exists and generate unique one if needed
      let uniqueUsername = baseUsername;
      let attempt = 0;
      let usernameExists = true;
      
      while (usernameExists && attempt < 10) {
        const { data: existingProfile } = await supabase
          .from('profiles')
          .select('username')
          .eq('username', uniqueUsername)
          .neq('id', user.id)
          .maybeSingle();
        
        if (!existingProfile) {
          usernameExists = false;
        } else {
          attempt++;
          uniqueUsername = `${baseUsername}-${attempt}`;
        }
      }

      // Prepare profile data
      const profileData: any = {
        id: user.id,
        email: user.email,
        full_name: fullName,
        first_name: formData.first_name,
        last_name: formData.last_name,
        username: uniqueUsername,
        avatar_url: formData.avatar_url,
        current_country: formData.current_country,
        headline: formData.headline,
        user_type: formData.user_type,
        organization_name: formData.user_type === 'organization' ? formData.organization_name : null,
        organization_category: formData.user_type === 'organization' ? formData.organization_category : null,
        profession: formData.profession,
        professional_role: formData.professional_role,
        professional_sectors: formData.professional_sectors,
        skills: formData.skills,
        years_experience: formData.years_experience ? parseInt(formData.years_experience.split('-')[0]) : null,
        country_of_origin: formData.country_of_origin,
        diaspora_origin: formData.diaspora_origin || null,
        interests: formData.interests,
        my_dna_statement: formData.my_dna_statement,
        focus_areas: formData.focus_areas,
        regional_expertise: formData.regional_expertise,
        industries: formData.industries,
        engagement_intentions: formData.engagement_intentions,
        is_public: true,
        updated_at: new Date().toISOString()
      };

      // Upsert profile
      const { error: upsertError } = await supabase
        .from('profiles')
        .upsert([profileData], { onConflict: 'id' });

      if (upsertError) {
        // Handle duplicate username
        if (upsertError.code === '23505') {
          const fallbackUsername = `${baseUsername}-${Math.random().toString(36).slice(2,7)}`;
          profileData.username = fallbackUsername;
          
          const retry = await supabase
            .from('profiles')
            .upsert([profileData], { onConflict: 'id' });

          if (retry.error) throw retry.error;
        } else {
          throw upsertError;
        }
      }

      // Wait for DB to commit
      await new Promise(resolve => setTimeout(resolve, 300));

      // Calculate profile completion percentage
      const { data: completionData, error: completionError } = await supabase
        .rpc('calculate_profile_completion_percentage', { profile_id: user.id });

      if (completionError) {
        console.error('Error calculating completion:', completionError);
      }

      const completionPercentage = completionData || 0;

      // ENFORCE 40% RULE
      if (completionPercentage < 40) {
        toast({
          title: "Profile Incomplete",
          description: `Your profile is ${Math.round(completionPercentage)}% complete. Please complete all required fields to reach 40%.`,
          variant: "destructive"
        });
        setIsSubmitting(false);
        return;
      }

      // Mark onboarding as complete
      const { error: completeError } = await supabase
        .from('profiles')
        .update({ 
          onboarding_completed_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);

      if (completeError) throw completeError;

      // Refresh profile
      await refreshProfile();

      toast({
        title: "Welcome to DNA!",
        description: `Your profile is ${Math.round(completionPercentage)}% complete. Let's start connecting!`,
      });

      // Redirect to dashboard
      setTimeout(() => {
        navigate('/dna/feed');
      }, 100);
    } catch (error: any) {
      console.error('Error completing onboarding:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to complete onboarding. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!user) {
    return null;
  }

  // Calculate estimated completion based on current step and filled fields
  const estimateCompletion = () => {
    let baseCompletion = 0;
    
    if (currentStep >= 0) baseCompletion += 10;
    if (currentStep >= 1) baseCompletion += 15;
    if (currentStep >= 2) baseCompletion += 15;
    if (currentStep >= 3) baseCompletion += 15;
    if (currentStep >= 4) {
      // Add partial completion for optional fields filled
      if (formData.focus_areas.length > 0) baseCompletion += 5;
      if (formData.regional_expertise.length > 0) baseCompletion += 5;
      if (formData.industries.length > 0) baseCompletion += 5;
      if (formData.engagement_intentions.length > 0) baseCompletion += 5;
    }
    
    return Math.min(baseCompletion, 70);
  };

  const currentStepComponent = () => {
    switch (currentStep) {
      case 0:
        return (
          <UserTypeStep
            data={{
              user_type: formData.user_type,
              organization_name: formData.organization_name,
              organization_category: formData.organization_category,
            }}
            onUpdate={(field, value) => updateField(field as any, value)}
            errors={errors}
          />
        );
      case 1:
        return (
          <IdentityStep
            data={formData}
            onUpdate={updateField}
            errors={errors}
          />
        );
      case 2:
        return (
          <ProfessionalStep
            data={formData}
            onUpdate={updateField}
            errors={errors}
          />
        );
      case 3:
        return (
          <DiasporaImpactStep
            data={formData}
            onUpdate={updateField}
            errors={errors}
          />
        );
      case 4:
        return (
          <DiscoveryStep
            data={formData}
            onUpdate={updateField}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-dna-mint/20 via-white to-dna-emerald/10">
      <div className="max-w-3xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="mb-6">
            <img 
              src="/lovable-uploads/2768ac69-7468-4ee5-a1aa-3f241d1b7b25.png" 
              alt="DNA Logo" 
              className="w-16 h-16 mx-auto mb-4"
            />
          </div>
        <OnboardingProgressBar
          currentStep={currentStep + 1}
          totalSteps={5}
          completionPercentage={estimateCompletion()}
        />
        </div>

        {/* Step Content */}
        <div className="mb-8">
          {currentStepComponent()}
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between gap-4">
          <Button
            variant="outline"
            onClick={handleBack}
            disabled={currentStep === 0 || isSubmitting}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>

          <div className="flex items-center gap-3">
            {currentStep === 4 && (
              <Button
                variant="ghost"
                onClick={handleSkip}
                disabled={isSubmitting}
              >
                Complete Later
              </Button>
            )}
            <Button
              onClick={handleNext}
              disabled={isSubmitting}
              className="bg-dna-copper hover:bg-dna-gold text-white flex items-center gap-2 px-6"
            >
              {isSubmitting ? (
                "Saving..."
              ) : currentStep === 4 ? (
                "Complete & Explore DNA"
              ) : (
                <>
                  Next
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Onboarding;