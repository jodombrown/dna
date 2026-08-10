import { useAuth } from '@/contexts/AuthContext';
import { useProfile } from '@/hooks/useProfile';
import { AppShell, READING_MAX_WIDTH } from '@/layouts/AppShell';
import { RightWidgets } from '@/components/layout/columns/RightWidgets';
import { Card } from '@/components/ui/card';
import { BarChart3 } from 'lucide-react';
import { TierGate } from '@/components/auth/TierGate';
import { checkTierAccess } from '@/services/tierService';
import { UserTier } from '@/types/composer';

const DnaAnalytics = () => {
  const { user } = useAuth();
  const { data: profile, isLoading } = useProfile();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user || !profile) {
    return null;
  }

  // Tier gating — free users cannot access cross-C analytics
  const tierAccess = checkTierAccess(UserTier.FREE, 'canViewCrossCAnalytics');

  // Analytics is prose-ish (headings, cards of text, no grid that wants to
  // absorb extra width as more columns), so its content column claims its
  // own reading-width cap here — the shell itself no longer caps anything.
  const centerColumn = (
    <div className="w-full" style={{ maxWidth: READING_MAX_WIDTH }}>
      <TierGate
        hasAccess={tierAccess.allowed}
        requiredTier="pro"
        featureLabel="Cross-C Analytics"
      >
        <div className="space-y-6">
          <div className="flex items-center gap-3 mb-6">
            <BarChart3 className="w-6 h-6 text-primary" />
            <h1 className="text-h2 font-serif">Analytics Dashboard</h1>
          </div>
          <Card className="p-6">
            <p className="text-muted-foreground">Analytics content coming soon...</p>
          </Card>
        </div>
      </TierGate>
    </div>
  );

  return (
    <AppShell
      bubble={{ kind: 'static', placeholder: 'Analytics Dashboard' }}
      related={<RightWidgets variant="default" />}
    >
      {centerColumn}
    </AppShell>
  );
};

export default DnaAnalytics;
