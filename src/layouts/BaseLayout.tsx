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
import { ChromeOwnerProvider, useChromeOwner } from '@/layouts/ChromeOwnerContext';

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
const BaseLayoutChrome: React.FC<BaseLayoutProps> = ({ children }) => {
  const accountActions = useAccountActions();
  const { viewState, layoutConfig } = useViewState();
  const { user, profile } = useAuth();
  const location = useLocation();

  // BD110: a route on AppShell claims chrome ownership, and while it holds the
  // claim BaseLayout renders NONE of its own chrome (and reserves no space for
  // it). Ownership is by claim, never by route — there is no path list here.
  const { claimed } = useChromeOwner();

  // Phase 20A: silently re-register push subscription if permission already granted
  useAutoRegisterPush();

  // DIA Sprint 4B: Initialize periodic checks for authenticated users
  useEffect(() => {
    if (user?.id) {
      const cleanup = initDIAPeriodicChecks(user.id);
      return cleanup;
    }
  }, [user?.id]);

  // Routes that render their own mobile header (a DnaMobileHubShell inside the
  // page) hide BaseLayout's mobile spacer. Connect renders DnaMobileHubShell
  // directly (not through AppShell), so it never CLAIMS chrome ownership: without
  // it in this list BaseLayout kept reserving --total-header-height on mobile,
  // which is the phantom band that sat between the Connect lens bar and the first
  // member card on /dna/connect/discover.
  const isFeedRoute = location.pathname.includes('/dna/feed');
  const isConnectRoute = location.pathname.startsWith('/dna/connect');
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
      {!claimed && <UnifiedHeader />}
      {!claimed && <PulseBar />}
      <div
        className={cn(
          "min-h-dvh w-full max-w-full relative",
          // R1: one ground at every route. The per-C auth gradients are retired;
          // every route now sits on --background with a single heritage texture
          // (the CulturalPattern overlay below), never a route-specific gradient.
          "bg-background",
          // bottom padding for PulseDock, which renders only below 768 (useMobile), so the
          // clearance must clear at md, not lg.
          "pb-20 md:pb-0",
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
        {/* Spacer div that reads CSS vars for top padding. It reserves space
            for BaseLayout's OWN chrome, so it stands down with that chrome when
            an AppShell route has claimed ownership — the claiming shell brings
            its own header and its own top spacing. */}
        {!claimed && (
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
        )}
        {children}
      </div>
      {/* Feedback FAB - side chevron on all /dna routes */}
      <FeedbackFAB onOpen={accountActions.onFeedback} />
      {!claimed && <PulseDock />}

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

/**
 * BaseLayout provides the ChromeOwnerContext so a route rendered in `children`
 * (via AppShell) can claim chrome ownership, and BaseLayoutChrome — inside the
 * provider — reads the claim to decide whether to render its own chrome.
 */
const BaseLayout: React.FC<BaseLayoutProps> = ({ children }) => (
  <ChromeOwnerProvider>
    <BaseLayoutChrome>{children}</BaseLayoutChrome>
  </ChromeOwnerProvider>
);

export default BaseLayout;
