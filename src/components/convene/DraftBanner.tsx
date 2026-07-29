import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface DraftBannerProps {
  onPublish: () => void;
  isPending: boolean;
}

/**
 * Draft banner — the anti-silent-failure control. A draft is invisible
 * to everyone but the organizer; without this banner an organizer can
 * share a link nobody else can open and never learn why.
 *
 * Owns its own bottom rhythm (mb-6) so the page file does not carry a
 * layout margin — "Section owns rhythm".
 */
export function DraftBanner({ onPublish, isPending }: DraftBannerProps) {
  return (
    <div className="mb-6 flex flex-col sm:flex-row sm:items-center gap-3 rounded-lg border-2 border-dna-warning bg-dna-warning/10 p-4">
      <p className="flex-1 font-semibold text-dna-warning">
        This event is a draft. Nobody can see it but you.
      </p>
      <Button
        className="shrink-0"
        onClick={onPublish}
        disabled={isPending}
      >
        {isPending
          ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Publishing...</>
          : 'Publish Event'}
      </Button>
    </div>
  );
}
