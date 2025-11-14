import { useQuery } from '@tanstack/react-query';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import UnifiedHeader from '@/components/UnifiedHeader';
import Footer from '@/components/Footer';
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
      const { data, error } = await supabase
        .from('contribution_needs')
        .select(`
          *,
          space:spaces(id, name, slug, tagline, description, focus_areas, region, status)
        `)
        .eq('id', id)
        .single();

      if (error) throw error;
      return data as ContributionNeedWithSpace;
    },
  });

  const { data: userRole } = useQuery({
    queryKey: ['user-space-role', need?.space_id],
    queryFn: async () => {
      if (!need?.space_id) return null;
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      const { data } = await supabase
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
  const Icon = need ? typeIcons[need.type] : Package;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <UnifiedHeader />
        <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="animate-pulse space-y-8">
            <div className="h-8 bg-muted rounded w-1/3"></div>
            <div className="h-64 bg-muted rounded"></div>
          </div>
        </main>
      </div>
    );
  }

  if (!need) {
    return (
      <div className="min-h-screen bg-background">
        <UnifiedHeader />
        <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <Card className="text-center py-12">
            <CardContent>
              <h2 className="text-xl font-semibold mb-2">Need not found</h2>
              <p className="text-muted-foreground mb-4">This contribution need doesn't exist</p>
              <Button asChild>
                <Link to="/dna/contribute/needs">Browse All Needs</Link>
              </Button>
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <UnifiedHeader />
      
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Button variant="ghost" asChild className="mb-6">
          <Link to="/dna/contribute/needs">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Needs
          </Link>
        </Button>

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
      </main>

      <Footer />
      
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
  );
};

export default NeedDetail;
