/**
 * PulseDock - Mobile Navigation Dock
 *
 * DNA's mobile navigation system featuring:
 * - Fixed bottom navigation with 5 primary items
 * - Center-elevated Feed button
 * - Status indicators for Five C's
 * - Expandable tray via MORE button with Smart Dock pattern
 * - Focus Mode integration for Five C's items
 *
 * Replaces MobileBottomNav with a Pulse-aware navigation system.
 */

import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Users, Calendar, Home, Layers, Grid3X3 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { usePulseNavigation, type MoreButtonState } from '@/hooks/usePulseNavigation';
import type { PulseSection } from '@/types/pulse';
import { useMobile } from '@/hooks/useMobile';
import { useAuth } from '@/contexts/AuthContext';
import { PulseDockItem } from './PulseDockItem';
import { PulseDockTray } from './PulseDockTray';
import { useFocusMode, type FocusModule } from '@/hooks/useFocusMode';

interface PrimaryItemBase {
  key: string;
  label: string;
  icon: typeof Users;
  href: string | null;
  isCenter?: boolean;
  isTrigger?: boolean;
}

const PRIMARY_ITEMS: PrimaryItemBase[] = [
  { key: 'connect', label: 'Connect', icon: Users, href: '/dna/connect' },
  { key: 'convene', label: 'Convene', icon: Calendar, href: '/dna/convene' },
  { key: 'feed', label: 'Feed', icon: Home, href: '/dna/feed', isCenter: true },
  { key: 'collaborate', label: 'Collaborate', icon: Layers, href: '/dna/collaborate' },
  { key: 'more', label: 'More', icon: Grid3X3, href: null, isTrigger: true },
];

// Items that should open Focus Mode instead of navigating
const FOCUS_MODE_ITEMS = ['connect', 'convene', 'collaborate'];

export function PulseDock() {
  const { isMobile } = useMobile();
  const { user } = useAuth();
  const [trayOpen, setTrayOpen] = useState(false);
  const pulseNav = usePulseNavigation();
  const location = useLocation();
  const navigate = useNavigate();
  const { toggleFocus, activeModule, isOpen } = useFocusMode();

  // Only render on mobile and for authenticated users
  if (!isMobile || !user) return null;

  const handleItemClick = (item: PrimaryItemBase) => {
    if (item.isTrigger) {
      setTrayOpen(true);
    } else if (FOCUS_MODE_ITEMS.includes(item.key)) {
      // Open Focus Mode for Connect, Convene, Collaborate
      toggleFocus(item.key as FocusModule);
    } else if (item.href) {
      navigate(item.href);
    }
  };

  const isActive = (href: string | null, itemKey?: string) => {
    // Check if focus mode is open for this item
    if (itemKey && FOCUS_MODE_ITEMS.includes(itemKey) && isOpen && activeModule === itemKey) {
      return true;
    }
    if (!href) return false;
    return location.pathname.startsWith(href);
  };

  const getPulseData = (item: PrimaryItemBase): PulseSection | MoreButtonState | null => {
    if (item.key === 'more') {
      return pulseNav.more;
    }
    if (item.key === 'feed') {
      return null;
    }
    const key = item.key as 'connect' | 'convene' | 'collaborate' | 'contribute' | 'convey';
    return pulseNav[key] || null;
  };

  return (
    <>
      {/* Tray Overlay */}
      <PulseDockTray open={trayOpen} onClose={() => setTrayOpen(false)} pulseNav={pulseNav} />

      {/* Primary Dock */}
      <nav
        className={cn(
          'fixed bottom-0 left-0 right-0 z-50',
          'bg-white/95 backdrop-blur-md',
          'border-t border-gray-200',
          'shadow-[0_-4px_20px_rgba(0,0,0,0.1)]',
          'pb-safe',
          'lg:hidden'
        )}
      >
        <div className="flex items-center justify-around h-16 px-2">
          {PRIMARY_ITEMS.map((item) => (
            <PulseDockItem
              key={item.key}
              item={item}
              pulseData={getPulseData(item)}
              isActive={item.isTrigger ? trayOpen : isActive(item.href, item.key)}
              onClick={() => handleItemClick(item)}
            />
          ))}
        </div>
      </nav>
    </>
  );
}

export default PulseDock;
