import React from "react";
import { Progress } from "@/components/ui/progress";
import { ProfileMissingFields } from "./ProfileMissingFields";
import { cn } from "@/lib/utils";
import { calculateProfileCompletionPts } from "@/lib/profileCompletion";

// Re-export from pure utility for backward compatibility
export { calculateProfileCompletionPts, calculateProfileCompletionPts as calculateProfileCompletion } from "@/lib/profileCompletion";

interface ProfileCompletionBarProps {
  profile: any;
  showMissingFields?: boolean;
  compact?: boolean;
  className?: string;
}

const ProfileCompletionBar: React.FC<ProfileCompletionBarProps> = ({ 
  profile, 
  showMissingFields = false,
  compact = false,
  className 
}) => {
  const completionPts = calculateProfileCompletionPts(profile);

  const getStrengthLabel = (score: number) => {
    if (score >= 80) return { label: 'Excellent', color: 'text-green-600' };
    if (score >= 60) return { label: 'Great', color: 'text-blue-600' };
    if (score >= 40) return { label: 'Good', color: 'text-amber-600' };
    return { label: 'Getting Started', color: 'text-dna-copper' };
  };

  const strength = getStrengthLabel(completionPts);

  return (
    <div className={cn("space-y-3", className)}>
      <div className="flex justify-between items-center">
        <span className="text-sm font-medium">Profile Strength</span>
        <div className="flex items-center gap-2">
          <span className={cn("text-xs font-semibold", strength.color)}>
            {strength.label}
          </span>
          <span className="text-sm font-bold">{completionPts} pts</span>
        </div>
      </div>
      <Progress value={completionPts} className={compact ? "h-1.5" : "h-2"} />
      
      {showMissingFields && completionPts < 100 && (
        <div className="pt-2">
          <ProfileMissingFields profile={profile} compact maxItems={4} />
        </div>
      )}
    </div>
  );
};

export default ProfileCompletionBar;
