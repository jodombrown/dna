/**
 * ContentColumn — the readable-width wrapper for a route's center-column body.
 *
 * Why this exists as a component and not a `<div className="...">` at the call
 * site: the design-system gate forbids page-level layout values (`container`,
 * `max-w-`, `px-`) on any changed line under `src/pages` — "Container owns
 * width" (see .github/workflows/design-system-gate.yml). MyEvents needed to
 * change its outer wrapper (BD376, trimming redundant vertical padding), and
 * touching that line re-surfaced its pre-existing `container max-w-3xl px-4`
 * tokens into the gate's added-line scope. Moving the width container into a
 * component under `src/components` is the fix the gate itself points at, and it
 * keeps the width tokens in exactly one place.
 *
 * It intentionally carries NO vertical padding: on the pages that use it the
 * enclosing layout (TwoColumnLayout's `p-4` mobile wrapper) already owns edge
 * rhythm, so a second vertical pad here was pure duplication — the redundancy
 * BD376 removed.
 */

import * as React from 'react';
import { cn } from '@/lib/utils';

interface ContentColumnProps {
  children: React.ReactNode;
  /** Layout positioning only (e.g. a page that needs a wider read). */
  className?: string;
  /** Read width. 'default' (max-w-3xl) is a single reading column; 'wide'
   *  (max-w-6xl) is for a page that composes a sidebar rail beside its content,
   *  like My Events' desktop lens rail. Keeping both widths in this component,
   *  and not at the call site, is what the page-level layout gate requires. */
  width?: 'default' | 'wide';
}

export function ContentColumn({ children, className, width = 'default' }: ContentColumnProps) {
  return (
    <div
      className={cn(
        'container mx-auto px-4',
        width === 'wide' ? 'max-w-6xl' : 'max-w-3xl',
        className,
      )}
    >
      {children}
    </div>
  );
}

export default ContentColumn;
