/**
 * AppShell — the desktop chrome contract, tested by rendering it (BD109).
 *
 * Frame 01 makes four claims that a read of the code cannot prove:
 *   1. On a route the shell renders the app header and the C nav.
 *   2. Inside a 448px drawer panel it renders NEITHER — zero route-only chrome,
 *      the same invariant PageFrame holds (BD135 rule 5).
 *   3. A surface that supplies no `related` gets a grid with no right (340)
 *      track — the track is DROPPED, not rendered empty.
 *   4. No branch of the shell renders a min-h-screen; the shell owns height.
 *
 * The chrome components need auth + query providers the real tree would supply;
 * here they are stubbed to landmarks so the test is about what the shell RENDERS,
 * not about provider plumbing — the same choice panelChrome.test.tsx makes.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import * as React from 'react';
import { IdentitySheetContext } from '@/components/ui/settings-kit';

vi.mock('@/components/UnifiedHeader', () => ({
  default: () => <header data-testid="app-header">app header</header>,
}));

vi.mock('@/components/pulse', () => ({
  PulseBar: () => <nav data-testid="c-nav">c nav</nav>,
  PulseDock: () => <nav data-testid="pulse-dock">pulse dock</nav>,
}));

// The mobile branch reuses DnaMobileHubShell's header treatment. This unit test
// is about which branch AppShell renders, not the hub shell's internals (those
// have their own suite), so it is stubbed to a landmark that surfaces children.
vi.mock('@/components/mobile/DnaMobileHubShell', () => ({
  DnaMobileHubShell: ({
    bubble,
    children,
  }: {
    bubble: { kind: string; placeholder?: string };
    children: React.ReactNode;
  }) => (
    <div data-testid="mobile-hub-shell" data-bubble={bubble.kind}>
      {children}
    </div>
  ),
}));

// Breakpoint is switched per-test through this mutable flag.
let mockIsMobile = false;
vi.mock('@/hooks/useMobile', () => ({
  useMobile: () => ({ isMobile: mockIsMobile }),
  useIsMobile: () => mockIsMobile,
}));

import { AppShell } from '@/layouts/AppShell';
import type { DnaMobileHeaderBubble } from '@/components/mobile/DnaMobileHeader';

const panelContext = { push: () => {}, pop: () => {}, close: () => {} };

// Every AppShell now takes the mobile header bubble (the one per-surface piece
// of the mobile chrome the shell owns). A fixed stub keeps these desktop/panel
// cases focused on the grid.
const BUBBLE: DnaMobileHeaderBubble = { kind: 'search', placeholder: 'Search…' };

function renderOnRoute(node: React.ReactNode) {
  return render(<MemoryRouter>{node}</MemoryRouter>);
}

function renderInPanel(node: React.ReactNode) {
  return render(
    <MemoryRouter>
      <IdentitySheetContext.Provider value={panelContext}>{node}</IdentitySheetContext.Provider>
    </MemoryRouter>,
  );
}

/** The grid is the only element carrying an explicit grid-template-columns. */
function gridColumns(container: HTMLElement): string {
  const grid = container.querySelector<HTMLElement>('.grid');
  return grid?.style.gridTemplateColumns ?? '';
}

beforeEach(() => {
  mockIsMobile = false;
});

describe('AppShell — route context', () => {
  it('renders the header and the C nav on a desktop route', () => {
    const c = renderOnRoute(<AppShell bubble={BUBBLE}><p>surface</p></AppShell>);
    expect(screen.getByTestId('app-header')).toBeTruthy();
    expect(screen.getByTestId('c-nav')).toBeTruthy();
    expect(screen.getByText('surface')).toBeTruthy();
    // The shell owns height; no branch reaches for a full-viewport frame.
    expect(c.container.querySelector('.min-h-screen')).toBeNull();
  });

  it('drops the right (340) track when no `related` is supplied', () => {
    const c = renderOnRoute(<AppShell bubble={BUBBLE} context={<p>filters</p>}><p>surface</p></AppShell>);
    const cols = gridColumns(c.container);
    expect(cols).toContain('280px'); // left rail present (context supplied)
    expect(cols).not.toContain('340px'); // right rail track absent, not empty
    // And nothing rendered the related content, because there was none.
    expect(screen.queryByText('related')).toBeNull();
  });

  it('adds the right (340) track only when `related` is supplied', () => {
    const c = renderOnRoute(
      <AppShell bubble={BUBBLE} context={<p>filters</p>} related={<p>related</p>}>
        <p>surface</p>
      </AppShell>,
    );
    const cols = gridColumns(c.container);
    expect(cols).toContain('280px');
    expect(cols).toContain('340px');
    expect(screen.getByText('related')).toBeTruthy();
  });

  it('drops the left (280) track when no `context` is supplied', () => {
    const c = renderOnRoute(<AppShell bubble={BUBBLE}><p>surface</p></AppShell>);
    const cols = gridColumns(c.container);
    expect(cols).not.toContain('280px');
    expect(cols).not.toContain('340px');
    expect(cols).toContain('1fr');
  });
});

describe('AppShell — panel context (BD135 rule 5)', () => {
  it('renders zero route-only chrome inside a 448px drawer panel', () => {
    const c = renderInPanel(<AppShell bubble={BUBBLE} context={<p>ctx</p>} related={<p>rel</p>}><p>surface</p></AppShell>);
    // The surface content is still there…
    expect(screen.getByText('surface')).toBeTruthy();
    // …but none of the route-only set is: no header, no C nav, no full frame.
    expect(c.container.querySelectorAll('header').length).toBe(0);
    expect(screen.queryByTestId('app-header')).toBeNull();
    expect(screen.queryByTestId('c-nav')).toBeNull();
    expect(c.container.querySelector('.min-h-screen')).toBeNull();
  });
});

describe('AppShell — mobile', () => {
  it('renders the mobile hub-shell header + content + PulseDock, and NO UnifiedHeader or desktop C nav', () => {
    mockIsMobile = true;
    renderOnRoute(<AppShell bubble={BUBBLE}><p>surface</p></AppShell>);
    // The mobile branch renders the canonical hub-shell chrome, not UnifiedHeader.
    expect(screen.getByTestId('mobile-hub-shell')).toBeTruthy();
    expect(screen.getByText('surface')).toBeTruthy();
    expect(screen.getByTestId('pulse-dock')).toBeTruthy();
    // UnifiedHeader (the self-hiding one) never renders on mobile here…
    expect(screen.queryByTestId('app-header')).toBeNull();
    // …and neither does the desktop C-nav track.
    expect(screen.queryByTestId('c-nav')).toBeNull();
  });

  it('folds the rails BENEATH the well: content, then context, then related', () => {
    mockIsMobile = true;
    renderOnRoute(
      <AppShell bubble={BUBBLE} context={<p>the-filters</p>} related={<p>the-related</p>}>
        <p>the-well</p>
      </AppShell>,
    );
    const shell = screen.getByTestId('mobile-hub-shell');
    const text = shell.textContent ?? '';
    // Order is positional: the well (LensBar's home) first, filters next, related last.
    expect(text.indexOf('the-well')).toBeGreaterThanOrEqual(0);
    expect(text.indexOf('the-well')).toBeLessThan(text.indexOf('the-filters'));
    expect(text.indexOf('the-filters')).toBeLessThan(text.indexOf('the-related'));
  });
});
