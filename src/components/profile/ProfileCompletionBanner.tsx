import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useProfileAccess } from '@/hooks/useProfileAccess';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';

interface ProfileCompletionBannerProps {
  minForFull?: number; // show banner until this score
}

export const ProfileCompletionBanner: React.FC<ProfileCompletionBannerProps> = ({ minForFull = 80 }) => {
  const { user, profile } = useAuth();
  const { completenessScore } = useProfileAccess();
  const [dismissed, setDismissed] = useState(false);

  const storageKey = user ? `dna_profile_banner_dismissed_${user.id}_v1` : 'dna_profile_banner_dismissed';

  useEffect(() => {
    try {
      const val = localStorage.getItem(storageKey);
      setDismissed(val === '1');
    } catch {}
  }, [storageKey]);

  const handleDismiss = () => {
    try { localStorage.setItem(storageKey, '1'); } catch {}
    setDismissed(true);
  };

  if (!user) return null;
  if (dismissed) return null;
  if (completenessScore >= minForFull) return null;

  return (
    <section aria-label="Profile completion" className="mx-4 mb-6 relative z-30">
      <div className="rounded-lg border border-border bg-background/95 backdrop-blur p-4 shadow-md">
        <div className="flex items-start gap-3">
          <div className="flex-1">
            <h2 className="text-sm font-semibold">Complete your profile to unlock more features</h2>
            <p className="text-xs text-muted-foreground mt-1">You're at {completenessScore}%. Finish your profile to enable messaging, programs, and more.</p>
            <div className="mt-3">
              <Progress value={completenessScore} />
            </div>
            <div className="mt-3 flex gap-2">
              <Button size="sm" onClick={() => (window.location.href = '/app/profile/edit')}>Complete profile</Button>
              <Button size="sm" variant="outline" onClick={handleDismiss}>Not now</Button>
            </div>
          </div>
          <button aria-label="Dismiss" onClick={handleDismiss} className="p-1 text-muted-foreground hover:text-foreground">
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    </section>
  );
};

export default ProfileCompletionBanner;
