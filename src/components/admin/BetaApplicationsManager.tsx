import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { CheckCircle, XCircle, Clock, Users, Rocket, Target } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface BetaApplication {
  id: string;
  name: string;
  email: string;
  company?: string;
  role?: string;
  beta_phase: string;
  experience?: string;
  motivation?: string;
  status: 'pending' | 'approved' | 'rejected';
  reviewed_by?: string;
  reviewed_at?: string;
  admin_notes?: string;
  created_at: string;
  updated_at: string;
}

const BetaApplicationsManager: React.FC = () => {
  const [applications, setApplications] = useState<BetaApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [adminNotes, setAdminNotes] = useState<{ [key: string]: string }>({});
  const { toast } = useToast();

  const betaPhaseIcons = {
    'beta1': <Users className="w-4 h-4" />,
    'beta2': <Rocket className="w-4 h-4" />,
    'beta3': <Target className="w-4 h-4" />
  };

  const betaPhaseNames = {
    'beta1': 'Beta 1: Early Prototype Testing',
    'beta2': 'Beta 2: MVP Feature Testing',
    'beta3': 'Beta 3: Pre-Launch Testing'
  };

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    try {
      const { data, error } = await supabase
        .from('beta_applications')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setApplications((data || []) as BetaApplication[]);
    } catch (error: any) {
      console.error('Error fetching applications:', error);
      toast({
        title: "Error",
        description: "Failed to load beta applications.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleApproval = async (applicationId: string, action: 'approve' | 'reject') => {
    setProcessingId(applicationId);
    
    try {
      const { error } = await supabase.functions.invoke('handle-beta-approval', {
        body: {
          applicationId,
          action,
          adminNotes: adminNotes[applicationId] || ''
        }
      });

      if (error) throw error;

      toast({
        title: action === 'approve' ? "Application Approved" : "Application Rejected",
        description: action === 'approve' 
          ? "Magic link has been sent to the applicant's email." 
          : "Rejection notification has been sent.",
      });

      // Refresh applications
      await fetchApplications();
      
      // Clear admin notes for this application
      setAdminNotes(prev => {
        const updated = { ...prev };
        delete updated[applicationId];
        return updated;
      });

    } catch (error: any) {
      console.error('Error processing application:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to process application.",
        variant: "destructive",
      });
    } finally {
      setProcessingId(null);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="border-yellow-500 text-yellow-700"><Clock className="w-3 h-3 mr-1" />Pending</Badge>;
      case 'approved':
        return <Badge variant="outline" className="border-green-500 text-green-700"><CheckCircle className="w-3 h-3 mr-1" />Approved</Badge>;
      case 'rejected':
        return <Badge variant="outline" className="border-red-500 text-red-700"><XCircle className="w-3 h-3 mr-1" />Rejected</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <Rocket className="w-8 h-8 text-dna-emerald mx-auto mb-4 animate-pulse" />
          <p>Loading beta applications...</p>
        </div>
      </div>
    );
  }

  const pendingApplications = applications.filter(app => app.status === 'pending');
  const processedApplications = applications.filter(app => app.status !== 'pending');

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Beta Applications Manager</h2>
        <Badge variant="outline" className="text-lg px-3 py-1">
          {pendingApplications.length} Pending Review
        </Badge>
      </div>

      {/* Pending Applications */}
      <div className="space-y-4">
        <h3 className="text-xl font-semibold text-dna-forest">Pending Applications</h3>
        {pendingApplications.length === 0 ? (
          <Card>
            <CardContent className="text-center py-8">
              <CheckCircle className="w-12 h-12 text-dna-emerald mx-auto mb-4" />
              <p className="text-gray-600">No pending applications to review</p>
            </CardContent>
          </Card>
        ) : (
          pendingApplications.map((app) => (
            <Card key={app.id} className="border-l-4 border-l-yellow-500">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <CardTitle className="text-lg">{app.name}</CardTitle>
                    <p className="text-sm text-gray-600">{app.email}</p>
                    <p className="text-xs text-gray-500">
                      Applied {formatDistanceToNow(new Date(app.created_at), { addSuffix: true })}
                    </p>
                  </div>
                  {getStatusBadge(app.status)}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium">Company/Organization</Label>
                    <p className="text-sm">{app.company || 'Not specified'}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Professional Role</Label>
                    <p className="text-sm">{app.role || 'Not specified'}</p>
                  </div>
                </div>

                <div>
                  <Label className="text-sm font-medium">Beta Phase Interest</Label>
                  <div className="flex items-center gap-2 mt-1">
                    {betaPhaseIcons[app.beta_phase as keyof typeof betaPhaseIcons]}
                    <span className="text-sm">{betaPhaseNames[app.beta_phase as keyof typeof betaPhaseNames]}</span>
                  </div>
                </div>

                {app.experience && (
                  <div>
                    <Label className="text-sm font-medium">Relevant Experience</Label>
                    <p className="text-sm bg-gray-50 p-2 rounded mt-1">{app.experience}</p>
                  </div>
                )}

                {app.motivation && (
                  <div>
                    <Label className="text-sm font-medium">Motivation</Label>
                    <p className="text-sm bg-gray-50 p-2 rounded mt-1">{app.motivation}</p>
                  </div>
                )}

                <div>
                  <Label htmlFor={`notes-${app.id}`} className="text-sm font-medium">Admin Notes (Optional)</Label>
                  <Textarea
                    id={`notes-${app.id}`}
                    value={adminNotes[app.id] || ''}
                    onChange={(e) => setAdminNotes(prev => ({ ...prev, [app.id]: e.target.value }))}
                    placeholder="Add any notes about this application..."
                    className="mt-1"
                    rows={2}
                  />
                </div>

                <div className="flex gap-3 pt-2">
                  <Button
                    onClick={() => handleApproval(app.id, 'approve')}
                    disabled={processingId === app.id}
                    className="bg-green-600 hover:bg-green-700 text-white"
                  >
                    <CheckCircle className="w-4 h-4 mr-2" />
                    {processingId === app.id ? 'Processing...' : 'Approve & Send Magic Link'}
                  </Button>
                  <Button
                    onClick={() => handleApproval(app.id, 'reject')}
                    disabled={processingId === app.id}
                    variant="destructive"
                  >
                    <XCircle className="w-4 h-4 mr-2" />
                    {processingId === app.id ? 'Processing...' : 'Reject Application'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Processed Applications */}
      <div className="space-y-4">
        <h3 className="text-xl font-semibold text-dna-forest">Processed Applications</h3>
        {processedApplications.length === 0 ? (
          <Card>
            <CardContent className="text-center py-8">
              <p className="text-gray-600">No processed applications yet</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {processedApplications.map((app) => (
              <Card key={app.id} className={`border-l-4 ${app.status === 'approved' ? 'border-l-green-500' : 'border-l-red-500'}`}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <CardTitle className="text-lg">{app.name}</CardTitle>
                      <p className="text-sm text-gray-600">{app.email}</p>
                      <p className="text-xs text-gray-500">
                        {app.status === 'approved' ? 'Approved' : 'Rejected'} {formatDistanceToNow(new Date(app.reviewed_at!), { addSuffix: true })}
                      </p>
                    </div>
                    {getStatusBadge(app.status)}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2 mb-2">
                    {betaPhaseIcons[app.beta_phase as keyof typeof betaPhaseIcons]}
                    <span className="text-sm">{betaPhaseNames[app.beta_phase as keyof typeof betaPhaseNames]}</span>
                  </div>
                  {app.admin_notes && (
                    <div>
                      <Label className="text-sm font-medium">Admin Notes</Label>
                      <p className="text-sm bg-gray-50 p-2 rounded mt-1">{app.admin_notes}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default BetaApplicationsManager;