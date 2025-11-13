import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { MessageCircle, Eye, MoreVertical, UserMinus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface ConnectionCardProps {
  connection: {
    id: string;
    full_name: string;
    username: string;
    avatar_url?: string;
    headline?: string;
    location?: string;
    connected_at: string;
  };
  onConnectionRemoved?: () => void;
}

export const ConnectionCard: React.FC<ConnectionCardProps> = ({
  connection,
  onConnectionRemoved,
}) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isRemoving, setIsRemoving] = useState(false);
  const [showRemoveDialog, setShowRemoveDialog] = useState(false);

  const handleMessage = async (e: React.MouseEvent) => {
    e.stopPropagation();
    
    try {
      const { data, error } = await supabase.rpc('get_or_create_conversation', {
        user1_id: (await supabase.auth.getUser()).data.user?.id,
        user2_id: connection.id,
      });

      if (error) throw error;

      navigate('/dna/connect/messages');
    } catch (error: any) {
      console.error('Message error:', error);
      toast({
        title: 'Error opening conversation',
        description: error.message || 'Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleRemoveConnection = async () => {
    setIsRemoving(true);
    try {
      const { data: currentUser } = await supabase.auth.getUser();
      
      if (!currentUser.user) throw new Error('Not authenticated');

      // Find the connection record
      const { data: connectionData, error: fetchError } = await supabase
        .from('connections')
        .select('id')
        .or(`and(requester_id.eq.${currentUser.user.id},recipient_id.eq.${connection.id}),and(requester_id.eq.${connection.id},recipient_id.eq.${currentUser.user.id})`)
        .eq('status', 'accepted')
        .limit(1)
        .single();

      if (fetchError) throw fetchError;
      if (!connectionData) throw new Error('Connection not found');

      const { error } = await supabase.rpc('remove_connection', {
        p_connection_id: connectionData.id,
      });

      if (error) throw error;

      toast({
        title: 'Connection removed',
        description: `You are no longer connected with ${connection.full_name}.`,
      });
      
      onConnectionRemoved?.();
    } catch (error: any) {
      console.error('Remove connection error:', error);
      toast({
        title: 'Error removing connection',
        description: error.message || 'Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsRemoving(false);
      setShowRemoveDialog(false);
    }
  };

  return (
    <>
      <Card className="hover:shadow-md transition-shadow">
        <CardContent className="p-4">
          <div className="flex items-start gap-4">
            {/* Avatar */}
            <Avatar 
              className="h-14 w-14 cursor-pointer" 
              onClick={() => navigate(`/dna/${connection.username}`)}
            >
              <AvatarImage src={connection.avatar_url} alt={connection.full_name} />
              <AvatarFallback>
                {connection.full_name.split(' ').map(n => n[0]).join('').slice(0, 2)}
              </AvatarFallback>
            </Avatar>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1 min-w-0">
                  <h3 
                    className="font-semibold text-base hover:text-dna-copper cursor-pointer truncate"
                    onClick={() => navigate(`/dna/${connection.username}`)}
                  >
                    {connection.full_name}
                  </h3>
                  <p className="text-sm text-muted-foreground truncate">
                    {connection.headline || 'DNA Member'}
                  </p>
                </div>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => setShowRemoveDialog(true)}>
                      <UserMinus className="mr-2 h-4 w-4" />
                      Remove Connection
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              {connection.location && (
                <p className="text-xs text-muted-foreground mb-3">{connection.location}</p>
              )}

              {/* Actions */}
              <div className="flex gap-2">
                <Button
                  variant="default"
                  size="sm"
                  onClick={handleMessage}
                  className="flex-1"
                >
                  <MessageCircle className="mr-2 h-4 w-4" />
                  Message
                </Button>
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate(`/dna/${connection.username}`)}
                >
                  <Eye className="mr-2 h-4 w-4" />
                  View Profile
                </Button>
              </div>

              <div className="text-xs text-muted-foreground mt-2">
                Connected {new Date(connection.connected_at).toLocaleDateString()}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <AlertDialog open={showRemoveDialog} onOpenChange={setShowRemoveDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Connection?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove {connection.full_name} from your connections?
              You will no longer be able to message each other unless you reconnect.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isRemoving}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleRemoveConnection}
              disabled={isRemoving}
              className="bg-destructive hover:bg-destructive/90"
            >
              {isRemoving ? 'Removing...' : 'Remove Connection'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
