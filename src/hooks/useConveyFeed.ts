import { useQuery } from '@tanstack/react-query';
import { supabaseClient } from '@/lib/supabaseHelpers';
import { ConveyItemWithDetails, ConveyFilters } from '@/types/conveyTypes';

interface UseConveyFeedOptions extends ConveyFilters {
  page?: number;
  pageSize?: number;
}

/**
 * Fetches stories from the posts table for the CONVEY hub.
 * Stories are posts with post_type in ('story', 'update', 'impact').
 */
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
        .from('posts')
        .select(`
          id,
          slug,
          title,
          subtitle,
          content,
          post_type,
          story_type,
          image_url,
          gallery_urls,
          author_id,
          space_id,
          event_id,
          created_at,
          updated_at,
          privacy_level,
          author:profiles!posts_author_id_fkey(
            id,
            full_name,
            avatar_url,
            region
          ),
          primary_space:spaces!posts_space_id_fkey(
            id,
            name,
            tagline,
            slug,
            region
          )
        `, { count: 'exact' })
        .eq('is_deleted', false)
        .in('post_type', ['story', 'update', 'impact'])
        .order('created_at', { ascending: false });

      // Apply type filter (maps to post_type or story_type)
      if (type) {
        // If filtering by 'story', 'update', 'impact' - these are post_types
        query = query.eq('post_type', type);
      }

      // Apply region filter (via author's region or space's region)
      // Note: posts table doesn't have region directly, so we filter client-side
      // or accept that region filtering may need a different approach

      // Apply "only my spaces" filter
      if (onlyMySpaces) {
        const { data: { user } } = await supabaseClient.auth.getUser();
        if (user) {
          const { data: mySpaces } = await supabaseClient
            .from('space_members')
            .select('space_id')
            .eq('user_id', user.id);

          if (mySpaces && mySpaces.length > 0) {
            const spaceIds = mySpaces.map(sm => sm.space_id);
            query = query.in('space_id', spaceIds);
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

      // Transform data to match ConveyItemWithDetails interface
      const transformedData: ConveyItemWithDetails[] = (data || []).map((post: any) => ({
        id: post.id,
        slug: post.slug || post.id, // Fallback to id if no slug
        title: post.title || '',
        subtitle: post.subtitle,
        type: post.post_type as 'story' | 'update' | 'impact',
        status: 'published' as const,
        visibility: post.privacy_level === 'public' ? 'public' as const : 'members_only' as const,
        body: post.content, // Map content to body for backward compatibility
        content: post.content, // Also include as content
        author_id: post.author_id,
        primary_space_id: post.space_id,
        primary_event_id: post.event_id,
        primary_need_id: null,
        primary_offer_id: null,
        primary_badge_id: null,
        focus_areas: null, // Not on posts table
        region: post.author?.region || post.primary_space?.region || null,
        created_at: post.created_at,
        updated_at: post.updated_at,
        published_at: post.created_at, // Use created_at as published_at
        image_url: post.image_url,
        gallery_urls: post.gallery_urls,
        story_type: post.story_type,
        author: post.author,
        primary_space: post.primary_space,
      }));

      // Apply region filter client-side if specified
      let filteredData = transformedData;
      if (region) {
        filteredData = transformedData.filter(item =>
          item.region === region ||
          item.author?.region === region ||
          item.primary_space?.region === region
        );
      }

      return {
        data: filteredData,
        count: count || 0,
      };
    },
  });
}

/**
 * Fetches stories for a specific space from the posts table.
 */
export function useSpaceConveyItems(
  spaceId: string | undefined,
  options: { type?: string; limit?: number; offset?: number } = {}
) {
  const { type, limit = 20, offset = 0 } = options;

  return useQuery({
    queryKey: ['space-convey-items', spaceId, { type, limit, offset }],
    queryFn: async () => {
      if (!spaceId) return [];

      let query = supabaseClient
        .from('posts')
        .select(`
          id,
          slug,
          title,
          subtitle,
          content,
          post_type,
          story_type,
          image_url,
          gallery_urls,
          author_id,
          space_id,
          event_id,
          created_at,
          updated_at,
          author:profiles!posts_author_id_fkey(
            id,
            full_name,
            avatar_url
          )
        `)
        .eq('is_deleted', false)
        .eq('space_id', spaceId)
        .in('post_type', ['story', 'update', 'impact'])
        .order('created_at', { ascending: false });

      if (type) {
        query = query.eq('post_type', type);
      }

      query = query.range(offset, offset + limit - 1);

      const { data, error } = await query;

      if (error) throw error;

      // Transform to ConveyItemWithDetails format
      return (data || []).map((post: any) => ({
        id: post.id,
        slug: post.slug || post.id,
        title: post.title || '',
        subtitle: post.subtitle,
        type: post.post_type as 'story' | 'update' | 'impact',
        status: 'published' as const,
        visibility: 'public' as const,
        body: post.content,
        content: post.content,
        author_id: post.author_id,
        primary_space_id: post.space_id,
        primary_event_id: post.event_id,
        primary_need_id: null,
        primary_offer_id: null,
        primary_badge_id: null,
        focus_areas: null,
        region: null,
        created_at: post.created_at,
        updated_at: post.updated_at,
        published_at: post.created_at,
        image_url: post.image_url,
        gallery_urls: post.gallery_urls,
        story_type: post.story_type,
        author: post.author,
      })) as ConveyItemWithDetails[];
    },
    enabled: !!spaceId,
  });
}

/**
 * Fetches stories for a specific event from the posts table.
 */
export function useEventConveyItems(
  eventId: string | undefined,
  options: { limit?: number } = {}
) {
  const { limit = 5 } = options;

  return useQuery({
    queryKey: ['event-convey-items', eventId, { limit }],
    queryFn: async () => {
      if (!eventId) return [];

      const { data, error } = await supabaseClient
        .from('posts')
        .select(`
          id,
          slug,
          title,
          subtitle,
          content,
          post_type,
          story_type,
          image_url,
          gallery_urls,
          author_id,
          space_id,
          event_id,
          created_at,
          updated_at,
          author:profiles!posts_author_id_fkey(
            id,
            full_name,
            avatar_url
          )
        `)
        .eq('is_deleted', false)
        .eq('event_id', eventId)
        .in('post_type', ['story', 'update', 'impact'])
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;

      // Transform to ConveyItemWithDetails format
      return (data || []).map((post: any) => ({
        id: post.id,
        slug: post.slug || post.id,
        title: post.title || '',
        subtitle: post.subtitle,
        type: post.post_type as 'story' | 'update' | 'impact',
        status: 'published' as const,
        visibility: 'public' as const,
        body: post.content,
        content: post.content,
        author_id: post.author_id,
        primary_space_id: post.space_id,
        primary_event_id: post.event_id,
        primary_need_id: null,
        primary_offer_id: null,
        primary_badge_id: null,
        focus_areas: null,
        region: null,
        created_at: post.created_at,
        updated_at: post.updated_at,
        published_at: post.created_at,
        image_url: post.image_url,
        gallery_urls: post.gallery_urls,
        story_type: post.story_type,
        author: post.author,
      })) as ConveyItemWithDetails[];
    },
    enabled: !!eventId,
  });
}

/**
 * Fetches a single story by slug from the posts table.
 */
export function useConveyItemBySlug(slug: string | undefined) {
  return useQuery({
    queryKey: ['convey-item', slug],
    queryFn: async () => {
      if (!slug) return null;

      // Check if slug looks like a UUID (for backward compatibility)
      const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(slug);

      let query = supabaseClient
        .from('posts')
        .select(`
          id,
          slug,
          title,
          subtitle,
          content,
          post_type,
          story_type,
          image_url,
          gallery_urls,
          author_id,
          space_id,
          event_id,
          created_at,
          updated_at,
          privacy_level,
          author:profiles!posts_author_id_fkey(
            id,
            full_name,
            avatar_url,
            region
          ),
          primary_space:spaces!posts_space_id_fkey(
            id,
            name,
            tagline,
            slug,
            region
          ),
          primary_event:events!posts_event_id_fkey(
            id,
            title,
            start_time,
            format
          )
        `)
        .eq('is_deleted', false)
        .in('post_type', ['story', 'update', 'impact']);

      // Query by slug or UUID
      if (isUUID) {
        query = query.eq('id', slug);
      } else {
        query = query.eq('slug', slug);
      }

      const { data, error } = await query.single();

      if (error) throw error;

      if (!data) return null;

      // Transform to ConveyItemWithDetails format
      return {
        id: data.id,
        slug: data.slug || data.id,
        title: data.title || '',
        subtitle: data.subtitle,
        type: data.post_type as 'story' | 'update' | 'impact',
        status: 'published' as const,
        visibility: data.privacy_level === 'public' ? 'public' as const : 'members_only' as const,
        body: data.content,
        content: data.content,
        author_id: data.author_id,
        primary_space_id: data.space_id,
        primary_event_id: data.event_id,
        primary_need_id: null,
        primary_offer_id: null,
        primary_badge_id: null,
        focus_areas: null,
        region: data.author?.region || data.primary_space?.region || null,
        created_at: data.created_at,
        updated_at: data.updated_at,
        published_at: data.created_at,
        image_url: data.image_url,
        gallery_urls: data.gallery_urls,
        story_type: data.story_type,
        author: data.author,
        primary_space: data.primary_space,
        primary_event: data.primary_event,
      } as ConveyItemWithDetails;
    },
    enabled: !!slug,
  });
}
