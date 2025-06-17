
import React from "react";
import EnhancedProfileForm from "@/components/profile/EnhancedProfileForm";
import SuggestedCommunitiesSection from "@/components/profile/SuggestedCommunitiesSection";
import SuggestedConnectionsSection from "@/components/profile/SuggestedConnectionsSection";
import { Button } from "@/components/ui/button";

interface Props {
  stepStatus: Record<string, boolean>;
  profile: any;
  user: any;
  completeStep: (step: string, extra?: Record<string, any>) => Promise<void>;
  navigate: (to: string) => void;
}

const OnboardingStepContent: React.FC<Props> = ({
  stepStatus,
  profile,
  user,
  completeStep,
  navigate,
}) => {
  if (!stepStatus.profile_completed) {
    return (
      <div>
        <div className="mb-2 font-medium">
          Step 1: Complete your profile for personalized recommendations
        </div>
        <EnhancedProfileForm profile={profile} onSave={async () => await completeStep("profile_completed")} />
      </div>
    );
  }

  if (stepStatus.profile_completed && !stepStatus.community_joined) {
    return (
      <div>
        <div className="mb-2 font-medium">
          Step 2: Join a community that matches your interests
        </div>
        <SuggestedCommunitiesSection
          impactAreas={profile?.impact_areas}
          onJoin={async () => await completeStep("community_joined")}
        />
      </div>
    );
  }

  if (
    stepStatus.profile_completed &&
    stepStatus.community_joined &&
    !stepStatus.connection_sent
  ) {
    return (
      <div>
        <div className="mb-2 font-medium">
          Step 3: Send your first connection request
        </div>
        <SuggestedConnectionsSection />
      </div>
    );
  }

  if (
    stepStatus.profile_completed &&
    stepStatus.community_joined &&
    stepStatus.connection_sent
  ) {
    return (
      <div className="text-center py-6">
        <b className="text-dna-emerald text-lg">Onboarding complete! 🎉</b>
        <div>Your personal dashboard is now available.</div>
        <Button className="mt-4" onClick={() => navigate("/my-profile")}>
          Go to My Profile
        </Button>
      </div>
    );
  }

  return null;
};

export default OnboardingStepContent;
