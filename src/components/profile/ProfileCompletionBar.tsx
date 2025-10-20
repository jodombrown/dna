
import React from "react";
import { Progress } from "@/components/ui/progress";

const PROFILE_FIELDS = [
  "full_name",
  "headline",
  "bio",
  "profession",
  "company",
  "skills", // array - needs 3+
  "focus_areas", // array - needs 2+
  "regional_expertise", // array - needs 1+
  "industries", // array - needs 2+
  "country_of_origin",
  "languages_spoken", // array - needs 1+
  "linkedin_url",
  "website_url"
];

interface ProfileCompletionBarProps {
  profile: any;
}

export function calculateProfileCompletion(profile: any): number {
  if (!profile) return 0;
  let score = 0;
  
  // Basic Info (30 points)
  if (profile.avatar_url) score += 10;
  if (profile.full_name?.length > 0) score += 5;
  if (profile.username?.length > 0) score += 5;
  if (profile.headline?.length > 0) score += 5;
  if (profile.bio?.length > 50) score += 5;
  
  // Professional Info (20 points)
  if (profile.profession?.length > 0) score += 5;
  if (profile.company?.length > 0) score += 5;
  if (profile.skills?.length >= 3) score += 10;
  
  // Discovery Tags (30 points) - CRITICAL FOR FINDABILITY
  if (profile.focus_areas?.length >= 2) score += 10;
  if (profile.regional_expertise?.length >= 1) score += 10;
  if (profile.industries?.length >= 2) score += 10;
  
  // Heritage & Identity (10 points)
  if (profile.country_of_origin?.length > 0) score += 5;
  if (profile.languages_spoken?.length >= 1) score += 5;
  
  // Engagement Flags (10 points)
  if (profile.availability_for_mentoring === true) score += 5;
  if (profile.looking_for_opportunities === true) score += 5;
  
  return score;
}

const ProfileCompletionBar: React.FC<ProfileCompletionBarProps> = ({ profile }) => {
  const percent = calculateProfileCompletion(profile);

  return (
    <div className="mb-4">
      <div className="flex justify-between items-center mb-1">
        <span className="text-sm font-medium text-dna-forest">Profile Completion</span>
        <span className="text-xs text-gray-500">{percent}%</span>
      </div>
      <Progress value={percent} />
    </div>
  );
};

export default ProfileCompletionBar;
