/**
 * DNA | CONVENE — Discovery's desktop header row (location + actions).
 * Owns its own vertical rhythm (BD176 rungs) so the row doesn't sit flush
 * against the chrome above or the CopperDivider below. Lives here, not in
 * the page, because a file under src/pages may not carry a page-level
 * py- value — that rhythm belongs to the component that owns the row.
 */
import type { ReactNode } from 'react';

interface ConveneDiscoveryHeaderRowProps {
  children: ReactNode;
}

export function ConveneDiscoveryHeaderRow({ children }: ConveneDiscoveryHeaderRowProps) {
  return <div className="flex items-center justify-between gap-3 py-2">{children}</div>;
}

export default ConveneDiscoveryHeaderRow;
