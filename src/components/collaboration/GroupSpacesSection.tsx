import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Users, Plus, FolderKanban } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabaseClient } from '@/lib/supabaseHelpers';
import { useNavigate } from 'react-router-dom';
import { SpaceWithMembership } from '@/types/spaceTypes';

interface GroupSpacesSectionProps {
  groupId: string;
  isAdmin: boolean;
}

export function GroupSpacesSection({ groupId, isAdmin }: GroupSpacesSectionProps) {
  const navigate = useNavigate();

  const { data: linkedSpaces, isLoading } = useQuery({
    queryKey: ['group-spaces', groupId],
    queryFn: async () => {
      const { data, error } = await supabaseClient
        .from('spaces')
        .select('*')
        .eq('origin_group_id', groupId);
      
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
            <CardTitle>Spaces Linked to This Group</CardTitle>
          </div>
          {isAdmin && (
            <Button
              size="sm"
              onClick={() => navigate(`/dna/collaborate/spaces/new?from_group_id=${groupId}`)}
            >
              <Plus className="h-4 w-4 mr-2" />
              Create Space
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {hasSpaces ? (
          <div className="grid gap-3">
            {linkedSpaces.map((space) => (
              <div
                key={space.id}
                className="p-4 border rounded-lg hover:bg-accent cursor-pointer transition-colors"
                onClick={() => navigate(`/dna/collaborate/spaces/${space.slug}`)}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-medium">{space.name}</h4>
                      <Badge variant={space.status === 'active' ? 'default' : 'secondary'} className="text-xs">
                        {space.status}
                      </Badge>
                      {space.visibility === 'invite_only' && (
                        <Badge variant="outline" className="text-xs">Private</Badge>
                      )}
                    </div>
                    {space.tagline && (
                      <p className="text-sm text-muted-foreground mb-2">{space.tagline}</p>
                    )}
                    <div className="flex flex-wrap gap-2 items-center">
                      {space.focus_areas && space.focus_areas.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {space.focus_areas.slice(0, 2).map((area, idx) => (
                            <Badge key={idx} variant="outline" className="text-xs">
                              {area}
                            </Badge>
                          ))}
                        </div>
                      )}
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Users className="h-3 w-3" />
                        <span>{space.member_count || 0} members</span>
                      </div>
                    </div>
                  </div>
                  <Button size="sm" variant="ghost">View</Button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-6">
            <p className="text-muted-foreground">
              {isAdmin
                ? 'Create a project space for this group to collaborate on initiatives together.'
                : 'No project spaces have been created for this group yet.'}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
