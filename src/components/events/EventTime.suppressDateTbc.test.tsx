/**
 * BD230: the undated discovery lane's header already says "Dates not yet
 * announced". A card inside it must not repeat that string in its date slot.
 * suppressDateTbc is how the section tells the card to stay silent — the card
 * never infers this from context, it is told.
 */
import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { EventTime } from '@/components/events/EventTime';
import { DATES_TBA } from '@/lib/events/eventTime';

const UNDATED = { start_time: null, time_confirmed: null, date_confirmed: false };

describe('EventTime · suppressDateTbc', () => {
  it('renders the TBA label for an undated event by default', () => {
    const { container } = render(
      <EventTime event={UNDATED} variant="compact" notifyAction={false} />
    );
    expect(container.textContent).toContain(DATES_TBA);
  });

  it('renders nothing when the section already owns the TBA copy', () => {
    const { container } = render(
      <EventTime event={UNDATED} variant="compact" notifyAction={false} suppressDateTbc />
    );
    expect(container.textContent).toBe('');
  });
});
