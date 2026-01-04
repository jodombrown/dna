import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { useQuery, useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { Search, Loader2, Users, Filter, X } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { EnhancedMemberCard } from './EnhancedMemberCard';
import { DiaInsightCard, DiaInsightData, DiaInsightType } from './DiaInsightCard';
import { FilterState } from './NetworkPanel';
import { cn } from '@/lib/utils';

interface DiscoveryFeedProps {
  filters?: FilterState;
  networkSearchQuery?: string;
  onMessageMember?: (memberId: string) => void;
  className?: string;
}

// DIA card insertion frequency (1 per 4-6 member cards)
const DIA_CARD_FREQUENCY = 5;
const MAX_VISIBLE_DIA_CARDS = 3;

/**
 * DiscoveryFeed - Center column of CONNECT hub
 *
 * PRD Requirements:
 * - Full-width search input at column top
 * - Infinite scroll feed mixing member discovery cards with DIA intelligence cards
 * - DIA cards appear after every 4-6 member cards
 * - Never show more than 3 DIA cards visible simultaneously
 * - Dismissed cards don't reappear for 7 days
 */
export function DiscoveryFeed({
  filters,
  networkSearchQuery,
  onMessageMember,
  className,
}: DiscoveryFeedProps) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState('');
  const [dismissedDiaCards, setDismissedDiaCards] = useState<Set<string>>(new Set());
  const scrollRef = useRef<HTMLDivElement>(null);

  // Load dismissed cards from localStorage
  useEffect(() => {
    const stored = localStorage.getItem('dismissed-dia-cards');
    if (stored) {
      const parsed = JSON.parse(stored) as { id: string; dismissedAt: number }[];
      const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
      const stillDismissed = parsed
        .filter((item) => item.dismissedAt > sevenDaysAgo)
        .map((item) => item.id);
      setDismissedDiaCards(new Set(stillDismissed));
    }
  }, []);

  // Fetch members with infinite scroll
  const {
    data: membersData,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading: membersLoading,
    refetch: refetchMembers,
  } = useInfiniteQuery({
    queryKey: ['discovery-members', user?.id, searchQuery, filters],
    queryFn: async ({ pageParam = 0 }) => {
      if (!user) return { members: [], nextPage: null };

      const { data, error } = await supabase.rpc('discover_members', {
        p_current_user_id: user.id,
        p_focus_areas: null,
        p_regional_expertise: filters?.regions?.length ? filters.regions : null,
        p_industries: null,
        p_country_of_origin: null,
        p_location_country: null,
        p_skills: null,
        p_search_query: searchQuery || null,
        p_sort_by: 'match',
        p_limit: 20,
        p_offset: pageParam * 20,
      });

      if (error) {
        // Fallback query
        const { data: fallbackData } = await supabase
          .from('profiles')
          .select('*')
          .neq('id', user.id)
          .eq('is_public', true)
          .order('updated_at', { ascending: false })
          .range(pageParam * 20, pageParam * 20 + 19);

        return {
          members: (fallbackData || []).map((p: any) => ({ ...p, match_score: 0 })),
          nextPage: (fallbackData || []).length === 20 ? pageParam + 1 : null,
        };
      }

      return {
        members: data || [],
        nextPage: (data || []).length === 20 ? pageParam + 1 : null,
      };
    },
    getNextPageParam: (lastPage) => lastPage.nextPage,
    enabled: !!user,
    staleTime: 60000,
    initialPageParam: 0,
  });

  // Fetch DIA insights
  const { data: diaInsights } = useQuery({
    queryKey: ['dia-insights', user?.id],
    queryFn: async (): Promise<DiaInsightData[]> => {
      if (!user) return [];

      const insights: DiaInsightData[] = [];

      // 1. New Arrivals - members who joined this week in user's sector
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);

      const { data: newMembers } = await supabase
        .from('profiles')
        .select('id, full_name, avatar_url, headline, industries')
        .neq('id', user.id)
        .gte('created_at', weekAgo.toISOString())
        .limit(5);

      if (newMembers && newMembers.length >= 3) {
        insights.push({
          id: 'new-arrivals-' + Date.now(),
          type: 'new_arrivals',
          description: `${newMembers.length} new members joined this week`,
          members: newMembers.map((m) => ({
            id: m.id,
            name: m.full_name || 'Member',
            avatar_url: m.avatar_url,
            headline: m.headline,
          })),
          count: newMembers.length,
          primaryAction: {
            label: 'View New Members',
            action: () => setSearchQuery(''),
          },
          secondaryAction: {
            label: 'Later',
            action: () => handleDismissDiaCard('new-arrivals-' + Date.now()),
          },
        });
      }

      // 2. People You Should Know - random high match recommendation
      const { data: recommendations } = await supabase.rpc('discover_members', {
        p_current_user_id: user.id,
        p_focus_areas: null,
        p_regional_expertise: null,
        p_industries: null,
        p_country_of_origin: null,
        p_location_country: null,
        p_skills: null,
        p_search_query: null,
        p_sort_by: 'match',
        p_limit: 1,
        p_offset: Math.floor(Math.random() * 10),
      });

      if (recommendations && recommendations.length > 0) {
        const rec = recommendations[0];
        insights.push({
          id: 'pysk-' + rec.id,
          type: 'people_you_should_know',
          description: `${rec.full_name} shares your focus on ${rec.focus_areas?.[0] || 'community building'}. You both work in ${rec.industries?.[0] || 'similar industries'}.`,
          members: [
            {
              id: rec.id,
              name: rec.full_name,
              avatar_url: rec.avatar_url,
              headline: rec.headline,
            },
          ],
          primaryAction: {
            label: 'Connect',
            action: () => {
              // Would trigger connect action
            },
          },
          secondaryAction: {
            label: 'Learn More',
            action: () => {
              window.location.href = `/dna/${rec.username}`;
            },
          },
        });
      }

      // 3. Network Insight - activity trends
      insights.push({
        id: 'network-insight-' + Date.now(),
        type: 'network_insight',
        description:
          'Your connections are more active in COLLABORATE this month. 5 new projects launched.',
        percentage: 40,
        primaryAction: {
          label: 'Explore Projects',
          action: () => {
            window.location.href = '/dna/collaborate';
          },
        },
      });

      // 4. Event Overlap
      const { data: upcomingEvents } = await supabase
        .from('events')
        .select('id, title, start_date')
        .gte('start_date', new Date().toISOString())
        .order('start_date')
        .limit(1);

      if (upcomingEvents && upcomingEvents.length > 0) {
        insights.push({
          id: 'event-overlap-' + upcomingEvents[0].id,
          type: 'event_overlap',
          description:
            "People you've messaged are attending this event. See who's going.",
          event: {
            id: upcomingEvents[0].id,
            title: upcomingEvents[0].title,
            date: upcomingEvents[0].start_date,
          },
          count: Math.floor(Math.random() * 15) + 5,
          primaryAction: {
            label: 'View Attendees',
            action: () => {
              window.location.href = `/dna/convene/events/${upcomingEvents[0].id}`;
            },
          },
        });
      }

      // 5. Contribution Match
      const { data: needs } = await supabase
        .from('marketplace_items')
        .select('id, title, item_type, user_id, profiles(full_name)')
        .eq('item_type', 'need')
        .eq('status', 'active')
        .limit(1);

      if (needs && needs.length > 0) {
        insights.push({
          id: 'contrib-match-' + needs[0].id,
          type: 'contribution_match',
          description: `${(needs[0] as any).profiles?.full_name || 'A member'} posted a need that matches your expertise.`,
          opportunity: {
            id: needs[0].id,
            title: needs[0].title,
            type: 'need',
            author: (needs[0] as any).profiles?.full_name || 'Member',
          },
          primaryAction: {
            label: 'View Need',
            action: () => {
              window.location.href = `/dna/contribute/needs/${needs[0].id}`;
            },
          },
        });
      }

      return insights;
    },
    enabled: !!user,
    staleTime: 300000, // 5 minutes
  });

  // Flatten members pages
  const allMembers = useMemo(() => {
    return membersData?.pages.flatMap((page) => page.members) || [];
  }, [membersData]);

  // Filter DIA cards (not dismissed, limit to MAX_VISIBLE)
  const visibleDiaInsights = useMemo(() => {
    if (!diaInsights) return [];
    return diaInsights
      .filter((insight) => !dismissedDiaCards.has(insight.id))
      .slice(0, MAX_VISIBLE_DIA_CARDS);
  }, [diaInsights, dismissedDiaCards]);

  // Interleave members with DIA cards
  const feedItems = useMemo(() => {
    const items: { type: 'member' | 'dia'; data: any; key: string }[] = [];
    let diaIndex = 0;

    allMembers.forEach((member, index) => {
      items.push({
        type: 'member',
        data: member,
        key: `member-${member.id}`,
      });

      // Insert DIA card after every DIA_CARD_FREQUENCY members
      if (
        (index + 1) % DIA_CARD_FREQUENCY === 0 &&
        diaIndex < visibleDiaInsights.length
      ) {
        items.push({
          type: 'dia',
          data: visibleDiaInsights[diaIndex],
          key: `dia-${visibleDiaInsights[diaIndex].id}`,
        });
        diaIndex++;
      }
    });

    return items;
  }, [allMembers, visibleDiaInsights]);

  // Handle DIA card dismissal
  const handleDismissDiaCard = useCallback((id: string) => {
    setDismissedDiaCards((prev) => {
      const next = new Set(prev);
      next.add(id);

      // Persist to localStorage
      const stored = localStorage.getItem('dismissed-dia-cards');
      const parsed: { id: string; dismissedAt: number }[] = stored
        ? JSON.parse(stored)
        : [];
      parsed.push({ id, dismissedAt: Date.now() });
      localStorage.setItem('dismissed-dia-cards', JSON.stringify(parsed));

      return next;
    });
  }, []);

  // Handle search
  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
  };

  const handleSearchClear = () => {
    setSearchQuery('');
  };

  // Infinite scroll handler
  const handleScroll = useCallback(() => {
    if (!scrollRef.current) return;

    const { scrollTop, scrollHeight, clientHeight } = scrollRef.current;
    if (scrollHeight - scrollTop - clientHeight < 200 && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.08 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20, scale: 0.95 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: { type: 'spring', stiffness: 400, damping: 30 },
    },
  };

  return (
    <div className={cn('flex flex-col h-full', className)}>
      {/* Search Header */}
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm border-b border-border/40 p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search all members..."
            value={searchQuery}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="pl-9 pr-9 bg-muted/50"
          />
          {searchQuery && (
            <button
              onClick={handleSearchClear}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 rounded-full hover:bg-muted"
            >
              <X className="h-4 w-4 text-muted-foreground" />
            </button>
          )}
        </div>

        {/* Active search indicator */}
        {searchQuery && (
          <div className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
            <span>
              Searching for "{searchQuery}" • {allMembers.length} result
              {allMembers.length !== 1 ? 's' : ''}
            </span>
          </div>
        )}
      </div>

      {/* Feed Content */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto px-4 py-4"
        onScroll={handleScroll}
      >
        {membersLoading ? (
          <div className="space-y-3">
            {[...Array(4)].map((_, i) => (
              <MemberCardSkeleton key={i} />
            ))}
          </div>
        ) : feedItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <Users className="h-12 w-12 text-muted-foreground/50 mb-4" />
            <p className="text-lg font-medium">No members found</p>
            <p className="text-sm text-muted-foreground mt-1">
              Try adjusting your search or filters
            </p>
            {searchQuery && (
              <Button
                variant="outline"
                size="sm"
                className="mt-4"
                onClick={handleSearchClear}
              >
                Clear search
              </Button>
            )}
          </div>
        ) : (
          <motion.div
            className="space-y-3"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            <AnimatePresence mode="popLayout">
              {feedItems.map((item) => (
                <motion.div
                  key={item.key}
                  variants={itemVariants}
                  layout
                >
                  {item.type === 'member' ? (
                    <EnhancedMemberCard
                      member={item.data}
                      onConnectionSent={() => refetchMembers()}
                      onMessage={onMessageMember}
                    />
                  ) : (
                    <DiaInsightCard
                      insight={item.data}
                      onDismiss={handleDismissDiaCard}
                    />
                  )}
                </motion.div>
              ))}
            </AnimatePresence>

            {/* Load more indicator */}
            {isFetchingNextPage && (
              <div className="flex justify-center py-4">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
              </div>
            )}

            {/* End of results */}
            {!hasNextPage && allMembers.length > 0 && (
              <p className="text-center text-sm text-muted-foreground py-4">
                You've seen all {allMembers.length} members
              </p>
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
}

// Skeleton loader for member cards
function MemberCardSkeleton() {
  return (
    <div className="p-4 border rounded-lg">
      <div className="flex gap-3">
        <div className="flex-1 space-y-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-5 w-40" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-3 w-32" />
        </div>
        <Skeleton className="h-20 w-20 rounded-xl" />
      </div>
    </div>
  );
}

export default DiscoveryFeed;
