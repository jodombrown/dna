import React, { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { Spinner } from "@/components/ui/spinner";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import ProfileCompletionBar, { calculateProfileCompletion } from "@/components/profile/ProfileCompletionBar";
import SuggestedCommunitiesSection from "@/components/profile/SuggestedCommunitiesSection";
import SuggestedConnectionsSection from "@/components/profile/SuggestedConnectionsSection";
import EnhancedProfileForm from "@/components/profile/EnhancedProfileForm";
import { supabase } from "@/integrations/supabase/client";
import OnboardingProgressChecklist from "@/components/onboarding/OnboardingProgressChecklist";
import OnboardingStepContent from "@/components/onboarding/OnboardingStepContent";

const ONBOARDING_STEPS = [
  "profile_completed",
  "community_joined",
  "connection_sent"
];

const Onboarding = () => {
  const { user, loading: authLoading } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [stepStatus, setStepStatus] = useState<{ [key: string]: boolean }>({});
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const navigate = useNavigate();

  const fetchProfileAndStatus = async () => {
    setFetching(true);
    setError(null);
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user?.id)
        .maybeSingle();
      setProfile(data || null);

      // Determine onboarding status from DB columns or completion
      let onboarding_status: any = {};
      if (data?.onboarding_status) onboarding_status = data.onboarding_status;
      onboarding_status.profile_completed =
        calculateProfileCompletion(data) >= 80 || onboarding_status.profile_completed;
      setStepStatus({
        profile_completed: onboarding_status.profile_completed,
        community_joined: !!data?.first_community_joined_at || onboarding_status.community_joined,
        connection_sent: !!data?.first_connection_made_at || onboarding_status.connection_sent
      });
    } catch (err: any) {
      setError("Error loading profile: " + (err.message || "Unknown error."));
      setProfile(null);
      setStepStatus({});
    } finally {
      setFetching(false);
    }
  };

  useEffect(() => {
    if (user) fetchProfileAndStatus();
    // eslint-disable-next-line
  }, [user]);

  // On completing each onboarding step: notify, update profile onboarding_status, and refetch
  const completeStep = async (step: string, extra: Record<string, any> = {}) => {
    const updateData: any = {
      onboarding_status: { ...profile?.onboarding_status, [step]: true }
    };
    
    if (step === "profile_completed") {
      updateData.profile_completed_at = new Date().toISOString();
    } else if (step === "community_joined") {
      updateData.first_community_joined_at = new Date().toISOString();
    } else if (step === "connection_sent") {
      updateData.first_connection_made_at = new Date().toISOString();
    }

    await supabase
      .from("profiles")
      .update(updateData)
      .eq("id", user.id);
      
    if (step === "profile_completed") {
      toast({
        title: "🎉 Profile Complete!",
        description: "Way to go! You're ready for the next step: join a community."
      });
    }
    if (step === "community_joined") {
      toast({
        title: "👏 Community Joined!",
        description: "Awesome! Now make your first connection."
      });
    }
    if (step === "connection_sent") {
      toast({
        title: "🌟 First Connection Sent!",
        description: "You're officially part of the community. Dashboard unlocked!"
      });
    }
    await fetchProfileAndStatus();
  };

  // Robust loading UI for bad states
  if (authLoading || fetching) {
    return (
      <div className="flex h-[60vh] flex-col items-center justify-center">
        <Spinner />
        <div className="mt-4 text-gray-700 text-lg">Loading onboarding…</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-[60vh] flex-col items-center justify-center">
        <div className="text-red-600 font-semibold mb-2">Error Loading Profile</div>
        <div className="mb-4">{error}</div>
        <Button onClick={fetchProfileAndStatus} className="mt-2">Retry</Button>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="text-gray-700 text-lg">Please sign in to continue onboarding.</div>
      </div>
    );
  }

  // Show progress with a checklist bar
  const stepLabels: Record<string, string> = {
    profile_completed: "Finish Profile",
    community_joined: "Join Community",
    connection_sent: "Send Connection"
  };

  // Onboarding wizard
  return (
    <div className="max-w-2xl mx-auto py-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-dna-forest">
            Welcome to DNA! {profile?.full_name && <>👋 {profile.full_name}</>}
          </CardTitle>
          <div className="mt-2 text-sm text-dna-copper tracking-tight">
            We'll help you connect, collaborate, and make impact. Complete these steps to unlock your dashboard.
          </div>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <ProfileCompletionBar profile={profile} />
            <OnboardingProgressChecklist
              stepStatus={stepStatus}
              stepLabels={stepLabels}
              onboardingSteps={ONBOARDING_STEPS}
            />
          </div>
          <OnboardingStepContent
            stepStatus={stepStatus}
            profile={profile}
            user={user}
            completeStep={completeStep}
            navigate={navigate}
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default Onboarding;
