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
 * Hook to fetch user connections for @mention autocomplete
 * Returns suggestions based on username/name search query
 */
export const useMentionAutocomplete = (query: string, enabled: boolean = true) => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['mention-autocomplete', user?.id, query],
    queryFn: async () => {
      if (!user || !query) return [];

      // Fetch user's connections that match the query
      const { data, error } = await supabase
        .from('connections')
        .select(`
          requester:profiles!connections_requester_id_fkey(id, username, full_name, avatar_url, headline),
          recipient:profiles!connections_recipient_id_fkey(id, username, full_name, avatar_url, headline)
        `)
        .eq('status', 'accepted')
        .or(`requester_id.eq.${user.id},recipient_id.eq.${user.id}`)
        .limit(10);

      if (error) {
        console.error('Error fetching mention suggestions:', error);
        return [];
      }

      // Flatten connections into a single array of profiles
      const profiles: MentionSuggestion[] = [];
      const searchLower = query.toLowerCase();

      data?.forEach((connection: any) => {
        const requester = connection.requester;
        const recipient = connection.recipient;

        // Add the other person in the connection (not the current user)
        const otherProfile = requester.id === user.id ? recipient : requester;

        // Filter by username or full name match
        if (
          otherProfile.username?.toLowerCase().includes(searchLower) ||
          otherProfile.full_name?.toLowerCase().includes(searchLower)
        ) {
          // Avoid duplicates
          if (!profiles.find(p => p.id === otherProfile.id)) {
            profiles.push({
              id: otherProfile.id,
              username: otherProfile.username,
              full_name: otherProfile.full_name,
              avatar_url: otherProfile.avatar_url,
              headline: otherProfile.headline,
            });
          }
        }
      });

      // Sort by relevance: exact username match first, then alphabetical
      return profiles.sort((a, b) => {
        const aUsernameMatch = a.username?.toLowerCase().startsWith(searchLower);
        const bUsernameMatch = b.username?.toLowerCase().startsWith(searchLower);

        if (aUsernameMatch && !bUsernameMatch) return -1;
        if (!aUsernameMatch && bUsernameMatch) return 1;

        return (a.username || '').localeCompare(b.username || '');
      }).slice(0, 5); // Limit to 5 suggestions
    },
    enabled: enabled && !!user && query.length > 0,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};
