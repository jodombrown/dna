/**
 * Contribute hub lens bar: the LensBar primitive (BD332) configured for the
 * Contribute hub, used at BOTH widths. Same instance renders on mobile and
 * desktop; it is not a mobile-only control.
 *
 * Three lenses, matching the Arc 3 brief:
 *   needs      Everything open: asks posted across the diaspora, waiting.
 *   mine       Your asks and your contributions, two sections in one lens.
 *   fulfilled  The closed loop: asks that found the people who met them.
 *
 * Route-driven: the active lens lives in ?lens=<id>, read by LensBar itself, so
 * this surface holds no tab state. The active lens icon carries the Contribute
 * gold through the `c="contribute"` prop (resolved via the c5 Tailwind key), the
 * one place hue appears in the bar.
 *
 * Icons are Lucide, one glyph one meaning, unique within this surface and clear
 * of the reservations in docs/ICON_USAGE_GUIDE.md (enforced by
 * scripts/check-icon-duplicates.ts). Adinkra is reserved for the C's themselves
 * and never appears here.
 */

import { Megaphone, UserRound, CircleCheckBig } from 'lucide-react';
import { LensBar, type Lens } from '@/components/shell/LensBar';

export type ContributeLensId = 'needs' | 'mine' | 'fulfilled';

export const CONTRIBUTE_LENSES: Lens[] = [
  {
    id: 'needs',
    label: 'Needs',
    icon: Megaphone,
    description: 'Open asks from across the diaspora',
  },
  {
    id: 'mine',
    label: 'Mine',
    icon: UserRound,
    description: 'Your asks and your contributions',
  },
  {
    id: 'fulfilled',
    label: 'Fulfilled',
    icon: CircleCheckBig,
    description: 'Asks that found the people who met them',
  },
];

export function ContributeLensBar() {
  return <LensBar lenses={CONTRIBUTE_LENSES} ariaLabel="Contribute lenses" c="contribute" />;
}
