/**
 * DNA | CONVENE — Browse's flat, paginated event list.
 *
 * Every Lens other than "all" (with no facets set), and every facet
 * narrowing, resolves into this one query instead of the lane arrangement.
 * `when`/`where`/`format`/`type`/`category` mirror the old events index's
 * filter predicates under the Browse facet names; `price` is derived from
 * event_ticket_types rows, never a fabricated string.
 *
 * Real pagination via .range() — no silent fifty-row ceiling.
 */
import { useInfiniteQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { EVENT_PLACE_SELECT, EVENT_PLACE_COLUMNS } from '@/lib/events/formatPlace';
import { EVENT_TIME_SELECT } from '@/lib/events/eventTime';

export const PAGE_SIZE = 24;

export interface ConveneBrowseFilters {
  lens: string;
  when: string;
  where: string;
  format: string;
  type: string;
  category: string;
  price: string;
  city: string | null;
}

async function fetchPaidEventIds(): Promise<string[]> {
  const { data } = await supabase
    .from('event_ticket_types')
    .select('event_id')
    .in('payment_type', ['paid', 'flex']);
  return [...new Set((data ?? []).map((r) => r.event_id))];
}

export function useConveneBrowseList(filters: ConveneBrowseFilters, enabled: boolean) {
  const { lens, when, where, format, type, category, price, city } = filters;

  const result = useInfiniteQuery({
    queryKey: ['convene-browse-list', lens, when, where, format, type, category, price, city],
    initialPageParam: 0,
    queryFn: async ({ pageParam }) => {
      let paidEventIds: string[] | null = null;
      if (price === 'free' || price === 'paid') {
        paidEventIds = await fetchPaidEventIds();
        if (price === 'paid' && paidEventIds.length === 0) {
          return { events: [], nextPage: null };
        }
      }

      let query = supabase
        .from('events')
        .select(`
          id, title, slug, ${EVENT_TIME_SELECT}, ${EVENT_PLACE_SELECT},
          description, short_description, tags,
          cover_image_url, event_type, format, is_cancelled, max_attendees,
          organizer_id, is_curated, curated_source, curated_source_url,
          event_attendees(count)
        `)
        .eq('status', 'published')
        .eq('visibility', 'public');

      // 'when' shares its 'upcoming'/'watching' predicates with useConveneCities
      // — an undated event (date_confirmed false / NULL start_time) still
      // belongs in 'upcoming'.
      const now = new Date().toISOString();
      if (!when || when === 'upcoming') {
        query = query.or(`start_time.gte.${now},start_time.is.null,date_confirmed.eq.false`);
      } else if (when === 'past') {
        query = query.lt('end_time', now);
      } else if (when === 'watching') {
        query = query.or('start_time.is.null,date_confirmed.eq.false');
      } else if (when === 'today') {
        const endOfDay = new Date();
        endOfDay.setHours(23, 59, 59, 999);
        query = query.gte('start_time', now).lte('start_time', endOfDay.toISOString());
      } else if (when === 'this_week') {
        const weekFromNow = new Date();
        weekFromNow.setDate(weekFromNow.getDate() + 7);
        query = query.gte('start_time', now).lte('start_time', weekFromNow.toISOString());
      } else if (when === 'this_month') {
        const monthFromNow = new Date();
        monthFromNow.setMonth(monthFromNow.getMonth() + 1);
        query = query.gte('start_time', now).lte('start_time', monthFromNow.toISOString());
      }

      if (where) query = query.eq(EVENT_PLACE_COLUMNS.country, where);
      if (format) query = query.eq('format', format as 'in_person' | 'virtual' | 'hybrid');
      if (type) {
        query = query.eq(
          'event_type',
          type as 'conference' | 'workshop' | 'meetup' | 'webinar' | 'networking' | 'social' | 'other',
        );
      }
      if (category) query = query.contains('tags', [category]);
      if (city) query = query.ilike('location_city', city);
      if (lens === 'curated') query = query.eq('is_curated', true);
      if (price === 'paid' && paidEventIds) query = query.in('id', paidEventIds);
      if (price === 'free' && paidEventIds && paidEventIds.length > 0) {
        query = query.not('id', 'in', `(${paidEventIds.join(',')})`);
      }

      const from = pageParam * PAGE_SIZE;
      const to = from + PAGE_SIZE - 1;
      const { data, error } = await query
        .order('start_time', { ascending: when !== 'past', nullsFirst: false })
        .range(from, to);

      if (error) throw error;

      const organizerIds = [
        ...new Set((data ?? []).map((e) => e.organizer_id).filter((id): id is string => !!id)),
      ];
      let organizerMap: Record<
        string,
        { id: string; full_name: string; avatar_url: string | null; username: string | null }
      > = {};
      if (organizerIds.length > 0) {
        const { data: profiles } = await supabase
          .from('profiles')
          .select('id, full_name, avatar_url, username')
          .in('id', organizerIds);
        if (profiles) organizerMap = Object.fromEntries(profiles.map((p) => [p.id, p]));
      }

      const events = (data ?? []).map((e) => ({
        ...e,
        organizer: organizerMap[e.organizer_id ?? ''] ?? null,
      }));

      return { events, nextPage: events.length === PAGE_SIZE ? pageParam + 1 : null };
    },
    getNextPageParam: (lastPage) => lastPage.nextPage,
    enabled,
    staleTime: 30_000,
  });

  const events = result.data?.pages.flatMap((p) => p.events) ?? [];

  return {
    events,
    isLoading: result.isLoading,
    isFetchingMore: result.isFetchingNextPage,
    hasMore: !!result.hasNextPage,
    loadMore: () => result.fetchNextPage(),
  };
}
