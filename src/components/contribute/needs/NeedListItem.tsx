// Minimal Need row for the Contribute hub lenses. Deliberately restrained: it is
// the hub's list row, not the flagged Need card (Frame 9). It carries no amount
// and no contributor count, because the brief forbids amounts and the canonical
// need_declarations model records no contributors yet. Gold appears once, on the
// currency eyebrow, the row's single accent. No left-edge stripe, no coloured
// band: the card is flat, carried by border, per the Arc 3 form rules.

import { Link } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CURRENCY_VISUALS } from '../manifest/currencyConfig';
import { NEED_SCOPE_LABELS, NEED_STATUS_LABELS } from './needsConfig';
import type { NeedDeclaration } from '@/types/contribute';

interface NeedListItemProps {
  need: NeedDeclaration;
  /** Show the lifecycle status chip (used in Mine, where status varies). */
  showStatus?: boolean;
}

export function NeedListItem({ need, showStatus = false }: NeedListItemProps) {
  const currency = CURRENCY_VISUALS[need.currency];
  const scope = NEED_SCOPE_LABELS[need.scope];
  const status = NEED_STATUS_LABELS[need.status];

  return (
    <Card className="p-4 transition-colors hover:bg-muted/40 sm:p-5">
      <Link to={`/dna/contribute/needs/${need.id}`} className="block">
        <span className="text-micro uppercase text-c5-contribute-text">{currency.label}</span>
        <h3 className="mt-1 text-h3 text-foreground">{need.title}</h3>
        {need.context && (
          <p className="mt-1 line-clamp-2 text-body text-muted-foreground">{need.context}</p>
        )}
        <div className="mt-3 flex flex-wrap items-center gap-2">
          {showStatus && <Badge variant="secondary">{status.short}</Badge>}
          <Badge variant="outline">{scope.short}</Badge>
          {need.tags.slice(0, 3).map((tag) => (
            <Badge key={tag} variant="outline">
              {tag}
            </Badge>
          ))}
        </div>
      </Link>
    </Card>
  );
}
