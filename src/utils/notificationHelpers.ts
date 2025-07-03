
import { supabase } from '@/integrations/supabase/client';

export const createNotification = async (
  recipientId: string,
  actorId: string,
  actionType: 'like' | 'comment' | 'follow' | 'tag',
  targetType: 'post' | 'user',
  targetId: string
) => {
  // Don't create notification if user is notifying themselves
  if (recipientId === actorId) return;

  try {
    const { error } = await supabase
      .from('notifications')
      .insert({
        recipient_id: recipientId,
        actor_id: actorId,
        action_type: actionType,
        target_type: targetType,
        target_id: targetId
      });

    if (error && error.code !== '23505') { // Ignore duplicate constraint errors
      console.error('Error creating notification:', error);
    }
  } catch (error) {
    console.error('Error creating notification:', error);
  }
};

// Helper functions for specific notification types
export const notifyPostLike = (postOwnerId: string, likerId: string, postId: string) => {
  return createNotification(postOwnerId, likerId, 'like', 'post', postId);
};

export const notifyPostComment = (postOwnerId: string, commenterId: string, postId: string) => {
  return createNotification(postOwnerId, commenterId, 'comment', 'post', postId);
};

export const notifyUserFollow = (followedUserId: string, followerId: string) => {
  return createNotification(followedUserId, followerId, 'follow', 'user', followedUserId);
};

export const notifyUserTag = (taggedUserId: string, taggerId: string, postId: string) => {
  return createNotification(taggedUserId, taggerId, 'tag', 'post', postId);
};
