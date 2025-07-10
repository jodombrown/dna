import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, Clock, Mail } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { 
  getPendingJoinRequests, 
  approveMembershipRequest, 
  rejectMembershipRequest,
  JoinRequest 
} from '@/services/communityService';

interface JoinRequestManagerProps {
  communityId: string;
  isAdmin: boolean;
}

const JoinRequestManager: React.FC<JoinRequestManagerProps> = ({ communityId, isAdmin }) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: joinRequests = [], isLoading } = useQuery({
    queryKey: ['pendingJoinRequests', communityId],
    queryFn: () => getPendingJoinRequests(communityId),
    enabled: isAdmin
  });

  const approveMutation = useMutation({
    mutationFn: approveMembershipRequest,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pendingJoinRequests', communityId] });
      queryClient.invalidateQueries({ queryKey: ['community', communityId] });
      toast({
        title: "Request Approved",
        description: "The member has been added to the community.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to approve request. Please try again.",
        variant: "destructive"
      });
    }
  });

  const rejectMutation = useMutation({
    mutationFn: rejectMembershipRequest,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pendingJoinRequests', communityId] });
      toast({
        title: "Request Rejected",
        description: "The join request has been rejected.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to reject request. Please try again.",
        variant: "destructive"
      });
    }
  });

  if (!isAdmin) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Pending Join Requests
          {joinRequests.length > 0 && (
            <Badge variant="secondary">{joinRequests.length}</Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="text-center py-4">
            <p className="text-gray-500">Loading requests...</p>
          </div>
        ) : joinRequests.length === 0 ? (
          <div className="text-center py-8">
            <Clock className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 font-medium">No pending requests</p>
            <p className="text-sm text-gray-400 mt-1">
              All join requests have been processed
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {joinRequests.map((request: JoinRequest) => (
              <div 
                key={request.id} 
                className="flex items-center justify-between p-4 border border-gray-200 rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={request.user?.avatar_url} alt={request.user?.full_name} />
                    <AvatarFallback>
                      {request.user?.full_name?.charAt(0) || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div>
                    <h4 className="font-medium text-gray-900">
                      {request.user?.full_name || 'Unknown User'}
                    </h4>
                    {request.user?.email && (
                      <div className="flex items-center gap-1 text-sm text-gray-500">
                        <Mail className="h-3 w-3" />
                        {request.user.email}
                      </div>
                    )}
                    <p className="text-xs text-gray-400">
                      Requested {new Date(request.requested_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => rejectMutation.mutate(request.id)}
                    disabled={rejectMutation.isPending}
                    className="text-red-600 border-red-200 hover:bg-red-50"
                  >
                    <XCircle className="h-4 w-4 mr-1" />
                    Reject
                  </Button>
                  
                  <Button
                    size="sm"
                    onClick={() => approveMutation.mutate(request.id)}
                    disabled={approveMutation.isPending}
                    className="bg-dna-emerald hover:bg-dna-forest text-white"
                  >
                    <CheckCircle className="h-4 w-4 mr-1" />
                    Approve
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default JoinRequestManager;