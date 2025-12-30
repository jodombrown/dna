import { supabase } from '@/integrations/supabase/client';

interface CreateNotificationParams {
  user_id: string;
  type: string;
  title: string;
  message: string;
  link_url?: string;
  payload?: Record<string, any>;
}

interface NotificationEmailPayload {
  user_id: string;
  notification_type: string;
  title: string;
  message: string;
  action_url?: string;
  actor_name?: string;
  actor_avatar_url?: string;
}

/**
 * Creates a notification in the database and optionally sends an email notification
 * based on user preferences.
 */
export async function createNotification(params: CreateNotificationParams): Promise<{ success: boolean; notificationId?: string; error?: string }> {
  try {
    // Insert notification into database
    const { data: notification, error: insertError } = await supabase
      .from('notifications')
      .insert({
        user_id: params.user_id,
        type: params.type,
        title: params.title,
        message: params.message,
        link_url: params.link_url,
        payload: params.payload || {},
        is_read: false,
      })
      .select('id')
      .single();

    if (insertError) {
      return { success: false, error: insertError.message };
    }

    // Send email notification asynchronously (don't block on it)
    sendNotificationEmail({
      user_id: params.user_id,
      notification_type: params.type,
      title: params.title,
      message: params.message,
      action_url: params.link_url ? `https://diasporanetwork.africa${params.link_url}` : undefined,
      actor_name: params.payload?.actor_name,
      actor_avatar_url: params.payload?.actor_avatar_url,
    }).catch(() => {});

    return { success: true, notificationId: notification.id };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

/**
 * Sends an email notification via the edge function.
 * This function respects user's email notification preferences.
 */
export async function sendNotificationEmail(payload: NotificationEmailPayload): Promise<{ success: boolean; error?: string }> {
  try {
    const response = await supabase.functions.invoke('send-notification-email', {
      body: payload,
    });

    if (response.error) {
      return { success: false, error: response.error.message };
    }

    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

/**
 * Helper function to send notification email for an existing notification
 */
export async function sendEmailForExistingNotification(
  userId: string,
  notificationType: string,
  title: string,
  message: string,
  actionUrl?: string,
  actorName?: string,
  actorAvatarUrl?: string
): Promise<void> {
  await sendNotificationEmail({
    user_id: userId,
    notification_type: notificationType,
    title,
    message,
    action_url: actionUrl,
    actor_name: actorName,
    actor_avatar_url: actorAvatarUrl,
  });
}

// Notification type constants
export const NOTIFICATION_TYPES = {
  CONNECTION_REQUEST: 'connection_request',
  CONNECTION_ACCEPTED: 'connection_accepted',
  COMMENT: 'comment',
  REACTION: 'reaction',
  MESSAGE: 'message',
  MENTION: 'mention',
  EVENT_REMINDER: 'event_reminder',
  POST_LIKE: 'post_like',
  STORY_PUBLISHED: 'story_published',
  WELCOME: 'welcome',
  FEEDBACK_STATUS_CHANGE: 'feedback_status_change',
} as const;

/**
 * Creates a DNA system notification (for platform-level notifications like feedback status changes)
 */
export async function createDNANotification(params: {
  user_id: string;
  title: string;
  message: string;
  link_url?: string;
  feedback_status?: string;
}): Promise<{ success: boolean; notificationId?: string; error?: string }> {
  return createNotification({
    user_id: params.user_id,
    type: NOTIFICATION_TYPES.FEEDBACK_STATUS_CHANGE,
    title: params.title,
    message: params.message,
    link_url: params.link_url,
    payload: {
      is_dna_system: true,
      feedback_status: params.feedback_status,
    },
  });
}
