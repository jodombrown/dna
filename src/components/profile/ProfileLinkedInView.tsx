
import React from "react";
import { Button } from "@/components/ui/button";
import ProfileCompletionBar from "./ProfileCompletionBar";
import ProfileHeroSection from "./ProfileHeroSection";
import ProfileStatsSection from "./ProfileStatsSection";
import ProfileAboutSection from "./ProfileAboutSection";
import ProfileSkillsSection from "./ProfileSkillsSection";

const ProfileLinkedInView = ({
  user,
  profile,
  handleSignOut,
  setEditing
}: any) => (
  <div className="max-w-5xl mx-auto pt-4 space-y-6">
    <div className="flex justify-end">
      <Button variant="destructive" className="mb-6" onClick={handleSignOut}>
        Sign Out
      </Button>
    </div>
    <ProfileCompletionBar profile={profile} />
    <ProfileHeroSection profile={profile} isOwnProfile={profile.id === user.id} onEdit={() => setEditing(true)} />
    <ProfileStatsSection profile={profile} />
    <div className="grid md:grid-cols-3 gap-6">
      <div className="md:col-span-2 space-y-6">
        <ProfileAboutSection profile={profile} />
      </div>
      <div className="space-y-6">
        <ProfileSkillsSection profile={profile} />
      </div>
    </div>
  </div>
);

export default ProfileLinkedInView;
