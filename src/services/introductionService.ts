/**
 * DNA | Introduction Service
 *
 * Handles warm introductions between two connections:
 * - Group introduction (3-person thread)
 * - Separate introductions (individual 1:1 messages)
 * - Tracks introductions in the `introductions` table
 */

import { supabase } from '@/integrations/supabase/client';

export interface IntroductionPayload {
  introducerId: string;
  personAId: string;
  personBId: string;
  message: string;
  introType: 'group' | 'separate';
  context?: Record<string, unknown>;
}

export interface IntroductionResult {
  success: boolean;
  conversationId?: string;
  error?: string;
}

/**
 * Send a group introduction — creates a 3-person conversation
 */
export async function sendGroupIntroduction(
  payload: IntroductionPayload
): Promise<IntroductionResult> {
  const { introducerId, personAId, personBId, message, context } = payload;

  try {
    // 1. Create group conversation
    const { data: conversation, error: convError } = await supabase
      .from('conversations_new')
      .insert({
        conversation_type: 'group',
        origin_type: 'introduction',
        created_by: introducerId,
        title: 'Introduction',
        metadata: { introduction: true },
      })
      .select('id')
      .single();

    if (convError || !conversation) {
      return { success: false, error: convError?.message || 'Failed to create conversation' };
    }

    const conversationId = conversation.id;

    // 2. Add all 3 participants
    const participants = [introducerId, personAId, personBId].map(userId => ({
      conversation_id: conversationId,
      user_id: userId,
    }));

    const { error: partError } = await supabase
      .from('conversation_participants')
      .insert(participants);

    if (partError) {
      return { success: false, error: partError.message };
    }

    // 3. Send the introduction message
    const { error: msgError } = await supabase
      .from('messages')
      .insert({
        conversation_id: conversationId,
        sender_id: introducerId,
        content: message,
        message_type: 'text',
      });

    if (msgError) {
      // Try alternate messages table
      await (supabase as unknown as { from: (t: string) => typeof supabase extends { from: infer F } ? ReturnType<F extends (...a: unknown[]) => infer R ? () => R : never> : never })
        .from('messaging_messages' as never)
        .insert({
          conversation_id: conversationId,
          sender_id: introducerId,
          content: message,
          message_type: 'text',
        } as never);
    }

    // 4. Update conversation last_message_at
    await supabase
      .from('conversations_new')
      .update({ last_message_at: new Date().toISOString() })
      .eq('id', conversationId);

    // 5. Track the introduction
    await supabase
      .from('introductions' as never)
      .insert({
        introducer_id: introducerId,
        person_a_id: personAId,
        person_b_id: personBId,
        conversation_id: conversationId,
        intro_type: 'group',
        message,
        context: context || {},
      } as never);

    // 6. Create notifications for both recipients
    const notifs = [personAId, personBId].map(recipientId => ({
      user_id: recipientId,
      type: 'introduction',
      title: 'You were introduced to someone',
      message: message.slice(0, 100),
      link: `/dna/messages?conversation=${conversationId}`,
      is_read: false,
    }));

    await supabase.from('notifications').insert(notifs);

    return { success: true, conversationId };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Unknown error' };
  }
}

/**
 * Generate a warm introduction message template
 */
export function generateIntroMessage(
  personAName: string,
  personBName: string,
  personAHeadline?: string,
  personBHeadline?: string
): string {
  const aDesc = personAHeadline ? `, ${personAHeadline}` : '';
  const bDesc = personBHeadline ? `, ${personBHeadline}` : '';

  return `Hey ${personAName} and ${personBName}! I wanted to connect you two — ${personAName}${aDesc} and ${personBName}${bDesc}. I think you'd have a lot to talk about!`;
}
