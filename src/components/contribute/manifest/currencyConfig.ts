import {
  Banknote,
  Clock,
  GraduationCap,
  Handshake,
  Megaphone,
  type LucideIcon,
} from 'lucide-react';
import type {
  ContributionCurrency,
  StanceAvailability,
  StanceVisibility,
} from '@/types/contribute';

export interface CurrencyVisual {
  key: ContributionCurrency;
  label: string;
  /** Token color for the currency icon and other non-text graphical marks. */
  barHex: string;
  /** Token color used wherever the currency name renders as text. AA-compliant on the page ground. */
  labelHex: string;
  icon: LucideIcon;
  placeholderTitle: string;
  shortBlurb: string;
  authorable: boolean;
}

/**
 * Single source of truth for currency presentation. Each currency takes one
 * locked hue from the Five C's identity palette (--c5-*, canonical per D092),
 * so every currency reads as a distinct, themeable mark of equal weight. The
 * former --dna-* hues and the 4px left bar are retired: D092 refuses
 * left-edge accent stripes, so the hue now carries the icon and label only.
 *
 * `barHex` vs `labelHex`: the mark is graphical (no contrast minimum) and uses
 * the palette's bevel rung; label text must clear WCAG AA (4.5:1) on the page
 * ground and uses the contrast-tuned text rung.
 */
export const CURRENCY_VISUALS: Record<ContributionCurrency, CurrencyVisual> = {
  capital: {
    key: 'capital',
    label: 'Capital',
    barHex: 'hsl(var(--c5-contribute-bevel))',
    labelHex: 'hsl(var(--c5-contribute-text))',
    icon: Banknote,
    placeholderTitle: '',
    shortBlurb: 'Coming after the trust ladder is built.',
    authorable: false,
  },
  time: {
    key: 'time',
    label: 'Time',
    barHex: 'hsl(var(--c5-convene-bevel))',
    labelHex: 'hsl(var(--c5-convene-text))',
    icon: Clock,
    placeholderTitle: 'e.g., Two hours a month mentoring first-time founders',
    shortBlurb: 'Hours you can put in yourself.',
    authorable: true,
  },
  expertise: {
    key: 'expertise',
    label: 'Expertise',
    barHex: 'hsl(var(--c5-collaborate-bevel))',
    labelHex: 'hsl(var(--c5-collaborate-text))',
    icon: GraduationCap,
    placeholderTitle: 'e.g., FDA regulatory strategy for biotech',
    shortBlurb: 'Knowledge depth you offer to others.',
    authorable: true,
  },
  network: {
    key: 'network',
    label: 'Network',
    barHex: 'hsl(var(--c5-connect-bevel))',
    labelHex: 'hsl(var(--c5-connect-text))',
    icon: Handshake,
    placeholderTitle: 'e.g., Warm intros to East African agritech investors',
    shortBlurb: 'Doors you can open.',
    authorable: true,
  },
  advocacy: {
    key: 'advocacy',
    label: 'Advocacy',
    barHex: 'hsl(var(--c5-convey-bevel))',
    labelHex: 'hsl(var(--c5-convey-text))',
    icon: Megaphone,
    placeholderTitle: 'e.g., Vouching for a founder to your investors',
    shortBlurb: 'Your voice and standing, lent to someone.',
    authorable: true,
  },
};

export const AVAILABILITY_LABELS: Record<StanceAvailability, { short: string; helper: string }> = {
  open_ongoing: {
    short: 'Open ongoing',
    helper: 'Always available, reach out anytime.',
  },
  monthly_hours: {
    short: 'A few hours per month',
    helper: 'Light, recurring availability.',
  },
  quarterly: {
    short: 'A few times per quarter',
    helper: 'Cadenced, not constant.',
  },
  project_based: {
    short: 'Project-based',
    helper: 'Open to specific projects with a clear scope.',
  },
  limited_capacity: {
    short: 'Limited capacity right now',
    helper: 'At capacity, only light availability.',
  },
};

export const VISIBILITY_LABELS: Record<StanceVisibility, { short: string; helper: string }> = {
  public: {
    short: 'Public',
    helper: 'Visible to everyone on DNA.',
  },
  connections_only: {
    short: 'Connections only',
    helper: 'Visible only to your accepted connections.',
  },
  private: {
    short: 'Private',
    helper: 'Only you can see this stance.',
  },
};
