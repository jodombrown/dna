import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { connectionService } from '@/services/connectionService';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Users, UserPlus, Clock, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';

const Network: React.FC = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: connections, isLoading: connectionsLoading } = useQuery({
    queryKey: ['connections'],
    queryFn: connectionService.getConnections,
  });

  const { data: pendingRequests, isLoading: requestsLoading } = useQuery({
    queryKey: ['pending-requests'],
    queryFn: connectionService.getPendingRequests,
  });

  const acceptMutation = useMutation({
    mutationFn: connectionService.acceptConnectionRequest,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['connections'] });
      queryClient.invalidateQueries({ queryKey: ['pending-requests'] });
      toast({ title: 'Connection accepted!' });
    },
    onError: () => {
      toast({ title: 'Failed to accept connection', variant: 'destructive' });
    },
  });

  const rejectMutation = useMutation({
    mutationFn: connectionService.rejectConnectionRequest,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pending-requests'] });
      toast({ title: 'Connection request rejected' });
    },
    onError: () => {
      toast({ title: 'Failed to reject request', variant: 'destructive' });
    },
  });

  const getInitials = (name: string) => {
    return name
      ?.split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase() || '?';
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-dna-forest mb-2">My Network</h1>
        <p className="text-gray-600">Manage your connections and requests</p>
      </div>

      <Tabs defaultValue="connections" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2 max-w-md">
          <TabsTrigger value="connections" className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            Connections ({connections?.length || 0})
          </TabsTrigger>
          <TabsTrigger value="requests" className="flex items-center gap-2">
            <Clock className="w-4 h-4" />
            Requests ({pendingRequests?.length || 0})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="connections" className="space-y-4">
          {connectionsLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-dna-copper" />
            </div>
          ) : connections?.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Users className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                <h3 className="text-lg font-semibold mb-2">No connections yet</h3>
                <p className="text-gray-600 mb-4">Start building your network by connecting with professionals</p>
                <Button onClick={() => navigate('/dna/connect')}>
                  <UserPlus className="w-4 h-4 mr-2" />
                  Find People
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {connections?.map((connection) => (
                <Card key={connection.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <Avatar className="w-16 h-16">
                        <AvatarImage src={connection.avatar_url || ''} />
                        <AvatarFallback className="bg-dna-copper text-white">
                          {getInitials(connection.full_name || '')}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-lg text-dna-forest truncate">
                          {connection.full_name}
                        </h3>
                        {connection.professional_role && (
                          <p className="text-sm text-gray-600 truncate">{connection.professional_role}</p>
                        )}
                        {connection.headline && (
                          <p className="text-xs text-gray-500 mt-1 line-clamp-2">{connection.headline}</p>
                        )}
                        {connection.location && (
                          <Badge variant="secondary" className="mt-2 text-xs">
                            {connection.location}
                          </Badge>
                        )}
                        <Button
                          variant="outline"
                          size="sm"
                          className="mt-3"
                          onClick={() => navigate(`/dna/profile/${connection.id}`)}
                        >
                          View Profile
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="requests" className="space-y-4">
          {requestsLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-dna-copper" />
            </div>
          ) : pendingRequests?.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Clock className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                <h3 className="text-lg font-semibold mb-2">No pending requests</h3>
                <p className="text-gray-600">You'll see connection requests here</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {pendingRequests?.map((request) => (
                <Card key={request.id}>
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <Avatar className="w-16 h-16">
                        <AvatarImage src={request.sender?.avatar_url || ''} />
                        <AvatarFallback className="bg-dna-copper text-white">
                          {getInitials(request.sender?.full_name || '')}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg text-dna-forest">
                          {request.sender?.full_name}
                        </h3>
                        {request.sender?.professional_role && (
                          <p className="text-sm text-gray-600">{request.sender.professional_role}</p>
                        )}
                        {request.sender?.location && (
                          <Badge variant="secondary" className="mt-2 text-xs">
                            {request.sender.location}
                          </Badge>
                        )}
                        {request.message && (
                          <div className="mt-3 p-3 bg-muted rounded-md border-l-4 border-dna-copper">
                            <p className="text-sm italic text-foreground">"{request.message}"</p>
                          </div>
                        )}
                        <div className="flex gap-2 mt-4">
                          <Button
                            size="sm"
                            onClick={() => acceptMutation.mutate(request.id)}
                            disabled={acceptMutation.isPending}
                          >
                            {acceptMutation.isPending ? (
                              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            ) : (
                              <CheckCircle className="w-4 h-4 mr-2" />
                            )}
                            Accept
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => rejectMutation.mutate(request.id)}
                            disabled={rejectMutation.isPending}
                          >
                            {rejectMutation.isPending ? (
                              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            ) : (
                              <XCircle className="w-4 h-4 mr-2" />
                            )}
                            Decline
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Network;
