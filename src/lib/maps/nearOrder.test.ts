import { describe, it, expect } from 'vitest';
import { formatDistanceM, buildNearOrdering, nearEmptyMessage, nearHeader } from './nearOrder';

describe('formatDistanceM', () => {
  it('coarsens sub-kilometre distances to 50m steps', () => {
    expect(formatDistanceM(0)).toBe('50 m');
    expect(formatDistanceM(120)).toBe('100 m');
    expect(formatDistanceM(140)).toBe('150 m');
    expect(formatDistanceM(999)).toBe('1000 m');
  });

  it('shows one decimal under 10km and whole km above', () => {
    expect(formatDistanceM(1200)).toBe('1.2 km');
    expect(formatDistanceM(9800)).toBe('9.8 km');
    expect(formatDistanceM(15400)).toBe('15 km');
  });

  it('returns empty for nonsense input', () => {
    expect(formatDistanceM(-5)).toBe('');
    expect(formatDistanceM(Number.NaN)).toBe('');
  });
});

describe('buildNearOrdering', () => {
  const events = [
    { id: 'a' },
    { id: 'b' },
    { id: 'c' },
    { id: 'd' },
  ];

  it('reorders matched events nearest-first and drops everything the RPC did not match', () => {
    const order = [
      { eventId: 'c', distanceM: 500 },
      { eventId: 'a', distanceM: 2000 },
    ];
    const { ordered, matched } = buildNearOrdering(events, order);
    expect(ordered.map((e) => e.id)).toEqual(['c', 'a']);
    expect(matched).toBe(2);
  });

  it('a non-matching event is absent from `ordered`, not merely last', () => {
    const order = [{ eventId: 'c', distanceM: 500 }];
    const { ordered } = buildNearOrdering(events, order);
    expect(ordered.map((e) => e.id)).toEqual(['c']);
    expect(ordered.find((e) => e.id === 'a')).toBeUndefined();
    expect(ordered.find((e) => e.id === 'b')).toBeUndefined();
    expect(ordered.find((e) => e.id === 'd')).toBeUndefined();
  });

  it('labels only the events the RPC placed', () => {
    const order = [{ eventId: 'b', distanceM: 1200 }];
    const { distanceLabels } = buildNearOrdering(events, order);
    expect(distanceLabels).toEqual({ b: '1.2 km' });
  });

  it('returns an empty ordering with zero matches when the RPC returned nothing', () => {
    const { ordered, matched, distanceLabels } = buildNearOrdering(events, []);
    expect(ordered).toEqual([]);
    expect(matched).toBe(0);
    expect(distanceLabels).toEqual({});
  });

  it('ignores RPC ids that are not in the loaded set', () => {
    const order = [
      { eventId: 'zzz', distanceM: 10 },
      { eventId: 'd', distanceM: 800 },
    ];
    const { ordered, matched } = buildNearOrdering(events, order);
    expect(ordered.map((e) => e.id)).toEqual(['d']);
    expect(matched).toBe(1);
  });

  it('excludes virtual events outright, even when the RPC matched one', () => {
    const withFormats = [
      { id: 'a', format: 'in_person' },
      { id: 'b', format: 'virtual' },
      { id: 'c', format: 'hybrid' },
    ];
    const order = [
      { eventId: 'a', distanceM: 100 },
      { eventId: 'b', distanceM: 50 },
      { eventId: 'c', distanceM: 200 },
    ];
    const { ordered, matched, distanceLabels } = buildNearOrdering(withFormats, order);
    expect(ordered.map((e) => e.id)).toEqual(['a', 'c']);
    expect(matched).toBe(2);
    expect(distanceLabels.b).toBeUndefined();
  });
});

describe('nearHeader', () => {
  it('names the anchor when something is near', () => {
    expect(nearHeader('device', 3)).toBe('Events near you');
    expect(nearHeader('declared', 1)).toBe('Near your saved location');
    expect(nearHeader('chapter', 2)).toBe('Near your chapter');
  });

  it('falls back to an honest empty header with no anchor or no matches', () => {
    expect(nearHeader('none', 0)).toBe('Nothing near you yet');
    expect(nearHeader('device', 0)).toBe('Nothing near you yet');
  });
});

describe('nearEmptyMessage', () => {
  it('names the radius and the resolved anchor', () => {
    expect(nearEmptyMessage('declared', 'Los Angeles', 250_000)).toBe(
      'No events within 250km of Los Angeles.',
    );
  });

  it('falls back to a generic anchor label when none is resolved', () => {
    expect(nearEmptyMessage('device', null, 250_000)).toBe(
      'No events within 250km of your location.',
    );
    expect(nearEmptyMessage('declared', null, 250_000)).toBe(
      'No events within 250km of your saved location.',
    );
    expect(nearEmptyMessage('chapter', null, 250_000)).toBe(
      'No events within 250km of your chapter.',
    );
  });

  it('asks for location instead of naming a bound when there is no anchor at all', () => {
    expect(nearEmptyMessage('none', null, 250_000)).toBe(
      'Turn on location to see events near you.',
    );
  });
});
