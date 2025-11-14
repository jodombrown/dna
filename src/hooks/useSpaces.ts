import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Space, SpaceWithMembership, SpaceMemberRole } from '@/types/spaceTypes';

export const usePublicSpaces = () => {
  return useQuery({
    queryKey: ['public-spaces'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('spaces')
        .select('*')
        .eq('visibility', 'public')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as Space[];
    },
  });
};

export const useMySpaces = () => {
  return useQuery({
    queryKey: ['my-spaces'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Get spaces where user is a member
      const { data: memberships, error: membershipsError } = await supabase
        .from('space_members')
        .select('space_id, role')
        .eq('user_id', user.id);

      if (membershipsError) throw membershipsError;

      if (!memberships || memberships.length === 0) {
        return { leading: [], contributing: [] };
      }

      // Get the actual space data
      const spaceIds = memberships.map(m => m.space_id);
      const { data: spaces, error: spacesError } = await supabase
        .from('spaces')
        .select('*')
        .in('id', spaceIds) as { data: Space[] | null; error: any };

      if (spacesError) throw spacesError;

      // Merge membership data with space data
      const spacesWithRoles: SpaceWithMembership[] = (spaces || []).map(space => {
        const membership = memberships.find(m => m.space_id === space.id);
        return {
          ...space,
          user_role: membership?.role as SpaceMemberRole | undefined,
        };
      });

      // Separate into leading and contributing
      const leading = spacesWithRoles.filter(s => s.user_role === 'lead');
      const contributing = spacesWithRoles.filter(s => s.user_role !== 'lead');

      return { leading, contributing };
    },
  });
};

export const useSpaceBySlug = (slug: string) => {
  return useQuery({
    queryKey: ['space', slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('spaces')
        .select('*')
        .eq('slug', slug)
        .single();

      if (error) throw error;
      return data as Space;
    },
    enabled: !!slug,
  });
};
