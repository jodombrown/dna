import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabaseClient } from '@/lib/supabaseHelpers';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Loader2, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { formatDistanceToNow } from 'date-fns';

interface SpaceUpdatesProps {
  spaceId: string;
  canEdit: boolean;
}

export function SpaceUpdates({ spaceId, canEdit }: SpaceUpdatesProps) {
  const [newUpdate, setNewUpdate] = useState('');
  const queryClient = useQueryClient();

  const { data: updates, isLoading } = useQuery({
    queryKey: ['space-updates', spaceId],
    queryFn: async () => {
      const { data, error } = await supabaseClient
        .from('space_updates')
        .select(`
          *,
          creator:profiles!created_by (
            full_name,
            avatar_url
          )
        `)
        .eq('space_id', spaceId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  const createUpdate = useMutation({
    mutationFn: async (content: string) => {
      const { data: { user } } = await supabaseClient.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabaseClient
        .from('space_updates')
        .insert({
          space_id: spaceId,
          created_by: user.id,
          content,
          type: 'manual_update',
        });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['space-updates', spaceId] });
      setNewUpdate('');
      toast.success('Update posted');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to post update');
    },
  });

  const deleteUpdate = useMutation({
    mutationFn: async (updateId: string) => {
      const { error } = await supabaseClient
        .from('space_updates')
        .delete()
        .eq('id', updateId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['space-updates', spaceId] });
      toast.success('Update deleted');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to delete update');
    },
  });

  const handlePostUpdate = () => {
    if (!newUpdate.trim()) return;
    createUpdate.mutate(newUpdate);
  };

  if (isLoading) {
    return <div className="text-center py-8">Loading updates...</div>;
  }

  return (
    <div className="space-y-4">
      {/* Create update form */}
      <Card>
        <CardContent className="pt-6">
          <Textarea
            placeholder="Share a quick update with this space..."
            value={newUpdate}
            onChange={(e) => setNewUpdate(e.target.value)}
            className="mb-3"
            rows={3}
          />
          <Button
            onClick={handlePostUpdate}
            disabled={!newUpdate.trim() || createUpdate.isPending}
          >
            {createUpdate.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Post Update
          </Button>
        </CardContent>
      </Card>

      {/* Updates feed */}
      {!updates || updates.length === 0 ? (
        <Card>
          <CardContent className="pt-6 text-center py-12">
            <p className="text-muted-foreground">No updates yet</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {updates.map((update) => (
            <Card key={update.id}>
              <CardContent className="pt-6">
                <div className="flex items-start gap-3">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={update.creator?.avatar_url || undefined} />
                    <AvatarFallback>{update.creator?.full_name?.[0]}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold">{update.creator?.full_name}</span>
                      <span className="text-sm text-muted-foreground">
                        {formatDistanceToNow(new Date(update.created_at), { addSuffix: true })}
                      </span>
                      {update.type !== 'manual_update' && (
                        <Badge variant="secondary" className="text-xs capitalize">
                          {update.type.replace('_', ' ')}
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm whitespace-pre-wrap">{update.content}</p>
                  </div>
                  {canEdit && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => deleteUpdate.mutate(update.id)}
                      disabled={deleteUpdate.isPending}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
