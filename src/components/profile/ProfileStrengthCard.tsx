import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Edit, TrendingUp, CheckCircle2, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface ProfileStrengthCardProps {
  completionScore: number;
  className?: string;
  compact?: boolean;
}

const getStrengthTier = (score: number) => {
  if (score >= 80) return { label: 'Strong Match', color: 'text-green-600', bgColor: 'bg-green-100' };
  if (score >= 60) return { label: 'Good Match', color: 'text-blue-600', bgColor: 'bg-blue-100' };
  if (score >= 40) return { label: 'Building', color: 'text-amber-600', bgColor: 'bg-amber-100' };
  return { label: 'Getting Started', color: 'text-orange-600', bgColor: 'bg-orange-100' };
};

export const ProfileStrengthCard: React.FC<ProfileStrengthCardProps> = ({
  completionScore,
  className = '',
  compact = false,
}) => {
  const navigate = useNavigate();
  const tier = getStrengthTier(completionScore);
  const isUnlocked = completionScore >= 40;

  if (compact) {
    return (
      <div className={`flex items-center gap-3 p-3 bg-muted/50 rounded-lg border ${className}`}>
        <div className="flex-1">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Profile Strength</span>
            <span className={`text-xs font-semibold px-2 py-0.5 rounded ${tier.bgColor} ${tier.color}`}>
              {tier.label}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Progress value={completionScore} className="flex-1 h-2" />
            <span className="text-sm font-bold min-w-[3ch]">{completionScore}%</span>
          </div>
        </div>
        {!isUnlocked && (
          <Button
            size="sm"
            variant="outline"
            onClick={() => navigate('/dna/profile/edit')}
          >
            <Edit className="h-3 w-3" />
          </Button>
        )}
      </div>
    );
  }

  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-dna-copper" />
            Profile Strength
          </span>
          <span className={`text-sm font-semibold px-3 py-1 rounded-full ${tier.bgColor} ${tier.color}`}>
            {tier.label}
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-2xl font-bold">{completionScore}%</span>
            <span className="text-sm text-muted-foreground">Complete</span>
          </div>
          <Progress value={completionScore} className="h-3" />
        </div>

        {isUnlocked ? (
          <div className="flex items-start gap-2 p-3 bg-green-50 border border-green-200 rounded-lg">
            <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-sm font-medium text-green-900">All Features Unlocked</p>
              <p className="text-xs text-green-700 mt-1">
                You can now appear in discovery, create events, and apply to opportunities
              </p>
            </div>
          </div>
        ) : (
          <div className="flex items-start gap-2 p-3 bg-orange-50 border border-orange-200 rounded-lg">
            <AlertCircle className="h-5 w-5 text-orange-600 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-sm font-medium text-orange-900">
                {40 - completionScore}% to unlock full access
              </p>
              <p className="text-xs text-orange-700 mt-1">
                Complete your profile to appear in discovery and access all DNA features
              </p>
            </div>
          </div>
        )}

        <Button
          onClick={() => navigate('/dna/profile/edit')}
          className="w-full"
          variant={isUnlocked ? 'outline' : 'default'}
        >
          <Edit className="h-4 w-4 mr-2" />
          {isUnlocked ? 'Enhance Profile' : 'Complete Your Profile'}
        </Button>
      </CardContent>
    </Card>
  );
};
