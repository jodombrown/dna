/**
 * BetaTransitionBanner - the one standard notice for the beta transition
 * window (August 15 to October 15, 2026) and the launch campaign that
 * follows it into Detty December in Accra, Ghana.
 *
 * Mounted inside the MEASURED chrome elements (UnifiedHeader's header, and
 * DnaMobileHubShell's fixed top container) so every layout offset that reads
 * --unified-header-height / the mobile header measurement absorbs it with no
 * second source of truth. Do not mount it anywhere else.
 *
 * Dismissal is per browser and versioned by the key, so a later cycle can
 * bring a new notice back without clearing storage by hand.
 */
import React, { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

const DISMISS_KEY = 'dna_beta_transition_notice_2026_08';

/** Window close, local time. After this the banner stops rendering. */
const BETA_WINDOW_END = new Date('2026-10-16T00:00:00Z');

interface BetaTransitionBannerProps {
  className?: string;
}

export function BetaTransitionBanner({ className }: BetaTransitionBannerProps) {
  const [isDismissed, setIsDismissed] = useState(true);

  useEffect(() => {
    try {
      setIsDismissed(localStorage.getItem(DISMISS_KEY) === 'true');
    } catch {
      // Storage blocked (private mode, embedded webview): show the notice.
      setIsDismissed(false);
    }
  }, []);

  if (isDismissed || Date.now() > BETA_WINDOW_END.getTime()) {
    return null;
  }

  const handleDismiss = () => {
    setIsDismissed(true);
    try {
      localStorage.setItem(DISMISS_KEY, 'true');
    } catch {
      // Nothing to persist to. The notice returns on the next load.
    }
  };

  return (
    <div
      data-beta-transition-banner
      role="status"
      className={cn(
        'w-full border-b border-border bg-muted',
        className,
      )}
    >
      <div className="max-w-7xl mx-auto flex items-center gap-2 px-3 py-1.5 sm:px-6 lg:px-8">
        <span className="text-meta font-body text-muted-foreground min-w-0">
          <span className="text-foreground">We are in beta through October 15, 2026.</span>{' '}
          <span className="hidden sm:inline">
            The transition runs from August 15, and public launch follows with a full campaign into
            Detty December in Accra, Ghana.
          </span>
          <span className="sm:hidden">Launch campaign lands for Detty December in Accra.</span>{' '}
          <Link
            to="/beta"
            className="text-foreground underline underline-offset-2 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-sm"
          >
            Click here to learn more about beta in-app testing
          </Link>
        </span>


        <button
          type="button"
          onClick={handleDismiss}
          aria-label="Dismiss beta transition notice"
          className="ml-auto shrink-0 rounded-md p-1 text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

export default BetaTransitionBanner;
