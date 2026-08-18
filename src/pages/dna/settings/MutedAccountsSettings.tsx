import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { SettingsLayout } from '@/components/settings/SettingsLayout';
import { Loader2, UserX, VolumeX, AlertCircle, Clock } from 'lucide-react';
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

interface MutedAuthor {
  muted_id: string;
  muted_user_id: string;
  muted_username: string;
  muted_full_name: string;
  muted_avatar_url?: string;
  muted_at: string;
}

export default function MutedAccountsSettings() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [unmutingUser, setUnmutingUser] = useState<MutedAuthor | null>(null);

  const { data: mutedAuthors, isLoading, error } = useQuery({
    queryKey: ['muted-authors'],
    queryFn: async (): Promise<MutedAuthor[]> => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      const { data: mutedRows, error: mutedError } = await supabase
        .from('muted_authors')
        .select('id, muted_user_id, created_at')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (mutedError) throw mutedError;
      if (!mutedRows || mutedRows.length === 0) return [];

      const mutedUserIds = mutedRows.map((row) => row.muted_user_id);
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id, username, full_name, avatar_url')
        .in('id', mutedUserIds);

      if (profilesError) throw profilesError;

      const profileById = new Map((profiles || []).map((profile) => [profile.id, profile]));

      return mutedRows.map((row) => {
        const profile = profileById.get(row.muted_user_id);
        return {
          muted_id: row.id,
          muted_user_id: row.muted_user_id,
          muted_username: profile?.username || 'unknown',
          muted_full_name: profile?.full_name || 'Unknown User',
          muted_avatar_url: profile?.avatar_url,
          muted_at: row.created_at,
        };
      });
    },
  });

  const unmuteMutation = useMutation({
    mutationFn: async (mutedUserId: string) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('muted_authors')
        .delete()
        .eq('user_id', user.id)
        .eq('muted_user_id', mutedUserId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['muted-authors'] });
      queryClient.invalidateQueries({ queryKey: ['universal-feed'] });
      toast({
        title: 'Account unmuted',
        description: `You'll see ${unmutingUser?.muted_full_name || 'their'} posts again.`,
      });
      setUnmutingUser(null);
    },
    onError: (error: Error) => {
      toast({
        title: 'Failed to unmute account',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const handleUnmute = () => {
    if (unmutingUser) {
      unmuteMutation.mutate(unmutingUser.muted_user_id);
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
      <SettingsLayout title="Muted Accounts" description="Manage accounts you've muted">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </SettingsLayout>
    );
  }

  if (error) {
    return (
      <SettingsLayout title="Muted Accounts" description="Manage accounts you've muted">
        <Card>
          <CardContent className="py-12">
            <div className="flex flex-col items-center text-center text-muted-foreground">
              <AlertCircle className="h-12 w-12 mb-4 text-destructive" />
              <p>Failed to load muted accounts</p>
              <Button
                variant="outline"
                className="mt-4"
                onClick={() => queryClient.invalidateQueries({ queryKey: ['muted-authors'] })}
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
      title="Muted Accounts"
      description="Manage accounts you've muted"
    >
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <VolumeX className="h-5 w-5" />
              About Muting
            </CardTitle>
            <CardDescription>
              What happens when you mute someone
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="text-sm text-muted-foreground space-y-2">
              <li>• Their posts won't appear in your feed</li>
              <li>• They can still see your posts and profile</li>
              <li>• They can still send you messages and connection requests</li>
              <li>• They won't be notified that you muted them</li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Muted Accounts ({mutedAuthors?.length || 0})</CardTitle>
            <CardDescription>
              Accounts you've muted can be unmuted at any time
            </CardDescription>
          </CardHeader>
          <CardContent>
            {!mutedAuthors || mutedAuthors.length === 0 ? (
              <div className="py-12 text-center">
                <UserX className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
                <p className="text-muted-foreground">You haven't muted anyone.</p>
              </div>
            ) : (
              <div className="divide-y">
                {mutedAuthors.map((user) => (
                  <div
                    key={user.muted_id}
                    className="flex items-center justify-between py-4 first:pt-0 last:pb-0"
                  >
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={user.muted_avatar_url} alt={user.muted_full_name} />
                        <AvatarFallback>{getInitials(user.muted_full_name)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{user.muted_full_name}</p>
                        <p className="text-sm text-muted-foreground">@{user.muted_username}</p>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground mt-0.5">
                          <Clock className="h-3 w-3" />
                          <span>Muted {formatDistanceToNow(new Date(user.muted_at), { addSuffix: true })}</span>
                        </div>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setUnmutingUser(user)}
                      disabled={unmuteMutation.isPending}
                    >
                      Unmute
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <AlertDialog open={!!unmutingUser} onOpenChange={() => setUnmutingUser(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Unmute {unmutingUser?.muted_full_name}?</AlertDialogTitle>
            <AlertDialogDescription>
              Their posts will start appearing in your feed again. You can mute them again at any time.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={unmuteMutation.isPending}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleUnmute}
              disabled={unmuteMutation.isPending}
            >
              {unmuteMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Unmuting...
                </>
              ) : (
                'Unmute'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </SettingsLayout>
  );
}
