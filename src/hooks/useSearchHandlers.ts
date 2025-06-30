
import { useNavigate } from 'react-router-dom';
import { useMessages } from '@/hooks/useMessages';
import { toast } from 'sonner';

export const useSearchHandlers = (user: any) => {
  const navigate = useNavigate();
  const { sendMessage } = useMessages();

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

  const handleMessage = async (recipientId: string, recipientName: string) => {
    if (!user) {
      toast.error('Please sign in to message professionals');
      navigate('/auth');
      return;
    }

    try {
      await sendMessage(recipientId, `Hi ${recipientName}, I'd like to connect and learn more about your work!`);
      toast.success('Message sent successfully!');
      navigate('/messages');
    } catch (error) {
      console.error('Message error:', error);
      toast.error('Failed to send message');
    }
  };

  return {
    handleConnect,
    handleMessage
  };
};
