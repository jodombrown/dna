import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

/**
 * The Convene Discovery hub's centered content column: the standard
 * container + max-width + horizontal gutter shared by mobile and desktop.
 * Lives outside src/pages so the page file itself carries no page-level
 * layout values (CLAUDE.md: Section owns rhythm, Container owns width).
 */
export function ConveneDiscoveryFrame({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn('container max-w-6xl mx-auto px-3 sm:px-6 lg:px-8', className)}>
      {children}
    </div>
  );
}

export default ConveneDiscoveryFrame;
