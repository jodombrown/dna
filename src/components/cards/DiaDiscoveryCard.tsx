/**
 * DiaDiscoveryCard — the shared chassis for every DIA discovery card, across
 * all five C's (BD232). A sibling of EventCardFrame and EventListRow: same
 * chassis idiom (12px radius, four-sided 3px bevel, bg-card, --card-padding,
 * no resting shadow), its own three bands. It has no image band, so it is a
 * sibling, not a variant of EventCardFrame.
 *
 *   1. Provenance — the DIA chip (adinkra + "DIA · MODULE" eyebrow) + dismiss.
 *   2. Body       — lead icon + headline + one supporting line.
 *   3. Action     — one CTA.
 *
 * Identity is not configurable, by design. The chip is always DIA gold
 * (--dna-dia); the frame is always the module's content-card bevel; the
 * adinkra and eyebrow resolve from `module`. Nothing here takes a colour — a
 * colour prop is how drift returns, which is why chipColor / frameToken /
 * glyph are absent. It knows nothing about *why* a card shows: each module
 * supplies its own content and owns its own dismiss write.
 */

import React from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';
import {
  Nkonsonkonson,
  Mpatapo,
  Adinkrahene,
  FuntunfunefuDenkyemfunefu,
  Sankofa,
} from '@/components/icons/adinkra';

type DiaModule = 'convene' | 'convey' | 'contribute' | 'collaborate' | 'connect';

type Glyph = React.ComponentType<{ className?: string }>;

export interface DiaDiscoveryCardProps {
  /** The C this card speaks for. Resolves — internally, from one fixed map —
   *  the frame bevel token, the adinkra glyph, and the eyebrow label.
   *  This is the ONLY identity input. */
  module: DiaModule;

  /** Per-variant lead icon (a lucide glyph). Content, not identity. */
  icon: Glyph;

  headline: string;
  body: string;

  cta: { label: string; onClick: () => void; variant?: 'solid' | 'outline' };

  /** The chassis owns the button and its 44px target; the module owns the
   *  7-day localStorage write, unchanged. */
  onDismiss: () => void;

  /** When the card's content is an announcement (a "preparing" / "rebuilding"
   *  state), mark it a live region so a screen reader announces its
   *  appearance. A11y semantics only — it changes nothing visual, so it is
   *  not the identity/colour category the frozen signature excludes. */
  announce?: boolean;

  /** Layout positioning only — never restyling. */
  className?: string;
}

/**
 * The frame takes the module's content-card bevel, never its module colour.
 * --dna-dia is 39 65% 47% — byte-identical to --module-convene; a
 * module-coloured frame would put a gold chip on a gold frame and the chip
 * would vanish. --bevel-event copper gives Convene a non-gold edge.
 */
const MODULE_CONFIG: Record<
  DiaModule,
  { bevelToken: string; Glyph: Glyph; eyebrow: string }
> = {
  convene: { bevelToken: 'event', Glyph: Nkonsonkonson, eyebrow: 'DIA · CONVENE' },
  convey: { bevelToken: 'story', Glyph: Mpatapo, eyebrow: 'DIA · CONVEY' },
  contribute: { bevelToken: 'opportunity', Glyph: Adinkrahene, eyebrow: 'DIA · CONTRIBUTE' },
  collaborate: { bevelToken: 'space', Glyph: FuntunfunefuDenkyemfunefu, eyebrow: 'DIA · COLLABORATE' },
  connect: { bevelToken: 'connect', Glyph: Sankofa, eyebrow: 'DIA · CONNECT' },
};

export function DiaDiscoveryCard({
  module,
  icon: LeadIcon,
  headline,
  body,
  cta,
  onDismiss,
  announce,
  className,
}: DiaDiscoveryCardProps) {
  const { bevelToken, Glyph, eyebrow } = MODULE_CONFIG[module];

  return (
    <div className={cn('w-full', className)}>
      <div
        role={announce ? 'status' : undefined}
        className="relative overflow-hidden rounded-xl border-bevel bg-card"
        style={{
          // Match the sibling exactly (EventCardFrame:55): four-sided bevel,
          // colour applied inline from the token (BD083). Never a left spine.
          borderColor: `hsl(var(--bevel-${bevelToken}))`,
          padding: 'var(--card-padding)',
        }}
      >
        {/* Dismiss — 44px touch target, pinned to the corner. */}
        <button
          type="button"
          onClick={onDismiss}
          aria-label="Dismiss"
          className="absolute top-1 right-1 p-3 rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          style={{ minWidth: 44, minHeight: 44 }}
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex flex-col gap-2">
          {/* Band 1 — provenance. The gold chip always wears DIA; a hairline
              ring keeps it legible even on a gold-near-gold frame (Contribute). */}
          <div className="flex items-center gap-2 pr-12">
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-dna-dia ring-1 ring-border">
              <Glyph className="w-3 h-3 text-white" />
            </span>
            <span className="text-micro text-dna-dia">{eyebrow}</span>
          </div>

          {/* Band 2 — body. */}
          <div className="flex items-start gap-2">
            <LeadIcon className="w-4 h-4 mt-0.5 shrink-0 text-foreground" />
            <div className="flex flex-col gap-1">
              <h4 className="text-h3 text-foreground">{headline}</h4>
              <p className="text-body text-muted-foreground">{body}</p>
            </div>
          </div>

          {/* Band 3 — action. One CTA. */}
          <div className="flex">
            <Button
              size="sm"
              variant={cta.variant === 'outline' ? 'secondary' : 'default'}
              onClick={cta.onClick}
            >
              {cta.label}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DiaDiscoveryCard;
