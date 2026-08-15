/**
 * BD558 — the mobile offset above event content has exactly ONE owner.
 *
 * ── The defect this certifies against ─────────────────────────────────────
 * On mobile, /dna/convene/events/* renders ConveneShell → DnaMobileHubShell,
 * which offsets its content by the fixed header's MEASURED height (top bar +
 * tabs row, ResizeObserver). BaseLayout ALSO rendered its own aria-hidden
 * spacer at `var(--total-header-height)` on those routes, because its Convene
 * entry matched the hub with `===` and no sub-route ever hit it. UnifiedHeader
 * self-hides across the whole /dna/convene subtree on mobile, so that spacer
 * reserved space for a header that is not in the tree: a stale token-sized band
 * stacked on top of a live measurement. Visible as a large empty gap between
 * the pinned tab row and the first content element ("Back to Events").
 *
 * ── Why the className, not a computed height ──────────────────────────────
 * jsdom applies no Tailwind, so `hidden sm:block` hides nothing here and a
 * measured height would read the same in both states. The class IS the
 * mechanism — `hidden sm:block` stands the spacer down below `sm` and keeps it
 * on desktop; plain `block` reserves at every width. So the class is what this
 * gate reads, and a regression that flips the route back to `===` fails here.
 *
 * ── Why every role ────────────────────────────────────────────────────────
 * The gap was reported on the management view, so it would be easy to "fix" it
 * only where a tabs row exists. The reservation is chrome-level and entirely
 * role-independent, so a plain Event-goer (tabs={null}) had the same gap. Each
 * persona is mounted the way production mounts it — real ConveneShell, real
 * DnaMobileHubShell, real SectionNav filtered by that role — and asserted to
 * carry one header and no second reservation.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import * as React from 'react';

// ── Breakpoint, flipped per assertion ──────────────────────────────────────
let mockIsMobile = true;
vi.mock('@/hooks/useMobile', () => ({
  useMobile: () => ({ isMobile: mockIsMobile }),
  useIsMobile: () => mockIsMobile,
}));

// ── Chrome leaves and BaseLayout's own dependencies, stubbed to nothing ─────
vi.mock('@/components/UnifiedHeader', () => ({
  default: () => (mockIsMobile ? null : <header data-unified-header />),
}));
vi.mock('@/components/pulse', () => ({
  PulseBar: () => null,
  PulseDock: () => null,
}));
vi.mock('@/components/notifications/UnifiedNotificationBell', () => ({
  UnifiedNotificationBell: () => <button aria-label="Notifications" />,
}));
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
vi.mock('@/contexts/ComposerContext', () => ({
  useUniversalComposer: () => ({ open: () => {} }),
}));

import BaseLayout from '@/layouts/BaseLayout';
import { ConveneShell } from '@/components/convene/ConveneShell';
import { SectionNav } from '@/components/shell/SectionNav';
import { EVENT_MANAGE_NAV } from '@/pages/dna/convene/EventDetail';

const EVENT_PATH = '/dna/convene/events/lagos-tech-mixer';

/**
 * The five personas that reach the event surface. `tabs` is exactly what
 * EventDetail computes: a SectionNav for anyone with management access
 * (hasManagementAccess), null for a plain attendee.
 */
const PERSONAS: Array<{ name: string; role: string; tabCount: number }> = [
  { name: 'Manager', role: 'manager', tabCount: 7 },
  { name: 'Organizer', role: 'organizer', tabCount: 6 },
  { name: 'Promoter', role: 'promoter', tabCount: 3 },
  { name: 'Check-in Staff', role: 'check-in', tabCount: 1 },
  { name: 'Event-goer', role: 'none', tabCount: 0 },
];

function renderEventSurface(role: string, path = EVENT_PATH) {
  const hasManagementAccess = role !== 'none';
  return render(
    <MemoryRouter initialEntries={[path]}>
      <BaseLayout>
        <ConveneShell
          showBottomNav={false}
          tabs={hasManagementAccess ? <SectionNav items={EVENT_MANAGE_NAV} userRole={role} /> : null}
        >
          <div data-testid="event-content">Back to Events</div>
        </ConveneShell>
      </BaseLayout>
    </MemoryRouter>,
  );
}

const spacerOf = (container: HTMLElement) =>
  container.querySelector<HTMLElement>('[data-chrome-spacer]');

beforeEach(() => {
  mockIsMobile = true;
});

describe('BD558 — one mobile reservation above event content', () => {
  for (const persona of PERSONAS) {
    describe(persona.name, () => {
      it('at 390 BaseLayout reserves no second header band', () => {
        mockIsMobile = true;
        const { container } = renderEventSurface(persona.role);

        // The spacer stands down below `sm`. `block` here is the phantom band.
        const spacer = spacerOf(container);
        expect(spacer).not.toBeNull();
        expect(spacer!.className).toContain('hidden');
        expect(spacer!.className).not.toMatch(/(^|\s)block(\s|$)/);
      });

      it('at 390 the shell still owns the one fixed header, tabs row included', () => {
        mockIsMobile = true;
        const { container, getByTestId } = renderEventSurface(persona.role);

        // Exactly one mobile header — the shell's. UnifiedHeader self-hides.
        expect(container.querySelectorAll('img[alt="DNA"]').length).toBe(1);
        expect(container.querySelectorAll('[data-unified-header]').length).toBe(0);

        // The tabs row rides that fixed header: same fixed top-0 container,
        // not a sibling below it. This is the BD556 placement, unchanged.
        const fixedHeader = container.querySelector('.fixed.top-0');
        expect(fixedHeader).not.toBeNull();
        const nav = fixedHeader!.querySelector('nav[aria-label="Event sections"]');
        if (persona.tabCount === 0) {
          expect(nav).toBeNull();
        } else {
          expect(nav).not.toBeNull();
          expect(nav!.querySelectorAll('a').length).toBe(persona.tabCount);
        }

        expect(getByTestId('event-content')).toBeTruthy();
      });

      it('at 1440 the reservation survives, alongside BaseLayout own header', () => {
        mockIsMobile = false;
        const { container } = renderEventSurface(persona.role);

        // The class string changes (`block` → `hidden sm:block`) but the
        // desktop RESULT must not: sm+ still reserves --total-header-height,
        // because above the breakpoint BaseLayout does render its own header
        // and DnaMobileHubShell renders children only. Desktop does not move.
        const spacer = spacerOf(container);
        expect(spacer).not.toBeNull();
        expect(spacer!.className).toContain('sm:block');
        expect(container.querySelectorAll('[data-unified-header]').length).toBe(1);
      });
    });
  }

  it('covers the nested management panes, not just the index route', () => {
    mockIsMobile = true;
    for (const pane of ['attendees', 'check-in', 'communications', 'promotion', 'team', 'analytics', 'edit']) {
      const { container, unmount } = renderEventSurface('manager', `${EVENT_PATH}/${pane}`);
      expect(spacerOf(container)!.className, `pane: ${pane}`).toContain('hidden');
      unmount();
    }
  });

  it('leaves routes with no DnaMobileHubShell reserving as before', () => {
    mockIsMobile = true;
    // /dna/convene/groups renders no mobile shell of its own, so its spacer is
    // a separate question. BD558 deliberately does not answer it.
    const { container } = render(
      <MemoryRouter initialEntries={['/dna/convene/groups']}>
        <BaseLayout>
          <div />
        </BaseLayout>
      </MemoryRouter>,
    );
    expect(spacerOf(container)!.className).toMatch(/(^|\s)block(\s|$)/);
  });
});
