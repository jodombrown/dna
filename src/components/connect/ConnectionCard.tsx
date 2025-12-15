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
        p_user_id: (await supabase.auth.getUser()).data.user?.id,
        p_other_user_id: connection.id,
      });

      if (error) throw error;

      navigate('/dna/messages');
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
      <Card className="hover:shadow-sm transition-all border-border/50">
        <CardContent className="p-3">
          <div className="flex items-center gap-3">
            {/* Avatar */}
            <Avatar 
              className="h-10 w-10 cursor-pointer shrink-0" 
              onClick={() => navigate(`/dna/${connection.username}`)}
            >
              <AvatarImage src={connection.avatar_url} alt={connection.full_name} />
              <AvatarFallback className="text-xs bg-primary/10 text-primary">
                {connection.full_name.split(' ').map(n => n[0]).join('').slice(0, 2)}
              </AvatarFallback>
            </Avatar>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <h3 
                className="font-medium text-sm hover:text-primary cursor-pointer truncate"
                onClick={() => navigate(`/dna/${connection.username}`)}
              >
                {connection.full_name}
              </h3>
              <p className="text-xs text-muted-foreground truncate">
                {connection.headline || 'DNA Member'}
              </p>
              {connection.location && (
                <p className="text-xs text-muted-foreground/70 truncate">{connection.location}</p>
              )}
            </div>

            {/* Actions - Compact inline */}
            <div className="flex items-center gap-1 shrink-0">
              <Button
                variant="ghost"
                size="icon"
                onClick={handleMessage}
                className="h-8 w-8"
                title="Message"
              >
                <MessageCircle className="h-4 w-4" />
              </Button>
              
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate(`/dna/${connection.username}`)}
                className="h-8 w-8"
                title="View Profile"
              >
                <Eye className="h-4 w-4" />
              </Button>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="bg-background border shadow-lg z-50">
                  <DropdownMenuItem onClick={() => setShowRemoveDialog(true)}>
                    <UserMinus className="mr-2 h-4 w-4" />
                    Remove Connection
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
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
