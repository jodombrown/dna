/**
 * Drafts & Scheduled — sidebar popover (reverses BD539's page-based
 * approach per founder feedback).
 *
 * Same data layer as the /dna/feed/drafts page (usePostDraftRows): three
 * sections (Scheduled/Drafts/Failed), same sort orders, same edit hand-off.
 * Only the container and row density change — modeled on
 * UnifiedNotificationBell: a Badge with a live count on the trigger, a
 * Popover (not a route) for the content.
 */

import { useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { CalendarClock, ChevronRight, FileClock, Loader2, Pencil, Trash2, TriangleAlert } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { useUniversalComposer } from '@/contexts/ComposerContext';
import { usePostDraftRows, contentPreview, openDraftInComposer, type PostDraftRow } from '@/hooks/usePostDraftRows';
import { cn } from '@/lib/utils';

export function DraftsAndScheduledPopover() {
  const [isOpen, setIsOpen] = useState(false);
  const composer = useUniversalComposer();
  const { isLoading, scheduled, drafts, failed, total, deletingId, handleDelete } = usePostDraftRows();

  const handleEdit = (row: PostDraftRow) => {
    setIsOpen(false);
    openDraftInComposer(composer, row);
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          className="group/drafts mt-2 flex w-full items-center gap-2 border-t border-border/50 pt-2.5 text-meta text-muted-foreground transition-colors hover:text-foreground"
        >
          <span className="relative flex shrink-0">
            <FileClock className="h-3.5 w-3.5 text-dna-emerald" />
            {total > 0 && (
              <Badge className="absolute -top-1 -right-1 flex h-5 min-w-5 items-center justify-center px-1 text-micro text-primary-foreground bg-primary hover:bg-primary/90">
                {total > 99 ? '99+' : total}
              </Badge>
            )}
          </span>
          <span>Drafts &amp; Scheduled</span>
          <ChevronRight className="ml-auto h-3 w-3 opacity-0 transition-opacity group-hover/drafts:opacity-100" />
        </button>
      </PopoverTrigger>
      <PopoverContent
        align="start"
        side="right"
        sideOffset={8}
        className="w-80 max-h-96 overflow-y-auto p-0"
      >
        {isLoading ? (
          <div className="space-y-2 p-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-10 w-full animate-pulse rounded-md bg-muted" />
            ))}
          </div>
        ) : (
          <div className="divide-y divide-border/50">
            <CompactSection title="Scheduled" count={scheduled.length}>
              {scheduled.map((row) => (
                <CompactRow
                  key={row.id}
                  row={row}
                  metaLine={
                    row.scheduled_at
                      ? new Date(row.scheduled_at).toLocaleString(undefined, {
                          dateStyle: 'medium',
                          timeStyle: 'short',
                        })
                      : 'No time set'
                  }
                  onEdit={() => handleEdit(row)}
                  deleteLabel="Cancel"
                  deleteTitle="Cancel this scheduled post?"
                  deleteDescription="It will not be published and this can't be undone."
                  isDeleting={deletingId === row.id}
                  onConfirmDelete={() => handleDelete(row.id)}
                />
              ))}
            </CompactSection>

            <CompactSection title="Drafts" count={drafts.length}>
              {drafts.map((row) => (
                <CompactRow
                  key={row.id}
                  row={row}
                  metaLine={`Edited ${formatDistanceToNow(new Date(row.updated_at), { addSuffix: true })}`}
                  onEdit={() => handleEdit(row)}
                  deleteLabel="Delete"
                  deleteTitle="Delete this draft?"
                  deleteDescription="This can't be undone."
                  isDeleting={deletingId === row.id}
                  onConfirmDelete={() => handleDelete(row.id)}
                />
              ))}
            </CompactSection>

            <CompactSection title="Failed" count={failed.length}>
              {failed.map((row) => (
                <CompactRow
                  key={row.id}
                  row={row}
                  metaLine={null}
                  failureReason={row.failure_reason}
                  onEdit={() => handleEdit(row)}
                  deleteLabel="Delete"
                  deleteTitle="Delete this failed post?"
                  deleteDescription="This can't be undone."
                  isDeleting={deletingId === row.id}
                  onConfirmDelete={() => handleDelete(row.id)}
                />
              ))}
            </CompactSection>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}

function CompactSection({
  title,
  count,
  children,
}: {
  title: string;
  count: number;
  children: React.ReactNode;
}) {
  return (
    <section>
      <p className="px-3 pt-2.5 text-micro uppercase text-muted-foreground">
        {title} <span className="normal-case">({count})</span>
      </p>
      {count === 0 ? (
        <p className="px-3 pb-2.5 pt-1 text-meta text-muted-foreground">Nothing here.</p>
      ) : (
        <div className="pb-1">{children}</div>
      )}
    </section>
  );
}

function CompactRow({
  row,
  metaLine,
  failureReason,
  onEdit,
  deleteLabel,
  deleteTitle,
  deleteDescription,
  isDeleting,
  onConfirmDelete,
}: {
  row: PostDraftRow;
  metaLine: string | null;
  failureReason?: string | null;
  onEdit: () => void;
  deleteLabel: string;
  deleteTitle: string;
  deleteDescription: string;
  isDeleting: boolean;
  onConfirmDelete: () => void;
}) {
  return (
    <div className="flex items-start justify-between gap-2 px-3 py-1.5 hover:bg-muted/40">
      <div className="min-w-0 flex-1">
        {metaLine && (
          <p className="flex items-center gap-1 text-micro font-normal normal-case tracking-normal text-muted-foreground">
            <CalendarClock className="h-3 w-3 shrink-0" aria-hidden="true" />
            <span className="truncate">{metaLine}</span>
          </p>
        )}
        {failureReason && (
          <p className="flex items-start gap-1 text-micro font-normal normal-case tracking-normal text-destructive">
            <TriangleAlert className="h-3 w-3 shrink-0 translate-y-0.5" aria-hidden="true" />
            <span className="line-clamp-1">{failureReason}</span>
          </p>
        )}
        <p className="truncate text-meta text-foreground">{contentPreview(row.payload)}</p>
      </div>
      <div className="flex shrink-0 items-center gap-0.5">
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6"
          onClick={onEdit}
          aria-label="Edit"
        >
          <Pencil className="h-3 w-3" aria-hidden="true" />
        </Button>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className={cn('h-6 w-6', deleteLabel === 'Delete' && 'hover:text-destructive')}
              disabled={isDeleting}
              aria-label={deleteLabel}
            >
              {isDeleting ? (
                <Loader2 className="h-3 w-3 animate-spin" aria-hidden="true" />
              ) : (
                <Trash2 className="h-3 w-3" aria-hidden="true" />
              )}
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>{deleteTitle}</AlertDialogTitle>
              <AlertDialogDescription>{deleteDescription}</AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Keep it</AlertDialogCancel>
              <AlertDialogAction
                onClick={onConfirmDelete}
                className="bg-destructive hover:bg-destructive/90"
              >
                {deleteLabel}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
}
