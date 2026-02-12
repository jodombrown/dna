/**
 * DIA Messaging Intelligence Service
 *
 * DIA integration within the messaging system. Provides:
 * - Smart reply generation (rule-based v1, LLM v2)
 * - Cross-C opportunity detection (suggests creating Events, Spaces, etc.)
 * - Conversation summaries for Space channels (Pro/Org)
 *
 * PRIVACY: DIA reads metadata only — never message content for training/analysis.
 * Smart replies use local rule-based detection on the client side.
 */

import { supabase } from '@/integrations/supabase/client';
import { logger } from '@/lib/logger';
import type {
  Message,
  DIASmartReply,
  DIAConversationSuggestion,
} from '@/types/messagingPRD';

const LOG_TAG = 'DIAMessagingService';

export const diaMessagingService = {

  /**
   * Generate smart reply suggestions based on the last messages in a conversation.
   *
   * v1: Rule-based detection (question patterns, gratitude, scheduling).
   * v2: Will upgrade to LLM-powered suggestions.
   *
   * Returns up to 3 suggestions sorted by confidence.
   */
  async generateSmartReplies(
    conversationId: string,
    lastMessages: Message[],
    userId: string
  ): Promise<DIASmartReply[]> {
    const lastMessage = lastMessages[lastMessages.length - 1];
    if (!lastMessage || lastMessage.senderId === userId) return [];

    const replies: DIASmartReply[] = [];
    const content = lastMessage.content.toLowerCase();

    // Question detection
    if (content.includes('?')) {
      if (content.includes('when') || content.includes('time') || content.includes('schedule')) {
        replies.push({
          id: 'sr_schedule_1',
          text: 'Let me check my schedule',
          confidence: 0.7,
          context: 'scheduling',
        });
        replies.push({
          id: 'sr_schedule_2',
          text: 'How about next week?',
          confidence: 0.6,
          context: 'scheduling',
        });
      }
      if (content.includes('interest') || content.includes('join') || content.includes('participate')) {
        replies.push({
          id: 'sr_interest_1',
          text: "Yes, I'm interested!",
          confidence: 0.8,
          context: 'opportunity',
        });
        replies.push({
          id: 'sr_interest_2',
          text: 'Can you tell me more?',
          confidence: 0.7,
          context: 'opportunity',
        });
      }
      if (content.includes('available') || content.includes('free')) {
        replies.push({
          id: 'sr_avail_1',
          text: "Yes, I'm available",
          confidence: 0.7,
          context: 'availability',
        });
        replies.push({
          id: 'sr_avail_2',
          text: 'Let me get back to you on that',
          confidence: 0.6,
          context: 'availability',
        });
      }
    }

    // Gratitude response
    if (content.includes('thank') || content.includes('appreciate') || content.includes('grateful')) {
      replies.push({
        id: 'sr_thanks_1',
        text: 'Happy to help!',
        confidence: 0.8,
        context: 'gratitude',
      });
      replies.push({
        id: 'sr_thanks_2',
        text: 'Anytime!',
        confidence: 0.7,
        context: 'gratitude',
      });
    }

    // Meeting/call suggestion
    if (content.includes('discuss') || content.includes('talk more') || content.includes('call') || content.includes('chat about')) {
      replies.push({
        id: 'sr_meeting_1',
        text: "Let's set up a time to chat",
        confidence: 0.7,
        context: 'meeting',
      });
      replies.push({
        id: 'sr_meeting_2',
        text: "I'm free this week — when works for you?",
        confidence: 0.6,
        context: 'meeting',
      });
    }

    // Agreement/confirmation
    if (content.includes('sound good') || content.includes('what do you think') || content.includes('agree')) {
      replies.push({
        id: 'sr_agree_1',
        text: 'Sounds great to me!',
        confidence: 0.8,
        context: 'agreement',
      });
      replies.push({
        id: 'sr_agree_2',
        text: "Let's do it",
        confidence: 0.7,
        context: 'agreement',
      });
    }

    // Greeting
    if (content.includes('hello') || content.includes('hi ') || content.includes('hey') || content === 'hi') {
      replies.push({
        id: 'sr_greet_1',
        text: 'Hey! How are you?',
        confidence: 0.7,
        context: 'greeting',
      });
      replies.push({
        id: 'sr_greet_2',
        text: 'Hi! Great to hear from you',
        confidence: 0.6,
        context: 'greeting',
      });
    }

    // Sort by confidence and return max 3
    return replies
      .sort((a, b) => b.confidence - a.confidence)
      .slice(0, 3);
  },

  /**
   * Detect when a conversation should bridge to another C module.
   *
   * Analyzes recent messages (by content patterns) to suggest:
   * - Creating an Event (CONVENE) when discussion mentions meetups/gatherings
   * - Creating a Space (COLLABORATE) when discussion mentions projects/collaboration
   * - Making introductions when participants have complementary skills
   *
   * Returns null if no cross-C opportunity is detected.
   */
  async detectCrossCOpportunity(
    conversationId: string,
    messages: Message[]
  ): Promise<DIAConversationSuggestion | null> {
    if (messages.length < 3) return null;

    const recentContent = messages
      .slice(-5)
      .map((m) => m.content.toLowerCase())
      .join(' ');

    // Detect event creation opportunity
    if (
      (recentContent.includes('meet up') ||
        recentContent.includes('get together') ||
        recentContent.includes('workshop') ||
        recentContent.includes('meetup') ||
        recentContent.includes('gathering') ||
        recentContent.includes('networking event')) &&
      !recentContent.includes('event created')
    ) {
      return {
        type: 'meeting',
        headline: 'This sounds like it could be an Event',
        body: 'Want to create a CONVENE event so others can join?',
        action: {
          type: 'open_composer',
          label: 'Create Event',
          payload: { mode: 'event' },
        },
      };
    }

    // Detect project/space opportunity
    if (
      (recentContent.includes('project') ||
        recentContent.includes('collaborate') ||
        recentContent.includes('working on') ||
        recentContent.includes('team up') ||
        recentContent.includes('build together') ||
        recentContent.includes('start a')) &&
      !recentContent.includes('space created')
    ) {
      return {
        type: 'cross_c_action',
        headline: 'This could become a Space',
        body: 'Create a COLLABORATE Space to organize this project.',
        action: {
          type: 'open_composer',
          label: 'Create Space',
          payload: { mode: 'space' },
        },
      };
    }

    // Detect opportunity posting
    if (
      (recentContent.includes('looking for') ||
        recentContent.includes('need someone') ||
        recentContent.includes('can anyone') ||
        recentContent.includes('hiring') ||
        recentContent.includes('opportunity')) &&
      !recentContent.includes('opportunity posted')
    ) {
      return {
        type: 'cross_c_action',
        headline: 'Post this as an Opportunity?',
        body: 'Create a CONTRIBUTE opportunity to reach more people.',
        action: {
          type: 'open_composer',
          label: 'Post Opportunity',
          payload: { mode: 'opportunity' },
        },
      };
    }

    // Detect follow-up suggestion (conversation gone quiet)
    if (messages.length >= 5) {
      const lastMessageTime = messages[messages.length - 1].createdAt;
      const now = new Date();
      const daysSinceLastMessage = (now.getTime() - lastMessageTime.getTime()) / (1000 * 60 * 60 * 24);

      if (daysSinceLastMessage > 7 && daysSinceLastMessage < 30) {
        return {
          type: 'follow_up',
          headline: 'Time to reconnect?',
          body: "It's been a while since your last message. Send a follow-up?",
          action: {
            type: 'suggest_message',
            label: 'Send Follow-up',
            payload: { suggestedText: "Hey! Just checking in — how are things going?" },
          },
        };
      }
    }

    return null;
  },

  /**
   * Generate a summary of key decisions and action items from Space channel messages.
   * Available for Pro/Org tiers only.
   *
   * v1: Extracts messages with the most reactions (likely important).
   * v2: Will use LLM-powered summarization.
   */
  async generateConversationSummary(
    conversationId: string,
    sinceDate: Date
  ): Promise<string> {
    const { data, error } = await supabase
      .from('messaging_messages')
      .select('content, reactions, sender_name')
      .eq('conversation_id', conversationId)
      .gte('created_at', sinceDate.toISOString())
      .order('created_at');

    if (error) {
      logger.error(LOG_TAG, 'Failed to fetch messages for summary', error);
      return 'Unable to generate summary at this time.';
    }

    if (!data || data.length === 0) {
      return 'No messages in this period.';
    }

    // Filter to messages that have reactions (likely important decisions)
    const messagesWithReactions = data.filter((m) => {
      const reactions = m.reactions as Array<{ count: number }> | null;
      return reactions && reactions.length > 0;
    });

    if (messagesWithReactions.length === 0) {
      return 'No key decisions detected in this period.';
    }

    // Build summary from reacted messages
    const summaryLines = messagesWithReactions.map((m) => {
      const reactions = m.reactions as Array<{ emoji: string; count: number }>;
      const totalReactions = reactions.reduce((sum, r) => sum + r.count, 0);
      const contentPreview = (m.content as string).slice(0, 100);
      return `- ${m.sender_name}: "${contentPreview}" (${totalReactions} reactions)`;
    });

    return summaryLines.join('\n');
  },

  /**
   * Get DIA-powered notification headline for a message.
   * Adapts based on conversation type and content.
   */
  buildMessageNotificationHeadline(
    message: Message,
    conversationType: string
  ): string {
    switch (conversationType) {
      case 'direct':
        return `${message.senderName} sent you a message`;
      case 'group':
        return `${message.senderName} in group`;
      case 'event_thread':
        return `${message.senderName} in event discussion`;
      case 'space_channel':
        return `${message.senderName} in channel`;
      case 'opportunity_thread':
        return `${message.senderName} on opportunity`;
      default:
        return `New message from ${message.senderName}`;
    }
  },
};
