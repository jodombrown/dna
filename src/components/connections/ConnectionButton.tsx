import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { UserPlus, UserCheck, Clock, MessageCircle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface ConnectionButtonProps {
  targetUserId: string;
  targetUserName?: string;
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'sm' | 'default' | 'lg';
}

type ConnectionStatus = 'none' | 'requested' | 'accepted' | 'received';

export const ConnectionButton: React.FC<ConnectionButtonProps> = ({
  targetUserId,
  targetUserName = 'User',
  variant = 'default',
  size = 'default'
}) => {
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>('none');
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  // Check existing connection status
  useEffect(() => {
    const checkConnectionStatus = async () => {
      if (!user || user.id === targetUserId) return;

      try {
        const { data, error } = await supabase
          .from('connections')
          .select('status, requester_id, recipient_id')
          .or(`and(requester_id.eq.${user.id},recipient_id.eq.${targetUserId}),and(requester_id.eq.${targetUserId},recipient_id.eq.${user.id})`)
          .maybeSingle();

        if (error) {
          return;
        }

        if (data) {
          if (data.status === 'accepted') {
            setConnectionStatus('accepted');
          } else if (data.status === 'pending') {
            // Check if current user sent or received the request
            setConnectionStatus(data.requester_id === user.id ? 'requested' : 'received');
          }
        }
      } catch (error) {
        // Error handled silently
      }
    };

    checkConnectionStatus();
  }, [user, targetUserId]);

  const handleConnect = async () => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please log in to connect with other users",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);

    try {
      const { data: connectionId, error } = await supabase.rpc('ensure_connection', {
        u1: user.id,
        u2: targetUserId
      });

      if (error) {
        throw error;
      }

      setConnectionStatus('requested');
      
      toast({
        title: "Connection request sent!",
        description: `Your connection request has been sent to ${targetUserName}.`
      });

      // Optional: Log connection event for analytics
      try {
        await supabase.rpc('log_engagement_event', {
          target_user_id: targetUserId,
          event_type_param: 'connection_request_sent',
          event_context_param: { connection_id: connectionId }
        });
      } catch (analyticsError) {
        // Don't fail the main action if analytics fails
      }

    } catch (error: any) {
      toast({
        title: "Connection failed",
        description: error.message || "Unable to send connection request. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAcceptConnection = async () => {
    setIsLoading(true);

    try {
      const { error } = await supabase
        .from('connections')
        .update({ status: 'accepted' })
        .or(`and(requester_id.eq.${user.id},recipient_id.eq.${targetUserId}),and(requester_id.eq.${targetUserId},recipient_id.eq.${user.id})`);

      if (error) throw error;

      setConnectionStatus('accepted');
      
      toast({
        title: "Connection accepted!",
        description: `You are now connected with ${targetUserName}.`
      });

    } catch (error: any) {
      toast({
        title: "Failed to accept connection",
        description: error.message || "Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Don't show button for same user
  if (!user || user.id === targetUserId) {
    return null;
  }

  const getButtonContent = () => {
    switch (connectionStatus) {
      case 'accepted':
        return {
          icon: <UserCheck className="w-4 h-4" />,
          text: 'Connected',
          disabled: true,
          variant: 'outline',
          onClick: undefined
        };
      case 'requested':
        return {
          icon: <Clock className="w-4 h-4" />,
          text: 'Requested',
          disabled: true,
          variant: 'outline',
          onClick: undefined
        };
      case 'received':
        return {
          icon: <UserCheck className="w-4 h-4" />,
          text: 'Accept',
          disabled: false,
          variant: 'default',
          onClick: handleAcceptConnection
        };
      default:
        return {
          icon: <UserPlus className="w-4 h-4" />,
          text: 'Connect',
          disabled: false,
          variant: variant,
          onClick: handleConnect
        };
    }
  };

  const buttonConfig = getButtonContent();

  return (
    <Button
      variant={buttonConfig.variant as any}
      size={size}
      disabled={buttonConfig.disabled || isLoading}
      onClick={buttonConfig.onClick}
      className="flex items-center gap-2"
    >
      {buttonConfig.icon}
      {buttonConfig.text}
    </Button>
  );
};