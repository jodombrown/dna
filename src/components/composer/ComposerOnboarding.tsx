/**
 * ComposerOnboarding — First-time tooltip system for the Five C's
 *
 * Sprint 3B: Shows brief tooltips on the mode chips the first time
 * a user opens the composer. Teaches the Five C's through the creation
 * interface itself.
 *
 * NOT a blocking modal — user can start typing immediately.
 * Tooltips auto-dismiss after first interaction or mode selection.
 * Persists completion state in localStorage via useComposerOnboarding hook.
 *
 * Desktop: Tooltips appear below each chip on hover/focus.
 * Mobile: Tooltips positioned above chips to avoid bottom sheet clipping.
 */

import { useState, useCallback } from 'react';
import { cn } from '@/lib/utils';
import { MODE_HANDLERS } from './modeHandlers';
import { useMobile } from '@/hooks/useMobile';
import type { ComposerMode } from '@/hooks/useUniversalComposer';

// ============================================================
// Tooltip Content
// ============================================================

const MODE_TOOLTIPS: Record<
  Exclude<ComposerMode, 'community'>,
  { title: string; description: string }
> = {
  post: {
    title: 'Share a Post',
    description: 'Share updates, thoughts, and links with your diaspora network.',
  },
  story: {
    title: 'Tell a Story',
    description: 'Publish long-form content about your journey, insights, and experiences.',
  },
  event: {
    title: 'Host an Event',
    description: 'Create virtual, in-person, or hybrid gatherings for your community.',
  },
  space: {
    title: 'Start a Space',
    description: 'Launch a project or initiative and build a team to collaborate.',
  },
  need: {
    title: 'Post an Opportunity',
    description: 'Share what you need or what you can offer — money, time, skills, or knowledge.',
  },
};

// ============================================================
// Hook: useComposerOnboarding
// ============================================================

const STORAGE_KEY = 'dna_composer_onboarding_complete';

export function useComposerOnboarding() {
  const [isComplete, setIsComplete] = useState(() => {
    try {
      return window.localStorage?.getItem(STORAGE_KEY) === 'true';
    } catch {
      return true; // If storage fails, skip onboarding
    }
  });

  const markComplete = useCallback(() => {
    setIsComplete(true);
    try {
      window.localStorage?.setItem(STORAGE_KEY, 'true');
    } catch {
      // Silently fail
    }
  }, []);

  return { isFirstTime: !isComplete, markComplete };
}

// ============================================================
// Component: ComposerOnboarding
// ============================================================

interface ComposerOnboardingProps {
  isFirstTime: boolean;
  onComplete: () => void;
}

export const ComposerOnboarding = ({
  isFirstTime,
  onComplete,
}: ComposerOnboardingProps) => {
  const { isMobile } = useMobile();
  const [hoveredMode, setHoveredMode] = useState<ComposerMode | null>(null);
  const [dismissed, setDismissed] = useState(false);

  if (!isFirstTime || dismissed) return null;

  const handleInteraction = () => {
    setDismissed(true);
    onComplete();
  };

  const modes = Object.keys(MODE_TOOLTIPS) as Array<Exclude<ComposerMode, 'community'>>;

  return (
    <div
      className="relative"
      onMouseDown={handleInteraction}
      onKeyDown={handleInteraction}
    >
      {/* Tooltip overlay — positioned relative to parent */}
      {hoveredMode && MODE_TOOLTIPS[hoveredMode] && (
        <OnboardingTooltip
          mode={hoveredMode}
          tooltip={MODE_TOOLTIPS[hoveredMode]}
          accentColor={MODE_HANDLERS[hoveredMode].accentColor}
          isMobile={isMobile}
        />
      )}

      {/* Ghost overlay triggers for each chip — designed to layer over the mode selector */}
      <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-hide pb-1 -mx-1 px-1">
        {modes.map((modeId) => (
          <div
            key={modeId}
            className="relative"
            onMouseEnter={() => setHoveredMode(modeId)}
            onMouseLeave={() => setHoveredMode(null)}
            onFocus={() => setHoveredMode(modeId)}
            onBlur={() => setHoveredMode(null)}
          >
            {/* Invisible trigger matching chip size */}
            <div className="px-3 py-1.5 min-h-[44px] flex items-center gap-1.5 opacity-0 pointer-events-auto">
              <span className="text-sm">{MODE_HANDLERS[modeId].shortLabel}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// ============================================================
// Tooltip Component
// ============================================================

interface OnboardingTooltipProps {
  mode: Exclude<ComposerMode, 'community'>;
  tooltip: { title: string; description: string };
  accentColor: string;
  isMobile: boolean;
}

function OnboardingTooltip({
  tooltip,
  accentColor,
  isMobile,
}: OnboardingTooltipProps) {
  return (
    <div
      className={cn(
        'absolute z-50 w-56 p-3 rounded-lg bg-popover shadow-lg border',
        'animate-in fade-in-0 zoom-in-95 duration-200',
        // Mobile: position above to avoid bottom sheet clipping
        // Desktop: position below
        isMobile ? 'bottom-full mb-2' : 'top-full mt-2',
        'left-0'
      )}
      style={{ borderLeftColor: accentColor, borderLeftWidth: '3px' }}
    >
      <p className="text-sm font-medium">{tooltip.title}</p>
      <p className="text-xs text-muted-foreground mt-1">{tooltip.description}</p>
    </div>
  );
}
