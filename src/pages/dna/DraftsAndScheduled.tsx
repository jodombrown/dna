/**
 * Drafts & Scheduled — BD534 step 5.
 *
 * Where a member finds, edits, or cancels a post_drafts row. Three sections
 * (scheduled / draft / failed), each querying the member's own rows —
 * RLS already restricts to author_id = auth.uid() (BD535), so this is a
 * normal authenticated read, no special handling.
 *
 * "Edit" and "Edit & retry" both resume the row in the composer via
 * composer.open(draft.mode, { editDraft: {...} }) — the same edit-mode path,
 * regardless of which section the row came from.
 */

import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { formatDistanceToNow } from 'date-fns';
import { CalendarClock, Loader2, Pencil, Trash2, TriangleAlert } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
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
import { useAuth } from '@/contexts/AuthContext';
import { useUniversalComposer } from '@/contexts/ComposerContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { getErrorMessage } from '@/lib/errorLogger';

type DraftStatus = 'draft' | 'scheduled' | 'failed';

interface PostDraftRow {
  id: string;
  mode: string;
  payload: Record<string, unknown>;
  status: string;
  scheduled_at: string | null;
  failure_reason: string | null;
  created_at: string;
  updated_at: string;
}

const PREVIEW_LENGTH = 100;

function contentPreview(payload: Record<string, unknown>): string {
  const content = typeof payload.content === 'string' ? payload.content : '';
  const trimmed = content.trim();
  if (!trimmed) return '(No text)';
  return trimmed.length > PREVIEW_LENGTH ? `${trimmed.slice(0, PREVIEW_LENGTH)}…` : trimmed;
}

export default function DraftsAndScheduled() {
  const { user } = useAuth();
  const composer = useUniversalComposer();
  const queryClient = useQueryClient();
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const { data: rows, isLoading } = useQuery({
    queryKey: ['post-drafts', user?.id],
    queryFn: async (): Promise<PostDraftRow[]> => {
      const { data, error } = await supabase
        .from('post_drafts')
        .select('id, mode, payload, status, scheduled_at, failure_reason, created_at, updated_at')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return (data ?? []) as unknown as PostDraftRow[];
    },
    enabled: !!user,
  });

  const scheduled = (rows ?? [])
    .filter((r) => r.status === 'scheduled')
    .sort((a, b) => (a.scheduled_at ?? '').localeCompare(b.scheduled_at ?? ''));
  const drafts = (rows ?? [])
    .filter((r) => r.status === 'draft')
    .sort((a, b) => b.updated_at.localeCompare(a.updated_at));
  const failed = (rows ?? []).filter((r) => r.status === 'failed');

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    try {
      const { error } = await supabase.from('post_drafts').delete().eq('id', id);
      if (error) throw error;
      queryClient.setQueryData<PostDraftRow[]>(['post-drafts', user?.id], (old) =>
        (old ?? []).filter((r) => r.id !== id)
      );
    } catch (error) {
      toast({ variant: 'destructive', description: getErrorMessage(error) });
    } finally {
      setDeletingId(null);
    }
  };

  const openInComposer = (row: PostDraftRow) => {
    const mode = row.mode === 'story' ? 'story' : 'connect';
    composer.open(mode, {
      editDraft: {
        id: row.id,
        mode,
        payload: row.payload,
        status: row.status as DraftStatus,
        scheduledAt: row.scheduled_at ?? undefined,
      },
    });
  };

  if (!user) return null;

  return (
    <div className="container mx-auto max-w-3xl px-3 py-4 sm:px-4 sm:py-6">
      <div className="mb-5">
        <h1 className="text-h1">Drafts &amp; Scheduled</h1>
        <p className="mt-1 text-body text-muted-foreground">
          Posts you've saved for later, scheduled to go out, or that failed to publish.
        </p>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-20 w-full rounded-lg" />
          ))}
        </div>
      ) : (
        <div className="space-y-8">
          <Section title="Scheduled" count={scheduled.length}>
            {scheduled.length === 0 ? (
              <EmptySection message="Nothing scheduled right now." />
            ) : (
              <div className="space-y-3">
                {scheduled.map((row) => (
                  <DraftCard
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
                    onEdit={() => openInComposer(row)}
                    editLabel="Edit"
                    deleteLabel="Cancel"
                    deleteTitle="Cancel this scheduled post?"
                    deleteDescription="It will not be published and this can't be undone."
                    isDeleting={deletingId === row.id}
                    onConfirmDelete={() => handleDelete(row.id)}
                  />
                ))}
              </div>
            )}
          </Section>

          <Section title="Drafts" count={drafts.length}>
            {drafts.length === 0 ? (
              <EmptySection message="No saved drafts." />
            ) : (
              <div className="space-y-3">
                {drafts.map((row) => (
                  <DraftCard
                    key={row.id}
                    row={row}
                    metaLine={`Last edited ${formatDistanceToNow(new Date(row.updated_at), { addSuffix: true })}`}
                    onEdit={() => openInComposer(row)}
                    editLabel="Edit"
                    deleteLabel="Delete"
                    deleteTitle="Delete this draft?"
                    deleteDescription="This can't be undone."
                    isDeleting={deletingId === row.id}
                    onConfirmDelete={() => handleDelete(row.id)}
                  />
                ))}
              </div>
            )}
          </Section>

          <Section title="Failed" count={failed.length}>
            {failed.length === 0 ? (
              <EmptySection message="Nothing has failed to publish." />
            ) : (
              <div className="space-y-3">
                {failed.map((row) => (
                  <DraftCard
                    key={row.id}
                    row={row}
                    metaLine={null}
                    failureReason={row.failure_reason}
                    onEdit={() => openInComposer(row)}
                    editLabel="Edit & retry"
                    deleteLabel="Delete"
                    deleteTitle="Delete this failed post?"
                    deleteDescription="This can't be undone."
                    isDeleting={deletingId === row.id}
                    onConfirmDelete={() => handleDelete(row.id)}
                  />
                ))}
              </div>
            )}
          </Section>
        </div>
      )}
    </div>
  );
}

function Section({
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
      <h2 className="mb-3 flex items-center gap-2 text-h3">
        {title}
        <span className="text-meta font-normal text-muted-foreground">({count})</span>
      </h2>
      {children}
    </section>
  );
}

function EmptySection({ message }: { message: string }) {
  return <p className="text-body text-muted-foreground">{message}</p>;
}

function DraftCard({
  row,
  metaLine,
  failureReason,
  onEdit,
  editLabel,
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
  editLabel: string;
  deleteLabel: string;
  deleteTitle: string;
  deleteDescription: string;
  isDeleting: boolean;
  onConfirmDelete: () => void;
}) {
  return (
    <Card>
      <CardContent className="flex items-start justify-between gap-4 p-4">
        <div className="min-w-0 flex-1">
          {metaLine && (
            <p className="mb-1 flex items-center gap-1.5 text-meta text-muted-foreground">
              <CalendarClock className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
              {metaLine}
            </p>
          )}
          {failureReason && (
            <p className="mb-1.5 flex items-start gap-1.5 text-meta text-destructive">
              <TriangleAlert className="h-3.5 w-3.5 shrink-0 translate-y-0.5" aria-hidden="true" />
              <span>{failureReason}</span>
            </p>
          )}
          <p className="line-clamp-2 text-body text-foreground">{contentPreview(row.payload)}</p>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <Button variant="outline" size="sm" onClick={onEdit}>
            <Pencil className="mr-1.5 h-3.5 w-3.5" aria-hidden="true" />
            {editLabel}
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="ghost" size="sm" disabled={isDeleting}>
                {isDeleting ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden="true" />
                ) : (
                  <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                )}
                <span className="ml-1.5">{deleteLabel}</span>
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
      </CardContent>
    </Card>
  );
}
