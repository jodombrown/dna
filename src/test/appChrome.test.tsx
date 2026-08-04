/**
 * BD110 detector — the app chrome has exactly ONE owner, at every width.
 *
 * ── The defect this certifies against ─────────────────────────────────────
 * Frame 01 makes the shell the sole chrome owner. Two ways that can break, both
 * live on main at the start of this frame:
 *
 *   · MISSING on mobile. UnifiedHeader self-hid on the AppShell paths, AppShell
 *     rendered UnifiedHeader on mobile, and so mobile /dna/connect rendered NO
 *     header at all — no logo, no bubble, no bell, no avatar.
 *   · DOUBLE on desktop. BaseLayout renders UnifiedHeader + PulseBar for the
 *     routes it still owns; an AppShell route renders them too. Without the
 *     claim handshake both mount, and the page carries two of each.
 *
 * ── Why this renders through BaseLayout ───────────────────────────────────
 * The double-mount is a property of BaseLayout AND AppShell being in the tree
 * together, coordinating through ChromeOwnerContext. Rendering AppShell alone
 * would make every count trivially 1 and certify nothing. So each route is
 * mounted exactly as production mounts it: inside BaseLayout, which provides the
 * context and renders its own chrome only while unclaimed.
 *
 * ── Why counts, not presence (BD110) ──────────────────────────────────────
 * Presence passes on a double mount — two headers still contain "a header". The
 * mobile assertions count the DNA logo (one per header), and the desktop
 * assertions count UnifiedHeader and PulseBar. A regression that re-introduces
 * the second mount fails here, where a presence check would stay green.
 *
 * The chrome LEAVES are stubbed to landmarks so the count is unambiguous and the
 * test needs no live auth/query stack; the mobile header (DnaMobileHeader) and
 * the hub shell around it are REAL, so the logo/bubble/bell/avatar assertions
 * are about the chrome the shell actually renders, not about a stub.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import * as React from 'react';

// ── Breakpoint, flipped per assertion ──────────────────────────────────────
let mockIsMobile = false;
vi.mock('@/hooks/useMobile', () => ({
  useMobile: () => ({ isMobile: mockIsMobile }),
  useIsMobile: () => mockIsMobile,
}));

// ── Chrome LEAVES → counting landmarks ──────────────────────────────────────
// One component each, so both BaseLayout and AppShell render the SAME element;
// the count after the claim handshake settles is the whole assertion.
vi.mock('@/components/UnifiedHeader', () => ({
  default: () => <header data-testid="unified-header" data-unified-header />,
}));
vi.mock('@/components/pulse', () => ({
  PulseBar: () => <nav data-testid="pulse-bar" />,
  PulseDock: () => <nav data-testid="pulse-dock" />,
}));
// The mobile header's bell is a leaf too (owns its own query in production).
vi.mock('@/components/notifications/UnifiedNotificationBell', () => ({
  UnifiedNotificationBell: () => <button data-testid="notif-bell" aria-label="Notifications" />,
}));

// ── BaseLayout's own dependencies, stubbed to nothing ───────────────────────
vi.mock('@/components/shared/CulturalPattern', () => ({ CulturalPattern: () => null }));
vi.mock('@/components/feedback/FeedbackFAB', () => ({ FeedbackFAB: () => null }));
vi.mock('@/components/onboarding/ProfileCompletionGuide', () => ({
  ProfileCompletionGuide: () => null,
}));
vi.mock('@/hooks/messaging/useAutoRegisterPush', () => ({ useAutoRegisterPush: () => {} }));
vi.mock('@/services/dia/diaPeriodicCheck', () => ({ initDIAPeriodicChecks: () => () => {} }));
vi.mock('@/contexts/ViewStateContext', () => ({
  useViewState: () => ({ viewState: 'default', layoutConfig: { type: 'default' } }),
}));
vi.mock('@/contexts/AccountActionsContext', () => ({
  useAccountActions: () => ({ onFeedback: () => {} }),
}));

// ── Identity, shared by BaseLayout, Connect and the mobile header ───────────
const USER = { id: 'u1', email: 'z@dna.test' };
const PROFILE = { username: 'zulu', display_name: 'Zulu', avatar_url: '' };
vi.mock('@/contexts/AuthContext', () => ({
  useAuth: () => ({ user: USER, profile: PROFILE, signOut: () => {}, loading: false }),
}));
vi.mock('@/hooks/useProfile', () => ({
  useProfile: () => ({ data: PROFILE, isLoading: false }),
}));
vi.mock('@/contexts/AccountDrawerContext', () => ({
  useAccountDrawer: () => ({ open: () => {} }),
}));
vi.mock('@/contexts/DiaSheetContext', () => ({
  useDiaSheet: () => ({ openWith: () => {} }),
}));

import BaseLayout from '@/layouts/BaseLayout';
import AppShell from '@/layouts/AppShell';

/**
 * The gate certifies AppShell's chrome contract, so it mounts AppShell directly
 * through a fixture the TEST owns rather than through a product route. No product
 * surface renders AppShell today, and the BD110 property lives in AppShell, not
 * in any one surface — so the fixture supplies exactly the four things a surface
 * hands the shell: the ONE per-surface bubble (the search bubble, whose
 * "Search members..." placeholder the mobile-header assertion reads) plus stub
 * children, stub context and stub related that add no chrome of their own.
 */
const AppShellFixture = () => (
  <AppShell
    bubble={{ kind: 'search', placeholder: 'Search members...' }}
    context={<div data-testid="fixture-context">filters</div>}
    related={<div data-testid="fixture-related">related</div>}
  >
    <div data-testid="fixture-content">content</div>
  </AppShell>
);

/**
 * Every route that renders an AppShell, mounted the way production mounts it.
 * Adding the next converted C here is the whole maintenance cost of this gate.
 */
const APP_SHELL_ROUTES: Array<{ name: string; path: string; element: React.ReactElement }> = [
  { name: 'AppShell', path: '/appshell-fixture', element: <AppShellFixture /> },
];

function renderRoute(path: string, element: React.ReactElement) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <BaseLayout>{element}</BaseLayout>
    </MemoryRouter>,
  );
}

beforeEach(() => {
  mockIsMobile = false;
});

describe('BD110 — one chrome owner across every AppShell route', () => {
  for (const route of APP_SHELL_ROUTES) {
    describe(route.name, () => {
      it('at 390 renders the DNA logo, the bubble, the bell, the avatar and the dock — each once', () => {
        mockIsMobile = true;
        const { container, getAllByTestId, getByPlaceholderText } = renderRoute(
          route.path,
          route.element,
        );

        // DNA logo — exactly one. A second header would show a second logo, so
        // this count is the double-mount guard on mobile.
        const logos = container.querySelectorAll('img[alt="DNA"]');
        expect(logos.length).toBe(1);

        // The search bubble the surface handed the shell.
        expect(getByPlaceholderText('Search members...')).toBeTruthy();

        // The bell (leaf landmark) — exactly one.
        expect(getAllByTestId('notif-bell').length).toBe(1);

        // The avatar: DnaMobileHeader's account trigger is the only
        // `span.cursor-pointer` (the logo is an <img>, the search bubble an
        // <input>). Its presence is what a headerless mobile route lacked.
        const avatars = container.querySelectorAll('span.cursor-pointer');
        expect(avatars.length).toBe(1);

        // PulseDock — exactly one, owned by the shell (BaseLayout's stands down).
        expect(getAllByTestId('pulse-dock').length).toBe(1);

        // The self-hiding UnifiedHeader never appears on mobile here.
        expect(container.querySelectorAll('[data-unified-header]').length).toBe(0);
      });

      it('at 1440 the tree holds exactly ONE UnifiedHeader and exactly ONE PulseBar', () => {
        mockIsMobile = false;
        const { getAllByTestId } = renderRoute(route.path, route.element);

        // The counts, not the presence: the claim handshake is the only reason
        // these are 1 and not 2 (BaseLayout + AppShell both render them).
        expect(getAllByTestId('unified-header').length).toBe(1);
        expect(getAllByTestId('pulse-bar').length).toBe(1);
      });
    });
  }
});
