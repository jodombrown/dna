import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, Target } from 'lucide-react';

interface SpaceMilestonesProps {
  spaceId: string;
  canEdit: boolean;
}

export function SpaceMilestones({ spaceId, canEdit }: SpaceMilestonesProps) {
  const { data: milestones, isLoading } = useQuery({
    queryKey: ['space-milestones', spaceId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('milestones')
        .select('*')
        .eq('space_id', spaceId)
        .order('due_date', { ascending: true });

      if (error) throw error;
      return data;
    },
  });

  if (isLoading) {
    return <div className="text-center py-8">Loading milestones...</div>;
  }

  return (
    <div className="space-y-4">
      {canEdit && (
        <div className="flex justify-end">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Add Milestone
          </Button>
        </div>
      )}

      {!milestones || milestones.length === 0 ? (
        <Card>
          <CardContent className="pt-6 text-center py-12">
            <Target className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground mb-4">No milestones yet</p>
            {canEdit && (
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Create First Milestone
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {milestones.map((milestone) => (
            <Card key={milestone.id}>
              <CardContent className="pt-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-semibold mb-2">{milestone.title}</h3>
                    {milestone.description && (
                      <p className="text-sm text-muted-foreground mb-2">
                        {milestone.description}
                      </p>
                    )}
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="capitalize">
                        {milestone.status}
                      </Badge>
                      {milestone.due_date && (
                        <span className="text-sm text-muted-foreground">
                          Due: {new Date(milestone.due_date).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
