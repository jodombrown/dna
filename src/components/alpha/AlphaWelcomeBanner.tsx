import React, { useState, useEffect } from 'react';
import { X, ClipboardList, MessageSquare } from 'lucide-react';
import { cn } from '@/lib/utils';
import { FEATURE_FLAGS } from '@/config/featureFlags';

interface AlphaWelcomeBannerProps {
  testerName: string;
  onOpenTestGuide: () => void;
  onOpenFeedback: () => void;
}

const SESSION_DISMISS_KEY = 'dna_alpha_banner_dismissed';

export function AlphaWelcomeBanner({
  testerName,
  onOpenTestGuide,
  onOpenFeedback,
}: AlphaWelcomeBannerProps) {
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    const dismissed = sessionStorage.getItem(SESSION_DISMISS_KEY);
    if (dismissed === 'true') {
      setIsDismissed(true);
    }
  }, []);

  if (!FEATURE_FLAGS.isAlphaTest || isDismissed) {
    return null;
  }

  const handleDismiss = () => {
    setIsDismissed(true);
    sessionStorage.setItem(SESSION_DISMISS_KEY, 'true');
  };

  return (
    <div
      className={cn(
        'relative mx-auto max-w-3xl mb-2 sm:mb-4',
        'rounded-xl border border-emerald-200 bg-emerald-50/80 dark:bg-emerald-950/30 dark:border-emerald-800',
        'px-3 py-3 sm:px-6 sm:py-5',
        'shadow-sm'
      )}
    >
      <button
        onClick={handleDismiss}
        className="absolute top-3 right-3 p-1 rounded-md text-emerald-500 hover:text-emerald-700 hover:bg-emerald-100 dark:hover:bg-emerald-900 transition-colors"
        aria-label="Dismiss welcome banner"
      >
        <X className="h-4 w-4" />
      </button>

      <div className="pr-8">
        <h3 className="text-sm font-semibold text-emerald-900 dark:text-emerald-100 mb-1">
          Welcome to the DNA Alpha Test, {testerName}!
        </h3>
        <p className="text-sm text-emerald-700 dark:text-emerald-300 mb-3">
          You&apos;re one of the first to experience the platform. We&apos;d love your
          honest feedback — what works, what doesn&apos;t, what excites you, what
          confuses you.
        </p>

        <div className="flex flex-wrap gap-2">
          <button
            onClick={onOpenTestGuide}
            className={cn(
              'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium',
              'bg-emerald-600 text-white hover:bg-emerald-700',
              'transition-colors'
            )}
          >
            <ClipboardList className="h-3.5 w-3.5" />
            View Test Guide
          </button>
          <button
            onClick={onOpenFeedback}
            className={cn(
              'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium',
              'bg-white text-emerald-700 border border-emerald-300 hover:bg-emerald-50',
              'dark:bg-emerald-900 dark:text-emerald-200 dark:border-emerald-700 dark:hover:bg-emerald-800',
              'transition-colors'
            )}
          >
            <MessageSquare className="h-3.5 w-3.5" />
            Give Feedback
          </button>
        </div>
      </div>
    </div>
  );
}
