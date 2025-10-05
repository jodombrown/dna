import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CheckCircle2, XCircle, Clock, ExternalLink } from 'lucide-react';

const AdminVerifications = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedRequest, setSelectedRequest] = useState<string | null>(null);
  const [reviewNotes, setReviewNotes] = useState('');

  // Fetch verification requests
  const { data: requests, isLoading } = useQuery({
    queryKey: ['admin-verification-requests'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('organization_verification_requests')
        .select(`
          *,
          organization:organizations(
            id,
            name,
            slug,
            logo_url,
            description
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  const approveMutation = useMutation({
    mutationFn: async (requestId: string) => {
      const request = requests?.find(r => r.id === requestId);
      if (!request) throw new Error('Request not found');

      // Update verification request
      const { error: requestError } = await supabase
        .from('organization_verification_requests')
        .update({
          status: 'approved',
          reviewed_at: new Date().toISOString(),
          reviewer_notes: reviewNotes,
        })
        .eq('id', requestId);

      if (requestError) throw requestError;

      // Update organization
      const { error: orgError } = await supabase
        .from('organizations')
        .update({
          verification_status: 'approved',
          verification_approved_at: new Date().toISOString(),
        })
        .eq('id', request.organization_id);

      if (orgError) throw orgError;
    },
    onSuccess: () => {
      toast({
        title: 'Request approved',
        description: 'Organization has been verified',
      });
      queryClient.invalidateQueries({ queryKey: ['admin-verification-requests'] });
      setSelectedRequest(null);
      setReviewNotes('');
    },
    onError: (error: any) => {
      toast({
        title: 'Approval failed',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const rejectMutation = useMutation({
    mutationFn: async (requestId: string) => {
      const request = requests?.find(r => r.id === requestId);
      if (!request) throw new Error('Request not found');

      // Update verification request
      const { error: requestError } = await supabase
        .from('organization_verification_requests')
        .update({
          status: 'rejected',
          reviewed_at: new Date().toISOString(),
          reviewer_notes: reviewNotes,
        })
        .eq('id', requestId);

      if (requestError) throw requestError;

      // Update organization
      const { error: orgError } = await supabase
        .from('organizations')
        .update({
          verification_status: 'rejected',
          verification_rejected_at: new Date().toISOString(),
          verification_notes: reviewNotes,
        })
        .eq('id', request.organization_id);

      if (orgError) throw orgError;
    },
    onSuccess: () => {
      toast({
        title: 'Request rejected',
        description: 'Organization verification has been rejected',
      });
      queryClient.invalidateQueries({ queryKey: ['admin-verification-requests'] });
      setSelectedRequest(null);
      setReviewNotes('');
    },
    onError: (error: any) => {
      toast({
        title: 'Rejection failed',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  const pendingRequests = requests?.filter(r => r.status === 'pending') || [];
  const approvedRequests = requests?.filter(r => r.status === 'approved') || [];
  const rejectedRequests = requests?.filter(r => r.status === 'rejected') || [];

  const renderRequest = (request: any) => (
    <Card key={request.id} className="mb-4">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            {request.organization?.logo_url && (
              <img 
                src={request.organization.logo_url} 
                alt={request.organization.name}
                className="w-12 h-12 rounded-lg object-cover"
              />
            )}
            <div>
              <CardTitle className="text-lg">{request.organization?.name}</CardTitle>
              <p className="text-sm text-muted-foreground">
                Submitted {new Date(request.created_at).toLocaleDateString()}
              </p>
            </div>
          </div>
          <Badge variant={
            request.status === 'approved' ? 'default' :
            request.status === 'rejected' ? 'destructive' :
            'secondary'
          }>
            {request.status}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Organization Details */}
          <div>
            <Label className="text-sm font-medium">Description</Label>
            <p className="text-sm text-muted-foreground mt-1">
              {request.description_of_work}
            </p>
          </div>

          {request.annual_budget_usd && (
            <div>
              <Label className="text-sm font-medium">Annual Budget</Label>
              <p className="text-sm text-muted-foreground mt-1">
                ${request.annual_budget_usd.toLocaleString()} USD
              </p>
            </div>
          )}

          {request.website_url && (
            <div>
              <Label className="text-sm font-medium">Website</Label>
              <a 
                href={request.website_url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-sm text-primary hover:underline flex items-center gap-1 mt-1"
              >
                {request.website_url}
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          )}

          {/* References */}
          <div>
            <Label className="text-sm font-medium">References</Label>
            <div className="space-y-2 mt-1">
              <div className="text-sm">
                <strong>{request.reference_1_name}</strong>
                <br />
                <span className="text-muted-foreground">{request.reference_1_email}</span>
                <br />
                <span className="text-muted-foreground italic">{request.reference_1_relationship}</span>
              </div>
              <div className="text-sm">
                <strong>{request.reference_2_name}</strong>
                <br />
                <span className="text-muted-foreground">{request.reference_2_email}</span>
                <br />
                <span className="text-muted-foreground italic">{request.reference_2_relationship}</span>
              </div>
            </div>
          </div>

          {/* Review Section for Pending */}
          {request.status === 'pending' && (
            <div className="border-t pt-4 mt-4">
              {selectedRequest === request.id ? (
                <div className="space-y-4">
                  <div>
                    <Label>Review Notes</Label>
                    <Textarea
                      value={reviewNotes}
                      onChange={(e) => setReviewNotes(e.target.value)}
                      placeholder="Add notes about this verification..."
                      className="mt-1"
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button
                      onClick={() => approveMutation.mutate(request.id)}
                      disabled={approveMutation.isPending}
                      className="flex-1"
                    >
                      <CheckCircle2 className="w-4 h-4 mr-2" />
                      Approve
                    </Button>
                    <Button
                      variant="destructive"
                      onClick={() => rejectMutation.mutate(request.id)}
                      disabled={rejectMutation.isPending}
                      className="flex-1"
                    >
                      <XCircle className="w-4 h-4 mr-2" />
                      Reject
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setSelectedRequest(null);
                        setReviewNotes('');
                      }}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <Button onClick={() => setSelectedRequest(request.id)}>
                  Review Request
                </Button>
              )}
            </div>
          )}

          {/* Show reviewer notes if approved/rejected */}
          {request.reviewer_notes && (
            <div>
              <Label className="text-sm font-medium">Reviewer Notes</Label>
              <p className="text-sm text-muted-foreground mt-1">
                {request.reviewer_notes}
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="container max-w-4xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Organization Verifications</h1>
        <p className="text-muted-foreground mt-2">
          Review and approve organization verification requests
        </p>
      </div>

      <Tabs defaultValue="pending">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="pending" className="gap-2">
            <Clock className="w-4 h-4" />
            Pending ({pendingRequests.length})
          </TabsTrigger>
          <TabsTrigger value="approved" className="gap-2">
            <CheckCircle2 className="w-4 h-4" />
            Approved ({approvedRequests.length})
          </TabsTrigger>
          <TabsTrigger value="rejected" className="gap-2">
            <XCircle className="w-4 h-4" />
            Rejected ({rejectedRequests.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="mt-6">
          {pendingRequests.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <p className="text-muted-foreground">No pending verification requests</p>
              </CardContent>
            </Card>
          ) : (
            pendingRequests.map(renderRequest)
          )}
        </TabsContent>

        <TabsContent value="approved" className="mt-6">
          {approvedRequests.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <p className="text-muted-foreground">No approved requests yet</p>
              </CardContent>
            </Card>
          ) : (
            approvedRequests.map(renderRequest)
          )}
        </TabsContent>

        <TabsContent value="rejected" className="mt-6">
          {rejectedRequests.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <p className="text-muted-foreground">No rejected requests</p>
              </CardContent>
            </Card>
          ) : (
            rejectedRequests.map(renderRequest)
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminVerifications;
