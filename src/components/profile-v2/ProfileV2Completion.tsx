import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { TrendingUp, ArrowRight } from 'lucide-react';
import { ProfileV2Completion as CompletionType } from '@/types/profileV2';

interface ProfileV2CompletionProps {
  completion: CompletionType;
  onActionClick?: (action: string) => void;
}

const ProfileV2Completion: React.FC<ProfileV2CompletionProps> = ({
  completion,
  onActionClick,
}) => {
  const getProgressColor = (score: number) => {
    if (score >= 80) return 'bg-green-500';
    if (score >= 50) return 'bg-yellow-500';
    return 'bg-orange-500';
  };

  const getProgressMessage = (score: number) => {
    if (score >= 90) return 'Excellent! Your profile is nearly complete.';
    if (score >= 70) return 'Great progress! A few more steps to go.';
    if (score >= 50) return 'Good start! Keep building your profile.';
    return 'Let\'s complete your profile to unlock more features.';
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-primary" />
          Profile Completion
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground">Progress</span>
            <span className="text-lg font-bold">{completion.score}%</span>
          </div>
          <Progress value={completion.score} className="h-2" />
          <p className="text-xs text-muted-foreground mt-2">
            {getProgressMessage(completion.score)}
          </p>
        </div>

        {completion.suggested_actions.length > 0 && (
          <div>
            <p className="text-sm font-medium mb-2">Next Steps:</p>
            <div className="space-y-2">
              {completion.suggested_actions
                .filter(action => action && action.trim())
                .slice(0, 5)
                .map((action, idx) => (
                  <button
                    key={idx}
                    onClick={() => onActionClick?.(action)}
                    className="w-full flex items-center justify-between p-2 text-left hover:bg-secondary/50 rounded-md transition-colors group"
                  >
                    <Badge variant="outline" className="text-xs">
                      {action.replace(/_/g, ' ')}
                    </Badge>
                    <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                  </button>
                ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ProfileV2Completion;
