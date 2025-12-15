import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { DiscoverFilters } from '@/components/connect/DiscoverFilters';
import { MemberCard } from '@/components/connect/MemberCard';
import { Loader2, Users } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useAnalytics } from '@/hooks/useAnalytics';
import { ProfileCompletionNudge } from '@/components/profile/ProfileCompletionNudge';

export default function Discover() {
  const { user } = useAuth();
  const [members, setMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<any>({});
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const { trackEvent } = useAnalytics();

  useEffect(() => {
    if (user) {
      setPage(0);
      setMembers([]);
      loadMembers(true);
    }
  }, [user, filters, searchQuery]);

  const loadMembers = async (reset = false) => {
    if (!user) return;
    try {
      setLoading(true);
      const offset = reset ? 0 : page * 20;

      // Primary: call RPC for smart discovery
      const { data, error } = await supabase.rpc('discover_members', {
        p_current_user_id: user.id,
        p_focus_areas: filters.focus_areas || null,
        p_regional_expertise: filters.regional_expertise || null,
        p_industries: filters.industries || null,
        p_country_of_origin: filters.country_of_origin || null,
        p_location_country: filters.current_country || null,
        p_skills: filters.skills || null,
        p_search_query: searchQuery || null,
        p_sort_by: 'match',
        p_limit: 20,
        p_offset: offset,
      });

      let rows = data as any[] | null;

      if (error) {
        console.error('Error loading members via RPC discover_members:', error);

        // Hotfix fallback: simple profiles query so the page still works
        let q = supabase
          .from('profiles')
          .select('id, full_name, username, avatar_url, headline, profession, location, country_of_origin, current_country, focus_areas, industries, skills, languages, available_for, diaspora_status, regional_expertise, is_mentor, is_investor, updated_at')
          .neq('id', user.id)
          .eq('is_public', true);

        // Apply filters (best-effort)
        if (filters?.focus_areas?.length) q = q.overlaps('focus_areas', filters.focus_areas);
        if (filters?.regional_expertise?.length) q = q.overlaps('regional_expertise', filters.regional_expertise);
        if (filters?.industries?.length) q = q.overlaps('industries', filters.industries);
        if (filters?.skills?.length) q = q.overlaps('skills', filters.skills);
        if (filters?.country_of_origin) q = q.ilike('country_of_origin', `%${filters.country_of_origin}%`);
        if (filters?.current_country) q = q.ilike('current_country', `%${filters.current_country}%`);
        if (searchQuery) {
          q = q.or(
            `full_name.ilike.%${searchQuery}%,headline.ilike.%${searchQuery}%,bio.ilike.%${searchQuery}%`
          );
        }

        q = q.order('updated_at', { ascending: false }).range(offset, offset + 19);

        const { data: fbData, error: fbError } = await q;
        if (fbError) {
          console.error('Fallback profiles query failed:', fbError);
          rows = [];
        } else {
          // Map to expected shape with a default match_score
          rows = (fbData || []).map((p: any) => ({ ...p, match_score: 0 }));
        }
      }

      if (reset) {
        setMembers(rows || []);
      } else {
        setMembers(prev => [...prev, ...(rows || [])]);
      }
      setHasMore((rows || []).length === 20);
    } finally {
      setLoading(false);
    }
  };

  const handleLoadMore = () => {
    setPage(prev => prev + 1);
    loadMembers(false);
  };

  if (!user) return null;

  return (
    <div className="space-y-6">
      {/* Profile Completion Nudge */}
      <ProfileCompletionNudge variant="compact" threshold={40} showMissingFields={true} />

      {/* Search Input */}
      <div>
        <input
          type="text"
          placeholder="Search by name, headline, or bio..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full px-4 py-2 border rounded-md"
        />
      </div>

      <DiscoverFilters 
        filters={filters} 
        onFilterChange={(f) => { 
          setFilters(f); 
          trackEvent('connect_discovery_filter_applied', { filters: f }); 
        }} 
        onClearFilters={() => setFilters({})} 
      />
      
      {loading && members.length === 0 ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      ) : members.length === 0 ? (
        <Alert>
          <Users className="h-4 w-4" />
          <AlertDescription>No members found. Try adjusting your filters.</AlertDescription>
        </Alert>
      ) : (
        <>
          <div className="grid gap-4">
            {members.map(m => (
              <MemberCard 
                key={m.id} 
                member={m} 
                onConnectionSent={() => loadMembers(true)} 
              />
            ))}
          </div>
          
          {hasMore && (
            <div className="flex justify-center pt-6">
              <button
                onClick={handleLoadMore}
                disabled={loading}
                className="px-6 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 disabled:opacity-50"
              >
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Load More'}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
