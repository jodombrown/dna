import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { DiscoverFilters } from '@/components/connect/DiscoverFilters';
import { MemberCard } from '@/components/connect/MemberCard';
import { Loader2, Users } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useAnalytics } from '@/hooks/useAnalytics';

export default function Discover() {
  const { user } = useAuth();
  const [members, setMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<any>({});
  const { trackEvent } = useAnalytics();

  useEffect(() => {
    if (user) loadMembers();
  }, [user, filters]);

  const loadMembers = async () => {
    if (!user) return;
    try {
      setLoading(true);
      const { data } = await supabase.rpc('discover_members', {
        p_current_user_id: user.id,
        p_focus_areas: filters.focus_areas || null,
        p_regional_expertise: null,
        p_industries: filters.industries || null,
        p_country_of_origin: filters.country_of_origin || null,
        p_location_country: filters.current_country || null,
        p_skills: filters.skills || null,
        p_search_query: null,
        p_sort_by: 'match',
        p_limit: 20,
        p_offset: 0,
      });
      setMembers(data || []);
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  return (
    <div className="space-y-6">
      <DiscoverFilters filters={filters} onFilterChange={(f) => { setFilters(f); trackEvent('connect_discovery_filter_applied', { filters: f }); }} onClearFilters={() => setFilters({})} />
      {loading ? <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin" /></div> : members.length === 0 ? <Alert><Users className="h-4 w-4" /><AlertDescription>No members found.</AlertDescription></Alert> : <div className="grid gap-4">{members.map(m => <MemberCard key={m.id} member={m} onConnectionSent={loadMembers} />)}</div>}
    </div>
  );
}
