/**
 * ExpandableProse — the shared feed-card body block (BD332).
 *
 * ONE RULE: the expander is never inside clamped text.
 *
 * StoryCard rendered a 240-character slice inside a `line-clamp-4` <p> with the
 * "…more" button as the last inline child of that same <p>. Past the fourth line
 * the clamp hid the tail of the paragraph and took the control with it. The
 * failure was deterministic by width, not intermittent: a 240-character preview
 * needs ~5.2 lines at 393px and ~3.2 at the 560px max-w-feed ceiling, so the
 * control was ALWAYS clipped on a phone and ALWAYS visible on desktop. Desktop
 * review structurally could not catch it.
 *
 * Therefore:
 * - The control sits on its own line BENEATH the clamped block, outside the
 *   clamp. It cannot be clipped at any content length or viewport width.
 * - There is NO character threshold. A threshold is what produced the defect.
 *   Overflow is MEASURED on the rendered element under a ResizeObserver, so a
 *   body that fits shows no control, a body that overflows always shows one,
 *   and a rotation re-measures.
 * - Expanded state goes through the EXISTING RenderProse, which breaks single
 *   paragraphs over 600 chars into readable groups. StoryCard had reimplemented
 *   that as a naive split('\n\n'), which is a latent wall-of-text on any body
 *   written without blank lines.
 */

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { RenderProse } from '@/utils/renderProse';
import { linkifyContent } from '@/utils/linkifyContent';
import { cn } from '@/lib/utils';

/** Literal strings so the Tailwind JIT scanner can see every class. */
const CLAMP_CLASS: Record<number, string> = {
  2: 'line-clamp-2',
  3: 'line-clamp-3',
  4: 'line-clamp-4',
  5: 'line-clamp-5',
  6: 'line-clamp-6',
};

interface ExpandableProseProps {
  content: string | null | undefined;
  /** Accent token for the control, e.g. "text-bevel-story". */
  accentClassName?: string;
  /** Collapsed height in lines. Default 4. */
  clampLines?: 2 | 3 | 4 | 5 | 6;
  /** Type and colour for the body; cascades to both states. */
  className?: string;
}

export const ExpandableProse: React.FC<ExpandableProseProps> = ({
  content,
  accentClassName,
  clampLines = 4,
  className,
}) => {
  const clampedRef = useRef<HTMLParagraphElement>(null);
  const [overflows, setOverflows] = useState(false);
  const [expanded, setExpanded] = useState(false);

  const body = (content ?? '').trim();

  const measure = useCallback(() => {
    const el = clampedRef.current;
    if (!el) return;
    // 1px tolerance: sub-pixel line heights round against us.
    setOverflows(el.scrollHeight - el.clientHeight > 1);
  }, []);

  useEffect(() => {
    // Only the collapsed element is measurable. When expanded it is unmounted
    // and `overflows` deliberately retains its last value, so "Show less" stays.
    if (expanded) return;
    measure();
    const el = clampedRef.current;
    if (!el || typeof ResizeObserver === 'undefined') return;
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, [expanded, body, measure]);

  if (!body) return null;

  return (
    <div className={className}>
      {expanded ? (
        <RenderProse content={body} />
      ) : (
        <p
          ref={clampedRef}
          data-testid="expandable-prose-clamped"
          className={cn(CLAMP_CLASS[clampLines], 'whitespace-pre-line break-words')}
        >
          {linkifyContent(body)}
        </p>
      )}

      {(overflows || expanded) && (
        <button
          type="button"
          data-testid="expandable-prose-control"
          onClick={(e) => {
            e.stopPropagation();
            setExpanded((v) => !v);
          }}
          className={cn(
            'mt-0.5 inline-flex min-h-11 items-center text-meta font-semibold',
            accentClassName
          )}
        >
          {expanded ? 'Show less' : 'Read more'}
        </button>
      )}
    </div>
  );
};
