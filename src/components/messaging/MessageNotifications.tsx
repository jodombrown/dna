import { useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface MessageNotificationsProps {
  userId?: string;
  isActive: boolean; // Whether the user is currently viewing messages
}

export const MessageNotifications: React.FC<MessageNotificationsProps> = ({ 
  userId, 
  isActive 
}) => {
  const { toast } = useToast();

  useEffect(() => {
    if (!userId) return;

    // Request notification permission
    if (Notification.permission === 'default') {
      Notification.requestPermission();
    }

    // Subscribe to new messages - unique channel per user
    const channel = supabase
      .channel(`message-notifications-${userId}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'messages'
      }, async (payload) => {
        const newMessage = payload.new;
        
        // Don't notify if user sent the message or is currently active
        if (newMessage.sender_id === userId || isActive) return;

        // Check if this message is in a conversation the user is part of
        const { data: conversation } = await supabase
          .from('conversations')
          .select('*')
          .eq('id', newMessage.conversation_id)
          .or(`user_1_id.eq.${userId},user_2_id.eq.${userId}`)
          .single();

        if (!conversation) return;

        // Get sender info
        const { data: sender } = await supabase
          .from('profiles')
          .select('display_name, avatar_url')
          .eq('id', newMessage.sender_id)
          .single();

        const senderName = sender?.display_name || 'Someone';

        // Show browser notification
        if (Notification.permission === 'granted') {
          const notification = new Notification(`New message from ${senderName}`, {
            body: newMessage.content.length > 50 
              ? newMessage.content.substring(0, 50) + '...'
              : newMessage.content,
            icon: sender?.avatar_url || '/favicon.ico',
            tag: `message-${newMessage.id}` // Prevent duplicate notifications
          });

          // Auto-close after 5 seconds
          setTimeout(() => notification.close(), 5000);
        }

        // Show toast notification
        toast({
          title: `New message from ${senderName}`,
          description: newMessage.content.length > 100 
            ? newMessage.content.substring(0, 100) + '...'
            : newMessage.content,
          duration: 5000,
        });
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId, isActive, toast]);

  return null; // This component doesn't render anything
};