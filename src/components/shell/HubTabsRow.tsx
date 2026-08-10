/**
 * HubTabsRow — the single wrapper every hub's lens bar renders inside,
 * mounted in DnaMobileHubShell's `tabs` slot on mobile and, per BD458, in
 * AppShell's `tabs` slot above the content column on desktop. Extracted from
 * three independent copies of the same class string (Convene, Feed, Connect):
 * agreement between copies was coincidental, not structural.
 *
 * Carries no `md:hidden`: every pre-AppShell caller already mounted this only
 * inside an `isMobile`-gated branch, so the class was dead weight there — and
 * it would have hidden the row outright once AppShell started rendering the
 * same `tabs` node on desktop too (AppShell's isMobile threshold is Tailwind's
 * `md`, so the two would have fired together).
 */
import React, { type ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface HubTabsRowProps {
  children: ReactNode;
  className?: string;
}

export function HubTabsRow({ children, className }: HubTabsRowProps) {
  return (
    <div className={cn('px-3 py-1.5 bg-background border-b border-border', className)}>
      {children}
    </div>
  );
}

export default HubTabsRow;
