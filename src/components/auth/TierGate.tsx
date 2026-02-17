import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Crown, ArrowLeft } from 'lucide-react';

interface TierGateProps {
  children: React.ReactNode;
  requiredTier?: 'pro' | 'org';
  /** For now, always passes through. Set to false to show upgrade screen. */
  hasAccess: boolean;
  featureLabel?: string;
}

/**
 * Wraps a route/component and shows a "DNA Pro Required" upgrade screen
 * when the user doesn't have access.
 */
export const TierGate: React.FC<TierGateProps> = ({
  children,
  requiredTier = 'pro',
  hasAccess,
  featureLabel = 'This feature',
}) => {
  const navigate = useNavigate();

  if (hasAccess) {
    return <>{children}</>;
  }

  const tierLabel = requiredTier === 'org' ? 'DNA Org' : 'DNA Pro';

  return (
    <div className="flex items-center justify-center min-h-[60vh] px-4">
      <Card className="max-w-md w-full border-primary/20 shadow-lg">
        <CardContent className="pt-8 pb-6 text-center space-y-5">
          <div className="mx-auto w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center">
            <Crown className="w-7 h-7 text-primary" />
          </div>
          <div className="space-y-2">
            <h2 className="text-xl font-bold text-foreground">
              {tierLabel} Required
            </h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {featureLabel} is available on the <strong>{tierLabel}</strong> plan.
              Upgrade to unlock advanced analytics, DIA intelligence, and more.
            </p>
          </div>
          <div className="flex flex-col gap-2">
            <Button className="w-full" disabled>
              <Crown className="w-4 h-4 mr-2" />
              Upgrade to {tierLabel} — Coming Soon
            </Button>
            <Button
              variant="ghost"
              className="w-full"
              onClick={() => navigate(-1)}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Go Back
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
