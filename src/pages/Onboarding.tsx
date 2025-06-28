
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/CleanAuthContext';
import { supabase } from '@/integrations/supabase/client';
import MultiStepOnboardingWizard from '@/components/onboarding/MultiStepOnboardingWizard';
import OnboardingProgressChecklist from '@/components/onboarding/OnboardingProgressChecklist';
import Header from '@/components/Header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

const Onboarding = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [onboardingStep, setOnboardingStep] = useState(0);

  useEffect(() => {
    if (user) {
      fetchProfile();
    } else {
      setLoading(false);
    }
  }, [user]);

  const fetchProfile = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      setProfile(data);
      
      // Calculate onboarding progress based on available profile data
      let progress = 0;
      if (data?.full_name) progress++;
      if (data?.bio) progress++;
      if (data?.profession) progress++;
      if (data?.location) progress++;
      
      setOnboardingStep(progress);
    } catch (error) {
      console.error('Error fetching profile:', error);
      toast({
        title: "Error",
        description: "Failed to fetch profile information",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const getOnboardingProgress = () => {
    if (!profile) return {
      profileComplete: false,
      connectionsComplete: false,
      communityComplete: false
    };

    return {
      profileComplete: !!(profile.full_name && profile.bio && profile.profession),
      connectionsComplete: false, // Demo: connections don't exist yet
      communityComplete: false, // Demo: community features don't exist yet
    };
  };

  const handleCompleteOnboarding = () => {
    toast({
      title: "Welcome to DNA!",
      description: "Your onboarding is complete. Start exploring the platform!",
    });
    navigate('/clean-social-feed');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex items-center justify-center py-12">
          <div className="text-lg">Loading...</div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-4xl mx-auto px-4 py-8">
          <Card>
            <CardHeader>
              <CardTitle>Sign In Required</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">
                Please sign in to access the onboarding process.
              </p>
              <Button onClick={() => navigate('/auth')}>
                Sign In
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const progress = getOnboardingProgress();

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Onboarding Content */}
          <div className="lg:col-span-2">
            <MultiStepOnboardingWizard 
              user={user}
              profile={profile}
              onComplete={handleCompleteOnboarding}
              currentStep={onboardingStep}
              onStepChange={setOnboardingStep}
            />
          </div>

          {/* Progress Sidebar */}
          <div className="lg:col-span-1">
            <OnboardingProgressChecklist 
              progress={progress}
              onComplete={handleCompleteOnboarding}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Onboarding;
