/**
 * DnaMobileHubShell snapshot + structural regression test.
 *
 * Locks in the shared mobile chrome for /dna/* hubs:
 *  - fixed top-0 header container (z-50, bg-background)
 *  - collapsible top bar row (hide-on-scroll target)
 *  - optional always-visible tabs row directly beneath the top bar
 *  - min-h-screen + pb-bottom-nav content wrapper (PulseDock, mounted
 *    globally in BaseLayout, is the sole mobile bottom nav)
 */
import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

vi.mock('@/hooks/useMobile', () => ({
  useMobile: () => ({ isMobile: true }),
}));

vi.mock('@/hooks/useMobileHeaderHeight', () => ({
  useMobileHeaderHeight: () => 96,
}));

vi.mock('@/hooks/useScrollDirection', () => ({
  useScrollDirection: () => ({ isScrollingDown: false, isAtTop: true }),
}));

vi.mock('@/components/mobile/DnaMobileHeader', () => ({
  DnaMobileHeader: ({ bubble }: { bubble: { kind: string; placeholder?: string } }) => (
    <div data-testid="dna-mobile-header" data-bubble={bubble.kind}>
      {bubble.placeholder ?? ''}
    </div>
  ),
}));

import { DnaMobileHubShell } from '@/components/mobile/DnaMobileHubShell';

describe('DnaMobileHubShell', () => {
  it('renders the canonical fixed top bar, tabs slot, and content', () => {
    const { container, getByTestId, getByText } = render(
      <MemoryRouter>
        <DnaMobileHubShell
          bubble={{ kind: 'static', placeholder: 'Discover' }}
          tabs={<div data-testid="hub-tabs">Tabs</div>}
        >
          <main>Body</main>
        </DnaMobileHubShell>
      </MemoryRouter>,
    );

    // Header + tabs present.
    expect(getByTestId('dna-mobile-header')).toBeInTheDocument();
    expect(getByTestId('hub-tabs')).toBeInTheDocument();
    expect(getByText('Body')).toBeInTheDocument();

    // Fixed header wrapper carries the expected chrome classes.
    const fixed = container.querySelector('div.fixed.top-0.left-0.right-0.z-50');
    expect(fixed).not.toBeNull();

    // Outer scroll container reserves bottom-nav space and clips overflow-x.
    const outer = container.firstChild as HTMLElement;
    expect(outer.className).toMatch(/min-h-screen/);
    expect(outer.className).toMatch(/pb-bottom-nav/);
    expect(outer.className).toMatch(/overflow-x-hidden/);

    // Snapshot the whole tree so future JSX/layout changes are surfaced.
    expect(container).toMatchSnapshot();
  });
});
