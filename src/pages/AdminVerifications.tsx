import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const AdminVerifications = () => {
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
            slug
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    },
  });

  const pendingRequests = requests?.filter(r => r.status === 'pending') || [];
  const reviewedRequests = requests?.filter(r => r.status !== 'pending') || [];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="container max-w-6xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Verification Dashboard</h1>
        <p className="text-muted-foreground mt-2">
          Review and approve organization verification requests
        </p>
      </div>

      <Tabs defaultValue="pending" className="space-y-6">
        <TabsList>
          <TabsTrigger value="pending">
            Pending ({pendingRequests.length})
          </TabsTrigger>
          <TabsTrigger value="reviewed">
            Reviewed ({reviewedRequests.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="space-y-4">
          {pendingRequests.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground">
                No pending verification requests
              </CardContent>
            </Card>
          ) : (
            pendingRequests.map((request: any) => (
              <Card key={request.id}>
                <CardHeader>
                  <CardTitle>{request.organization?.name}</CardTitle>
                </CardHeader>
                <CardContent>
                  <Badge>Pending</Badge>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        <TabsContent value="reviewed" className="space-y-4">
          {reviewedRequests.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground">
                No reviewed requests yet
              </CardContent>
            </Card>
          ) : (
            reviewedRequests.map((request: any) => (
              <Card key={request.id}>
                <CardHeader>
                  <CardTitle>{request.organization?.name}</CardTitle>
                </CardHeader>
                <CardContent>
                  <Badge>{request.status}</Badge>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminVerifications;
