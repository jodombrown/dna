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
  icon: LucideIcon;
  placeholderTitle: string;
  shortBlurb: string;
  authorable: boolean;
}

/**
 * Single source of truth for currency presentation. Per BD372, currencies no
 * longer carry a per-currency colour: every currency previously borrowed a
 * DIFFERENT C's hue (time -> Convene, expertise -> Collaborate, network ->
 * Connect, advocacy -> Convey), and only capital, the one currency that
 * cannot yet be authored, wore Contribute's own colour. All five now render
 * with a single, static Contribute treatment (`text-c5-contribute` for icons
 * and marks, `text-c5-contribute-text` for label text, `bg-c5-contribute` for
 * filled surfaces), applied directly as a Tailwind class in each consumer,
 * never looked up per-currency here. Design's own recommendation: a colour
 * repeated five times invites re-diversification, one shared treatment does
 * not.
 */
export const CURRENCY_VISUALS: Record<ContributionCurrency, CurrencyVisual> = {
  capital: {
    key: 'capital',
    label: 'Capital',
    icon: Banknote,
    placeholderTitle: '',
    shortBlurb: 'Coming after the trust ladder is built.',
    authorable: false,
  },
  time: {
    key: 'time',
    label: 'Time',
    icon: Clock,
    placeholderTitle: 'e.g., Two hours a month mentoring first-time founders',
    shortBlurb: 'Hours you can put in yourself.',
    authorable: true,
  },
  expertise: {
    key: 'expertise',
    label: 'Expertise',
    icon: GraduationCap,
    placeholderTitle: 'e.g., FDA regulatory strategy for biotech',
    shortBlurb: 'Knowledge depth you offer to others.',
    authorable: true,
  },
  network: {
    key: 'network',
    label: 'Network',
    icon: Handshake,
    placeholderTitle: 'e.g., Warm intros to East African agritech investors',
    shortBlurb: 'Doors you can open.',
    authorable: true,
  },
  advocacy: {
    key: 'advocacy',
    label: 'Advocacy',
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
