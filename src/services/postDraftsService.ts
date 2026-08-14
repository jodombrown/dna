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
