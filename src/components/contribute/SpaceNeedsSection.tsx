import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabaseClient } from '@/lib/supabaseHelpers';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, DollarSign, Users, Clock, Key, Package, HandHeart, CheckCircle2 } from 'lucide-react';
import NeedFormDialog from './NeedFormDialog';
import { useSpaceContributeStats } from '@/hooks/useContributeStats';
import { ImpactStoryCTA } from './ImpactStoryCTA';
import type { ContributionNeed } from '@/types/contributeTypes';

const typeIcons = {
  funding: DollarSign,
  skills: Users,
  time: Clock,
  access: Key,
  resources: Package,
};

interface SpaceNeedsSectionProps {
  spaceId: string;
  isLead: boolean;
}

const SpaceNeedsSection = ({ spaceId, isLead }: SpaceNeedsSectionProps) => {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const { data: stats } = useSpaceContributeStats(spaceId);

  const { data: needs, isLoading } = useQuery({
    queryKey: ['space-needs', spaceId],
    queryFn: async () => {
      const { data, error} = await supabaseClient
        .from('contribution_needs')
        .select(`
          *,
          offers:contribution_offers(count),
          badges:contribution_badges(count)
        `)
        .eq('space_id', spaceId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as (ContributionNeed & { 
        offers: { count: number }[];
        badges: { count: number }[];
      })[];
    },
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Contribute</CardTitle>
          <CardDescription>Loading needs...</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <>
      {/* Stats section for Leads */}
      {isLead && stats && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Plus className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.open_needs}</p>
                  <p className="text-sm text-muted-foreground">Open Needs</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <HandHeart className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.offers_last_90_days}</p>
                  <p className="text-sm text-muted-foreground">Offers (90 days)</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <CheckCircle2 className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.validated_contributions}</p>
                  <p className="text-sm text-muted-foreground">Validated</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Contribute</CardTitle>
              <CardDescription>What this space needs to succeed</CardDescription>
            </div>
            {isLead && (
              <Button onClick={() => setIsCreateOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add Need
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {needs && needs.length > 0 ? (
            <div className="space-y-4">
              {needs.map((need) => {
                const Icon = typeIcons[need.type];
                const badgeCount = need.badges?.[0]?.count || 0;
                const isFulfilledOrValidated = need.status === 'fulfilled' || badgeCount > 0;
                
                return (
                  <Card key={need.id} className="hover:shadow-md transition-shadow">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <Link to={`/dna/contribute/needs/${need.id}`} className="flex items-start gap-3 flex-1">
                          <Icon className="h-5 w-5 text-primary mt-0.5" />
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <CardTitle className="text-base">{need.title}</CardTitle>
                              <Badge variant={need.status === 'open' ? 'default' : 'secondary'} className="text-xs">
                                {need.status}
                              </Badge>
                              {need.priority === 'high' && (
                                <Badge variant="destructive" className="text-xs">High</Badge>
                              )}
                              {badgeCount > 0 && (
                                <Badge variant="outline" className="text-xs">
                                  {badgeCount} validated
                                </Badge>
                              )}
                            </div>
                            <CardDescription className="line-clamp-2">
                              {need.description}
                            </CardDescription>
                            {need.type === 'funding' && need.target_amount && (
                              <p className="text-sm font-semibold text-primary mt-2">
                                Target: {need.currency || '$'}{need.target_amount.toLocaleString()}
                              </p>
                            )}
                          </div>
                        </Link>
                        {isLead && isFulfilledOrValidated && (
                          <ImpactStoryCTA
                            spaceId={spaceId}
                            needId={need.id}
                            needTitle={need.title}
                            size="sm"
                          />
                        )}
                      </div>
                    </CardHeader>
                  </Card>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-12">
              <HandHeart className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No needs yet</h3>
              <p className="text-muted-foreground mb-4">
                {isLead 
                  ? "Start by posting what your space needs to succeed" 
                  : "This space hasn't posted any needs yet"}
              </p>
              {isLead && (
                <Button onClick={() => setIsCreateOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add First Need
                </Button>
              )}
              {!isLead && (
                <p className="text-sm text-muted-foreground mt-2">
                  Check back later or explore other spaces looking for support
                </p>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {isLead && (
        <NeedFormDialog
          isOpen={isCreateOpen}
          onClose={() => setIsCreateOpen(false)}
          spaceId={spaceId}
        />
      )}
    </>
  );
};

export default SpaceNeedsSection;
