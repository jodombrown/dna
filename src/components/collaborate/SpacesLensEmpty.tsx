/**
 * Empty states for the three Collaborate hub lenses (Arc 3, Frame 7).
 *
 * These are deliverables, not fallbacks. An unknown renders as nothing: no
 * placeholder rows, no sample Spaces, no stock imagery. Each lens says one true
 * thing about why it is empty and offers only the action that is honest for it.
 *
 * The Completed lens is the proof surface and cannot be seeded: when no Space
 * has finished, it states that plainly and offers no call to action, because
 * completion is earned, not prompted.
 */

import type { ReactNode } from 'react';
import type { LucideIcon } from 'lucide-react';

interface LensEmptyProps {
  icon: LucideIcon;
  title: string;
  body: string;
  /** Optional single action. Omitted where no action is honest (Completed). */
  action?: ReactNode;
}

function LensEmpty({ icon: Icon, title, body, action }: LensEmptyProps) {
  return (
    <div className="flex flex-col items-center rounded-xl border border-dashed border-border px-6 py-14 text-center">
      <Icon className="h-8 w-8 text-muted-foreground" aria-hidden="true" strokeWidth={1.5} />
      <h3 className="mt-4 text-h3 text-foreground">{title}</h3>
      <p className="mt-1.5 max-w-sm text-body text-muted-foreground">{body}</p>
      {action ? <div className="mt-5">{action}</div> : null}
    </div>
  );
}

export { LensEmpty };
export type { LensEmptyProps };
