import React, { useEffect, useState } from 'react';
import { useViewState } from '@/contexts/ViewStateContext';
import { useAuth } from '@/contexts/AuthContext';
import { useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import UnifiedHeader from '@/components/UnifiedHeader';
import { AccountDrawer } from '@/components/navigation/AccountDrawer';
import { PulseBar, PulseDock } from '@/components/pulse';
import { initDIAPeriodicChecks } from '@/services/dia/diaPeriodicCheck';
import { FEATURE_FLAGS } from '@/config/featureFlags';
import { AlphaWelcomeBanner } from '@/components/alpha/AlphaWelcomeBanner';
import { AlphaTestGuide } from '@/components/alpha/AlphaTestGuide';
import { AlphaFeedbackForm } from '@/components/alpha/AlphaFeedbackForm';
import { ProfileCompletionGuide } from '@/components/onboarding/ProfileCompletionGuide';

interface BaseLayoutProps {
  children: React.ReactNode;
}

/**
 * BaseLayout - The intelligent layout wrapper that adapts based on view state
 *
 * This component automatically applies the correct layout configuration
 * based on the current view state (determined by the route).
 *
 * Features:
 * - Smooth transitions between layout configurations (300ms)
 * - Responsive behavior for mobile/tablet/desktop
 * - Preserves context across view state changes
 */
const BaseLayout: React.FC<BaseLayoutProps> = ({ children }) => {
  const { viewState, layoutConfig } = useViewState();
  const { user, profile } = useAuth();
  const location = useLocation();
  const [isTestGuideOpen, setIsTestGuideOpen] = useState(false);
  const [isFeedbackFormOpen, setIsFeedbackFormOpen] = useState(false);

  // DIA Sprint 4B: Initialize periodic checks for authenticated users
  useEffect(() => {
    if (user?.id) {
      const cleanup = initDIAPeriodicChecks(user.id);
      return cleanup;
    }
  }, [user?.id]);

  // Check if we're on Connect route on mobile (has its own header)
  const isConnectRoute = location.pathname.includes('/dna/connect');

  // Unique gradient for each of the 5 Cs + Feed when logged in
  // All using DNA brand colors: mint, terra, ochre, sunset, purple, copper
  const getAuthGradient = () => {
    if (!user) return "bg-background";

    const path = location.pathname;

    // Feed - DNA mint green
    if (path.includes('/feed')) {
      return "bg-gradient-to-br from-dna-mint/20 via-background to-dna-mint/10";
    }

    // Connect - Cultural warmth (terra/ochre)
    if (path.includes('/connect') || path.includes('/network') || path.includes('/discover')) {
      return "bg-gradient-to-br from-dna-terra/15 via-background to-dna-ochre/10";
    }

    // Convene - Sunset celebration (orange/purple)
    if (path.includes('/convene') || path.includes('/events')) {
      return "bg-gradient-to-br from-dna-sunset/15 via-background to-dna-purple/10";
    }

    // Collaborate - Earth to mint (terra/mint growth)
    if (path.includes('/collaborate') || path.includes('/spaces')) {
      return "bg-gradient-to-br from-dna-terra/15 via-background to-dna-mint/10";
    }

    // Contribute - Copper warmth (copper/ochre)
    if (path.includes('/contribute') || path.includes('/impact') || path.includes('/opportunities')) {
      return "bg-gradient-to-br from-dna-copper/15 via-background to-dna-ochre/10";
    }

    // Convey - Royal storytelling (purple/sunset)
    if (path.includes('/convey')) {
      return "bg-gradient-to-br from-dna-purple/15 via-background to-dna-sunset/10";
    }

    // Default - DNA mint green
    return "bg-gradient-to-br from-dna-mint/20 via-background to-dna-copper/10";
  };

  return (
    <>
      <UnifiedHeader />
      <AccountDrawer />
      <PulseBar />
      <div
        className={cn(
          "min-h-screen w-full max-w-full",
          getAuthGradient(),
          // Remove top padding on mobile for Connect routes (has its own header)
          isConnectRoute ? "pt-0 md:pt-14 md:sm:pt-16" : "pt-14 sm:pt-16",
          // Add bottom padding on mobile to account for PulseDock
          "pb-20 lg:pb-0",
          "transition-all duration-300 ease-in-out",
          "overflow-x-hidden"
        )}
        data-view-state={viewState}
        data-layout-type={layoutConfig.type}
      >
        {/* Alpha Welcome Banner - hidden on mobile feed (has its own layout) */}
        {FEATURE_FLAGS.isAlphaTest && user && (
          <div className="px-3 pt-2 sm:px-4 sm:pt-4 hidden sm:block [body:has([data-mobile-feed='true'])_&]:hidden">
            <AlphaWelcomeBanner
              testerName={profile?.first_name ?? profile?.full_name ?? 'Tester'}
              onOpenTestGuide={() => setIsTestGuideOpen(true)}
              onOpenFeedback={() => setIsFeedbackFormOpen(true)}
            />
          </div>
        )}
        {children}
      </div>
      {/* Sprint 12: FeedbackFAB and AlphaFeedbackButton removed —
          Feedback Hub is now accessible from header icon */}
      <PulseDock />

      {/* Profile Completion Guide - Sprint 12B */}
      {user && <ProfileCompletionGuide />}

      {/* Alpha Testing Infrastructure */}
      {FEATURE_FLAGS.isAlphaTest && user && (
        <>
          <AlphaTestGuide
            isOpen={isTestGuideOpen}
            onClose={() => setIsTestGuideOpen(false)}
            onOpenFeedback={() => {
              setIsTestGuideOpen(false);
              setIsFeedbackFormOpen(true);
            }}
          />
          <AlphaFeedbackForm
            isOpen={isFeedbackFormOpen}
            onClose={() => setIsFeedbackFormOpen(false)}
          />
        </>
      )}
    </>
  );
};

export default BaseLayout;
