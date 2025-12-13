import React from "react";
import { Progress } from "@/components/ui/progress";
import { ProfileMissingFields, getProfileFieldChecks } from "./ProfileMissingFields";
import { cn } from "@/lib/utils";

interface ProfileCompletionBarProps {
  profile: any;
  showMissingFields?: boolean;
  compact?: boolean;
  className?: string;
}

// Points-based calculation using 5-pillar system (total 100 pts)
export function calculateProfileCompletionPts(profile: any): number {
  if (!profile) return 0;
  
  const fields = getProfileFieldChecks(profile);
  const completedPts = fields.filter(f => f.complete).reduce((sum, f) => sum + f.points, 0);
  
  return Math.min(100, completedPts);
}

// Legacy alias for backward compatibility
export const calculateProfileCompletion = calculateProfileCompletionPts;

const ProfileCompletionBar: React.FC<ProfileCompletionBarProps> = ({ 
  profile, 
  showMissingFields = false,
  compact = false,
  className 
}) => {
  const percent = calculateProfileCompletion(profile);

  const getStrengthLabel = (score: number) => {
    if (score >= 80) return { label: 'Excellent', color: 'text-green-600' };
    if (score >= 60) return { label: 'Great', color: 'text-blue-600' };
    if (score >= 40) return { label: 'Good', color: 'text-amber-600' };
    return { label: 'Getting Started', color: 'text-dna-copper' };
  };

  const strength = getStrengthLabel(percent);

  return (
    <div className={cn("space-y-3", className)}>
      <div className="flex justify-between items-center">
        <span className="text-sm font-medium">Profile Strength</span>
        <div className="flex items-center gap-2">
          <span className={cn("text-xs font-semibold", strength.color)}>
            {strength.label}
          </span>
          <span className="text-sm font-bold">{percent}%</span>
        </div>
      </div>
      <Progress value={percent} className={compact ? "h-1.5" : "h-2"} />
      
      {showMissingFields && percent < 100 && (
        <div className="pt-2">
          <ProfileMissingFields profile={profile} compact maxItems={4} />
        </div>
      )}
    </div>
  );
};

export default ProfileCompletionBar;
