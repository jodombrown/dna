import React from 'react';
import { Users, Network, Map, MessageCircle } from 'lucide-react';
import { DnaMobileHeader } from '@/components/mobile/DnaMobileHeader';
import { MESSAGING_ENABLED } from '@/config/featureFlags';
import { LensBar, type Lens } from '@/components/shell/LensBar';

export type ConnectTab = 'discover' | 'network' | 'map' | 'messages';

interface ConnectMobileHeaderProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onFiltersClick: () => void;
  activeFilterCount?: number;
}

/**
 * Connect lenses (BD332b). Route-driven via ?lens=<id>: LensBar reads and
 * writes the param, so this surface no longer holds tab state.
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
const CONNECT_LENSES: Lens[] = [
  { id: 'discover', label: 'Members', icon: Users },
  { id: 'network', label: 'Network', icon: Network },
  { id: 'map', label: 'Map', icon: Map },
  { id: 'messages', label: 'Messages', icon: MessageCircle, disabled: !MESSAGING_ENABLED },
];

export function ConnectMobileHeader({
  searchQuery,
  onSearchChange,
  onFiltersClick,
  activeFilterCount = 0,
}: ConnectMobileHeaderProps) {
  return (
    <div className="md:hidden">
      <DnaMobileHeader
        bubble={{
          kind: 'search',
          placeholder: 'Search members...',
          value: searchQuery,
          onChange: onSearchChange,
          onFiltersClick,
          activeFilterCount,
        }}
      />
      <ConnectMobileTabs />
    </div>
  );
}

export function ConnectMobileTabs() {
  return (
    <div className="px-3 py-1.5 bg-background border-b border-border">
      <LensBar lenses={CONNECT_LENSES} ariaLabel="Connect lenses" c="connect" />
    </div>
  );
}

export function ConnectMobileTopBar({
  searchQuery,
  onSearchChange,
  onFiltersClick,
  activeFilterCount = 0,
}: ConnectMobileHeaderProps) {
  return (
    <div className="md:hidden">
      <DnaMobileHeader
        bubble={{
          kind: 'search',
          placeholder: 'Search members...',
          value: searchQuery,
          onChange: onSearchChange,
          onFiltersClick,
          activeFilterCount,
        }}
      />
    </div>
  );
}
