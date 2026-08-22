/**
 * post_drafts — save-as-draft and schedule-for-later for the composer.
 *
 * connect/story modes only (BD534). The publish-scheduled-post edge
 * function and its pg_cron job own turning a 'scheduled' row into a
 * real post; this file only ever writes 'draft' or 'scheduled' rows.
 */

import { supabase } from '@/integrations/supabase/client';
import type { Json } from '@/integrations/supabase/types';
import type { ComposerFormData } from '@/hooks/useUniversalComposer';

export interface SaveDraftParams {
  authorId: string;
  mode: 'connect' | 'story';
  payload: ComposerFormData;
}

export interface ScheduleDraftParams {
  authorId: string;
  mode: 'connect' | 'story';
  payload: ComposerFormData;
  /** Already resolved to the correct instant — the caller converts wall time to UTC. */
  scheduledAt: Date;
}

export async function saveDraft(params: SaveDraftParams): Promise<{ id: string }> {
  const { data, error } = await supabase
    .from('post_drafts')
    .insert({
      author_id: params.authorId,
      mode: params.mode,
      payload: params.payload as unknown as Json,
      status: 'draft',
    })
    .select('id')
    .single();
  if (error || !data) throw error ?? new Error('Failed to save draft');
  return data;
}

export async function scheduleDraft(params: ScheduleDraftParams): Promise<{ id: string }> {
  const { data, error } = await supabase
    .from('post_drafts')
    .insert({
      author_id: params.authorId,
      mode: params.mode,
      payload: params.payload as unknown as Json,
      status: 'scheduled',
      scheduled_at: params.scheduledAt.toISOString(),
    })
    .select('id')
    .single();
  if (error || !data) throw error ?? new Error('Failed to schedule post');
  return data;
}

export interface UpdateDraftParams {
  id: string;
  mode: 'connect' | 'story';
  payload: ComposerFormData;
}

export interface UpdateScheduleParams {
  id: string;
  mode: 'connect' | 'story';
  payload: ComposerFormData;
  /** Already resolved to the correct instant — the caller converts wall time to UTC. */
  scheduledAt: Date;
}

/**
 * Re-editing a 'draft' or 'failed' row and saving as a draft again. UPDATEs
 * the existing row in place — an edit session must never leave a second row
 * behind (BD534 step 5).
 */
export async function updateDraft(params: UpdateDraftParams): Promise<{ id: string }> {
  const { data, error } = await supabase
    .from('post_drafts')
    .update({
      mode: params.mode,
      payload: params.payload as unknown as Json,
      status: 'draft',
      updated_at: new Date().toISOString(),
    })
    .eq('id', params.id)
    .select('id');
  if (error) throw error;
  // BD638 (1): a PostgREST UPDATE that matches no row is not an error — it
  // returns zero rows and no error, so a write blocked by RLS or aimed at a
  // deleted/foreign id used to resolve as success and the composer showed a
  // "Draft saved" toast over work that was never stored. Asking for the
  // affected rows back is what makes a zero-row update observable.
  if (!data || data.length === 0) {
    throw new Error('Draft could not be saved — it may have been deleted.');
  }
  return { id: params.id };
}

/**
 * Re-editing a row and (re)scheduling it. UPDATEs the existing row — same
 * id, new scheduled_at, failure_reason cleared so a retried 'failed' row
 * doesn't carry its old failure into the next attempt.
 */
export async function updateSchedule(params: UpdateScheduleParams): Promise<{ id: string }> {
  const { data, error } = await supabase
    .from('post_drafts')
    .update({
      mode: params.mode,
      payload: params.payload as unknown as Json,
      status: 'scheduled',
      scheduled_at: params.scheduledAt.toISOString(),
      failure_reason: null,
      updated_at: new Date().toISOString(),
    })
    .eq('id', params.id)
    .select('id');
  if (error) throw error;
  // Same zero-row-is-not-an-error hazard as updateDraft above (BD638).
  if (!data || data.length === 0) {
    throw new Error('Schedule could not be saved — the draft may have been deleted.');
  }
  return { id: params.id };
}

/**
 * Normal "Post now" on an edit session: the content now exists as a real
 * post, so the draft row it came from has no further purpose.
 */
export async function deletePostDraft(id: string): Promise<void> {
  const { error } = await supabase.from('post_drafts').delete().eq('id', id);
  if (error) throw error;
}
