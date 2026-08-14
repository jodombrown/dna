/**
 * post_drafts data layer — shared between the Drafts & Scheduled page
 * (src/pages/dna/DraftsAndScheduled.tsx, kept as a deep-link route) and the
 * sidebar popover (src/components/feed/DraftsAndScheduledPopover.tsx). One
 * query, one delete mutation, one composer hand-off — both surfaces render
 * it differently but must never drift on what counts as scheduled/draft/failed.
 */

import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { getErrorMessage } from '@/lib/errorLogger';
import type { useUniversalComposer } from '@/contexts/ComposerContext';

export type DraftStatus = 'draft' | 'scheduled' | 'failed';

export interface PostDraftRow {
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

export function contentPreview(payload: Record<string, unknown>): string {
  const content = typeof payload.content === 'string' ? payload.content : '';
  const trimmed = content.trim();
  if (!trimmed) return '(No text)';
  return trimmed.length > PREVIEW_LENGTH ? `${trimmed.slice(0, PREVIEW_LENGTH)}…` : trimmed;
}

/** Same edit-mode hand-off every "Edit" / "Edit & retry" action uses. */
export function openDraftInComposer(
  composer: ReturnType<typeof useUniversalComposer>,
  row: PostDraftRow
): void {
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
}

export function usePostDraftRows() {
  const { user } = useAuth();
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

  return {
    isLoading,
    scheduled,
    drafts,
    failed,
    total: scheduled.length + drafts.length + failed.length,
    deletingId,
    handleDelete,
  };
}
