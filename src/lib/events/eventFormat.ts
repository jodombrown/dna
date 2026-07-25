// The ONE formatter for an event's format enum.
//
// public.events.format is the enum 'in_person' | 'virtual' | 'hybrid'.
// Rendered raw through Tailwind's `capitalize`, 'in_person' reached members
// as "In_person" — the first letter uppercased, the underscore untouched
// (BD228). Hand-written labels elsewhere had already drifted apart:
// "In person", "In-Person", "in person". Every surface that shows the
// format label now goes through formatEventFormat, so the mapping lives in
// exactly one place and cannot disagree with itself.

export type EventFormat = 'in_person' | 'virtual' | 'hybrid';

const FORMAT_LABELS: Record<EventFormat, string> = {
  in_person: 'In person',
  virtual: 'Virtual',
  hybrid: 'Hybrid',
};

/**
 * Map an event format enum to its display label. null / undefined / '' →
 * '' (a surface renders nothing rather than a stray label). An unrecognised
 * value is humanised — underscores to spaces, first letter up — so a future
 * enum member can never leak as a raw "some_value" the way in_person did.
 */
export function formatEventFormat(format?: string | null): string {
  if (!format) return '';
  const known = FORMAT_LABELS[format as EventFormat];
  if (known) return known;
  const humanized = format.replace(/_/g, ' ').trim();
  return humanized ? humanized.charAt(0).toUpperCase() + humanized.slice(1) : '';
}
