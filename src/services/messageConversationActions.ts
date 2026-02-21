/**
 * Conversation management actions (delete, archive, pin, mute)
 * Extracted from messageService.ts for better modularity
 */

import { supabase } from '@/integrations/supabase/client';

/**
 * Delete a conversation (soft delete - hides for current user only)
 */
export async function deleteConversation(conversationId: string): Promise<void> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  // Get conversation to determine which user column to update
  const { data: conv, error: fetchError } = await supabase
    .from('conversations')
    .select('user_a, user_b')
    .eq('id', conversationId)
    .single();

  if (fetchError || !conv) throw new Error('Conversation not found');

  const isUserA = conv.user_a === user.id;
  const updateField = isUserA ? 'deleted_by_a' : 'deleted_by_b';

  const { error } = await supabase
    .from('conversations')
    .update({ [updateField]: true })
    .eq('id', conversationId);

  if (error) throw error;
}

/**
 * Archive/unarchive a conversation
 */
export async function archiveConversation(conversationId: string, archive: boolean = true): Promise<void> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { data: conv, error: fetchError } = await supabase
    .from('conversations')
    .select('user_a, user_b')
    .eq('id', conversationId)
    .single();

  if (fetchError || !conv) throw new Error('Conversation not found');

  const isUserA = conv.user_a === user.id;
  const updateField = isUserA ? 'is_archived_by_a' : 'is_archived_by_b';

  const { error } = await supabase
    .from('conversations')
    .update({ [updateField]: archive })
    .eq('id', conversationId);

  if (error) throw error;
}

/**
 * Pin/unpin a conversation
 */
export async function pinConversation(conversationId: string, pin: boolean = true): Promise<void> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { data: conv, error: fetchError } = await supabase
    .from('conversations')
    .select('user_a, user_b')
    .eq('id', conversationId)
    .single();

  if (fetchError || !conv) throw new Error('Conversation not found');

  const isUserA = conv.user_a === user.id;
  const updateField = isUserA ? 'is_pinned_by_a' : 'is_pinned_by_b';

  const { error } = await supabase
    .from('conversations')
    .update({ [updateField]: pin })
    .eq('id', conversationId);

  if (error) throw error;
}

/**
 * Mute/unmute a conversation
 */
export async function muteConversation(conversationId: string, mute: boolean = true): Promise<void> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { data: conv, error: fetchError } = await supabase
    .from('conversations')
    .select('user_a, user_b')
    .eq('id', conversationId)
    .single();

  if (fetchError || !conv) throw new Error('Conversation not found');

  const isUserA = conv.user_a === user.id;
  const updateField = isUserA ? 'is_muted_by_a' : 'is_muted_by_b';

  const { error } = await supabase
    .from('conversations')
    .update({ [updateField]: mute })
    .eq('id', conversationId);

  if (error) throw error;
}
