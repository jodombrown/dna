import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface MentionSuggestion {
  id: string;
  username: string;
  full_name: string;
  avatar_url: string | null;
  headline: string | null;
}

/**
 * Hook to fetch ALL platform users for @mention autocomplete
 * Returns suggestions based on username/name search query
 */
export const useMentionAutocomplete = (query: string, enabled: boolean = true) => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['mention-autocomplete', query],
    queryFn: async () => {
      if (!query || query.length < 1) return [];

      // Search all platform users (not just connections)
      const searchLower = query.toLowerCase();
      
      const { data, error } = await supabase
        .from('profiles')
        .select('id, username, full_name, avatar_url, headline')
        .or(`username.ilike.%${searchLower}%,full_name.ilike.%${searchLower}%`)
        .neq('id', user?.id || '') // Exclude current user
        .limit(10);

      if (error) {
        return [];
      }

      // Map to MentionSuggestion format
      const profiles: MentionSuggestion[] = (data || []).map((profile: any) => ({
        id: profile.id,
        username: profile.username || '',
        full_name: profile.full_name || '',
        avatar_url: profile.avatar_url,
        headline: profile.headline,
      }));

      // Sort by relevance: exact username match first, starts with match second, then alphabetical
      return profiles.sort((a, b) => {
        const aExact = a.username?.toLowerCase() === searchLower;
        const bExact = b.username?.toLowerCase() === searchLower;
        if (aExact && !bExact) return -1;
        if (!aExact && bExact) return 1;

        const aStartsWith = a.username?.toLowerCase().startsWith(searchLower);
        const bStartsWith = b.username?.toLowerCase().startsWith(searchLower);
        if (aStartsWith && !bStartsWith) return -1;
        if (!aStartsWith && bStartsWith) return 1;

        return (a.username || '').localeCompare(b.username || '');
      }).slice(0, 5); // Limit to 5 suggestions
    },
    enabled: enabled && query.length > 0,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};
