/**
 * Pulse Bar Types - DIA Phase 1 Foundation
 *
 * These types define the data structures for the Pulse Bar component,
 * which shows real-time status across all Five C's (CONNECT, CONVENE,
 * COLLABORATE, CONTRIBUTE, CONVEY).
 */

export type PulseStatus = 'active' | 'attention' | 'dormant' | 'urgent';

export interface PulseItem {
  id: string;
  title: string;
  subtitle?: string;
  avatar_url?: string;
  action_url: string;
  timestamp?: string;
}

export interface PulseSection {
  count: number;
  status: PulseStatus;
  micro_text: string;
  top_items: PulseItem[];
}

export interface ConnectPulse extends PulseSection {
  pending_requests: number;
  suggestions_count: number;
}

export interface ConvenePulse extends PulseSection {
  upcoming_count: number;
  pending_invites: number;
  next_event?: {
    id: string;
    title: string;
    starts_at: string;
  };
}

export interface CollaboratePulse extends PulseSection {
  active_spaces: number;
  stalled_count: number;
  attention_space?: {
    id: string;
    name: string;
    status: string;
  };
}

export interface ContributePulse extends PulseSection {
  match_count: number;
  open_listings: number;
}

export interface ConveyPulse extends PulseSection {
  total_engagement_24h: number;
  is_trending: boolean;
  top_performing_post?: {
    id: string;
    title: string;
    engagement_count: number;
  };
}

export interface UserPulseData {
  connect: ConnectPulse;
  convene: ConvenePulse;
  collaborate: CollaboratePulse;
  contribute: ContributePulse;
  convey: ConveyPulse;
  last_updated: string;
}

export type PulseKey = 'connect' | 'convene' | 'collaborate' | 'contribute' | 'convey';

/**
 * FIVE_CS — the single ordered source of the Five C's navigation slot set, in
 * Five C's order: connect, convene, collaborate, contribute, convey.
 *
 * PulseDock (PRIMARY_ITEMS) and PulseBar BOTH derive their slots from this one
 * const. Two hand-maintained arrays are exactly how the mobile and desktop
 * widths drift apart; there is one declaration here so they cannot.
 *
 * `icon` is the icon's registry name; each surface resolves it to its own
 * component (adinkra symbol) so this stays a plain data array.
 */
export interface FiveCSlot {
  id: PulseKey;
  label: string;
  icon: string;
  href: string;
}

export const FIVE_CS: readonly FiveCSlot[] = [
  { id: 'connect', label: 'Connect', icon: 'Sankofa', href: '/dna/connect' },
  { id: 'convene', label: 'Convene', icon: 'Nkonsonkonson', href: '/dna/convene' },
  { id: 'collaborate', label: 'Collaborate', icon: 'FuntunfunefuDenkyemfunefu', href: '/dna/collaborate' },
  { id: 'contribute', label: 'Contribute', icon: 'Adinkrahene', href: '/dna/contribute' },
  { id: 'convey', label: 'Convey', icon: 'Mpatapo', href: '/dna/convey' },
] as const;

export interface PulseConfig {
  label: string;
  icon: string;
  href: string;
}

/**
 * PULSE_CONFIG — per-key label/icon/href lookup for the desktop PulseBar,
 * derived from FIVE_CS so the slot set has exactly one source. Labels are
 * uppercased for the bar's eyebrow treatment.
 */
export const PULSE_CONFIG: Record<PulseKey, PulseConfig> = Object.fromEntries(
  FIVE_CS.map((c) => [c.id, { label: c.label.toUpperCase(), icon: c.icon, href: c.href }]),
) as Record<PulseKey, PulseConfig>;

/**
 * Mobile Navigation Types for Pulse Dock
 */
export interface PulseDockNavItem {
  key: string;
  label: string;
  icon: string;
  href: string | null;
  isCenter?: boolean;
  isTrigger?: boolean;
}

export interface MoreButtonState {
  hasActivity: boolean;
  totalCount: number;
  hasAttention: boolean;
  hasUrgent: boolean;
  status: PulseStatus;
}
