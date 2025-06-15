
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
  const { toast } = useToast();
  const navigate = useNavigate();

  const fetchProfileAndStatus = async () => {
    setFetching(true);
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
    setFetching(false);
  };

  useEffect(() => {
    if (user) fetchProfileAndStatus();
    // eslint-disable-next-line
  }, [user]);

  // On completing each onboarding step: notify, update profile onboarding_status, and refetch
  const completeStep = async (step: string, extra: Record<string, any> = {}) => {
    await supabase
      .from("profiles")
      .update({
        onboarding_status: { ...profile?.onboarding_status, [step]: true },
        ...(step === "profile_completed" ? { profile_completed_at: new Date().toISOString() } : {}),
        ...(step === "community_joined" ? { first_community_joined_at: new Date().toISOString() } : {}),
        ...(step === "connection_sent" ? { first_connection_made_at: new Date().toISOString() } : {})
      })
      .eq("id", user.id);
    if (step === "profile_completed") {
      toast({
        title: "🎉 Profile Complete!",
        description: "Way to go! You’re ready for the next step: join a community."
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
        description: "You’re officially part of the community. Dashboard unlocked!"
      });
    }
    await fetchProfileAndStatus();
  };

  if (authLoading || fetching) return (
    <div className="flex h-[60vh] flex-col items-center justify-center">
      <Spinner />
      <div className="mt-2 text-gray-700">Loading onboarding…</div>
    </div>
  );

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
          <CardTitle className="text-dna-forest">Welcome to DNA! {profile?.full_name && <>👋 {profile.full_name}</>}</CardTitle>
          <div className="mt-2 text-sm text-dna-copper tracking-tight">
            We’ll help you connect, collaborate, and make impact. Complete these steps to unlock your dashboard.
          </div>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <ProfileCompletionBar profile={profile} />
            <div className="flex flex-col gap-2">
              {ONBOARDING_STEPS.map((step) => (
                <div className="flex items-center" key={step}>
                  <span className={`w-5 h-5 rounded-full inline-flex justify-center items-center mr-2 
                    ${stepStatus[step] ? "bg-dna-emerald text-white" : "bg-gray-200 text-gray-500"}`}>
                    {stepStatus[step] ? "✓" : (ONBOARDING_STEPS.findIndex(s => !stepStatus[s]) === ONBOARDING_STEPS.indexOf(step) ? "→" : "")}
                  </span>
                  <span className={stepStatus[step] ? "font-semibold text-dna-emerald" : ""}>{stepLabels[step]}</span>
                </div>
              ))}
            </div>
          </div>
          {!stepStatus.profile_completed && (
            <div>
              <div className="mb-2 font-medium">Step 1: Complete your profile for personalized recommendations</div>
              <EnhancedProfileForm
                profile={profile}
                onSave={async () => await completeStep("profile_completed")}
              />
            </div>
          )}
          {stepStatus.profile_completed && !stepStatus.community_joined && (
            <div>
              <div className="mb-2 font-medium">Step 2: Join a community that matches your interests</div>
              <SuggestedCommunitiesSection
                impactAreas={profile?.impact_areas}
                onJoin={async () => await completeStep("community_joined")}
              />
            </div>
          )}
          {stepStatus.profile_completed && stepStatus.community_joined && !stepStatus.connection_sent && (
            <div>
              <div className="mb-2 font-medium">Step 3: Send your first connection request</div>
              <SuggestedConnectionsSection
                userId={user.id}
                countryOfOrigin={profile?.country_of_origin}
                location={profile?.location}
                onConnect={async () => await completeStep("connection_sent")}
              />
            </div>
          )}
          {stepStatus.profile_completed && stepStatus.community_joined && stepStatus.connection_sent && (
            <div className="text-center py-6">
              <b className="text-dna-emerald text-lg">Onboarding complete! 🎉</b>
              <div>Your personal dashboard is now available.</div>
              <Button className="mt-4" onClick={() => navigate("/my-profile")}>Go to My Profile</Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Onboarding;
