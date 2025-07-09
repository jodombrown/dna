import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Crown, 
  Check, 
  X, 
  Clock, 
  ExternalLink, 
  MessageSquare,
  RefreshCw,
  User,
  MapPin,
  Building
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Tables } from '@/integrations/supabase/types';
import { formatDistanceToNow } from 'date-fns';

interface ContributorRequest extends Tables<'adin_contributor_requests'> {
  user?: {
    full_name: string | null;
    avatar_url?: string | null;
    email?: string | null;
  } | null;
}

const ContributorVerificationReview = () => {
  const { toast } = useToast();
  const [requests, setRequests] = useState<ContributorRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [adminNotes, setAdminNotes] = useState<{ [key: string]: string }>({});

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('adin_contributor_requests')
        .select(`
          *,
          user:users!user_id (
            full_name,
            avatar_url,
            email
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setRequests((data as any[]) || []);
    } catch (error) {
      console.error('Error fetching contributor requests:', error);
      toast({
        title: "Error",
        description: "Failed to load contributor requests",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (requestId: string, action: 'approved' | 'rejected' | 'needs_info') => {
    setActionLoading(requestId);

    try {
      const notes = adminNotes[requestId] || '';
      
      const { error } = await supabase
        .from('adin_contributor_requests')
        .update({
          status: action,
          admin_notes: notes || null,
          reviewed_at: new Date().toISOString()
        })
        .eq('id', requestId);

      if (error) throw error;

      toast({
        title: "Request Updated",
        description: `Request has been ${action}`,
      });

      // Refresh the list
      fetchRequests();
      
      // Clear admin notes for this request
      setAdminNotes(prev => {
        const newNotes = { ...prev };
        delete newNotes[requestId];
        return newNotes;
      });

    } catch (error) {
      console.error('Error updating request:', error);
      toast({
        title: "Error",
        description: "Failed to update request",
        variant: "destructive"
      });
    } finally {
      setActionLoading(null);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'bg-green-100 text-green-800 border-green-200';
      case 'rejected': return 'bg-red-100 text-red-800 border-red-200';
      case 'needs_info': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default: return 'bg-blue-100 text-blue-800 border-blue-200';
    }
  };

  const getImpactTypeIcon = (type: string) => {
    switch (type) {
      case 'startup': return Building;
      case 'policy': return MessageSquare;
      case 'research': return User;
      default: return Crown;
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  if (loading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-center py-8">
            <RefreshCw className="h-6 w-6 animate-spin mr-2" />
            <span>Loading contributor requests...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Contributor Verification Requests</h2>
          <p className="text-gray-600">Review and approve verified contributor applications</p>
        </div>
        <Button onClick={fetchRequests} variant="outline" size="sm">
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {['pending', 'approved', 'rejected', 'needs_info'].map(status => (
          <Card key={status}>
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-dna-emerald">
                  {requests.filter(r => r.status === status).length}
                </div>
                <div className="text-sm text-gray-600 capitalize">
                  {status.replace('_', ' ')}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Requests List */}
      <div className="space-y-4">
        {requests.length === 0 ? (
          <Card>
            <CardContent className="pt-6 text-center py-8">
              <Crown className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <h3 className="text-lg font-semibold mb-2">No Verification Requests</h3>
              <p className="text-gray-500">
                Contributor verification requests will appear here when submitted.
              </p>
            </CardContent>
          </Card>
        ) : (
          requests.map((request) => {
            const ImpactIcon = getImpactTypeIcon(request.impact_type);
            
            return (
              <Card key={request.id} className="overflow-hidden">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                       <Avatar className="h-12 w-12">
                         <AvatarImage src={request.user?.avatar_url || undefined} />
                         <AvatarFallback className="bg-dna-emerald text-white">
                           {request.user?.full_name?.charAt(0) || 'U'}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <h3 className="font-semibold text-lg">{request.user?.full_name || 'Unknown User'}</h3>
                        <p className="text-sm text-gray-600">{request.user?.email || 'No email'}</p>
                        <div className="flex items-center gap-4 mt-1">
                          <div className="flex items-center gap-1 text-xs text-gray-500">
                            <ImpactIcon className="h-3 w-3" />
                            {request.impact_type.charAt(0).toUpperCase() + request.impact_type.slice(1)}
                          </div>
                          <div className="flex items-center gap-1 text-xs text-gray-500">
                            <MapPin className="h-3 w-3" />
                            {request.country_focus}
                          </div>
                          <div className="text-xs text-gray-500">
                            {formatDistanceToNow(new Date(request.created_at), { addSuffix: true })}
                          </div>
                        </div>
                      </div>
                    </div>
                    <Badge variant="outline" className={getStatusColor(request.status)}>
                      {request.status.replace('_', ' ')}
                    </Badge>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  {/* Description */}
                  <div>
                    <h4 className="font-medium mb-2">Contribution Description:</h4>
                    <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded-lg">
                      {request.description}
                    </p>
                  </div>

                  {/* Evidence Links */}
                  {request.evidence_links && request.evidence_links.length > 0 && (
                    <div>
                      <h4 className="font-medium mb-2">Supporting Evidence:</h4>
                      <div className="space-y-2">
                        {request.evidence_links.map((link, index) => (
                          <a
                            key={index}
                            href={link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800"
                          >
                            <ExternalLink className="h-3 w-3" />
                            {link}
                          </a>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Admin Notes (if any) */}
                  {request.admin_notes && (
                    <div>
                      <h4 className="font-medium mb-2">Admin Notes:</h4>
                      <p className="text-sm text-gray-700 bg-yellow-50 p-3 rounded-lg border border-yellow-200">
                        {request.admin_notes}
                      </p>
                    </div>
                  )}

                  {/* Admin Actions */}
                  {request.status === 'pending' && (
                    <div className="space-y-3 pt-4 border-t">
                      <div>
                        <label className="block text-sm font-medium mb-2">Admin Notes (Optional):</label>
                        <Textarea
                          placeholder="Add notes about this verification decision..."
                          value={adminNotes[request.id] || ''}
                          onChange={(e) => setAdminNotes(prev => ({ ...prev, [request.id]: e.target.value }))}
                          className="min-h-[80px]"
                        />
                      </div>
                      
                      <div className="flex gap-2">
                        <Button
                          onClick={() => handleAction(request.id, 'approved')}
                          disabled={actionLoading === request.id}
                          className="bg-green-600 hover:bg-green-700 flex-1"
                        >
                          <Check className="h-4 w-4 mr-2" />
                          Approve
                        </Button>
                        <Button
                          onClick={() => handleAction(request.id, 'needs_info')}
                          disabled={actionLoading === request.id}
                          variant="outline"
                          className="flex-1"
                        >
                          <MessageSquare className="h-4 w-4 mr-2" />
                          Request Info
                        </Button>
                        <Button
                          onClick={() => handleAction(request.id, 'rejected')}
                          disabled={actionLoading === request.id}
                          variant="destructive"
                          className="flex-1"
                        >
                          <X className="h-4 w-4 mr-2" />
                          Reject
                        </Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
};

export default ContributorVerificationReview;