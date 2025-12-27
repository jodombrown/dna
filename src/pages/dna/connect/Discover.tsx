import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { MemberCard } from '@/components/connect/MemberCard';
import { DiscoverSearchHeader } from '@/components/connect/DiscoverSearchHeader';
import { DiscoverFilterPills } from '@/components/connect/DiscoverFilterPills';
import { DiscoverFilterSheet } from '@/components/connect/DiscoverFilterSheet';
import { MemberCardSkeletonGrid } from '@/components/connect/MemberCardSkeleton';
import { Loader2, Users } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useAnalytics } from '@/hooks/useAnalytics';
import { ProfileCompletionNudge } from '@/components/profile/ProfileCompletionNudge';

interface FilterState {
  country_of_origin?: string;
  current_country?: string;
  focus_areas?: string[];
  regional_expertise?: string[];
  industries?: string[];
  skills?: string[];
}

// Animation variants for staggered cards
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
    },
  },
};

const cardVariants = {
  hidden: {
    opacity: 0,
    y: 20,
    scale: 0.95,
  },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      type: 'spring' as const,
      stiffness: 400,
      damping: 30,
    },
  },
};

export default function Discover() {
  const { user } = useAuth();
  const [members, setMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<FilterState>({});
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [isFilterSheetOpen, setIsFilterSheetOpen] = useState(false);
  const { trackEvent } = useAnalytics();

  // Check for reduced motion preference
  const prefersReducedMotion =
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Count active filters
  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (filters.country_of_origin) count++;
    if (filters.current_country) count++;
    if (filters.focus_areas?.length) count += filters.focus_areas.length;
    if (filters.regional_expertise?.length) count += filters.regional_expertise.length;
    if (filters.industries?.length) count += filters.industries.length;
    if (filters.skills?.length) count += filters.skills.length;
    return count;
  }, [filters]);

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

  const handleFilterChange = (newFilters: FilterState) => {
    setFilters(newFilters);
    trackEvent('connect_discovery_filter_applied', { filters: newFilters });
  };

  const handleClearFilters = () => {
    setFilters({});
  };

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
  };

  const handleSearchClear = () => {
    setSearchQuery('');
  };

  if (!user) return null;

  return (
    <div className="space-y-4">
      {/* Profile Completion Nudge */}
      <ProfileCompletionNudge variant="compact" threshold={40} showMissingFields={true} />

      {/* iOS-Style Sticky Search Header */}
      <DiscoverSearchHeader
        value={searchQuery}
        onChange={handleSearchChange}
        onClear={handleSearchClear}
        isLoading={loading && members.length > 0}
      />

      {/* Horizontal Filter Pills */}
      <DiscoverFilterPills
        filters={filters}
        onOpenSheet={() => setIsFilterSheetOpen(true)}
        activeCount={activeFilterCount}
      />

      {/* Filter Bottom Sheet */}
      <DiscoverFilterSheet
        open={isFilterSheetOpen}
        onOpenChange={setIsFilterSheetOpen}
        filters={filters}
        onApply={handleFilterChange}
        onClear={handleClearFilters}
      />

      {/* Content */}
      {loading && members.length === 0 ? (
        <MemberCardSkeletonGrid count={4} />
      ) : members.length === 0 ? (
        <Alert>
          <Users className="h-4 w-4" />
          <AlertDescription>No members found. Try adjusting your filters.</AlertDescription>
        </Alert>
      ) : (
        <>
          <motion.div
            className="grid gap-3 px-1"
            variants={prefersReducedMotion ? undefined : containerVariants}
            initial="hidden"
            animate="visible"
            key={`${searchQuery}-${JSON.stringify(filters)}`}
          >
            <AnimatePresence mode="popLayout">
              {members.map((m, index) => (
                <motion.div
                  key={m.id}
                  variants={prefersReducedMotion ? undefined : cardVariants}
                  layout
                >
                  <MemberCard
                    member={m}
                    onConnectionSent={() => loadMembers(true)}
                  />
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>

          {hasMore && (
            <div className="flex justify-center pt-4 pb-2">
              <button
                onClick={handleLoadMore}
                disabled={loading}
                className="px-6 py-2.5 bg-primary text-primary-foreground rounded-full text-sm font-medium hover:bg-primary/90 disabled:opacity-50 transition-all active:scale-95"
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
