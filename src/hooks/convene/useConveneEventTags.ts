/**
 * DNA | CONVENE — distinct event tags, for the Category facet.
 *
 * `events.tags` is a free-form string[] column (no fixed vocabulary), so the
 * Category facet's option list is derived from what organizers have actually
 * entered, the same way useConveneCities derives its city list — never a
 * hand-authored category set.
 */
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

const MAX_TAGS = 16;

export function useConveneEventTags() {
  return useQuery({
    queryKey: ['convene-distinct-tags'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('events')
        .select('tags')
        .eq('status', 'published')
        .eq('visibility', 'public')
        .not('tags', 'is', null);

      if (error || !data) return [];

      const counts = new Map<string, number>();
      for (const row of data) {
        for (const tag of row.tags ?? []) {
          if (!tag) continue;
          counts.set(tag, (counts.get(tag) ?? 0) + 1);
        }
      }

      return Array.from(counts.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, MAX_TAGS)
        .map(([tag]) => tag);
    },
    staleTime: 120_000,
  });
}
