import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Check, X, MapPin } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAnalytics } from '@/hooks/useAnalytics';
import { useAuth } from '@/contexts/AuthContext';
import { diaEventBus } from '@/services/dia/diaEventBus';
import { getErrorMessage } from '@/lib/errorLogger';

interface ConnectionRequestCardProps {
  request: {
    connection_id: string;
    requester_id: string;
    username: string;
    full_name: string;
    avatar_url?: string;
    headline?: string;
    location?: string;
    professional_role?: string;
    message?: string;
    created_at: string;
  };
  onRequestHandled?: () => void;
}

export const ConnectionRequestCard: React.FC<ConnectionRequestCardProps> = ({
  request,
  onRequestHandled,
}) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { trackEvent } = useAnalytics();
  const { user } = useAuth();
  const [isProcessing, setIsProcessing] = useState(false);
  const [status, setStatus] = useState<'pending' | 'accepted' | 'declined'>('pending');

  const handleAccept = async (e: React.MouseEvent) => {
    e.stopPropagation();
    
    setIsProcessing(true);
    try {
      const { error } = await supabase
        .from('connections')
        .update({ status: 'accepted' })
        .eq('id', request.connection_id);

      if (error) throw error;

      // DIA Sprint 4B: Emit connection event for proactive nudges
      if (user?.id) {
        diaEventBus.emit({
          type: 'new_connection',
          userId: user.id,
          connectedUserId: request.requester_id,
        });
      }

      setStatus('accepted');
      toast({
        title: 'Connection accepted',
        description: `You are now connected with ${request.full_name}.`,
      });
      await trackEvent('connect_request_accepted', {
        connection_id: request.connection_id,
        target_user_id: request.requester_id,
      });
      onRequestHandled?.();
    } catch (error: unknown) {
      toast({
        title: 'Error accepting request',
        description: getErrorMessage(error) || 'Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDecline = async (e: React.MouseEvent) => {
    e.stopPropagation();
    
    setIsProcessing(true);
    try {
      const { error } = await supabase
        .from('connections')
        .update({ status: 'declined' })
        .eq('id', request.connection_id);

      if (error) throw error;

      setStatus('declined');
      toast({
        title: 'Request declined',
        description: `Connection request from ${request.full_name} has been declined.`,
      });
      onRequestHandled?.();
    } catch (error: unknown) {
      toast({
        title: 'Error declining request',
        description: getErrorMessage(error) || 'Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  if (status !== 'pending') return null;

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-start gap-4">
          {/* Avatar */}
          <Avatar 
            className="h-14 w-14 cursor-pointer" 
            onClick={() => navigate(`/dna/${request.username}`)}
          >
            <AvatarImage src={request.avatar_url} alt={request.full_name} />
            <AvatarFallback>
              {(request.full_name || request.username || 'DN').split(' ').map(n => n[0]).join('').slice(0, 2)}
            </AvatarFallback>
          </Avatar>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="mb-2">
              <h3 
                className="font-semibold text-base hover:text-dna-copper cursor-pointer truncate"
                onClick={() => navigate(`/dna/${request.username}`)}
              >
                {request.full_name}
              </h3>
              <p className="text-sm text-muted-foreground truncate">
                {request.headline || request.professional_role || 'DNA Member'}
              </p>
            </div>

            {request.location && (
              <div className="flex items-center gap-1 text-xs text-muted-foreground mb-2">
                <MapPin className="h-3 w-3" />
                <span className="truncate">{request.location}</span>
              </div>
            )}

            {request.message && (
              <div className="bg-muted/50 p-2 rounded text-sm mb-3 text-muted-foreground italic">
                "{request.message}"
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-2">
              <Button
                variant="default"
                size="sm"
                onClick={handleAccept}
                disabled={isProcessing}
                className="flex-1"
              >
                <Check className="mr-2 h-4 w-4" />
                {isProcessing ? 'Accepting...' : 'Accept'}
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                onClick={handleDecline}
                disabled={isProcessing}
                className="flex-1"
              >
                <X className="mr-2 h-4 w-4" />
                {isProcessing ? 'Declining...' : 'Decline'}
              </Button>
            </div>

            <div className="text-xs text-muted-foreground mt-2">
              Sent {new Date(request.created_at).toLocaleDateString()}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
