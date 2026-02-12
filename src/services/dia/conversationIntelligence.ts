/**
 * DIA | Conversation Intelligence Service
 *
 * Analyzes messaging METADATA for relationship strength signals.
 * DIA only accesses metadata (frequency, timing, participants) — NEVER message content.
 *
 * This is a critical privacy boundary: the service reads aggregate counts
 * and timestamps, not the actual text of messages.
 *
 * Powers: Network Intelligence (feeds strength scores), DIA Chat (context)
 */

import { supabase } from '@/integrations/supabase/client';
import type {
  ConversationMetadata,
  MessageFrequency,
  ResponsePattern,
} from '@/types/dia';

/**
 * Get conversation metadata for relationship intelligence.
 * Privacy: This function NEVER reads message content.
 */
async function getConversationMetadata(conversationId: string): Promise<ConversationMetadata> {
  // Get participants
  const { data: participants } = await supabase
    .from('conversation_participants')
    .select('user_id, last_read_at')
    .eq('conversation_id', conversationId);

  const participantIds = (participants || []).map(p => p.user_id);

  // Get message counts and timestamps (metadata only, not content)
  const { data: messageStats } = await supabase
    .from('messages')
    .select('sender_id, created_at')
    .eq('conversation_id', conversationId)
    .order('created_at', { ascending: true });

  const frequency = computeFrequency(messageStats || []);
  const responsePatterns = computeResponsePatterns(messageStats || [], participantIds);
  const initiationRatio = computeInitiationRatio(messageStats || [], participantIds);

  const lastMessage = messageStats && messageStats.length > 0
    ? messageStats[messageStats.length - 1]
    : null;

  return {
    conversation_id: conversationId,
    participant_ids: participantIds,
    message_frequency: frequency,
    response_patterns: responsePatterns,
    initiation_ratio: initiationRatio,
    last_activity: lastMessage?.created_at || new Date().toISOString(),
  };
}

/**
 * Get aggregate conversation stats for a user across all conversations.
 * Used by Network Intelligence for connection strength computation.
 */
async function getUserConversationStats(
  userId: string,
  otherUserId: string,
): Promise<{ messageCount: number; avgResponseMinutes: number; lastActivity: string | null }> {
  // Find shared conversation
  const { data: conversations } = await supabase
    .from('conversations')
    .select('id')
    .or(`and(user_a.eq.${userId},user_b.eq.${otherUserId}),and(user_a.eq.${otherUserId},user_b.eq.${userId})`)
    .limit(1);

  if (!conversations || conversations.length === 0) {
    return { messageCount: 0, avgResponseMinutes: 0, lastActivity: null };
  }

  const conversationId = conversations[0].id;

  const { data: messages, count } = await supabase
    .from('messages')
    .select('sender_id, created_at', { count: 'exact' })
    .eq('conversation_id', conversationId)
    .order('created_at', { ascending: false })
    .limit(1);

  return {
    messageCount: count || 0,
    avgResponseMinutes: 0, // Computed from response patterns
    lastActivity: messages && messages.length > 0 ? messages[0].created_at : null,
  };
}

// --- Internal computation helpers ---

function computeFrequency(
  messages: Array<{ sender_id: string; created_at: string }>,
): MessageFrequency {
  if (messages.length === 0) {
    return { daily_average: 0, weekly_average: 0, trend: 'dormant' };
  }

  const now = Date.now();
  const dayMs = 24 * 60 * 60 * 1000;
  const weekMs = 7 * dayMs;

  const recentDayCount = messages.filter(
    m => now - new Date(m.created_at).getTime() < dayMs,
  ).length;

  const recentWeekCount = messages.filter(
    m => now - new Date(m.created_at).getTime() < weekMs,
  ).length;

  const prevWeekCount = messages.filter(m => {
    const age = now - new Date(m.created_at).getTime();
    return age >= weekMs && age < weekMs * 2;
  }).length;

  let trend: MessageFrequency['trend'] = 'stable';
  if (recentWeekCount === 0 && prevWeekCount === 0) trend = 'dormant';
  else if (recentWeekCount > prevWeekCount * 1.3) trend = 'increasing';
  else if (recentWeekCount < prevWeekCount * 0.7) trend = 'decreasing';

  return {
    daily_average: recentDayCount,
    weekly_average: recentWeekCount,
    trend,
  };
}

function computeResponsePatterns(
  messages: Array<{ sender_id: string; created_at: string }>,
  participantIds: string[],
): ResponsePattern {
  if (messages.length < 2) {
    return { average_response_minutes: 0, response_rate: 0, peak_hours: [] };
  }

  const responseTimes: number[] = [];
  const hourCounts = new Array(24).fill(0);
  let replies = 0;
  let expectedReplies = 0;

  for (let i = 1; i < messages.length; i++) {
    const prev = messages[i - 1];
    const curr = messages[i];

    hourCounts[new Date(curr.created_at).getHours()]++;

    // If sender changed, this is a response
    if (prev.sender_id !== curr.sender_id) {
      const responseTime = new Date(curr.created_at).getTime() - new Date(prev.created_at).getTime();
      responseTimes.push(responseTime / (60 * 1000)); // Convert to minutes
      replies++;
    }
    if (prev.sender_id !== curr.sender_id || i === messages.length - 1) {
      expectedReplies++;
    }
  }

  const avgResponse = responseTimes.length > 0
    ? responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length
    : 0;

  // Find peak hours (top 3)
  const peakHours = hourCounts
    .map((count, hour) => ({ hour, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 3)
    .filter(h => h.count > 0)
    .map(h => h.hour);

  return {
    average_response_minutes: Math.round(avgResponse),
    response_rate: expectedReplies > 0 ? replies / expectedReplies : 0,
    peak_hours: peakHours,
  };
}

function computeInitiationRatio(
  messages: Array<{ sender_id: string; created_at: string }>,
  participantIds: string[],
): number {
  if (messages.length === 0 || participantIds.length < 2) return 0.5;

  // Count conversation initiations (first message in a cluster after a gap)
  const gapMs = 60 * 60 * 1000; // 1 hour gap = new conversation
  let initiationsA = 0;
  let initiationsB = 0;

  let lastTime = 0;
  for (const msg of messages) {
    const msgTime = new Date(msg.created_at).getTime();
    if (msgTime - lastTime > gapMs) {
      if (msg.sender_id === participantIds[0]) initiationsA++;
      else initiationsB++;
    }
    lastTime = msgTime;
  }

  const total = initiationsA + initiationsB;
  return total > 0 ? initiationsA / total : 0.5;
}

export const conversationIntelligenceService = {
  getConversationMetadata,
  getUserConversationStats,
};
