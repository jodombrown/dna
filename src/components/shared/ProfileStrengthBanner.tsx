import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useProfileAccess } from '@/hooks/useProfileAccess';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { X, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface ProfileStrengthBannerProps {
  minForFull?: number;
}

export const ProfileStrengthBanner = ({ minForFull = 40 }: ProfileStrengthBannerProps) => {
  const { user, profile } = useAuth();
  const { completenessScore } = useProfileAccess();
  const navigate = useNavigate();
  const [dismissed, setDismissed] = useState(false);

  const storageKey = user ? `dna_profile_strength_banner_${user.id}` : 'dna_profile_strength_banner';

  useEffect(() => {
    try {
      const val = localStorage.getItem(storageKey);
      setDismissed(val === '1');
    } catch {}
  }, [storageKey]);

  const handleDismiss = () => {
    try {
      localStorage.setItem(storageKey, '1');
    } catch {}
    setDismissed(true);
  };

  if (!user || !profile) return null;
  if (dismissed) return null;
  if (completenessScore >= minForFull) return null;

  return (
    <Alert className="border-dna-copper/50 bg-dna-copper/5">
      <AlertCircle className="h-4 w-4 text-dna-copper" />
      <AlertDescription className="ml-2">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1">
            <div className="flex items-center justify-between mb-2">
              <p className="font-semibold text-sm">
                Complete your profile to unlock more features
              </p>
              <button
                onClick={handleDismiss}
                className="text-muted-foreground hover:text-foreground transition-colors"
                aria-label="Dismiss"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <p className="text-xs text-muted-foreground mb-3">
              You're at {completenessScore}%. Complete your profile to at least {minForFull}% to send connection requests, join spaces, and access more opportunities.
            </p>
            <Progress value={completenessScore} className="h-2 mb-3" />
            <div className="flex gap-2">
              <Button
                size="sm"
                onClick={() => navigate('/dna/profile/edit')}
                className="bg-dna-copper hover:bg-dna-gold"
              >
                Complete Profile
              </Button>
              <Button size="sm" variant="ghost" onClick={handleDismiss}>
                Not now
              </Button>
            </div>
          </div>
        </div>
      </AlertDescription>
    </Alert>
  );
};
