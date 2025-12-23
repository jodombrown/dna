import { supabase } from '@/integrations/supabase/client';
import { createNotification, NOTIFICATION_TYPES } from './notificationService';

/**
 * Mention Service
 * Handles extraction and processing of @mentions in posts and comments
 */

// Regex to match @username mentions
// Matches: @username, @user_name, @user123
const MENTION_REGEX = /@([a-zA-Z0-9_]+)/g;

export interface MentionedUser {
  id: string;
  username: string;
  full_name: string | null;
}

export const mentionService = {
  /**
   * Extract usernames from content
   * @param content - Text content that may contain @mentions
   * @returns Array of usernames (without @ symbol)
   */
  extractMentions(content: string): string[] {
    if (!content) return [];

    const matches = content.match(MENTION_REGEX);
    if (!matches) return [];

    // Remove @ symbol and deduplicate (case-insensitive)
    const usernames = [...new Set(matches.map(m => m.slice(1).toLowerCase()))];
    return usernames;
  },

  /**
   * Look up user IDs from usernames
   * @param usernames - Array of usernames to look up
   * @returns Array of MentionedUser objects
   */
  async resolveUsernames(usernames: string[]): Promise<MentionedUser[]> {
    if (!usernames.length) return [];

    // Build OR filter for case-insensitive username matching
    const orFilters = usernames.map(m => `username.ilike.${m}`).join(',');
    const { data, error } = await supabase
      .from('profiles')
      .select('id, username, full_name')
      .or(orFilters);

    if (error) {
      console.error('[mentionService] Error resolving usernames:', error);
      return [];
    }

    return (data || []) as MentionedUser[];
  },

  /**
   * Process mentions in a post and create notifications
   * @param content - Post content
   * @param postId - ID of the post
   * @param authorId - ID of the post author
   * @param authorName - Display name of the post author
   */
  async processMentionsForPost(
    content: string,
    postId: string,
    authorId: string,
    authorName: string
  ): Promise<void> {
    try {
      const usernames = this.extractMentions(content);
      if (!usernames.length) {
        console.log('[mentionService] No mentions found in post');
        return;
      }

      console.log('[mentionService] Found mentions in post:', usernames);

      const mentionedUsers = await this.resolveUsernames(usernames);
      if (!mentionedUsers.length) {
        console.log('[mentionService] No matching users found for mentions');
        return;
      }

      console.log('[mentionService] Resolved users:', mentionedUsers.map(u => u.username));

      // Create notification for each mentioned user (except the author)
      const usersToNotify = mentionedUsers.filter(user => user.id !== authorId);

      for (const user of usersToNotify) {
        const preview = content.slice(0, 100);

        console.log('[mentionService] Creating post mention notification for:', user.username);

        const result = await createNotification({
          user_id: user.id,
          type: NOTIFICATION_TYPES.MENTION,
          title: 'You were mentioned in a post',
          message: `${authorName} mentioned you: "${preview}${content.length > 100 ? '...' : ''}"`,
          link_url: `/dna/convey/post/${postId}`,
          payload: {
            post_id: postId,
            author_id: authorId,
            author_name: authorName,
            content_preview: preview,
            mention_type: 'post',
          },
        });

        console.log('[mentionService] Post mention notification result:', result);
      }

      console.log(`[mentionService] Created ${usersToNotify.length} mention notifications for post ${postId}`);
    } catch (error) {
      console.error('[mentionService] Error processing mentions for post:', error);
    }
  },

  /**
   * Process mentions in a comment and create notifications
   * @param content - Comment content
   * @param commentId - ID of the comment
   * @param postId - ID of the parent post
   * @param authorId - ID of the comment author
   * @param authorName - Display name of the comment author
   */
  async processMentionsForComment(
    content: string,
    commentId: string,
    postId: string,
    authorId: string,
    authorName: string
  ): Promise<void> {
    try {
      const usernames = this.extractMentions(content);
      if (!usernames.length) {
        console.log('[mentionService] No mentions found in comment');
        return;
      }

      console.log('[mentionService] Found mentions in comment:', usernames);

      const mentionedUsers = await this.resolveUsernames(usernames);
      if (!mentionedUsers.length) {
        console.log('[mentionService] No matching users found for mentions');
        return;
      }

      console.log('[mentionService] Resolved users:', mentionedUsers.map(u => u.username));

      // Create notification for each mentioned user (except the author)
      const usersToNotify = mentionedUsers.filter(user => user.id !== authorId);

      for (const user of usersToNotify) {
        const preview = content.slice(0, 100);

        console.log('[mentionService] Creating comment mention notification for:', user.username);

        const result = await createNotification({
          user_id: user.id,
          type: NOTIFICATION_TYPES.MENTION,
          title: 'You were mentioned in a comment',
          message: `${authorName} mentioned you in a comment: "${preview}${content.length > 100 ? '...' : ''}"`,
          link_url: `/dna/convey/post/${postId}`,
          payload: {
            post_id: postId,
            comment_id: commentId,
            author_id: authorId,
            author_name: authorName,
            content_preview: preview,
            mention_type: 'comment',
          },
        });

        console.log('[mentionService] Comment mention notification result:', result);
      }

      console.log(`[mentionService] Created ${usersToNotify.length} mention notifications for comment ${commentId}`);
    } catch (error) {
      console.error('[mentionService] Error processing mentions for comment:', error);
    }
  },
};
