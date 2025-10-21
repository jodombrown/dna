import React, { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { connectionService } from '@/services/connectionService';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Users, UserPlus, Clock, Loader2, Sparkles } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import UnifiedHeader from '@/components/UnifiedHeader';
import MobileBottomNav from '@/components/mobile/MobileBottomNav';
import ConnectionCard from '@/components/network/ConnectionCard';
import ConnectionRequestCard from '@/components/network/ConnectionRequestCard';
import NetworkSearch from '@/components/network/NetworkSearch';
import SuggestionsTab from '@/components/network/SuggestionsTab';

const Network: React.FC = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeRequestId, setActiveRequestId] = useState<string | null>(null);

  const { data: connections, isLoading: connectionsLoading } = useQuery({
    queryKey: ['connections'],
    queryFn: connectionService.getConnections,
  });

  const { data: pendingRequests, isLoading: requestsLoading } = useQuery({
    queryKey: ['pending-requests'],
    queryFn: connectionService.getPendingRequests,
  });

  // Filter connections based on search
  const filteredConnections = useMemo(() => {
    if (!connections || !searchQuery.trim()) return connections;
    
    const query = searchQuery.toLowerCase();
    return connections.filter((connection) => {
      return (
        connection.full_name?.toLowerCase().includes(query) ||
        connection.professional_role?.toLowerCase().includes(query) ||
        connection.headline?.toLowerCase().includes(query)
      );
    });
  }, [connections, searchQuery]);

  const acceptMutation = useMutation({
    mutationFn: connectionService.acceptConnectionRequest,
    onMutate: (requestId) => {
      setActiveRequestId(requestId);
    },
    onSuccess: (_, requestId) => {
      queryClient.invalidateQueries({ queryKey: ['connections'] });
      queryClient.invalidateQueries({ queryKey: ['pending-requests'] });
      queryClient.invalidateQueries({ queryKey: ['network-suggestions'] });
      const request = pendingRequests?.find(r => r.id === requestId);
      toast({ 
        title: 'Connection accepted!',
        description: request?.sender?.full_name ? `You're now connected with ${request.sender.full_name}` : undefined
      });
    },
    onError: () => {
      toast({ title: 'Failed to accept connection', variant: 'destructive' });
    },
    onSettled: () => {
      setActiveRequestId(null);
    },
  });

  const rejectMutation = useMutation({
    mutationFn: connectionService.rejectConnectionRequest,
    onMutate: (requestId) => {
      setActiveRequestId(requestId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pending-requests'] });
      queryClient.invalidateQueries({ queryKey: ['network-suggestions'] });
      toast({ title: 'Request declined' });
    },
    onError: () => {
      toast({ title: 'Failed to decline request', variant: 'destructive' });
    },
    onSettled: () => {
      setActiveRequestId(null);
    },
  });

  return (
    <div className="min-h-screen bg-background">
      <UnifiedHeader />
      
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">My Network</h1>
          <p className="text-muted-foreground">Manage your connections and requests</p>
        </div>

      <Tabs defaultValue="connections" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3 max-w-lg">
          <TabsTrigger value="connections" className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            Connections {connections?.length ? `(${connections.length})` : ''}
          </TabsTrigger>
          <TabsTrigger value="requests" className="flex items-center gap-2">
            <Clock className="w-4 h-4" />
            Requests {pendingRequests?.length ? `(${pendingRequests.length})` : ''}
          </TabsTrigger>
          <TabsTrigger value="suggestions" className="flex items-center gap-2">
            <Sparkles className="w-4 h-4" />
            Suggestions
          </TabsTrigger>
        </TabsList>

        <TabsContent value="connections" className="space-y-4">
          {connectionsLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-[hsl(30,65%,55%)]" />
            </div>
          ) : connections?.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Users className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-semibold mb-2">No connections yet</h3>
                <p className="text-muted-foreground mb-4">Start building your network by discovering members</p>
                <Button onClick={() => navigate('/dna/discover/members')}>
                  <UserPlus className="w-4 h-4 mr-2" />
                  Go to Discovery
                </Button>
              </CardContent>
            </Card>
          ) : (
            <>
              <NetworkSearch onSearch={setSearchQuery} />
              <div className="grid gap-4 md:grid-cols-2">
                {filteredConnections?.map((connection) => (
                  <ConnectionCard key={connection.id} connection={connection} />
                ))}
              </div>
              {filteredConnections?.length === 0 && searchQuery && (
                <Card>
                  <CardContent className="py-8 text-center">
                    <p className="text-muted-foreground">No connections found matching "{searchQuery}"</p>
                  </CardContent>
                </Card>
              )}
            </>
          )}
        </TabsContent>

        <TabsContent value="requests" className="space-y-4">
          {requestsLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-[hsl(30,65%,55%)]" />
            </div>
          ) : pendingRequests?.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Clock className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-semibold mb-2">No pending requests</h3>
                <p className="text-muted-foreground">
                  Check back later for new connection opportunities
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {pendingRequests?.map((request) => (
                <ConnectionRequestCard
                  key={request.id}
                  request={request}
                  onAccept={acceptMutation.mutate}
                  onDecline={rejectMutation.mutate}
                  isAccepting={acceptMutation.isPending && activeRequestId === request.id}
                  isDeclining={rejectMutation.isPending && activeRequestId === request.id}
                />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="suggestions" className="space-y-4">
          <SuggestionsTab />
        </TabsContent>
      </Tabs>
      </div>
      
      <MobileBottomNav />
    </div>
  );
};

export default Network;
