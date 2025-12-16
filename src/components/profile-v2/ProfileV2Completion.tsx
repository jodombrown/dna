import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ArrowRight, Target } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { calculateProfileCompletionPts, getMissingFields } from '@/lib/profileCompletion';
import { ProfileMissingFields } from '@/components/profile/ProfileMissingFields';

interface ProfileV2CompletionProps {
  profile: any;
  onActionClick?: (action: string) => void;
}

const ProfileV2Completion: React.FC<ProfileV2CompletionProps> = ({
  profile,
  onActionClick,
}) => {
  const navigate = useNavigate();
  
  // Use the canonical calculation - single source of truth
  const score = calculateProfileCompletionPts(profile);
  const missingFields = getMissingFields(profile);

  const getProgressColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 50) return 'text-yellow-600';
    return 'text-orange-600';
  };

  const getProgressMessage = (score: number) => {
    if (score === 100) return '🎉 Perfect! Your profile is complete.';
    if (score >= 90) return '👏 Almost there! Just a bit more to reach 100.';
    if (score >= 70) return '💪 Great progress! Keep building your profile.';
    if (score >= 50) return '✨ Good start! Complete more to unlock features.';
    return '🚀 Complete your profile to get discovered.';
  };

  const handleActionClick = (action: string) => {
    if (onActionClick) {
      onActionClick(action);
    }
    navigate('/dna/profile/edit');
  };

  return (
    <Card className="overflow-hidden border-primary/20 bg-gradient-to-br from-background to-primary/5">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <Target className="w-5 h-5 text-primary" />
          Profile Strength
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground">Progress</span>
            <span className={`text-lg font-bold ${getProgressColor(score)}`}>
              {score}/100 pts
            </span>
          </div>
          <Progress value={score} className="h-2.5" />
          <p className="text-xs text-muted-foreground mt-2">
            {getProgressMessage(score)}
          </p>
        </div>

        {/* Show missing fields if not at 100 */}
        {missingFields.length > 0 && (
          <div className="pt-2 border-t border-border/50">
            <p className="text-xs font-medium text-muted-foreground mb-3">
              Complete these to reach 100 pts:
            </p>
            <ProfileMissingFields profile={profile} compact maxItems={3} />
          </div>
        )}

        <div>
          <button
            onClick={() => handleActionClick('edit_profile')}
            className="w-full flex items-center justify-between p-2.5 text-left bg-background hover:bg-secondary/50 rounded-lg transition-colors group border border-transparent hover:border-primary/20"
          >
            <Badge variant="outline" className="text-xs capitalize font-normal">
              {score === 100 ? 'Edit Profile' : 'Complete Profile'}
            </Badge>
            <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-0.5 transition-all" />
          </button>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProfileV2Completion;
