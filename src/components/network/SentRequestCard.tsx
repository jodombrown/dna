/**
 * Sent Connection Request Card
 * Displays connection requests that the user has sent with option to withdraw
 */

import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { XCircle, Clock, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface SentRequestCardProps {
  request: {
    connection_id: string;
    recipient_id: string;
    recipient_name: string;
    recipient_avatar?: string | null;
    recipient_headline?: string | null;
    created_at: string;
  };
  onWithdraw: () => void;
}

export const SentRequestCard: React.FC<SentRequestCardProps> = ({
  request,
  onWithdraw,
}) => {
  const navigate = useNavigate();
  const [isWithdrawing, setIsWithdrawing] = useState(false);

  const getInitials = (name: string) => {
    return name
      ?.split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase() || '?';
  };

  const timeAgo = formatDistanceToNow(new Date(request.created_at), {
    addSuffix: true,
  });

  const handleWithdraw = async () => {
    setIsWithdrawing(true);
    try {
      // Delete the pending connection request directly
      const { error } = await supabase
        .from('connections')
        .delete()
        .eq('id', request.connection_id)
        .eq('status', 'pending');

      if (error) throw error;

      toast.success('Connection request withdrawn');
      onWithdraw();
    } catch (error: any) {
      console.error('Error withdrawing request:', error);
      toast.error(error.message || 'Failed to withdraw request');
    } finally {
      setIsWithdrawing(false);
    }
  };

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-start gap-4">
          <Avatar className="w-16 h-16 cursor-pointer" onClick={() => navigate(`/profile/${request.recipient_id}`)}>
            <AvatarImage src={request.recipient_avatar || ''} />
            <AvatarFallback className="bg-dna-copper text-white">
              {getInitials(request.recipient_name)}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <div className="flex items-start justify-between">
              <div>
                <h3
                  className="font-semibold text-lg text-foreground cursor-pointer hover:text-dna-copper transition-colors"
                  onClick={() => navigate(`/profile/${request.recipient_id}`)}
                >
                  {request.recipient_name}
                </h3>
                {request.recipient_headline && (
                  <p className="text-sm text-muted-foreground mt-1">
                    {request.recipient_headline}
                  </p>
                )}
              </div>
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Clock className="w-3 h-3" />
                {timeAgo}
              </div>
            </div>

            <Badge variant="outline" className="mt-3 text-xs border-amber-500/50 text-amber-700 dark:text-amber-300">
              Pending
            </Badge>

            <div className="mt-4 flex gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleWithdraw}
                disabled={isWithdrawing}
                className="text-muted-foreground hover:text-destructive"
              >
                {isWithdrawing ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Withdrawing...
                  </>
                ) : (
                  <>
                    <XCircle className="w-4 h-4 mr-2" />
                    Withdraw Request
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
