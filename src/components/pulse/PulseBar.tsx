/**
 * PulseBar - Main Pulse Bar Container Component
 *
 * DNA's primary differentiator for desktop - a living, intelligent horizontal
 * bar that shows real-time status across all Five C's (CONNECT, CONVENE,
 * COLLABORATE, CONTRIBUTE, CONVEY).
 *
 * Features:
 * - Real-time updates via Supabase subscriptions
 * - Visual status indicators (active, attention, dormant, urgent)
 * - Activity density dots
 * - DIA-powered micro-text
 * - Hover preview cards with top items
 */

import React from 'react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import { usePulseBar } from '@/hooks/usePulseBar';
import { useMobile } from '@/hooks/useMobile';
import { PulseItem } from './PulseItem';
import { PULSE_CONFIG, type PulseKey } from '@/types/pulse';

const PULSE_KEYS: PulseKey[] = ['connect', 'convene', 'collaborate', 'contribute', 'convey'];

/**
 * Skeleton loader for the Pulse Bar
 */
function PulseBarSkeleton() {
  return (
    <div className="w-full bg-white/80 backdrop-blur-sm border-b border-gray-200 px-4 py-2">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-2">
        {PULSE_KEYS.map((key) => (
          <div key={key} className="flex-1 animate-pulse">
            <div className="h-14 bg-gray-100 rounded-lg" />
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * Main PulseBar Component
 * Desktop-only: Hidden on mobile to preserve mobile UI during desktop development
 */
export function PulseBar() {
  const { user } = useAuth();
  const { isMobile } = useMobile();
  const { pulseData, isLoading } = usePulseBar();

  // Don't render on mobile - preserve existing mobile UI
  if (isMobile) {
    return null;
  }

  // Don't render for unauthenticated users
  if (!user) {
    return null;
  }

  // Show skeleton while loading
  if (isLoading) {
    return <PulseBarSkeleton />;
  }

  return (
    <div
      className={cn(
        'w-full bg-white/80 backdrop-blur-sm',
        'border-b border-gray-200',
        'px-2 sm:px-4 py-2',
        'sticky top-14 sm:top-16 z-40'
      )}
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-1 sm:gap-2">
        {PULSE_KEYS.map((key) => (
          <PulseItem
            key={key}
            pulseKey={key}
            config={PULSE_CONFIG[key]}
            data={pulseData?.[key]}
          />
        ))}
      </div>
    </div>
  );
}

export default PulseBar;
