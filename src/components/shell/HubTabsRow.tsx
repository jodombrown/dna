/**
 * HubTabsRow — the single wrapper every mobile hub's lens bar renders inside,
 * mounted in DnaMobileHubShell's `tabs` slot. Extracted per BD458 from three
 * independent copies of the same class string (Convene, Feed, Connect):
 * agreement between copies was coincidental, not structural.
 */
import React, { type ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface HubTabsRowProps {
  children: ReactNode;
  className?: string;
}

export function HubTabsRow({ children, className }: HubTabsRowProps) {
  return (
    <div className={cn('md:hidden px-3 py-1.5 bg-background border-b border-border', className)}>
      {children}
    </div>
  );
}

export default HubTabsRow;
