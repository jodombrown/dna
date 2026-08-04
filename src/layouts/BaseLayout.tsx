import React, { useEffect, useState } from 'react';
import { useViewState } from '@/contexts/ViewStateContext';
import { useAuth } from '@/contexts/AuthContext';
import { useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import UnifiedHeader from '@/components/UnifiedHeader';
import { PulseBar, PulseDock } from '@/components/pulse';
import { initDIAPeriodicChecks } from '@/services/dia/diaPeriodicCheck';
import { FEATURE_FLAGS } from '@/config/featureFlags';
import { AlphaWelcomeBanner } from '@/components/alpha/AlphaWelcomeBanner';
import { ProfileCompletionGuide } from '@/components/onboarding/ProfileCompletionGuide';
import { FeedbackFAB } from '@/components/feedback/FeedbackFAB';
import { useAccountActions } from '@/contexts/AccountActionsContext';
import { useAutoRegisterPush } from '@/hooks/messaging/useAutoRegisterPush';
import { CulturalPattern } from '@/components/shared/CulturalPattern';

// Phase 16 - lazy global: morning brief banner only on /dna/feed for authed users.
const MorningBriefBanner = React.lazy(() =>
  import('@/components/pulse/MorningBriefBanner').then((m) => ({ default: m.MorningBriefBanner })),
);

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
  const accountActions = useAccountActions();
  const { viewState, layoutConfig } = useViewState();
  const { user, profile } = useAuth();
  const location = useLocation();

  // Phase 20A: silently re-register push subscription if permission already granted
  useAutoRegisterPush();

  // DIA Sprint 4B: Initialize periodic checks for authenticated users
  useEffect(() => {
    if (user?.id) {
      const cleanup = initDIAPeriodicChecks(user.id);
      return cleanup;
    }
  }, [user?.id]);

  // Check if we're on routes that manage their own mobile headers
  const isConnectRoute = location.pathname.includes('/dna/connect');
  const isFeedRoute = location.pathname.includes('/dna/feed');
  const isConveneHubRoute = location.pathname === '/dna/convene';
  const isContributeHubRoute = location.pathname === '/dna/contribute';
  const isConveyHubRoute = location.pathname === '/dna/convey';
  const isCollaborateHubRoute = location.pathname === '/dna/collaborate';
  const hasCustomMobileHeader =
    isFeedRoute ||
    isConnectRoute ||
    isConveneHubRoute ||
    isContributeHubRoute ||
    isConveyHubRoute ||
    isCollaborateHubRoute;

  return (
    <>
      <UnifiedHeader />
      <PulseBar />
      <div
        className={cn(
          "min-h-dvh w-full max-w-full relative",
          // R1: one ground at every route. The per-C auth gradients are retired;
          // every route now sits on --background with a single heritage texture
          // (the CulturalPattern overlay below), never a route-specific gradient.
          "bg-background",
          // Add bottom padding on mobile to account for PulseDock
          "pb-20 lg:pb-0",
          "transition-colors duration-300 ease-in-out",
          "overflow-x-hidden"
        )}
        style={{
          // Dynamic top padding from measured header heights
          // Skip mobile padding on feed/connect — they manage their own fixed headers
          paddingTop: hasCustomMobileHeader
            ? undefined  // mobile: managed by useMobileHeaderHeight; desktop handled below
            : undefined, // set below for all cases
        }}
        data-view-state={viewState}
        data-layout-type={layoutConfig.type}
      >
        {/* R1: the only page-level texture. One heritage pattern at 4% opacity
            over --background, replacing the six route-specific auth gradients.
            pointer-events-none and aria-hidden inside CulturalPattern. */}
        <CulturalPattern pattern="adinkra" opacity={0.04} />
        {/* Spacer div that reads CSS vars for top padding */}
        <div
          aria-hidden
          style={{
            // Always reserve space for header + pulse bar to prevent columns
            // rendering behind the PulseBar before the measurement hook runs.
            // Mobile pages with custom headers hide this spacer via the className.
            // BD361: read --total-header-height instead of re-summing its two
            // terms by hand. That token IS the sum of the header and the pulse
            // bar (index.css), so one edit there moves every reservation at once.
            height: 'var(--total-header-height, 7.5rem)',
          }}
          className={cn(
            hasCustomMobileHeader ? 'hidden sm:block' : 'block',
          )}
        />
        {children}
      </div>
      {/* Feedback FAB - side chevron on all /dna routes */}
      <FeedbackFAB onOpen={accountActions.onFeedback} />
      <PulseDock />

      {/* Phase 16 - DIA Morning brief (gated to /dna/feed inside the component) */}
      {user && location.pathname.startsWith('/dna/feed') && (
        <React.Suspense fallback={null}>
          <MorningBriefBanner />
        </React.Suspense>
      )}

      {/* Profile Completion Guide - Sprint 12B */}
      {user && <ProfileCompletionGuide />}

      {/*
        DR1 step 6 (DR0 defects 5 and 6): FeedbackDrawer and AlphaTestGuide are
        mounted ONCE, by AccountActionsProvider at app root. They used to be
        mounted here AND inside AccountDrawer, each with its own isOpen, and the
        Account-side AlphaTestGuide bypassed the alpha flag. Triggers on this
        layout now route to the single owner.
      */}
    </>
  );
};

export default BaseLayout;
