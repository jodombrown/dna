import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate, Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Users, FolderKanban, Plus } from 'lucide-react';
import { supabaseClient } from '@/lib/supabaseHelpers';
import { ProfileV2Data, ProfileV2Visibility } from '@/types/profileV2';
import { Space, SpaceMemberRole } from '@/types/spaceTypes';
import { formatDistanceToNow } from 'date-fns';
import { REBUILD_FLAGS } from '@/lib/rebuildFlags';

interface ProfileV2SpacesProps {
  profile: ProfileV2Data;
  visibility: ProfileV2Visibility;
  isOwner: boolean;
}

interface SpaceDisplayItem extends Space {
  user_role?: SpaceMemberRole;
}

const ProfileV2Spaces: React.FC<ProfileV2SpacesProps> = (props) => {
  // STUBBED: Phase 2 teardown. Restore in Phase 3 rebuild.
  if (REBUILD_FLAGS.collaborateContributeRebuild) return null;
  return <ProfileV2SpacesImpl {...props} />;
};

const ProfileV2SpacesImpl: React.FC<ProfileV2SpacesProps> = ({
  profile,
  visibility,
  isOwner,
}) => {
  const navigate = useNavigate();
  const profileUserId = profile.id;

  // Query spaces the profile user is leading (created)
  const { data: leadingSpaces = [], isLoading: leadingLoading } = useQuery({
    queryKey: ['profile-leading-spaces', profileUserId, isOwner],
    queryFn: async () => {
      // Get memberships where user is lead
      const { data: memberships, error: membershipsError } = await supabaseClient
        .from('space_members')
        .select('space_id, role')
        .eq('user_id', profileUserId)
        .eq('role', 'lead');

      if (membershipsError) throw membershipsError;
      if (!memberships || memberships.length === 0) return [];

      // Get the spaces
      const spaceIds = memberships.map((m: { space_id: string; role: string }) => m.space_id);
      let query = supabaseClient
        .from('spaces')
        .select('*')
        .in('id', spaceIds)
        .order('updated_at', { ascending: false });

      // For non-owners, filter to only public and active spaces
      if (!isOwner) {
        query = query.eq('visibility', 'public').in('status', ['active', 'idea']);
      }

      const { data: spaces, error: spacesError } = await query;
      if (spacesError) throw spacesError;

      return (spaces || []).map((space: Space): SpaceDisplayItem => ({
        ...space,
        user_role: 'lead',
      }));
    },
    enabled: !!profileUserId,
  });

  // Query spaces the profile user is contributing to (member but not lead)
  const { data: contributingSpaces = [], isLoading: contributingLoading } = useQuery({
    queryKey: ['profile-contributing-spaces', profileUserId, isOwner],
    queryFn: async () => {
      // Get memberships where user is not lead
      const { data: memberships, error: membershipsError } = await supabaseClient
        .from('space_members')
        .select('space_id, role')
        .eq('user_id', profileUserId)
        .neq('role', 'lead');

      if (membershipsError) throw membershipsError;
      if (!memberships || memberships.length === 0) return [];

      // Get the spaces
      const spaceIds = memberships.map((m: { space_id: string; role: string }) => m.space_id);
      let query = supabaseClient
        .from('spaces')
        .select('*')
        .in('id', spaceIds)
        .order('updated_at', { ascending: false });

      // For non-owners, filter to only public and active spaces
      if (!isOwner) {
        query = query.eq('visibility', 'public').in('status', ['active', 'idea']);
      }

      const { data: spaces, error: spacesError } = await query;
      if (spacesError) throw spacesError;

      // Merge role info
      return (spaces || []).map((space: Space): SpaceDisplayItem => {
        const membership = memberships.find((m: { space_id: string; role: string }) => m.space_id === space.id);
        return {
          ...space,
          user_role: (membership?.role as SpaceMemberRole) || 'contributor',
        };
      });
    },
    enabled: !!profileUserId,
  });

  // Sort: Active first, then by last activity date
  const sortSpaces = (spaces: SpaceDisplayItem[]) => {
    return [...spaces].sort((a, b) => {
      // Active and idea status first
      const statusOrder = { active: 0, idea: 1, paused: 2, completed: 3 };
      const aOrder = statusOrder[a.status] ?? 4;
      const bOrder = statusOrder[b.status] ?? 4;
      if (aOrder !== bOrder) return aOrder - bOrder;
      // Then by updated_at descending
      return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime();
    });
  };

  const sortedLeadingSpaces = sortSpaces(leadingSpaces);
  const sortedContributingSpaces = sortSpaces(contributingSpaces);

  const totalLeading = leadingSpaces.length;
  const totalContributing = contributingSpaces.length;
  const totalSpaces = totalLeading + totalContributing;

  const isLoading = leadingLoading || contributingLoading;
  const hasSpaces = totalSpaces > 0;

  // Hide if visibility is set to hidden and viewer is not owner
  if (visibility.spaces === 'hidden' && !isOwner) {
    return null;
  }

  // Hide if no spaces and not the owner
  if (!hasSpaces && !isOwner && !isLoading) {
    return null;
  }

  // Loading skeleton
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FolderKanban className="w-5 h-5 text-primary" />
            Spaces
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-8 w-48" />
          <div className="grid gap-4">
            <Skeleton className="h-40 w-full" />
            <Skeleton className="h-40 w-full" />
          </div>
        </CardContent>
      </Card>
    );
  }

  const SpaceCardDisplay = ({ space }: { space: SpaceDisplayItem }) => (
    <Link to={`/dna/collaborate/spaces/${space.slug}`}>
      <Card className="hover:shadow-lg hover:border-primary/20 transition-all h-full">
        <CardContent className="pt-6 space-y-4">
          <div>
            <div className="flex items-start justify-between gap-2 mb-2">
              <h3 className="font-semibold text-lg line-clamp-2">{space.name}</h3>
              <Badge
                variant={space.status === 'active' ? 'default' : 'secondary'}
                className="text-xs shrink-0 capitalize"
              >
                {space.status}
              </Badge>
            </div>
            {space.tagline && (
              <p className="text-sm text-muted-foreground line-clamp-2">{space.tagline}</p>
            )}
          </div>

          <div className="flex flex-wrap gap-2">
            <Badge variant="outline" className="capitalize text-xs">
              {space.space_type.replace('_', ' ')}
            </Badge>
            {space.user_role && (
              <Badge variant="secondary" className="capitalize text-xs">
                {space.user_role === 'lead' ? 'Lead' : space.user_role.replace('_', ' ')}
              </Badge>
            )}
          </div>

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

          <div className="flex items-center justify-between text-xs text-muted-foreground pt-2 border-t">
            {space.region && <span>📍 {space.region}</span>}
            <span>Updated {formatDistanceToNow(new Date(space.updated_at), { addSuffix: true })}</span>
          </div>
        </CardContent>
      </Card>
    </Link>
  );

  const renderSpacesList = (
    spaces: SpaceDisplayItem[],
    emptyTitle: string,
    emptyDescription: string,
    emptyAction: { label: string; path: string }
  ) => {
    if (spaces.length === 0) {
      return (
        <div className="text-center py-12 px-4">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
            <FolderKanban className="w-8 h-8 text-primary" />
          </div>
          <p className="text-lg font-medium text-foreground mb-2">{emptyTitle}</p>
          <p className="text-sm text-muted-foreground mb-4">
            {emptyDescription}
          </p>
          {isOwner && (
            <Button onClick={() => navigate(emptyAction.path)}>
              {emptyAction.label}
            </Button>
          )}
        </div>
      );
    }

    return (
      <div className="grid gap-4 sm:grid-cols-1 lg:grid-cols-2">
        {spaces.map((space) => (
          <SpaceCardDisplay key={space.id} space={space} />
        ))}
      </div>
    );
  };

  return (
    <Card>
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FolderKanban className="w-5 h-5 text-primary" />
            Spaces
            <Badge variant="secondary" className="ml-2">
              {totalSpaces}
            </Badge>
          </div>
          {isOwner && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/dna/collaborate/spaces/new')}
            >
              <Plus className="w-4 h-4 mr-2" />
              Create Space
            </Button>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* Space Stats Summary */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="flex items-center gap-3 p-3 bg-secondary/50 rounded-lg">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <Users className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-xl sm:text-2xl font-bold text-primary">{totalLeading}</p>
              <p className="text-xs sm:text-sm text-muted-foreground">Spaces Created</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 bg-secondary/50 rounded-lg">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <FolderKanban className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-xl sm:text-2xl font-bold text-primary">{totalContributing}</p>
              <p className="text-xs sm:text-sm text-muted-foreground">Collaborations</p>
            </div>
          </div>
        </div>

        <Tabs defaultValue="leading" className="space-y-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="leading" className="flex items-center gap-2">
              <span>Leading</span>
              <Badge variant="outline" className="text-xs">
                {totalLeading}
              </Badge>
            </TabsTrigger>
            <TabsTrigger value="contributing" className="flex items-center gap-2">
              <span>Contributing To</span>
              <Badge variant="outline" className="text-xs">
                {totalContributing}
              </Badge>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="leading" className="mt-4">
            {renderSpacesList(
              sortedLeadingSpaces,
              'No spaces created yet',
              isOwner
                ? 'Create your first space to lead a project or initiative!'
                : `${profile.full_name || 'This user'} hasn't created any spaces yet.`,
              { label: 'Create Space', path: '/dna/collaborate/spaces/new' }
            )}
          </TabsContent>

          <TabsContent value="contributing" className="mt-4">
            {renderSpacesList(
              sortedContributingSpaces,
              'Not a member of any spaces yet',
              isOwner
                ? 'Discover and join spaces to collaborate with others!'
                : `${profile.full_name || 'This user'} hasn't joined any public spaces yet.`,
              { label: 'Discover Spaces', path: '/dna/collaborate/spaces' }
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default ProfileV2Spaces;
