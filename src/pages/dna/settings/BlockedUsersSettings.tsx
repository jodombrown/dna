import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { connectionService } from '@/services/connectionService';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { SettingsLayout } from '@/components/settings/SettingsLayout';
import {
  Loader2,
  UserX,
  ShieldOff,
  AlertCircle,
  Clock
} from 'lucide-react';
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
import { formatDistanceToNow } from 'date-fns';
import { BlockedUser } from '@/types/blocked';

export default function BlockedUsersSettings() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [unblockingUser, setUnblockingUser] = useState<BlockedUser | null>(null);

  const { data: blockedUsers, isLoading, error } = useQuery({
    queryKey: ['blocked-users'],
    queryFn: () => connectionService.getBlockedUsers(),
  });

  const unblockMutation = useMutation({
    mutationFn: (userId: string) => connectionService.unblockUser(userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['blocked-users'] });
      toast({
        title: 'User unblocked',
        description: `${unblockingUser?.blocked_full_name || 'User'} has been unblocked. They can now contact you and see your content.`,
      });
      setUnblockingUser(null);
    },
    onError: (error: Error) => {
      toast({
        title: 'Failed to unblock user',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const handleUnblock = () => {
    if (unblockingUser) {
      unblockMutation.mutate(unblockingUser.blocked_user_id);
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  if (isLoading) {
    return (
      <SettingsLayout title="Blocked Users" description="Manage users you've blocked">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </SettingsLayout>
    );
  }

  if (error) {
    return (
      <SettingsLayout title="Blocked Users" description="Manage users you've blocked">
        <Card>
          <CardContent className="py-12">
            <div className="flex flex-col items-center text-center text-muted-foreground">
              <AlertCircle className="h-12 w-12 mb-4 text-destructive" />
              <p>Failed to load blocked users</p>
              <Button
                variant="outline"
                className="mt-4"
                onClick={() => queryClient.invalidateQueries({ queryKey: ['blocked-users'] })}
              >
                Try Again
              </Button>
            </div>
          </CardContent>
        </Card>
      </SettingsLayout>
    );
  }

  return (
    <SettingsLayout
      title="Blocked Users"
      description="Manage users you've blocked"
    >
      <div className="space-y-6">
        {/* Info Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserX className="h-5 w-5" />
              About Blocking
            </CardTitle>
            <CardDescription>
              What happens when you block someone
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="text-sm text-muted-foreground space-y-2">
              <li>• They cannot send you messages or connection requests</li>
              <li>• They won't see your posts in their feed</li>
              <li>• They won't appear in your search results or recommendations</li>
              <li>• Any existing connection will be removed</li>
              <li>• They won't be notified that you blocked them</li>
            </ul>
          </CardContent>
        </Card>

        {/* Blocked Users List */}
        <Card>
          <CardHeader>
            <CardTitle>Blocked Users ({blockedUsers?.length || 0})</CardTitle>
            <CardDescription>
              Users you've blocked can be unblocked at any time
            </CardDescription>
          </CardHeader>
          <CardContent>
            {!blockedUsers || blockedUsers.length === 0 ? (
              <div className="py-12 text-center">
                <ShieldOff className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
                <p className="text-muted-foreground">You haven't blocked anyone</p>
                <p className="text-sm text-muted-foreground mt-1">
                  When you block someone, they'll appear here
                </p>
              </div>
            ) : (
              <div className="divide-y">
                {blockedUsers.map((user) => (
                  <div
                    key={user.block_id}
                    className="flex items-center justify-between py-4 first:pt-0 last:pb-0"
                  >
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={user.blocked_avatar_url} alt={user.blocked_full_name} />
                        <AvatarFallback>{getInitials(user.blocked_full_name)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{user.blocked_full_name}</p>
                        <p className="text-sm text-muted-foreground">@{user.blocked_username}</p>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground mt-0.5">
                          <Clock className="h-3 w-3" />
                          <span>Blocked {formatDistanceToNow(new Date(user.blocked_at), { addSuffix: true })}</span>
                        </div>
                        {user.reason && (
                          <p className="text-xs text-muted-foreground mt-1">
                            Reason: {user.reason}
                          </p>
                        )}
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setUnblockingUser(user)}
                      disabled={unblockMutation.isPending}
                    >
                      Unblock
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Unblock Confirmation Dialog */}
      <AlertDialog open={!!unblockingUser} onOpenChange={() => setUnblockingUser(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Unblock {unblockingUser?.blocked_full_name}?</AlertDialogTitle>
            <AlertDialogDescription>
              After unblocking, this person will be able to:
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>Send you messages and connection requests</li>
                <li>See your posts and profile</li>
                <li>Appear in your search results</li>
              </ul>
              <p className="mt-2">
                You can block them again at any time from their profile.
              </p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={unblockMutation.isPending}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleUnblock}
              disabled={unblockMutation.isPending}
            >
              {unblockMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Unblocking...
                </>
              ) : (
                'Unblock'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </SettingsLayout>
  );
}
