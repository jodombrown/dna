import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Loader2, Check, Clock } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { ConnectionRequestModal } from "./ConnectionRequestModal";
import { useToast } from "@/hooks/use-toast";
import { connectionService } from "@/services/connectionService";

interface ConnectButtonProps {
  targetUserId: string;
  targetUserName: string;
  variant?: "default" | "outline" | "ghost";
  size?: "default" | "sm" | "lg";
  className?: string;
}

type ConnectionStatus = 'none' | 'pending_sent' | 'pending_received' | 'accepted' | 'declined';

export function ConnectButton({ 
  targetUserId, 
  targetUserName,
  variant = "default",
  size = "default",
  className = ""
}: ConnectButtonProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [status, setStatus] = useState<ConnectionStatus>('none');
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Fetch connection status
  useEffect(() => {
    const fetchStatus = async () => {
      if (!user?.id || targetUserId === user.id) {
        setIsLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase.rpc('get_connection_status', {
          user1_id: user.id,
          user2_id: targetUserId
        });

        if (error) throw error;
        setStatus(data as ConnectionStatus);
      } catch (error) {
        console.error('Error fetching connection status:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStatus();
  }, [user?.id, targetUserId]);

  const handleConnect = () => {
    setIsModalOpen(true);
  };

  const handleSendRequest = async (message: string) => {
    try {
      await connectionService.sendConnectionRequest(targetUserId, message);
      setStatus('pending_sent');
      toast({
        title: "Connection request sent",
        description: `Request sent to ${targetUserName}`,
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to send connection request",
        variant: "destructive",
      });
      throw error;
    }
  };

  const handleAcceptRequest = async () => {
    setIsLoading(true);
    try {
      // Find the connection
      const { data: connection } = await supabase
        .from('connections')
        .select('id')
        .eq('requester_id', targetUserId)
        .eq('recipient_id', user?.id)
        .eq('status', 'pending')
        .single();

      if (!connection) throw new Error('Request not found');

      await connectionService.acceptConnectionRequest(connection.id);
      setStatus('accepted');
      
      toast({
        title: "Connection accepted",
        description: `You are now connected with ${targetUserName}`,
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to accept connection",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Don't show button if viewing own profile
  if (!user || targetUserId === user.id) {
    return null;
  }

  if (isLoading && status === 'none') {
    return (
      <Button variant={variant} size={size} disabled className={className}>
        <Loader2 className="h-4 w-4 animate-spin" />
      </Button>
    );
  }

  // Button configurations based on status
  const getButtonConfig = () => {
    switch (status) {
      case 'none':
        return {
          label: 'Connect',
          icon: null,
          onClick: handleConnect,
          variant: 'default' as const,
          disabled: false,
          className: 'bg-[hsl(151,75%,50%)] text-white hover:bg-[hsl(151,75%,40%)]'
        };
      
      case 'pending_sent':
        return {
          label: 'Request Sent',
          icon: <Clock className="h-4 w-4 mr-2" />,
          onClick: undefined,
          variant: 'outline' as const,
          disabled: true,
          className: 'text-[hsl(30,10%,60%)] border-[hsl(30,10%,80%)]'
        };
      
      case 'pending_received':
        return {
          label: 'Accept Request',
          icon: null,
          onClick: handleAcceptRequest,
          variant: 'default' as const,
          disabled: isLoading,
          className: 'bg-[hsl(151,75%,50%)] text-white hover:bg-[hsl(151,75%,40%)]'
        };
      
      case 'accepted':
        return {
          label: 'Connected',
          icon: <Check className="h-4 w-4 mr-2" />,
          onClick: undefined,
          variant: 'outline' as const,
          disabled: false,
          className: 'text-[hsl(151,75%,30%)] border-[hsl(151,75%,50%)]'
        };
      
      case 'declined':
        return {
          label: 'Declined',
          icon: null,
          onClick: undefined,
          variant: 'outline' as const,
          disabled: true,
          className: 'text-[hsl(30,10%,60%)] border-[hsl(30,10%,80%)]'
        };
    }
  };

  const config = getButtonConfig();

  return (
    <>
      <Button
        variant={config.variant}
        size={size}
        onClick={config.onClick}
        disabled={config.disabled}
        className={`${config.className} ${className}`}
      >
        {isLoading && status === 'pending_received' ? (
          <Loader2 className="h-4 w-4 animate-spin mr-2" />
        ) : (
          config.icon
        )}
        {config.label}
      </Button>

      <ConnectionRequestModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSend={handleSendRequest}
        targetUser={{
          full_name: targetUserName,
          headline: undefined
        }}
      />
    </>
  );
}
