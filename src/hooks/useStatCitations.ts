import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface StatCitation {
  id: string;
  key: string;
  display_value: string;
  label: string;
  description: string;
  source_name: string;
  source_url: string | null;
  year: number | null;
  methodology: string | null;
  definition: string | null;
  sort_order: number;
  is_active: boolean;
  updated_at: string;
  scope_population: string | null;
  scope_geography: string;
  scope_period: string | null;
}

/**
 * Fallback data passed as `placeholderData`, so it renders on the FIRST PAINT
 * of every visit, before the query resolves, not only if the request fails or
 * the table is empty. Because it bypasses the database entirely, it also
 * bypasses the NOT NULL constraint on scope_geography; the values below must be
 * kept in sync with the live rows. Mirrors the seeded rows so the homepage
 * never renders blank while network / cache warms up.
 */
export const FALLBACK_STAT_CITATIONS: StatCitation[] = [
  {
    id: 'fallback-1',
    key: 'diaspora_population',
    display_value: '200M+',
    label: 'People of African Descent',
    description: 'Living outside Africa, projected to comprise 25% of global population',
    source_name: 'African Union',
    source_url: 'https://au.int/en/diaspora-division',
    year: 2024,
    methodology: null,
    definition: null,
    sort_order: 1,
    is_active: true,
    updated_at: '',
    scope_population: 'Diaspora',
    scope_geography: 'worldwide',
    scope_period: null,
  },
  {
    id: 'fallback-2',
    key: 'annual_remittances',
    display_value: '100B+',
    label: 'Annual Remittances to Africa (2024)',
    description: 'Larger than foreign direct investment and roughly double official development assistance',
    source_name: 'World Bank, via IFAD RemitSCOPE Africa',
    source_url: 'https://remitscope.org/africa/',
    year: 2024,
    methodology: null,
    definition: null,
    sort_order: 2,
    is_active: true,
    updated_at: '',
    scope_population: null,
    scope_geography: 'Africa, all countries',
    scope_period: '2024',
  },
  {
    id: 'fallback-3',
    key: 'education_rate',
    display_value: '43%',
    label: 'Highly Educated',
    description: "Hold bachelor's degree or higher, 2x the U.S. national average",
    source_name: 'Pew Research Center',
    source_url:
      'https://www.pewresearch.org/2022/01/20/a-growing-share-of-black-immigrants-have-a-college-degree-or-higher/',
    year: 2022,
    methodology: null,
    definition: null,
    sort_order: 3,
    is_active: true,
    updated_at: '',
    scope_population: 'Black immigrants ages 25 and older',
    scope_geography: 'in the United States',
    scope_period: '2022',
  },
];

export function useStatCitations() {
  return useQuery({
    queryKey: ['stat-citations', 'active'],
    queryFn: async (): Promise<StatCitation[]> => {
      const { data, error } = await supabase
        .from('stat_citations')
        .select('*')
        .eq('is_active', true)
        .order('sort_order', { ascending: true });

      if (error) throw error;
      return (data ?? []) as StatCitation[];
    },
    staleTime: 5 * 60 * 1000,
    placeholderData: FALLBACK_STAT_CITATIONS,
  });
}

/** Admin view — includes inactive rows. */
export function useAllStatCitations() {
  return useQuery({
    queryKey: ['stat-citations', 'all'],
    queryFn: async (): Promise<StatCitation[]> => {
      const { data, error } = await supabase
        .from('stat_citations')
        .select('*')
        .order('sort_order', { ascending: true });

      if (error) throw error;
      return (data ?? []) as StatCitation[];
    },
    staleTime: 30 * 1000,
  });
}
