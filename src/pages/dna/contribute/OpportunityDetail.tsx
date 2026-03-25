import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabaseClient } from '@/lib/supabaseHelpers';
import { useAuth } from '@/contexts/AuthContext';
import LayoutController from '@/components/LayoutController';
import { LeftNav } from '@/components/layout/columns/LeftNav';
import { RightWidgets } from '@/components/layout/columns/RightWidgets';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ArrowLeft, DollarSign, Users, Clock, Key, Package, AlertCircle, MessageSquare, ClipboardList } from 'lucide-react';
import OpportunityThreadCTA from '@/components/contribute/OpportunityThreadCTA';
import { DIADetailInsight } from '@/components/dia/DIADetailInsight';
import { ConversationPicker } from '@/components/messaging/ConversationPicker';
import { ApplicationsDrawer } from '@/components/contribute/ApplicationsDrawer';
import { FulfillmentBanner } from '@/components/contribute/FulfillmentBanner';
import { contributeApplicationService } from '@/services/contributeApplicationService';
import { toast } from 'sonner';
import { useState } from 'react';
import type { ContributionNeedWithSpace } from '@/types/contributeTypes';

const typeIcons = {
  funding: DollarSign,
  skills: Users,
  time: Clock,
  access: Key,
  resources: Package,
};

export default function OpportunityDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [offerMessage, setOfferMessage] = useState('');
  const [showShareInChat, setShowShareInChat] = useState(false);
  const [showApplications, setShowApplications] = useState(false);

  const { data: need, isLoading } = useQuery({
    queryKey: ['contribution-need', id],
    queryFn: async () => {
      const { data, error } = await supabaseClient
        .from('contribution_needs')
        .select(`
          *,
          space:spaces(id, name, slug, tagline, focus_areas, region, created_by)
        `)
        .eq('id', id)
        .single();

      if (error) throw error;
      return data as ContributionNeedWithSpace;
    },
    enabled: !!id,
  });

  const isPoster = user && need?.created_by === user.id;

  const { data: appCount } = useQuery({
    queryKey: ['app-count', id],
    queryFn: () => contributeApplicationService.getApplicationCount(id!),
    enabled: !!id && !!isPoster,
  });

  const createOfferMutation = useMutation({
    mutationFn: async (message: string) => {
      const { data, error } = await supabaseClient
        .from('contribution_offers')
        .insert({
          need_id: id!,
          space_id: need!.space_id,
          created_by: user!.id,
          message,
          status: 'pending',
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast.success('Your offer has been submitted!');
      setOfferMessage('');
      queryClient.invalidateQueries({ queryKey: ['contribution-offers', id] });
    },
    onError: (error) => {
      toast.error('Failed to submit offer. Please try again.');
    },
  });

  const handleSubmitOffer = () => {
    if (!offerMessage.trim()) {
      toast.error('Please describe how you can help');
      return;
    }
    if (!user) {
      toast.error('Please sign in to submit an offer');
      return;
    }
    createOfferMutation.mutate(offerMessage);
  };

  if (isLoading) {
    return (
      <LayoutController
        leftColumn={<LeftNav />}
        centerColumn={
          <div className="p-8">
            <div className="animate-pulse space-y-4">
              <div className="h-8 bg-muted rounded w-3/4"></div>
              <div className="h-4 bg-muted rounded w-1/2"></div>
              <div className="h-32 bg-muted rounded"></div>
            </div>
          </div>
        }
        rightColumn={<RightWidgets variant="default" />}
      />
    );
  }

  if (!need) {
    return (
      <LayoutController
        leftColumn={<LeftNav />}
        centerColumn={
          <div className="p-8">
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                This contribution need could not be found.
              </AlertDescription>
            </Alert>
            <Button onClick={() => navigate('/dna/contribute')} className="mt-4">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Contribute
            </Button>
          </div>
        }
        rightColumn={<RightWidgets variant="default" />}
      />
    );
  }

  const Icon = typeIcons[need.type];

  return (
    <LayoutController
      leftColumn={<LeftNav />}
      centerColumn={
        <div className="max-w-4xl mx-auto p-4 md:p-8">
          {/* Back button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/dna/contribute')}
            className="mb-4"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Contribute
          </Button>

          {/* Fulfillment Banner */}
          {id && <FulfillmentBanner opportunityId={id} />}

          {/* View Applications (poster only) */}
          {isPoster && (
            <Button
              variant="outline"
              onClick={() => setShowApplications(true)}
              className="mb-4 border-[#B87333] text-[#B87333] hover:bg-[#B87333]/10"
            >
              <ClipboardList className="h-4 w-4 mr-2" />
              View Applications {appCount ? `(${appCount})` : ''}
            </Button>
          )}

          {/* Main need card */}
          <Card className="mb-6">
            <CardHeader>
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <Icon className="h-6 w-6 text-primary" />
                  <div>
                    <CardTitle className="text-2xl mb-1">{need.title}</CardTitle>
                    <CardDescription>
                      {need.space ? (
                        <Link 
                          to={`/dna/collaborate/spaces/${need.space.slug || need.space.id}`}
                          className="hover:text-primary transition-colors"
                        >
                          {need.space.name}
                        </Link>
                      ) : (
                        'Project'
                      )}
                    </CardDescription>
                  </div>
                </div>
                <div className="flex gap-2 items-center">
                  <Badge variant={need.status === 'open' ? 'default' : 'secondary'}>
                    {need.status}
                  </Badge>
                  <Badge variant="outline">{need.priority} priority</Badge>
                  {user && (
                    <Button variant="outline" size="sm" onClick={() => setShowShareInChat(true)}>
                      <MessageSquare className="h-3.5 w-3.5 mr-1.5" />
                      Share in Chat
                    </Button>
                  )}
                </div>
              </div>

              {/* Meta info */}
              <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <span className="font-medium">Type:</span> {need.type}
                </div>
                {need.region && (
                  <div className="flex items-center gap-1">
                    <span className="font-medium">Region:</span> {need.region}
                  </div>
                )}
                {need.needed_by && (
                  <div className="flex items-center gap-1">
                    <span className="font-medium">Needed by:</span> {new Date(need.needed_by).toLocaleDateString()}
                  </div>
                )}
                {need.time_commitment && (
                  <div className="flex items-center gap-1">
                    <span className="font-medium">Time:</span> {need.time_commitment}
                  </div>
                )}
              </div>
            </CardHeader>

            <CardContent>
              <div className="prose prose-sm max-w-none">
                <p className="text-foreground whitespace-pre-wrap">{need.description}</p>
              </div>

              {need.target_amount && (
                <div className="mt-6 p-4 bg-muted rounded-lg">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Target Amount</span>
                    <span className="text-lg font-bold">
                      {need.currency || 'USD'} {need.target_amount.toLocaleString()}
                    </span>
                  </div>
                </div>
              )}

              {need.focus_areas && need.focus_areas.length > 0 && (
                <div className="mt-6">
                  <h3 className="text-sm font-medium mb-2">Focus Areas</h3>
                  <div className="flex flex-wrap gap-2">
                    {need.focus_areas.map((area, idx) => (
                      <Badge key={idx} variant="secondary">{area}</Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* DIA Detail Insight */}
          <DIADetailInsight surface="opportunity_detail" entityId={need.id} />

          {/* Thread CTA */}
          {user && (
            <div className="mb-6">
              <OpportunityThreadCTA
                opportunityId={need.id}
                opportunityTitle={need.title}
                posterId={need.created_by}
                currentUserId={user.id}
                isClosed={need.status === 'closed' || need.status === 'fulfilled'}
              />
            </div>
          )}

          {/* Offer to contribute */}
          {need.status === 'open' && user && (
            <Card>
              <CardHeader>
                <CardTitle>Offer to Contribute</CardTitle>
                <CardDescription>
                  Let the team know how you can help with this need
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Textarea
                  placeholder="Describe your skills, resources, or how you can help..."
                  value={offerMessage}
                  onChange={(e) => setOfferMessage(e.target.value)}
                  rows={4}
                />
                <Button
                  onClick={handleSubmitOffer}
                  disabled={createOfferMutation.isPending || !offerMessage.trim()}
                  className="w-full"
                >
                  {createOfferMutation.isPending ? 'Submitting...' : 'Submit Offer'}
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Share in Chat Picker */}
          <ConversationPicker
            open={showShareInChat}
            onOpenChange={setShowShareInChat}
            entityReference={{
              entityType: 'opportunity',
              entityId: need.id,
              entityTitle: need.title,
              entityPreview: need.description?.slice(0, 100),
            }}
          {/* Applications Drawer */}
          {isPoster && id && (
            <ApplicationsDrawer
              opportunityId={id}
              opportunityTitle={need.title}
              isOpen={showApplications}
              onClose={() => setShowApplications(false)}
            />
          )}
        </div>
      }
      rightColumn={<RightWidgets variant="default" />}
    />
  );
}
