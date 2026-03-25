import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { contributeApplicationService } from '@/services/contributeApplicationService';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerFooter } from '@/components/ui/drawer';
import { ArrowLeft, CheckCircle, Clock, AlertTriangle, XCircle, Send, RotateCcw } from 'lucide-react';
import { AcknowledgmentPrompt } from './AcknowledgmentPrompt';
import { toast } from 'sonner';
import type { FulfillmentStatus } from '@/types/applicationTypes';

const statusConfig: Record<FulfillmentStatus, {
  contributorMsg: string;
  posterMsg: string;
  bg: string;
  icon: typeof CheckCircle;
}> = {
  in_progress: {
    contributorMsg: 'Your contribution is accepted -- deliver your work below',
    posterMsg: 'Waiting for delivery',
    bg: 'bg-[#B87333]/10 border-[#B87333]/30 text-[#B87333]',
    icon: Clock,
  },
  submitted: {
    contributorMsg: 'Submitted -- awaiting poster review',
    posterMsg: 'Delivery received -- review below',
    bg: 'bg-amber-50 border-amber-300 text-amber-800',
    icon: Send,
  },
  revision_requested: {
    contributorMsg: 'Revision requested -- see notes below and resubmit',
    posterMsg: 'Revision requested -- waiting for resubmission',
    bg: 'bg-amber-50 border-amber-300 text-amber-800',
    icon: RotateCcw,
  },
  completed: {
    contributorMsg: 'Contribution complete!',
    posterMsg: 'Contribution complete!',
    bg: 'bg-[#4A8D77]/10 border-[#4A8D77]/30 text-[#4A8D77]',
    icon: CheckCircle,
  },
  cancelled: {
    contributorMsg: 'This contribution was cancelled',
    posterMsg: 'This contribution was cancelled',
    bg: 'bg-destructive/10 border-destructive/30 text-destructive',
    icon: XCircle,
  },
};

export default function FulfillmentTracker() {
  const { fulfillmentId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const [submissionNotes, setSubmissionNotes] = useState('');
  const [revisionDrawerOpen, setRevisionDrawerOpen] = useState(false);
  const [revisionNotes, setRevisionNotes] = useState('');

  const { data: fulfillment, isLoading } = useQuery({
    queryKey: ['fulfillment', fulfillmentId],
    queryFn: () => contributeApplicationService.getFulfillment(fulfillmentId!),
    enabled: !!fulfillmentId,
  });

  // Fetch contributor and poster profiles
  const { data: profiles } = useQuery({
    queryKey: ['fulfillment-profiles', fulfillment?.contributor_id, fulfillment?.poster_id],
    queryFn: async () => {
      if (!fulfillment) return null;
      const ids = [fulfillment.contributor_id, fulfillment.poster_id].filter(Boolean);
      const { data } = await supabase
        .from('profiles')
        .select('id, full_name, avatar_url, username')
        .in('id', ids);
      return data || [];
    },
    enabled: !!fulfillment,
  });

  const submitMutation = useMutation({
    mutationFn: () => contributeApplicationService.submitFulfillment(fulfillmentId!, submissionNotes),
    onSuccess: () => {
      toast.success('Delivery submitted for review');
      setSubmissionNotes('');
      queryClient.invalidateQueries({ queryKey: ['fulfillment', fulfillmentId] });
    },
    onError: () => toast.error('Failed to submit delivery'),
  });

  const respondMutation = useMutation({
    mutationFn: ({ action, notes }: { action: 'complete' | 'request_revision'; notes?: string }) =>
      contributeApplicationService.respondToFulfillment(fulfillmentId!, action, notes),
    onSuccess: (_, variables) => {
      toast.success(variables.action === 'complete' ? 'Delivery accepted!' : 'Revision requested');
      setRevisionDrawerOpen(false);
      setRevisionNotes('');
      queryClient.invalidateQueries({ queryKey: ['fulfillment', fulfillmentId] });
    },
    onError: () => toast.error('Failed to respond'),
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background pt-20 pb-bottom-nav">
        <div className="max-w-3xl mx-auto px-4 py-8">
          <div className="space-y-4">
            <div className="h-16 bg-muted animate-pulse rounded-lg" />
            <div className="h-48 bg-muted animate-pulse rounded-lg" />
          </div>
        </div>
      </div>
    );
  }

  if (!fulfillment) {
    return (
      <div className="min-h-screen bg-background pt-20 pb-bottom-nav">
        <div className="max-w-3xl mx-auto px-4 py-8">
          <Alert variant="destructive">
            <AlertDescription>Fulfillment not found.</AlertDescription>
          </Alert>
          <Button variant="ghost" onClick={() => navigate(-1)} className="mt-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  const isContributor = user?.id === fulfillment.contributor_id;
  const isPoster = user?.id === fulfillment.poster_id;
  const role = isContributor ? 'contributor' : 'poster';
  const config = statusConfig[fulfillment.status];
  const StatusIcon = config.icon;

  const contributorProfile = profiles?.find(p => p.id === fulfillment.contributor_id);
  const posterProfile = profiles?.find(p => p.id === fulfillment.poster_id);
  const otherProfile = isContributor ? posterProfile : contributorProfile;

  return (
    <div className="min-h-screen bg-background pt-20 pb-bottom-nav md:pb-0">
      <div className="max-w-3xl mx-auto px-4 py-6 space-y-6">
        {/* Back */}
        <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>

        {/* Status Banner */}
        <div className={`p-4 rounded-lg border ${config.bg} flex items-center gap-3`}>
          <StatusIcon className="h-5 w-5 flex-shrink-0" />
          <p className="text-sm font-medium">
            {role === 'contributor' ? config.contributorMsg : config.posterMsg}
          </p>
        </div>

        {/* Timeline */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Timeline</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="relative pl-6 space-y-4">
              <div className="absolute left-2 top-2 bottom-2 w-0.5 bg-[#2D6A4F]" />
              
              <TimelineEvent
                label="Fulfillment started"
                timestamp={fulfillment.created_at}
                icon={<Clock className="h-3 w-3" />}
              />
              
              {fulfillment.submission_notes && (
                <TimelineEvent
                  label="Delivery submitted"
                  timestamp={fulfillment.updated_at}
                  icon={<Send className="h-3 w-3" />}
                />
              )}
              
              {fulfillment.revision_notes && (
                <TimelineEvent
                  label="Revision requested"
                  timestamp={fulfillment.updated_at}
                  icon={<RotateCcw className="h-3 w-3" />}
                />
              )}
              
              {fulfillment.completed_at && (
                <TimelineEvent
                  label="Completed"
                  timestamp={fulfillment.completed_at}
                  icon={<CheckCircle className="h-3 w-3" />}
                />
              )}
            </div>
          </CardContent>
        </Card>

        {/* Revision Notes Callout */}
        {fulfillment.status === 'revision_requested' && fulfillment.revision_notes && isContributor && (
          <Alert className="border-amber-300 bg-amber-50">
            <AlertTriangle className="h-4 w-4 text-amber-600" />
            <AlertDescription className="text-amber-800">
              <strong>Revision notes:</strong> {fulfillment.revision_notes}
            </AlertDescription>
          </Alert>
        )}

        {/* Contributor: Submit form */}
        {isContributor && (fulfillment.status === 'in_progress' || fulfillment.status === 'revision_requested') && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">
                {fulfillment.status === 'revision_requested' ? 'Resubmit Delivery' : 'Submit Delivery'}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Textarea
                placeholder="Describe your delivery..."
                value={submissionNotes}
                onChange={(e) => setSubmissionNotes(e.target.value)}
                rows={4}
              />
              <Button
                onClick={() => submitMutation.mutate()}
                disabled={submitMutation.isPending || !submissionNotes.trim()}
                className="w-full bg-[#B87333] hover:bg-[#a5632c]"
              >
                {submitMutation.isPending ? 'Submitting...' : 'Submit Delivery'}
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Poster: Review delivery */}
        {isPoster && fulfillment.status === 'submitted' && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Review Delivery</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {fulfillment.submission_notes && (
                <div className="p-3 bg-muted rounded-lg">
                  <p className="text-xs text-muted-foreground mb-1">Delivery notes from contributor:</p>
                  <p className="text-sm text-foreground whitespace-pre-wrap">{fulfillment.submission_notes}</p>
                </div>
              )}

              {fulfillment.submission_attachments && (fulfillment.submission_attachments as unknown[]).length > 0 && (
                <div>
                  <p className="text-xs text-muted-foreground mb-2">Attachments:</p>
                  <div className="flex flex-wrap gap-2">
                    {(fulfillment.submission_attachments as Array<{ name: string; url: string }>).map((att, i) => (
                      <Badge key={i} variant="secondary" className="cursor-pointer">
                        <a href={att.url} target="_blank" rel="noopener noreferrer">{att.name}</a>
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex gap-3">
                <Button
                  onClick={() => respondMutation.mutate({ action: 'complete' })}
                  disabled={respondMutation.isPending}
                  className="flex-1 bg-[#4A8D77] hover:bg-[#3d7563]"
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Accept Delivery
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setRevisionDrawerOpen(true)}
                  disabled={respondMutation.isPending}
                  className="flex-1"
                >
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Request Revision
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Acknowledgment Prompt (post-completion) */}
        {fulfillment.status === 'completed' && otherProfile && (
          <AcknowledgmentPrompt
            fulfillmentId={fulfillment.id}
            toProfile={{
              id: otherProfile.id,
              name: otherProfile.full_name || 'Contributor',
              avatar: otherProfile.avatar_url,
            }}
          />
        )}

        {/* Revision Drawer */}
        <Drawer open={revisionDrawerOpen} onOpenChange={setRevisionDrawerOpen}>
          <DrawerContent>
            <DrawerHeader>
              <DrawerTitle>Request Revision</DrawerTitle>
            </DrawerHeader>
            <div className="px-4">
              <Textarea
                placeholder="Describe what needs to be revised..."
                value={revisionNotes}
                onChange={(e) => setRevisionNotes(e.target.value)}
                rows={4}
              />
            </div>
            <DrawerFooter>
              <Button
                onClick={() => respondMutation.mutate({ action: 'request_revision', notes: revisionNotes })}
                disabled={respondMutation.isPending || !revisionNotes.trim()}
              >
                Send Revision Request
              </Button>
            </DrawerFooter>
          </DrawerContent>
        </Drawer>
      </div>
    </div>
  );
}

function TimelineEvent({ label, timestamp, icon }: { label: string; timestamp: string; icon: React.ReactNode }) {
  return (
    <div className="flex items-start gap-3">
      <div className="w-4 h-4 rounded-full bg-[#2D6A4F] flex items-center justify-center text-white flex-shrink-0 mt-0.5 relative z-10">
        {icon}
      </div>
      <div>
        <p className="text-sm font-medium text-foreground">{label}</p>
        <p className="text-xs text-muted-foreground">{new Date(timestamp).toLocaleDateString()}</p>
      </div>
    </div>
  );
}
