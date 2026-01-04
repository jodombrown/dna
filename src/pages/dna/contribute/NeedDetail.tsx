import { useQuery } from '@tanstack/react-query';
import { useParams, Link } from 'react-router-dom';
import { supabaseClient } from '@/lib/supabaseHelpers';
import DetailViewLayout from '@/layouts/DetailViewLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft, DollarSign, Users, Clock, Key, Package, MapPin, Calendar, HandHeart } from 'lucide-react';
import type { ContributionNeedWithSpace } from '@/types/contributeTypes';
import { useState } from 'react';
import NeedFormDialog from '@/components/contribute/NeedFormDialog';
import OfferFormDialog from '@/components/contribute/OfferFormDialog';
import NeedOffersSection from '@/components/contribute/NeedOffersSection';
import { ImpactStoryCTA } from '@/components/contribute/ImpactStoryCTA';

const typeIcons = {
  funding: DollarSign,
  skills: Users,
  time: Clock,
  access: Key,
  resources: Package,
};

const NeedDetail = () => {
  const { id } = useParams();
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isOfferOpen, setIsOfferOpen] = useState(false);

  const { data: need, isLoading } = useQuery({
    queryKey: ['contribution-need', id],
    queryFn: async () => {
      // Step 1: Fetch the need
      const { data: needData, error: needError } = await supabaseClient
        .from('contribution_needs')
        .select('*')
        .eq('id', id)
        .maybeSingle();

      if (needError) throw needError;
      if (!needData) return null;

      // Step 2: Fetch the space separately
      let space = null;
      if (needData.space_id) {
        const { data: spaceData } = await supabaseClient
          .from('spaces')
          .select('id, name, slug, tagline, description, focus_areas, region, status')
          .eq('id', needData.space_id)
          .maybeSingle();
        space = spaceData;
      }

      // Step 3: Fetch badge count separately
      const { count: badgeCount } = await supabaseClient
        .from('contribution_badges')
        .select('id', { count: 'exact' })
        .eq('need_id', id as string);

      return {
        ...needData,
        space,
        badges: [{ count: badgeCount || 0 }],
      } as ContributionNeedWithSpace & {
        badges: { count: number }[];
      };
    },
  });

  const { data: userRole } = useQuery({
    queryKey: ['user-space-role', need?.space_id],
    queryFn: async () => {
      if (!need?.space_id) return null;
      
      const { data: { user } } = await supabaseClient.auth.getUser();
      if (!user) return null;

      const { data } = await supabaseClient
        .from('space_members')
        .select('role')
        .eq('space_id', need.space_id)
        .eq('user_id', user.id)
        .single();

      return data?.role;
    },
    enabled: !!need?.space_id,
  });

  const isLead = userRole === 'lead';
  const badgeCount = need?.badges?.[0]?.count || 0;
  const isFulfilledOrValidated = need && (need.status === 'fulfilled' || badgeCount > 0);
  const Icon = need ? typeIcons[need.type] : Package;

  if (isLoading) {
    return (
      <DetailViewLayout
        title="Loading..."
        backPath="/dna/contribute/needs"
        backLabel="Back to Needs"
      >
        <div className="animate-pulse space-y-8">
          <div className="h-8 bg-muted rounded w-1/3"></div>
          <div className="h-64 bg-muted rounded"></div>
        </div>
      </DetailViewLayout>
    );
  }

  if (!need) {
    return (
      <DetailViewLayout
        title="Need Not Found"
        backPath="/dna/contribute/needs"
        backLabel="Back to Needs"
      >
        <Card className="text-center py-12">
          <CardContent>
            <h2 className="text-xl font-semibold mb-2">Need not found</h2>
            <p className="text-muted-foreground mb-4">This contribution need doesn't exist</p>
            <Button asChild>
              <Link to="/dna/contribute/needs">Browse All Needs</Link>
            </Button>
          </CardContent>
        </Card>
      </DetailViewLayout>
    );
  }

  return (
    <DetailViewLayout
      title={need.title}
      backPath="/dna/contribute/needs"
      backLabel="Back to Needs"
      breadcrumbs={[
        { label: 'Home', path: '/dna/feed' },
        { label: 'Contribute', path: '/dna/contribute/needs' },
        { label: need.title }
      ]}
    >
        <div className="max-w-4xl mx-auto">
          <Card>
          <CardHeader>
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="bg-primary/10 rounded-full p-3">
                  <Icon className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <Badge variant={need.status === 'open' ? 'default' : 'secondary'} className="mb-2">
                    {need.status}
                  </Badge>
                  {need.priority === 'high' && (
                    <Badge variant="destructive" className="ml-2">High Priority</Badge>
                  )}
                </div>
              </div>
              {isLead && (
                <Button onClick={() => setIsEditOpen(true)}>Edit Need</Button>
              )}
            </div>
            <CardTitle className="text-3xl">{need.title}</CardTitle>
            <CardDescription className="text-base">
              <span className="capitalize">{need.type}</span> need
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-8">
            {/* Metadata */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {need.needed_by && (
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-muted-foreground">Needed by</p>
                    <p className="font-medium">{new Date(need.needed_by).toLocaleDateString()}</p>
                  </div>
                </div>
              )}
              {need.type === 'funding' && need.target_amount && (
                <div className="flex items-center gap-2 text-sm">
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-muted-foreground">Target</p>
                    <p className="font-medium">
                      {need.currency || '$'}{need.target_amount.toLocaleString()}
                    </p>
                  </div>
                </div>
              )}
              {(need.type === 'skills' || need.type === 'time') && need.time_commitment && (
                <div className="flex items-center gap-2 text-sm">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-muted-foreground">Commitment</p>
                    <p className="font-medium">{need.time_commitment}</p>
                  </div>
                </div>
              )}
            </div>

            <Separator />

            {/* Description */}
            <div>
              <h3 className="text-lg font-semibold mb-3">Description</h3>
              <p className="text-muted-foreground whitespace-pre-wrap">{need.description}</p>
            </div>

            <Separator />

            {/* Associated Space */}
            <div>
              <h3 className="text-lg font-semibold mb-3">Associated Project</h3>
              <Card>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle>{need.space?.name}</CardTitle>
                      <CardDescription>{need.space?.tagline}</CardDescription>
                      <div className="flex items-center gap-4 mt-3 text-sm text-muted-foreground">
                        {need.space?.region && (
                          <div className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {need.space.region}
                          </div>
                        )}
                        {need.space?.focus_areas && need.space.focus_areas.length > 0 && (
                          <div className="flex gap-1">
                            {need.space.focus_areas.slice(0, 2).map((area) => (
                              <Badge key={area} variant="outline" className="text-xs">
                                {area}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                    <Button asChild variant="outline">
                      <Link to={`/dna/collaborate/spaces/${need.space?.slug}`}>
                        View Space
                      </Link>
                    </Button>
                  </div>
                </CardHeader>
              </Card>
            </div>

            <Separator />

            {/* Offers Section */}
            <div>
              <NeedOffersSection
                needId={need.id}
                spaceId={need.space_id}
                isLead={isLead}
              />
            </div>

            {/* Offer Button for Non-Leads */}
            {!isLead && (
              <div>
                <Button onClick={() => setIsOfferOpen(true)} size="lg" className="w-full">
                  <HandHeart className="mr-2 h-5 w-5" />
                  Offer to Help
                </Button>
              </div>
            )}
          </CardContent>
          </Card>

          {isLead && need && (
            <NeedFormDialog
              isOpen={isEditOpen}
              onClose={() => setIsEditOpen(false)}
              spaceId={need.space_id}
              existingNeed={need}
            />
          )}

          {!isLead && need && (
            <OfferFormDialog
              isOpen={isOfferOpen}
              onClose={() => setIsOfferOpen(false)}
              needId={need.id}
              spaceId={need.space_id}
              needType={need.type}
            />
          )}
        </div>
    </DetailViewLayout>
  );
};

export default NeedDetail;
