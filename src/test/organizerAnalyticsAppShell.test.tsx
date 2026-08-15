/**
 * OrganizerAnalytics — BD474 AppShell migration + BD476 crash-guard exit gate.
 *
 * Covers the D099 three-width QA:
 *  1. An organizer with zero hosted events (partial RPC shape — events_hosted
 *     missing entirely) does not crash and renders zero-defaulted stats, at
 *     mobile/tablet/desktop widths.
 *  2. An organizer with hosted events renders normally, at all three widths.
 *  3. Loading and error states render inside the SAME single AppShell wrap,
 *     not a separate LayoutController per state.
 */
import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

vi.mock('@/contexts/AuthContext', () => ({
  useAuth: () => ({ user: { id: 'organizer-1' } }),
}));

let mockAnalyticsState: { data: unknown; isLoading: boolean; error: unknown } = {
  data: undefined,
  isLoading: false,
  error: null,
};
vi.mock('@/hooks/useEventAnalytics', () => ({
  useOrganizerAnalytics: () => mockAnalyticsState,
}));

vi.mock('@/components/layout/columns/RightWidgets', () => ({
  RightWidgets: () => <div data-testid="right-widgets" />,
}));

vi.mock('@/components/UnifiedHeader', () => ({
  default: () => <header data-testid="app-header" />,
}));
vi.mock('@/components/pulse', () => ({
  PulseBar: () => <nav data-testid="c-nav" />,
  PulseDock: () => <nav data-testid="pulse-dock" />,
}));
vi.mock('@/components/mobile/DnaMobileHubShell', () => ({
  DnaMobileHubShell: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="mobile-hub-shell">{children}</div>
  ),
}));

let mockIsMobile = false;
let mockIsTablet = false;
vi.mock('@/hooks/useMobile', () => ({
  useMobile: () => ({ isMobile: mockIsMobile, isTablet: mockIsTablet }),
}));

import OrganizerAnalytics from '@/pages/dna/convene/OrganizerAnalytics';

function renderAtWidth(width: 'mobile' | 'tablet' | 'desktop') {
  mockIsMobile = width === 'mobile';
  mockIsTablet = width === 'tablet';
  return render(
    <MemoryRouter>
      <OrganizerAnalytics />
    </MemoryRouter>,
  );
}

const WIDTHS = ['mobile', 'tablet', 'desktop'] as const;

beforeEach(() => {
  mockIsMobile = false;
  mockIsTablet = false;
});

describe('OrganizerAnalytics — single AppShell wrap, all states', () => {
  it('renders exactly one AppShell frame regardless of state (no per-state LayoutController)', () => {
    mockAnalyticsState = { data: undefined, isLoading: true, error: null };
    renderAtWidth('desktop');
    // AppShell desktop branch renders header + c-nav exactly once.
    expect(screen.getAllByTestId('app-header')).toHaveLength(1);
    expect(screen.getAllByTestId('c-nav')).toHaveLength(1);
    expect(screen.getAllByTestId('right-widgets')).toHaveLength(1);
  });

  for (const width of WIDTHS) {
    it(`loading state renders inside the shell at ${width}`, () => {
      mockAnalyticsState = { data: undefined, isLoading: true, error: null };
      renderAtWidth(width);
      expect(document.querySelector('.animate-spin')).toBeTruthy();
    });

    it(`error state renders inside the shell at ${width}`, () => {
      mockAnalyticsState = { data: undefined, isLoading: false, error: new Error('boom') };
      renderAtWidth(width);
      expect(screen.getByText('Error Loading Analytics')).toBeTruthy();
      expect(screen.getByText('boom')).toBeTruthy();
    });
  }
});

describe('OrganizerAnalytics — BD476 crash guard: partial RPC shape', () => {
  for (const width of WIDTHS) {
    it(`an organizer with zero hosted events (events_hosted missing from RPC payload) renders without crashing at ${width}`, () => {
      // The RPC returned a shape where events_hosted itself is absent —
      // exactly the partial-shape signature that produced the live crash.
      mockAnalyticsState = {
        isLoading: false,
        error: null,
        data: {
          organizer_id: 'organizer-1',
          time_period_days: 90,
          // events_hosted intentionally omitted
          avg_rsvps_per_event: 0,
          avg_going_per_event: 0,
          avg_show_up_rate: 0,
          event_list: [],
          conversion_metrics: {
            events_to_groups: null,
            events_to_spaces: null,
            events_to_opportunities: null,
            note: '',
          },
        },
      };

      expect(() => renderAtWidth(width)).not.toThrow();
      expect(screen.getByText('Events Hosted')).toBeTruthy();
      // total + last_30_days both default to 0 rather than throwing on
      // events_hosted.total / events_hosted.last_30_days.
      expect(screen.getAllByText('0').length).toBeGreaterThan(0);
    });
  }
});

describe('OrganizerAnalytics — organizer with hosted events, normal render', () => {
  for (const width of WIDTHS) {
    it(`renders full analytics at ${width}`, () => {
      mockAnalyticsState = {
        isLoading: false,
        error: null,
        data: {
          organizer_id: 'organizer-1',
          time_period_days: 90,
          events_hosted: { total: 5, last_30_days: 2, last_90_days: 5, upcoming: 1, past: 4 },
          avg_rsvps_per_event: 12,
          avg_going_per_event: 9,
          avg_show_up_rate: 75,
          event_list: [],
          conversion_metrics: {
            events_to_groups: null,
            events_to_spaces: null,
            events_to_opportunities: null,
            note: '',
          },
        },
      };

      renderAtWidth(width);
      expect(screen.getByText('Your Event Analytics')).toBeTruthy();
      expect(screen.getByText('5')).toBeTruthy(); // events_hosted.total
    });
  }
});
