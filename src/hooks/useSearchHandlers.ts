
import { useNavigate } from 'react-router-dom';
import { useConversations } from '@/hooks/useConversations';
import { toast } from 'sonner';

export const useSearchHandlers = (user: any) => {
  const navigate = useNavigate();
  const { createOrGetConversation } = useConversations();

  const handleConnect = async (userId: string) => {
    if (!user) {
      toast.error('Please sign in to connect with professionals');
      navigate('/auth');
      return;
    }

    try {
      toast.success('Feature coming soon - Connection system will be implemented in a future update');
    } catch (error) {
      console.error('Connection error:', error);
      toast.error('Failed to send connection request');
    }
  };

  const handleMessage = async (recipientId: string) => {
    if (!user) {
      toast.error('Please sign in to message professionals');
      navigate('/auth');
      return;
    }

    try {
      const conversationId = await createOrGetConversation(recipientId);
      if (conversationId) {
        navigate(`/messages/${conversationId}`);
        toast.success('Conversation started!');
      }
    } catch (error) {
      console.error('Message error:', error);
      toast.error('Failed to start conversation');
    }
  };

  return {
    handleConnect,
    handleMessage
  };
};
