import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Users, Plus, FolderKanban } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabaseClient } from '@/lib/supabaseHelpers';
import { useNavigate } from 'react-router-dom';
import { SpaceWithMembership } from '@/types/spaceTypes';

interface EventSpacesSectionProps {
  eventId: string;
  isOrganizer: boolean;
}

export function EventSpacesSection({ eventId, isOrganizer }: EventSpacesSectionProps) {
  const navigate = useNavigate();

  const { data: linkedSpaces, isLoading } = useQuery({
    queryKey: ['event-spaces', eventId],
    queryFn: async () => {
      const { data, error } = await supabaseClient
        .from('spaces')
        .select('*')
        .eq('origin_event_id', eventId);
      
      if (error) throw error;
      return data as SpaceWithMembership[];
    },
  });

  if (isLoading) {
    return null;
  }

  const hasSpaces = linkedSpaces && linkedSpaces.length > 0;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FolderKanban className="h-5 w-5 text-primary" />
            <CardTitle>Project Spaces</CardTitle>
          </div>
          {isOrganizer && (
            <Button
              size="sm"
              variant={hasSpaces ? "outline" : "default"}
              onClick={() => navigate(`/dna/collaborate/spaces/new?from_event_id=${eventId}`)}
            >
              <Plus className="h-4 w-4 mr-2" />
              {hasSpaces ? 'Create Another' : 'Create Project Space'}
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {hasSpaces ? (
          <div className="space-y-3">
            {linkedSpaces.map((space) => (
              <div
                key={space.id}
                className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent cursor-pointer transition-colors"
                onClick={() => navigate(`/dna/collaborate/spaces/${space.slug}`)}
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h4 className="font-medium truncate">{space.name}</h4>
                    <Badge variant={space.status === 'active' ? 'default' : 'secondary'}>
                      {space.status}
                    </Badge>
                  </div>
                  {space.tagline && (
                    <p className="text-sm text-muted-foreground truncate mt-1">
                      {space.tagline}
                    </p>
                  )}
                  <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                    <Users className="h-3 w-3" />
                    <span>{space.member_count || 0} members</span>
                  </div>
                </div>
                <Button size="sm" variant="ghost">
                  Open
                </Button>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-6">
            <p className="text-muted-foreground">
              {isOrganizer
                ? 'Turn this event into a collaborative project space to organize tasks and work together.'
                : 'No project spaces have been created for this event yet.'}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
