import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, DollarSign, Users, Clock, Key, Package } from 'lucide-react';
import NeedFormDialog from './NeedFormDialog';
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

  const { data: needs, isLoading } = useQuery({
    queryKey: ['space-needs', spaceId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('contribution_needs')
        .select('*')
        .eq('space_id', spaceId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as ContributionNeed[];
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
                return (
                  <Link key={need.id} to={`/dna/contribute/needs/${need.id}`}>
                    <Card className="hover:shadow-md transition-shadow">
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div className="flex items-start gap-3 flex-1">
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
                          </div>
                        </div>
                      </CardHeader>
                    </Card>
                  </Link>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8">
              <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground mb-4">
                {isLead ? "You haven't posted any needs yet" : "This space hasn't posted any needs yet"}
              </p>
              {isLead && (
                <Button onClick={() => setIsCreateOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add First Need
                </Button>
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
