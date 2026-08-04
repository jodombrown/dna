import { Users, Network, Map, MessageCircle } from 'lucide-react';
import { MESSAGING_ENABLED } from '@/config/featureFlags';
import { type Lens } from '@/components/shell/LensBar';

export type ConnectTab = 'discover' | 'network' | 'map' | 'messages';

/**
 * Connect lenses (BD332b / BD363). Route-driven via ?lens=<id>: the LensBar
 * reads and writes the param, so this surface holds no tab state. The bar now
 * lives in the content well at both widths — there is no separate mobile tab
 * row.
 *
 * Two deliberate icon/behaviour choices:
 *  - Map uses Map, not Globe. Globe meant "a place" on Connect and "no place"
 *    on Convene — the same glyph across two adjacent surfaces read as available.
 *    Globe is retired from the shell.
 *  - Messages always holds its seat, disabled while messaging is OUT
 *    (MESSAGING_ENABLED === false). Messaging returns in Arc 3 (BD331); the set
 *    must not renumber when the flag flips, so the lens is present-but-disabled
 *    (aria-disabled, non-focusable, dashed border) rather than conditionally
 *    absent. The flag itself stays false.
 */
export const CONNECT_LENSES: Lens[] = [
  { id: 'discover', label: 'Discover', icon: Users, description: 'Find diaspora members by skill, interest, and location' },
  { id: 'network', label: 'Network', icon: Network, description: 'Manage your connections and pending requests' },
  { id: 'map', label: 'Map', icon: Map, description: 'Where the diaspora is gathering. Places, never people.' },
  { id: 'messages', label: 'Messages', icon: MessageCircle, disabled: !MESSAGING_ENABLED, description: 'Start conversations with your connections' },
];
