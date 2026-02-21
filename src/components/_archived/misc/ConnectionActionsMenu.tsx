import React, { useState } from 'react';
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { MoreVertical, UserMinus, Ban, MessageCircle } from 'lucide-react';
import { connectionService } from '@/services/connectionService';
import { useToast } from '@/hooks/use-toast';
import { useQueryClient } from '@tanstack/react-query';
import { getErrorMessage } from '@/lib/errorLogger';

interface ConnectionActionsMenuProps {
  connectionId: string;
  userId: string;
  userName: string;
  onMessage?: () => void;
}

/**
 * ConnectionActionsMenu - Dropdown menu for connection management
 * 
 * Provides actions:
 * - Message (if callback provided)
 * - Remove Connection (with confirmation)
 * - Block User (with reason and confirmation)
 */
export const ConnectionActionsMenu: React.FC<ConnectionActionsMenuProps> = ({
  connectionId,
  userId,
  userName,
  onMessage,
}) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showRemoveDialog, setShowRemoveDialog] = useState(false);
  const [showBlockDialog, setShowBlockDialog] = useState(false);
  const [blockReason, setBlockReason] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleRemoveConnection = async () => {
    setIsLoading(true);
    try {
      await connectionService.removeConnection(connectionId);
      
      // Invalidate queries
      queryClient.invalidateQueries({ queryKey: ['connections'] });
      queryClient.invalidateQueries({ queryKey: ['connection-status'] });
      
      toast({
        title: 'Connection removed',
        description: `You are no longer connected with ${userName}`,
      });
      
      setShowRemoveDialog(false);
    } catch (error: unknown) {
      toast({
        title: 'Failed to remove connection',
        description: getErrorMessage(error) || 'Please try again',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleBlockUser = async () => {
    setIsLoading(true);
    try {
      await connectionService.blockUser(userId, blockReason || undefined);
      
      // Invalidate queries
      queryClient.invalidateQueries({ queryKey: ['connections'] });
      queryClient.invalidateQueries({ queryKey: ['connection-status'] });
      queryClient.invalidateQueries({ queryKey: ['blocked-users'] });
      
      toast({
        title: 'User blocked',
        description: `${userName} has been blocked and removed from your connections`,
      });
      
      setShowBlockDialog(false);
      setBlockReason('');
    } catch (error: unknown) {
      toast({
        title: 'Failed to block user',
        description: getErrorMessage(error) || 'Please try again',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon">
            <MoreVertical className="w-4 h-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {onMessage && (
            <>
              <DropdownMenuItem onClick={onMessage}>
                <MessageCircle className="w-4 h-4 mr-2" />
                Message
              </DropdownMenuItem>
              <DropdownMenuSeparator />
            </>
          )}
          <DropdownMenuItem onClick={() => setShowRemoveDialog(true)}>
            <UserMinus className="w-4 h-4 mr-2" />
            Remove Connection
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => setShowBlockDialog(true)}
            className="text-destructive focus:text-destructive"
          >
            <Ban className="w-4 h-4 mr-2" />
            Block User
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Remove Connection Dialog */}
      <AlertDialog open={showRemoveDialog} onOpenChange={setShowRemoveDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Connection?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to disconnect from {userName}? You can always send them a new
              connection request later.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isLoading}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleRemoveConnection}
              disabled={isLoading}
              className="bg-destructive hover:bg-destructive/90"
            >
              {isLoading ? 'Removing...' : 'Remove Connection'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Block User Dialog */}
      <AlertDialog open={showBlockDialog} onOpenChange={setShowBlockDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Block {userName}?</AlertDialogTitle>
            <AlertDialogDescription>
              Blocking will remove your connection and prevent {userName} from:
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>Sending you connection requests</li>
                <li>Messaging you</li>
                <li>Viewing your profile</li>
              </ul>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="py-4">
            <Textarea
              placeholder="Reason for blocking (optional)"
              value={blockReason}
              onChange={(e) => setBlockReason(e.target.value)}
              className="resize-none"
              rows={3}
            />
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isLoading}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleBlockUser}
              disabled={isLoading}
              className="bg-destructive hover:bg-destructive/90"
            >
              {isLoading ? 'Blocking...' : 'Block User'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
