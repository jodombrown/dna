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
import UsernameStep from '@/components/onboarding/steps/UsernameStep';
import DiasporaImpactStep from '@/components/onboarding/steps/DiasporaImpactStep';
import { validateStep } from '@/components/onboarding/validation/onboardingStepValidation';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import confetti from 'canvas-confetti';

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
    username: profile?.username || '',
    country_of_origin: profile?.country_of_origin || '',
    // Deferred fields - kept for profile completion later
    profession: profile?.profession || '',
    professional_role: profile?.professional_role || '',
    professional_sectors: profile?.professional_sectors || [],
    skills: profile?.skills || [],
    years_experience: profile?.years_experience?.toString() || '',
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
    if (currentStep < 3) {
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

  const handleSubmit = async () => {
    if (!user) return;

    setIsSubmitting(true);

    try {
      // Use the username chosen by the user (already validated in step 2)
      const fullName = `${formData.first_name.trim()} ${formData.last_name.trim()}`.trim();

      // Prepare profile data
      const profileData: any = {
        id: user.id,
        email: user.email,
        full_name: fullName,
        first_name: formData.first_name,
        last_name: formData.last_name,
        username: formData.username,
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
        // Handle duplicate username (shouldn't happen as we check in step 2, but just in case)
        if (upsertError.code === '23505') {
          toast({
            title: "Username Taken",
            description: "This username was just taken by someone else. Please go back and choose a different one.",
            variant: "destructive"
          });
          setIsSubmitting(false);
          setCurrentStep(2); // Go back to username step
          return;
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

      // 🎉 CONFETTI CELEBRATION!
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#D4AF37', '#C87533', '#2F5233', '#3D8B40']
      });

      toast({
        title: "🎉 Welcome to DNA!",
        description: `You're all set, @${formData.username}! Let's start connecting with the diaspora.`,
      });

      // Redirect to dashboard
      setTimeout(() => {
        navigate('/dna/feed');
      }, 1500);
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

  // Calculate estimated completion based on current step
  const estimateCompletion = () => {
    let baseCompletion = 0;

    if (currentStep >= 0) baseCompletion += 20; // User type
    if (currentStep >= 1) baseCompletion += 25; // Identity
    if (currentStep >= 2) baseCompletion += 25; // Username
    if (currentStep >= 3) baseCompletion += 30; // Diaspora

    return Math.min(baseCompletion, 100);
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
          <UsernameStep
            data={{
              full_name: `${formData.first_name} ${formData.last_name}`,
              username: formData.username,
              country_of_origin: formData.country_of_origin,
              current_country: formData.current_country,
              industry: formData.profession,
            }}
            updateData={(updates) => {
              Object.entries(updates).forEach(([key, value]) => {
                updateField(key as any, value);
              });
            }}
          />
        );
      case 3:
        return (
          <DiasporaImpactStep
            data={{
              country_of_origin: formData.country_of_origin,
            }}
            onUpdate={updateField}
            errors={errors}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-dna-mint/20 via-white to-dna-emerald/10">
      <div className="max-w-3xl mx-auto px-4 py-6 sm:py-8">
        {/* Progress Bar */}
        <div className="mb-6">
          <OnboardingProgressBar
            currentStep={currentStep + 1}
            totalSteps={4}
            completionPercentage={estimateCompletion()}
          />
        </div>

        {/* Step Content */}
        <div className="mb-6">
          {currentStepComponent()}
        </div>

        {/* Navigation */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 px-4 sm:px-0">
          <Button
            variant="outline"
            onClick={handleBack}
            disabled={currentStep === 0 || isSubmitting}
            className="flex items-center justify-center gap-2 min-h-[44px] w-full sm:w-auto"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>

          <Button
            onClick={handleNext}
            disabled={isSubmitting}
            className="bg-dna-copper hover:bg-dna-gold text-white flex items-center justify-center gap-2 px-6 min-h-[44px] w-full sm:w-auto"
          >
            {isSubmitting ? (
              "Saving..."
            ) : currentStep === 3 ? (
              "Complete & Join DNA"
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
  );
};

export default Onboarding;