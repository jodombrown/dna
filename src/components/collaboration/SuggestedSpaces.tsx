import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Sparkles, Users, Calendar, UsersIcon } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabaseClient } from '@/lib/supabaseHelpers';
import { useNavigate } from 'react-router-dom';
import { SpaceWithMembership } from '@/types/spaceTypes';
import { useAuth } from '@/contexts/AuthContext';
import { useJoinSpace } from '@/hooks/useSpaceMutations';
import { useAnalytics } from '@/hooks/useAnalytics';

export function SuggestedSpaces() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const joinSpace = useJoinSpace();
  const { trackEvent } = useAnalytics();

  const { data: suggestedSpaces, isLoading } = useQuery({
    queryKey: ['suggested-spaces', user?.id],
    queryFn: async () => {
      if (!user) return [];

      // Get user's profile to match focus areas and region
      const { data: profile } = await supabaseClient
        .from('profiles')
        .select('focus_areas, current_location')
        .eq('id', user.id)
        .single();

      // Get spaces the user is NOT a member of
      const { data: memberSpaces } = await supabaseClient
        .from('space_members')
        .select('space_id')
        .eq('user_id', user.id);

      const memberSpaceIds = memberSpaces?.map(m => m.space_id) || [];

      // Query public, active spaces
      let query = supabaseClient
        .from('spaces')
        .select('*')
        .eq('visibility', 'public')
        .eq('status', 'active')
        .order('updated_at', { ascending: false })
        .limit(20);

      if (memberSpaceIds.length > 0) {
        query = query.not('id', 'in', `(${memberSpaceIds.join(',')})`);
      }

      const { data: spaces, error } = await query;
      if (error) throw error;

      // Score and sort spaces
      const scoredSpaces = (spaces || []).map((space: any) => {
        let score = 0;
        
        // Focus area match (highest weight)
        if (profile?.focus_areas && space.focus_areas) {
          const userAreas = new Set(profile.focus_areas);
          const spaceAreas = new Set(space.focus_areas);
          const matches = [...userAreas].filter(area => spaceAreas.has(area)).length;
          score += matches * 10;
        }

        // Region match
        if (profile?.current_location && space.region) {
          if (space.region.toLowerCase().includes(profile.current_location.toLowerCase()) ||
              profile.current_location.toLowerCase().includes(space.region.toLowerCase())) {
            score += 5;
          }
        }
        if (space.region === 'Global') {
          score += 3;
        }

        // Recency boost
        const daysSinceUpdate = Math.floor(
          (Date.now() - new Date(space.updated_at).getTime()) / (1000 * 60 * 60 * 24)
        );
        if (daysSinceUpdate < 7) score += 3;
        else if (daysSinceUpdate < 30) score += 1;

        return { ...space, score };
      });

      return scoredSpaces
        .sort((a, b) => b.score - a.score)
        .slice(0, 6) as SpaceWithMembership[];
    },
    enabled: !!user,
  });

  const handleJoinSpace = async (spaceId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!user) return;
    try {
      await joinSpace.mutateAsync({ spaceId, userId: user.id });
      trackEvent('connect_cross_movement_space_join', {
        space_id: spaceId,
        source: 'suggested_spaces',
      });
    } catch (error) {
      // Error handled by mutation hook
    }
  };

  if (isLoading || !suggestedSpaces || suggestedSpaces.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Sparkles className="h-5 w-5 text-primary" />
        <h2 className="text-2xl font-bold">Spaces You Might Want to Join</h2>
      </div>
      
      <div className="grid gap-4 md:grid-cols-2">
        {suggestedSpaces.map((space) => (
          <Card
            key={space.id}
            className="cursor-pointer hover:border-primary transition-colors"
            onClick={() => navigate(`/dna/collaborate/spaces/${space.slug}`)}
          >
            <CardHeader>
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <CardTitle className="text-lg">{space.name}</CardTitle>
                  {space.tagline && (
                    <CardDescription className="mt-1">{space.tagline}</CardDescription>
                  )}
                </div>
                <Badge variant={space.status === 'active' ? 'default' : 'secondary'}>
                  {space.status}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {/* Focus Areas */}
              {space.focus_areas && space.focus_areas.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {space.focus_areas.slice(0, 3).map((area, idx) => (
                    <Badge key={idx} variant="outline" className="text-xs">
                      {area}
                    </Badge>
                  ))}
                  {space.focus_areas.length > 3 && (
                    <Badge variant="outline" className="text-xs">
                      +{space.focus_areas.length - 3}
                    </Badge>
                  )}
                </div>
              )}

              {/* Meta info */}
              <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
                {space.region && <span>📍 {space.region}</span>}
                <span className="flex items-center gap-1">
                  <Users className="h-3 w-3" />
                  {space.member_count || 0} members
                </span>
              </div>

              {/* Origin badge */}
              {(space.origin_event_id || space.origin_group_id) && (
                <Badge variant="secondary" className="text-xs">
                  {space.origin_event_id && (
                    <>
                      <Calendar className="h-3 w-3 mr-1" />
                      From Event
                    </>
                  )}
                  {space.origin_group_id && (
                    <>
                      <UsersIcon className="h-3 w-3 mr-1" />
                      From Group
                    </>
                  )}
                </Badge>
              )}

              {/* Actions */}
              <div className="flex gap-2 pt-2">
                <Button
                  size="sm"
                  variant="default"
                  onClick={(e) => handleJoinSpace(space.id, e)}
                  disabled={joinSpace.isPending}
                >
                  Join Space
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate(`/dna/collaborate/spaces/${space.slug}`);
                  }}
                >
                  View
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
