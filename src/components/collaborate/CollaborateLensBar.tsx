/**
 * Collaborate hub lens bar: the LensBar primitive (BD332) configured for the
 * Collaborate hub, used at BOTH widths. Same instance renders on mobile and
 * desktop; it is not a mobile-only control.
 *
 * Three lenses, matching the Arc 3 brief:
 *   discover   Spaces you have not joined (the marketplace of open work).
 *   mine       Spaces where you hold a roster seat.
 *   completed  Finished work and the proof it produced (the proof surface).
 *
 * Route-driven: the active lens lives in ?lens=<id>, read by LensBar itself, so
 * this surface holds no tab state. The active lens icon carries the Collaborate
 * teal through the `c="collaborate"` prop (resolved via the c5 Tailwind key),
 * the one place hue appears in the bar.
 *
 * Icons are Lucide, one glyph one meaning, unique within this surface and clear
 * of the reservations in docs/ICON_USAGE_GUIDE.md (enforced by
 * scripts/check-icon-duplicates.ts). Telescope is deliberately NOT Compass:
 * Compass is reserved for Feed "For You". Adinkra is reserved for the C's
 * themselves and never appears here.
 */

import { Telescope, UsersRound, BadgeCheck } from 'lucide-react';
import { LensBar, type Lens } from '@/components/shell/LensBar';

export type CollaborateLensId = 'discover' | 'mine' | 'completed';

export const COLLABORATE_LENSES: Lens[] = [
  {
    id: 'discover',
    label: 'Discover',
    icon: Telescope,
    description: 'Spaces you have not joined yet',
  },
  {
    id: 'mine',
    label: 'Mine',
    icon: UsersRound,
    description: 'Spaces where you hold a seat',
  },
  {
    id: 'completed',
    label: 'Completed',
    icon: BadgeCheck,
    description: 'Finished work and the proof it produced',
  },
];

export function CollaborateLensBar() {
  return <LensBar lenses={COLLABORATE_LENSES} ariaLabel="Collaborate lenses" c="collaborate" />;
}
