/**
 * BD218 — `distanceLabel` is a Feature-A-owned contract on ConveneEventCard.
 *
 * The "Near Me" sort (NearMeEventsLane → DiscoveryLane) is the ONLY caller that
 * passes `distanceLabel`. That is exactly what makes it dangerous: a card
 * refactor — e.g. the EventCardFrame / EventPlate port (BD206/BD210/BD211) —
 * can drop this meta row and every OTHER Convene view stays green, so the
 * regression is invisible everywhere except the near-me sort nobody opens by
 * default. This test is that missing view. It goes red the moment the label
 * stops rendering.
 *
 * Pinned both ways on purpose:
 *   • set   → the "<distance> away" row renders (the label survives the port)
 *   • unset → nothing renders (the copper accent stays scarce; the row is gated
 *             to the near-me sort and must never leak into other lanes)
 *
 * Ledger: 🛠️ Build Decisions / BD218. The prop site in ConveneEventCard.tsx
 * carries an in-path comment pointing back here.
 */
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Hermetic: the card's import chain reaches the supabase client. Stub it so the
// test depends on nothing but the prop — no child of this render actually calls
// it (showMutualAttendees is off, the date is confirmed), so the stub is inert.
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: vi.fn(),
    rpc: vi.fn(),
    channel: vi.fn(() => ({ on: vi.fn().mockReturnThis(), subscribe: vi.fn() })),
    removeChannel: vi.fn(),
  },
}));

import { ConveneEventCard } from '@/components/convene/ConveneEventCard';

// A confirmed, far-future, location-less event renders the plain date box: no
// urgency chip ("N days away" would also match /away/), no TBA notify button,
// no location pill. The ONLY "away" / copper-MapPin row that can appear is the
// distance label under test — so an assertion on it is unambiguous.
const baseEvent = {
  id: 'evt-1',
  title: 'Diaspora Founders Mixer',
  start_time: '2027-03-15T18:00:00Z',
  date_confirmed: true,
  time_confirmed: true,
};

function renderCard(distanceLabel?: string) {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={client}>
      <MemoryRouter>
        <ConveneEventCard
          event={baseEvent}
          showMutualAttendees={false}
          distanceLabel={distanceLabel}
        />
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

describe('ConveneEventCard distanceLabel (BD218 — near-me contract)', () => {
  it('renders the "<distance> away" row when the near-me sort sets it', () => {
    renderCard('12 km');
    expect(screen.getByText(/12 km away/i)).toBeInTheDocument();
  });

  it('renders no distance row when unset (accent stays scarce outside near-me)', () => {
    renderCard(undefined);
    expect(screen.queryByText(/away/i)).toBeNull();
  });
});
