
import React from "react";
import { Progress } from "@/components/ui/progress";

const PROFILE_FIELDS = [
  "full_name",
  "headline",
  "city",
  "location",
  "bio",
  "my_dna_statement",
  "impact_areas",
  "engagement_intentions",
  "available_for",
  "linkedin_url",
  "website_url"
];

interface ProfileCompletionBarProps {
  profile: any;
}

export function calculateProfileCompletion(profile: any): number {
  if (!profile) return 0;
  let completed = 0;
  PROFILE_FIELDS.forEach((field) => {
    if (
      Array.isArray(profile[field]) ? profile[field]?.length > 0
      : profile[field]
    ) {
      completed += 1;
    }
  });
  return Math.round((completed / PROFILE_FIELDS.length) * 100);
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
