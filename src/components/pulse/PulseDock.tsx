/**
 * PulseDock - Mobile Navigation Dock
 *
 * DNA's mobile navigation system: a fixed bottom bar of exactly the Five C's,
 * derived from the one FIVE_CS const so its slot set can never drift from the
 * desktop PulseBar's. Status indicators carry no C hue (Frame B); the active
 * slot alone spends its C.
 *
 * There is no Feed centre seat and no More trigger: Home lives on the mark in
 * DnaMobileHeader (which navigates to /dna/feed), and every former tray tenant
 * has its own ruled home elsewhere in the chrome.
 */

import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import type { LucideIcon } from 'lucide-react';
import { Sankofa, Nkonsonkonson, FuntunfunefuDenkyemfunefu, Adinkrahene, Mpatapo } from '@/components/icons/adinkra';
import { cn } from '@/lib/utils';
import { usePulseNavigation } from '@/hooks/usePulseNavigation';
import { FIVE_CS, type PulseKey, type PulseSection } from '@/types/pulse';
import { useMobile } from '@/hooks/useMobile';
import { useAuth } from '@/contexts/AuthContext';
import { useKeyboardDetection } from '@/hooks/useKeyboardDetection';
import { scheduleHubPrefetch } from '@/lib/prefetchHubRoutes';
import { Popover, PopoverAnchor, PopoverContent } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';

import { PulseDockItem } from './PulseDockItem';

interface PrimaryItemBase {
  key: PulseKey;
  label: string;
  icon: LucideIcon;
  href: string;
  isAdinkra?: boolean;
}

// BD416: reused verbatim from usePulseBar's per-C microText, not new copy.
const GUEST_POPOVER_SUBTITLE: Partial<Record<PulseKey, string>> = {
  connect: 'Grow your network',
  collaborate: 'Start collaborating',
  contribute: 'Browse opportunities',
  convey: 'Share your story',
};

const ADINKRA_ICONS: Record<string, LucideIcon> = {
  Sankofa,
  Nkonsonkonson,
  FuntunfunefuDenkyemfunefu,
  Adinkrahene,
  Mpatapo,
};

// Derived from the one FIVE_CS const (src/types/pulse) — same source the
// desktop PulseBar reads, so the two slot sets cannot drift.
const PRIMARY_ITEMS: PrimaryItemBase[] = FIVE_CS.map((c) => ({
  key: c.id,
  label: c.label,
  icon: ADINKRA_ICONS[c.icon],
  href: c.href,
  isAdinkra: true,
}));

export function PulseDock() {
  const { isMobile } = useMobile();
  const { user } = useAuth();
  const pulseNav = usePulseNavigation();
  const location = useLocation();
  const navigate = useNavigate();
  const [guestPopoverKey, setGuestPopoverKey] = React.useState<PulseKey | null>(null);

  // Activate keyboard detection to auto-hide dock when typing
  useKeyboardDetection();

  // Warm all five hub chunks during idle time so the first tap on any
  // dock item resolves synchronously. Mobile taps were paying a cold
  // chunk-fetch cost every time because navigate() runs after the tap.
  React.useEffect(() => {
    if (!isMobile || !user) return;
    scheduleHubPrefetch();
  }, [isMobile, user]);

  // Hide dock only in full-screen chat threads (Messages with active conversation)
  const isFullScreenChat = location.pathname.includes('/dna/messages');

  // BD450: a guest holding an /event/:id?guest_token=... link has no session,
  // but is still on mobile and still wants the dock — usePulseNavigation()
  // returns undefined pulse data for them (its query is gated on
  // enabled: !!user?.id), so nothing below has to special-case guest data.
  const searchParams = new URLSearchParams(location.search);
  const isGuestEventView = location.pathname.startsWith('/event/') && !!searchParams.get('guest_token');

  // Only render on mobile, and for authenticated users or a guest event view
  if (!isMobile || (!user && !isGuestEventView)) return null;
  if (isFullScreenChat) return null;

  const handleItemClick = (item: PrimaryItemBase) => {
    // BD416: Convene is exactly what the guest link is for, so it navigates
    // normally. Every other C is out of scope for a guest — never navigate,
    // never disable the item, just surface what joining DNA would unlock.
    if (isGuestEventView && item.key !== 'convene') {
      setGuestPopoverKey(item.key);
      return;
    }
    navigate(item.href);
  };

  const handleGuestJoinClick = () => {
    setGuestPopoverKey(null);
    navigate(`/auth?redirect=${encodeURIComponent(location.pathname + location.search)}`);
  };

  const isActive = (href: string) => {
    const path = location.pathname;
    // Direct prefix match
    if (path.startsWith(href)) return true;
    // Map related routes to their parent module
    if (href === '/dna/connect') {
      return path.startsWith('/dna/profile') || path.startsWith('/dna/discover') || path.startsWith('/dna/network');
    }
    if (href === '/dna/collaborate') {
      return path.startsWith('/dna/collaborate') || path.startsWith('/dna/spaces');
    }
    return false;
  };

  const getPulseData = (item: PrimaryItemBase): PulseSection | null => {
    return pulseNav[item.key] || null;
  };

  return (
    <>
      {/* Primary Dock */}
        <nav
          className={cn(
            'fixed bottom-0 left-0 right-0 z-50',
            'bg-background/95 backdrop-blur-md',
            'border-t border-border',
            'shadow-[0_-4px_20px_hsl(var(--foreground)/0.08)]',
            // `pb-safe` was here and was a phantom (BD157): no spacing scale in
            // tailwind.config.ts, so it rendered nothing and the dock sat in the
            // home-indicator strip. Replaced by the inset itself, below.
            'lg:hidden'
          )}
        style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
      >
        <div className="flex items-center justify-around h-16 px-2">
          {PRIMARY_ITEMS.map((item) => (
            <Popover
              key={item.key}
              open={guestPopoverKey === item.key}
              onOpenChange={(open) => !open && setGuestPopoverKey(null)}
            >
              <PopoverAnchor asChild>
                <div className="contents">
                  <PulseDockItem
                    item={item}
                    pulseData={getPulseData(item)}
                    isActive={isActive(item.href)}
                    onClick={() => handleItemClick(item)}
                  />
                </div>
              </PopoverAnchor>
              {isGuestEventView && item.key !== 'convene' && (
                <PopoverContent side="top" align="center" className="w-64">
                  <div className="flex flex-col gap-2">
                    <p className="font-semibold text-sm">{GUEST_POPOVER_SUBTITLE[item.key]}</p>
                    <p className="text-xs text-muted-foreground">
                      This is part of DNA — join to unlock {item.label.toLowerCase()}.
                    </p>
                    <Button size="sm" className="mt-1" onClick={handleGuestJoinClick}>
                      Join DNA to Attend
                    </Button>
                  </div>
                </PopoverContent>
              )}
            </Popover>
          ))}
        </div>
      </nav>
    </>
  );
}

export default PulseDock;
