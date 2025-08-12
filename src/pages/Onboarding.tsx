import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChevronLeft, ChevronRight, CheckCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { normalizeUsername } from '@/utils/username';

// Import existing onboarding steps
import IdentityStep from '@/components/onboarding/steps/IdentityStep';
import UserTypeStep from '@/components/onboarding/steps/UserTypeStep';
import PillarsStep from '@/components/onboarding/steps/PillarsStep';
import PersonalizedStep from '@/components/onboarding/steps/PersonalizedStep';
import IntentStep from '@/components/onboarding/steps/IntentStep';
import ProfessionalStep from '@/components/onboarding/steps/ProfessionalStep';
import GoalsBioStep from '@/components/onboarding/steps/GoalsBioStep';
import ContributionStep from '@/components/onboarding/steps/ContributionStep';
import RecommendationsStep from '@/components/onboarding/steps/RecommendationsStep';
import FirstActionStep from '@/components/onboarding/steps/FirstActionStep';

const STEPS = [
  { id: 'step1_identity', title: 'Identity', component: IdentityStep },
  { id: 'step2_user_type', title: 'Your Path', component: UserTypeStep },
  { id: 'step3_pillars', title: 'DNA Framework', component: PillarsStep },
  { id: 'step4_personalized', title: 'Your Journey', component: PersonalizedStep },
  { id: 'step5_intent', title: 'Impact Intent', component: IntentStep },
  { id: 'step6_skills', title: 'Skills & Expertise', component: ProfessionalStep },
  { id: 'step7_links', title: 'Profile & Links', component: GoalsBioStep },
  { id: 'step8_agreement', title: 'Community Agreement', component: ContributionStep },
  { id: 'step9_recommendations', title: 'Recommendations', component: RecommendationsStep },
  { id: 'step10_first_action', title: 'Get Started', component: FirstActionStep },
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
    
    // Step 2: User Type
    user_type: '',
    
    // Step 3: Pillars
    selected_pillars: [],
    
    // Step 4: Personalized (varies by user type)
    // Professional fields
    mentorship_interest: [],
    impact_goals: [],
    // Founder fields
    venture_name: '',
    venture_stage: '',
    fundraising_status: '',
    collaboration_needs: [],
    // Ally fields
    support_areas: [],
    advocacy_interests: [],
    
    // Step 5: Intent
    what_to_give: [],
    what_to_receive: [],
    
    // Step 6: Skills & Contribution
    skills: [],
    sectors: [],
    contribution_style: '',
    
    // Step 7: Links & Identity
    linkedin_url: user?.user_metadata?.linkedin_url || '',
    twitter_url: '',
    website_url: '',
    avatar_url: user?.user_metadata?.picture || '',
    
    // Step 8: Community Agreement
    agrees_to_values: false,
    
    // Step 9: Recommendations
    onboarding_selections: [],
    
    // Step 10: First Action
    first_action_ready: false
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Redirect if user is not authenticated
  useEffect(() => {
    if (!user) {
      navigate('/auth');
    }
  }, [user, navigate]);

  // If profile already exists and is complete, redirect to user's public dashboard
  useEffect(() => {
    if (profile && profile.onboarding_completed_at) {
      const username = profile?.username;
      if (username) {
        navigate(`/dna/${username}`);
      } else {
        navigate('/app');
      }
    }
  }, [profile, navigate]);

  const updateFormData = (updates: Partial<typeof formData>) => {
    setFormData(prev => ({ ...prev, ...updates }));
  };

  const canProceedToNext = () => {
    switch (currentStep) {
      case 0: // Identity
        return formData.full_name && formData.username && formData.country_of_origin;
      case 1: // User Type
        return formData.user_type;
      case 2: // Pillars
        return formData.selected_pillars.length > 0;
      case 3: // Personalized
        return true; // All fields optional
      case 4: // Intent
        return formData.what_to_give.length > 0 || formData.what_to_receive.length > 0;
      case 5: // Skills & Contribution
        return formData.skills.length > 0 && formData.sectors.length > 0 && formData.contribution_style;
      case 6: // Links & Identity
        return true; // All fields optional
      case 7: // Community Agreement
        return formData.agrees_to_values;
      case 8: // Recommendations
        return true; // All selections optional
      case 9: // First Action
        return true; // Always ready for action
      default:
        return false;
    }
  };

  const handleNext = () => {
    if (currentStep < STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      // Final step is handled by FirstActionStep component
      // No need to submit here as user will be navigated to app
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
        username: normalizeUsername(formData.username),
        country_of_origin: formData.country_of_origin,
        current_country: formData.current_country,
        user_type: formData.user_type,
        selected_pillars: formData.selected_pillars,
        what_to_give: formData.what_to_give,
        what_to_receive: formData.what_to_receive,
        mentorship_interest: formData.mentorship_interest,
        impact_goals: formData.impact_goals,
        venture_name: formData.venture_name,
        venture_stage: formData.venture_stage,
        fundraising_status: formData.fundraising_status,
        collaboration_needs: formData.collaboration_needs,
        support_areas: formData.support_areas,
        advocacy_interests: formData.advocacy_interests,
        skills: formData.skills,
        sectors: formData.sectors,
        contribution_style: formData.contribution_style,
        linkedin_url: formData.linkedin_url,
        twitter_url: formData.twitter_url,
        website_url: formData.website_url,
        avatar_url: formData.avatar_url,
        agrees_to_values: formData.agrees_to_values,
        onboarding_stage: 'completed',
        onboarding_completed_at: new Date().toISOString(),
        onboarding_recommendations_viewed: false,
        first_action_completed: false,
        is_public: true,
        updated_at: new Date().toISOString()
      };

      const { error } = await supabase
        .from('profiles')
        .upsert(profileData, { onConflict: 'id' });

      if (error) throw error;

      // Send welcome email
      try {
        await supabase.functions.invoke('send-welcome-email', {
          body: {
            userId: user.id,
            userEmail: user.email,
            userName: formData.full_name || user.user_metadata?.full_name || 'DNA Member',
            selectedPillars: formData.selected_pillars || [],
            completedSteps: [
              'Created your DNA profile',
              'Selected your focus areas',
              'Set up your preferences',
              'Joined the community'
            ]
          }
        });
      } catch (emailError) {
        console.error('Error sending welcome email:', emailError);
        // Don't block onboarding completion if email fails
      }

      // Refresh the profile to get the updated data
      await refreshProfile();

      toast({
        title: "Welcome to DNA!",
        description: "Your profile has been created successfully.",
      });

      // Redirect to user's dashboard
      const username = formData.username || profile?.username;
      if (username) {
        navigate(`/dna/${username}`);
      } else {
        navigate('/app');
      }
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
    console.log("Onboarding: No user found, should redirect to auth");
    return null;
  }

  console.log("Onboarding: User found", { user: user?.id, profile: profile?.id });
  console.log("Onboarding: Current step", currentStep, "Component", STEPS[currentStep]?.component?.name);

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
            onClick={() => currentStep === STEPS.length - 1 ? handleSubmit() : handleNext()}
            disabled={!canProceedToNext() || isSubmitting}
            className="bg-dna-copper hover:bg-dna-gold text-white flex items-center justify-center gap-2 h-12 sm:h-10"
            size="lg"
          >
            {isSubmitting ? (
              "Creating Profile..."
            ) : currentStep === STEPS.length - 1 ? (
              "Complete Onboarding"
            ) : currentStep === STEPS.length - 2 ? (
              "Continue to Recommendations"
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