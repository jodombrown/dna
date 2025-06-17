
import { useState, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { useMessages } from '@/hooks/useMessages';

interface ConnectionStatus {
  status: 'none' | 'pending' | 'connected';
  isPending?: boolean;
}

export const useConnectPageLogic = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const { sendMessage } = useMessages();
  const [activeTab, setActiveTab] = useState('professionals');
  const [connectionStatuses, setConnectionStatuses] = useState<Record<string, ConnectionStatus>>({});

  const handleConnect = useCallback(async (professionalId: string) => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to connect with professionals.",
        variant: "destructive",
      });
      return;
    }

    try {
      setConnectionStatuses(prev => ({
        ...prev,
        [professionalId]: { status: 'pending', isPending: true }
      }));

      // Simulate connection request
      await new Promise(resolve => setTimeout(resolve, 1000));

      setConnectionStatuses(prev => ({
        ...prev,
        [professionalId]: { status: 'connected', isPending: false }
      }));

      toast({
        title: "Connection Request Sent",
        description: "Your connection request has been sent successfully.",
      });
    } catch (error) {
      setConnectionStatuses(prev => ({
        ...prev,
        [professionalId]: { status: 'none', isPending: false }
      }));

      toast({
        title: "Connection Failed",
        description: "Failed to send connection request. Please try again.",
        variant: "destructive",
      });
    }
  }, [user, toast]);

  const handleMessage = useCallback(async (recipientId: string, recipientName: string) => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to send messages.",
        variant: "destructive",
      });
      return;
    }

    try {
      const defaultMessage = `Hi ${recipientName}, I'd like to connect with you through the DNA platform.`;
      
      await sendMessage(recipientId, defaultMessage, 'Connection Request');

      toast({
        title: "Message Sent",
        description: `Your message has been sent to ${recipientName}.`,
      });
    } catch (error) {
      toast({
        title: "Message Failed",
        description: "Failed to send message. Please try again.",
        variant: "destructive",
      });
    }
  }, [user, toast, sendMessage]);

  const handleJoinCommunity = useCallback(async () => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to join communities.",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Community Joined",
      description: "You have successfully joined the community.",
    });
  }, [user, toast]);

  const handleRegisterEvent = useCallback(async () => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to register for events.",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Event Registration",
      description: "You have successfully registered for the event.",
    });
  }, [user, toast]);

  const getConnectionStatus = useCallback((professionalId: string): ConnectionStatus => {
    return connectionStatuses[professionalId] || { status: 'none' };
  }, [connectionStatuses]);

  return {
    activeTab,
    setActiveTab,
    connectionStatuses,
    handleConnect,
    handleMessage,
    handleJoinCommunity,
    handleRegisterEvent,
    getConnectionStatus
  };
};
