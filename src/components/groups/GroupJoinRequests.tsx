import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Check, X, Users } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { useNavigate } from 'react-router-dom';

interface JoinRequest {
  id: string;
  group_id: string;
  user_id: string;
  username: string;
  full_name: string;
  avatar_url?: string;
  headline?: string;
  message?: string;
  status: string;
  created_at: string;
}

interface GroupJoinRequestsProps {
  groupId: string;
}

export function GroupJoinRequests({ groupId }: GroupJoinRequestsProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // Fetch join requests
  const { data: requests, refetch } = useQuery({
    queryKey: ['group-join-requests', groupId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('group_join_requests')
        .select(`
          id,
          group_id,
          user_id,
          message,
          status,
          created_at,
          profiles:user_id (
            username,
            full_name,
            avatar_url,
            headline
          )
        `)
        .eq('group_id', groupId)
        .eq('status', 'pending')
        .order('created_at', { ascending: false });

      if (error) throw error;

      return (data || []).map((req: any) => ({
        id: req.id,
        group_id: req.group_id,
        user_id: req.user_id,
        username: req.profiles.username,
        full_name: req.profiles.full_name,
        avatar_url: req.profiles.avatar_url,
        headline: req.profiles.headline,
        message: req.message,
        status: req.status,
        created_at: req.created_at,
      })) as JoinRequest[];
    },
    enabled: !!groupId,
  });

  // Approve/reject mutation
  const handleRequestMutation = useMutation({
    mutationFn: async ({ requestId, userId, approve }: { requestId: string; userId: string; approve: boolean }) => {
      if (!user) throw new Error('Not authenticated');

      // Update request status
      const { error: updateError } = await supabase
        .from('group_join_requests')
        .update({
          status: approve ? 'approved' : 'rejected',
          reviewed_by: user.id,
          reviewed_at: new Date().toISOString(),
        })
        .eq('id', requestId);

      if (updateError) throw updateError;

      // If approved, add member
      if (approve) {
        const { error: memberError } = await supabase
          .from('group_members')
          .insert({
            group_id: groupId,
            user_id: userId,
            role: 'member',
          });

        if (memberError) throw memberError;
      }
    },
    onSuccess: (_, variables) => {
      refetch();
      queryClient.invalidateQueries({ queryKey: ['group-members'] });
      queryClient.invalidateQueries({ queryKey: ['group-details'] });
      toast({
        title: variables.approve ? 'Request approved' : 'Request rejected',
        description: variables.approve ? 'User has been added to the group' : 'Join request has been declined',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: 'Failed to process request',
        variant: 'destructive',
      });
    },
  });

  const getInitials = (name: string) => {
    return name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2);
  };

  if (!requests || requests.length === 0) {
    return null;
  }

  return (
    <Card className="p-6">
      <h3 className="font-semibold mb-4 flex items-center gap-2">
        <Users className="h-5 w-5" />
        Pending Join Requests ({requests.length})
      </h3>

      <div className="space-y-4">
        {requests.map((request) => (
          <div key={request.id} className="flex items-start gap-3 p-3 border rounded-lg">
            <Avatar
              className="h-12 w-12 cursor-pointer"
              onClick={() => navigate(`/dna/${request.username}`)}
            >
              <AvatarImage src={request.avatar_url} alt={request.full_name} />
              <AvatarFallback className="bg-[hsl(151,75%,50%)] text-white">
                {getInitials(request.full_name)}
              </AvatarFallback>
            </Avatar>

            <div className="flex-1 min-w-0">
              <p
                className="font-semibold cursor-pointer hover:text-[hsl(151,75%,50%)] transition-colors"
                onClick={() => navigate(`/dna/${request.username}`)}
              >
                {request.full_name}
              </p>
              {request.headline && (
                <p className="text-sm text-muted-foreground truncate">
                  {request.headline}
                </p>
              )}
              {request.message && (
                <p className="text-sm mt-2 p-2 bg-muted rounded">
                  "{request.message}"
                </p>
              )}
              <p className="text-xs text-muted-foreground mt-1">
                {formatDistanceToNow(new Date(request.created_at), { addSuffix: true })}
              </p>
            </div>

            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() =>
                  handleRequestMutation.mutate({
                    requestId: request.id,
                    userId: request.user_id,
                    approve: true,
                  })
                }
                disabled={handleRequestMutation.isPending}
              >
                <Check className="h-4 w-4" />
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() =>
                  handleRequestMutation.mutate({
                    requestId: request.id,
                    userId: request.user_id,
                    approve: false,
                  })
                }
                disabled={handleRequestMutation.isPending}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
