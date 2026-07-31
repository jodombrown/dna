import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import type { PulseSlice } from '@/types/right-rail';
import type { FiveCsPulseResult } from '@/hooks/useFiveCsPulse';

// --- Mocks ------------------------------------------------------------------

vi.mock('@/contexts/AuthContext', () => ({
  useAuth: () => ({ user: { id: 'user-1' } }),
}));

// Controllable stand-in for the pulse hook. Each test sets `pulseResult`.
let pulseResult: FiveCsPulseResult;
vi.mock('@/hooks/useFiveCsPulse', () => ({
  useFiveCsPulse: () => pulseResult,
  usePulseBreakdown: () => ({ data: [], isLoading: false }),
  useUserPulseTotals: () => ({ data: undefined }),
}));

import { PulseCompass } from './PulseCompass';

const slice = (
  c_module: PulseSlice['c_module'],
  event_count: number,
  all_time_count: number,
): PulseSlice => ({
  c_module,
  event_count,
  unique_users: event_count > 0 ? 1 : 0,
  delta_vs_prior_period: 0,
  all_time_count,
});

const renderCompass = () =>
  render(
    <MemoryRouter>
      <PulseCompass />
    </MemoryRouter>,
  );

/** The legend row whose accessible name starts with the pillar label. */
const legendRow = (label: string): HTMLElement => {
  const legend = screen.getByTestId('pulse-legend');
  const btn = within(legend)
    .getAllByRole('button')
    .find((b) => b.getAttribute('aria-label') === `${label} stats`);
  if (!btn) throw new Error(`no legend row for ${label}`);
  return btn;
};

describe('PulseCompass — no dead number renders', () => {
  // Realistic ~20-member day: Convene had one action in the window and has a
  // history; Contribute has never had any activity at all.
  const twentyMemberDay: FiveCsPulseResult = {
    data: [
      slice('connect', 0, 9),
      slice('convene', 1, 14),
      slice('collaborate', 0, 3),
      slice('contribute', 0, 0),
      slice('convey', 0, 5),
    ],
    isLoading: false,
    isError: false,
    hasTotals: true,
  };

  it('contribute (zero ever) renders the invitation, not a number', () => {
    pulseResult = twentyMemberDay;
    renderCompass();

    const row = legendRow('Contribute');
    expect(within(row).getByText('No one has opened a need yet.')).toBeInTheDocument();
    // No bare "0" anywhere in the row.
    expect(row).not.toHaveTextContent(/\b0\b/);
  });

  it('convene (activity this window) renders the window count AND the all-time total', () => {
    pulseResult = twentyMemberDay;
    renderCompass();

    const row = legendRow('Convene');
    expect(row).toHaveTextContent('1 today');
    expect(row).toHaveTextContent('14 all time');
    // It is a count, not the invitation.
    expect(within(row).queryByText(/^No one has/)).toBeNull();
  });

  it('a dormant pillar (history but nothing this window) shows the total, framed — never a bare 0', () => {
    pulseResult = twentyMemberDay;
    renderCompass();

    const row = legendRow('Connect'); // 0 this window, 9 all time
    expect(row).toHaveTextContent('9 all time');
    // The zero is framed by "today · … all time", never a lone "0".
    expect(within(row).queryByText('0')).toBeNull();
  });

  it('loading is distinguishable from a genuine zero — no legend, no invitation', () => {
    pulseResult = { data: [], isLoading: true, isError: false, hasTotals: false };
    renderCompass();

    expect(screen.queryByTestId('pulse-legend')).toBeNull();
    expect(screen.queryByText(/^No one has/)).toBeNull();
    expect(screen.queryByText('Take your first action to start your pulse')).toBeNull();
  });

  it('unresolved totals never render the "no one ever" invitation (would be a false claim)', () => {
    pulseResult = {
      data: [slice('contribute', 0, 0), slice('convene', 0, 0)],
      isLoading: false,
      isError: true,
      hasTotals: false, // totals query errored — all-time unknown
    };
    renderCompass();

    expect(screen.queryByText(/^No one has/)).toBeNull();
    // Degrades to words, not a bare 0.
    const row = legendRow('Contribute');
    expect(row).toHaveTextContent('None today');
  });

  it('never hides an empty pillar — all five Cs are always listed', () => {
    pulseResult = twentyMemberDay;
    renderCompass();

    const legend = screen.getByTestId('pulse-legend');
    ['Connect', 'Convene', 'Collaborate', 'Contribute', 'Convey'].forEach((label) => {
      expect(
        within(legend)
          .getAllByRole('button')
          .some((b) => b.getAttribute('aria-label') === `${label} stats`),
      ).toBe(true);
    });
  });
});
