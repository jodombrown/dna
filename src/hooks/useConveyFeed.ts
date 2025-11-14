import { useQuery } from '@tanstack/react-query';
import { supabaseClient } from '@/lib/supabaseHelpers';
import { ConveyItemWithDetails, ConveyFilters } from '@/types/conveyTypes';

interface UseConveyFeedOptions extends ConveyFilters {
  page?: number;
  pageSize?: number;
}

export function useConveyFeed(options: UseConveyFeedOptions = {}) {
  const {
    type,
    region,
    focusAreas,
    onlyMySpaces = false,
    page = 1,
    pageSize = 20,
  } = options;

  return useQuery({
    queryKey: ['convey-feed', { type, region, focusAreas, onlyMySpaces, page, pageSize }],
    queryFn: async () => {
      let query = supabaseClient
        .from('convey_items')
        .select(`
          *,
          author:profiles!convey_items_author_id_fkey(
            id,
            full_name,
            avatar_url
          ),
          primary_space:spaces!convey_items_primary_space_id_fkey(
            id,
            name,
            tagline,
            slug
          )
        `)
        .eq('status', 'published')
        .order('published_at', { ascending: false, nullsFirst: false })
        .order('created_at', { ascending: false });

      // Apply type filter
      if (type) {
        query = query.eq('type', type);
      }

      // Apply region filter
      if (region) {
        query = query.eq('region', region);
      }

      // Apply focus areas filter (overlap)
      if (focusAreas && focusAreas.length > 0) {
        query = query.overlaps('focus_areas', focusAreas);
      }

      // Apply "only my spaces" filter
      if (onlyMySpaces) {
        // Get current user's spaces first
        const { data: { user } } = await supabaseClient.auth.getUser();
        if (user) {
          const { data: mySpaces } = await supabaseClient
            .from('space_members')
            .select('space_id')
            .eq('user_id', user.id);

          if (mySpaces && mySpaces.length > 0) {
            const spaceIds = mySpaces.map(sm => sm.space_id);
            query = query.in('primary_space_id', spaceIds);
          } else {
            // User has no spaces, return empty result
            return { data: [], count: 0 };
          }
        }
      }

      // Apply pagination
      const from = (page - 1) * pageSize;
      const to = from + pageSize - 1;
      query = query.range(from, to);

      const { data, error, count } = await query;

      if (error) throw error;

      return {
        data: (data || []) as ConveyItemWithDetails[],
        count: count || 0,
      };
    },
  });
}

export function useConveyItemBySlug(slug: string | undefined) {
  return useQuery({
    queryKey: ['convey-item', slug],
    queryFn: async () => {
      if (!slug) return null;

      const { data, error } = await supabaseClient
        .from('convey_items')
        .select(`
          *,
          author:profiles!convey_items_author_id_fkey(
            id,
            full_name,
            avatar_url
          ),
          primary_space:spaces!convey_items_primary_space_id_fkey(
            id,
            name,
            tagline,
            slug
          )
        `)
        .eq('slug', slug)
        .single();

      if (error) throw error;

      return data as ConveyItemWithDetails;
    },
    enabled: !!slug,
  });
}
