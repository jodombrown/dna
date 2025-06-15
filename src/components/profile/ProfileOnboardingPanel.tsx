
import React from "react";
import { Button } from "@/components/ui/button";
import ProfileCompletionBar from "./ProfileCompletionBar";
import EnhancedProfileForm from "./EnhancedProfileForm";
import SuggestedConnectionsSection from "./SuggestedConnectionsSection";

const ProfileOnboardingPanel = ({
  profile,
  user,
  handleSignOut,
  handleProfileSaved,
  toast
}: any) => (
  <div className="max-w-2xl mx-auto pt-4">
    <div className="flex justify-end">
      <Button variant="destructive" className="mb-6" onClick={handleSignOut}>
        Sign Out
      </Button>
    </div>
    <h2 className="text-2xl font-bold text-dna-forest mb-2">
      {profile ? "Edit Your Profile" : "Start Your Profile, Today!"}
    </h2>
    <ProfileCompletionBar profile={profile || {}} />
    <EnhancedProfileForm profile={profile} onSave={handleProfileSaved} />
    <div className="mt-8">
      <h3 className="font-semibold text-dna-forest mb-2">People you may want to connect with</h3>
      <SuggestedConnectionsSection
        userId={user.id}
        countryOfOrigin={profile?.country_of_origin}
        location={profile?.location}
        onConnect={() =>
          toast({ title: "Connection Sent", description: "We’ve sent a connection request on your behalf!" })
        }
      />
    </div>
    <div className="mt-8 text-center text-dna-copper text-base">
      <b>Need help getting started?</b> Use the guided tour or reach out to our community manager for personal support.
    </div>
  </div>
);

export default ProfileOnboardingPanel;
