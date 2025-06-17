
import React from "react";
import { Button } from "@/components/ui/button";
import ProfileCompletionBar from "./ProfileCompletionBar";
import DNALinkedInProfile from "./DNALinkedInProfile";

const ProfileLinkedInView = ({
  user,
  profile,
  handleSignOut,
  setEditing
}: any) => {
  const handleEdit = () => {
    setEditing(true);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200 px-4 py-3">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <h1 className="text-lg font-semibold text-dna-forest">My DNA Profile</h1>
          <Button variant="destructive" onClick={handleSignOut}>
            Sign Out
          </Button>
        </div>
      </div>
      
      <div className="pb-8">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <ProfileCompletionBar profile={profile} />
        </div>
        
        <DNALinkedInProfile
          profile={profile}
          isOwnProfile={true}
          onEdit={handleEdit}
        />
      </div>
    </div>
  );
};

export default ProfileLinkedInView;
