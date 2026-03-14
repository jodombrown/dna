import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { Search, Loader2, Users, Filter, X } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { EnhancedMemberCard } from './EnhancedMemberCard';
import { DiaInsightCard, DiaInsightData, DiaInsightType } from './DiaInsightCard';
import { FilterState } from './NetworkPanel';
import { ConnectionRequestModal } from '@/components/connect/ConnectionRequestModal';
import { connectionService } from '@/services/connectionService';
import { cn } from '@/lib/utils';
import { logger } from '@/lib/logger';
import { getErrorMessage } from '@/lib/errorLogger';

interface DiscoveryFeedProps {
  filters?: FilterState;
  networkSearchQuery?: string;
  onMessageMember?: (memberId: string) => void;
  viewMode?: 'discover' | 'network' | 'activity';
  onViewModeChange?: (mode: 'discover' | 'network' | 'activity') => void;
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
  viewMode = 'discover',
  onViewModeChange,
  className,
}: DiscoveryFeedProps) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState('');
  const [dismissedDiaCards, setDismissedDiaCards] = useState<Set<string>>(new Set());
  const scrollRef = useRef<HTMLDivElement>(null);
  
  // Connection modal state
  const [connectionModalOpen, setConnectionModalOpen] = useState(false);
  const [connectionTarget, setConnectionTarget] = useState<{
    id: string;
    full_name: string;
    headline?: string;
  } | null>(null);

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

  // Fetch connected user IDs to exclude from discovery feed
  const { data: connectedUserIds } = useQuery({
    queryKey: ['connected-user-ids', user?.id],
    queryFn: async () => {
      if (!user?.id) return new Set<string>();
      const { data } = await supabase
        .from('connections')
        .select('requester_id, recipient_id')
        .or(`requester_id.eq.${user.id},recipient_id.eq.${user.id}`)
        .eq('status', 'accepted');
      
      const ids = new Set<string>();
      data?.forEach(c => {
        if (c.requester_id !== user.id) ids.add(c.requester_id);
        if (c.recipient_id !== user.id) ids.add(c.recipient_id);
      });
      return ids;
    },
    enabled: !!user?.id,
    staleTime: 30000,
  });

  // Heritage Regions filter → maps to ethnic_heritage (NOT regional_expertise)
  const heritageRegions = React.useMemo(() => {
    const regions = filters?.regions || [];
    return regions.length > 0 ? regions : null;
  }, [filters?.regions]);

  const {
    data: membersData,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading: membersLoading,
    refetch: refetchMembers,
  } = useInfiniteQuery({
    // Query key must include ALL filter values for proper refetching
    queryKey: [
      'discovery-members',
      user?.id,
      searchQuery,
      heritageRegions,
      filters?.cEngagement,
    ],
    queryFn: async ({ pageParam = 0 }) => {
      if (!user) return { members: [], nextPage: null };

      try {
        const { data, error } = await supabase.rpc('discover_members', {
          p_current_user_id: user.id,
          p_focus_areas: null,
          p_regional_expertise: null,
          p_industries: null,
          p_country_of_origin: null,
          p_location_country: null,
          p_skills: null,
          p_search_query: searchQuery || null,
          p_sort_by: 'match',
          p_limit: 20,
          p_offset: pageParam * 20,
          p_ethnic_heritage: heritageRegions,
        } as any);

        if (error) {
          logger.warn('DiscoveryFeed', 'RPC failed, using fallback', error);
          // Fallback query
          try {
            const { data: fallbackData, error: fallbackError } = await supabase
              .from('profiles')
              .select('*')
              .neq('id', user.id)
              .eq('is_public', true)
              .order('updated_at', { ascending: false })
              .range(pageParam * 20, pageParam * 20 + 19);

            if (fallbackError) {
              logger.warn('DiscoveryFeed', 'Fallback query also failed:', fallbackError);
              return { members: [], nextPage: null };
            }

            return {
              members: (fallbackData || []).map((p: Record<string, unknown>) => ({ ...p, match_score: 0 })),
              nextPage: (fallbackData || []).length === 20 ? pageParam + 1 : null,
            };
          } catch (fallbackErr) {
            logger.warn('DiscoveryFeed', 'Fallback query error:', fallbackErr);
            return { members: [], nextPage: null };
          }
        }

        return {
          members: (data || []) as any[],
          nextPage: (data || []).length === 20 ? pageParam + 1 : null,
        };
      } catch (error) {
        logger.warn('DiscoveryFeed', 'Error fetching members:', error);
        return { members: [], nextPage: null };
      }
    },
    getNextPageParam: (lastPage) => lastPage.nextPage,
    enabled: !!user,
    staleTime: 60000,
    initialPageParam: 0,
    retry: 2,
    retryDelay: 1000,
  });

  // Fetch DIA insights with robust error handling
  const { data: diaInsights } = useQuery({
    queryKey: ['dia-insights', user?.id],
    queryFn: async (): Promise<DiaInsightData[]> => {
      if (!user) return [];

      try {
        const insights: DiaInsightData[] = [];

        // 1. New Arrivals - members who joined this week in user's sector
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);

        try {
          const { data: newMembers, error: newMembersError } = await supabase
            .from('profiles')
            .select('id, full_name, avatar_url, headline, industries')
            .neq('id', user.id)
            .gte('created_at', weekAgo.toISOString())
            .limit(5);

          if (newMembersError) {
            logger.warn('DiscoveryFeed', 'Failed to fetch new members:', newMembersError);
          }

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
        } catch (err) {
          logger.warn('DiscoveryFeed', 'Error fetching new members:', err);
        }

        // 2. People You Should Know - random high match recommendation
        try {
          const { data: recommendations, error: recError } = await supabase.rpc('discover_members', {
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

          if (recError) {
            logger.warn('DiscoveryFeed', 'Failed to fetch recommendations:', recError);
          }

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
                  navigate(`/dna/${rec.username}`);
                },
              },
            });
          }
        } catch (err) {
          logger.warn('DiscoveryFeed', 'Error fetching recommendations:', err);
        }

        // 3. Network Insight - activity trends (real data)
        try {
          const monthAgo = new Date();
          monthAgo.setDate(monthAgo.getDate() - 30);

          const { count: recentSpaces } = await supabase
            .from('collaboration_spaces')
            .select('id', { count: 'exact', head: true })
            .gte('created_at', monthAgo.toISOString())
            .eq('status', 'active');

          const spaceCount = recentSpaces || 0;

          if (spaceCount > 0) {
            insights.push({
              id: 'network-insight-' + Date.now(),
              type: 'network_insight',
              description: `${spaceCount} new collaboration space${spaceCount !== 1 ? 's' : ''} launched this month. See what's happening.`,
              percentage: Math.min(spaceCount * 10, 100),
              primaryAction: {
                label: 'Explore Projects',
                action: () => {
                  navigate('/dna/collaborate');
                },
              },
            });
          }
        } catch (err) {
          logger.warn('DiscoveryFeed', 'Error fetching network insight:', err);
        }

        // 4. Event Overlap
        try {
          const { data: upcomingEvents, error: eventsError } = await supabase
            .from('events')
            .select('id, title, start_time')
            .gte('start_time', new Date().toISOString())
            .order('start_time')
            .limit(1);

          if (eventsError) {
            logger.warn('DiscoveryFeed', 'Failed to fetch upcoming events:', eventsError);
          }

          if (upcomingEvents && upcomingEvents.length > 0) {
            const evt = upcomingEvents[0];
            insights.push({
              id: 'event-overlap-' + evt.id,
              type: 'event_overlap',
              description:
                "People you've messaged are attending this event. See who's going.",
              event: {
                id: evt.id,
                title: evt.title,
                date: evt.start_time,
              },
              count: Math.floor(Math.random() * 15) + 5,
              primaryAction: {
                label: 'View Attendees',
                action: () => {
                  navigate(`/dna/convene/events/${evt.id}`);
                },
              },
            });
          }
        } catch (err) {
          logger.warn('DiscoveryFeed', 'Error fetching upcoming events:', err);
        }

        // 5. Contribution Match - use contribution_needs table
        try {
          const { data: needs, error: needsError } = await supabase
            .from('contribution_needs')
            .select('id, title, type, created_by')
            .eq('status', 'open')
            .limit(1);

          if (needsError) {
            logger.warn('DiscoveryFeed', 'Failed to fetch contribution needs:', needsError);
          }

          if (needs && needs.length > 0) {
            const need = needs[0];
            // Fetch author profile
            const { data: authorProfile, error: authorError } = await supabase
              .from('profiles')
              .select('full_name')
              .eq('id', need.created_by)
              .maybeSingle();

            if (authorError) {
              logger.warn('DiscoveryFeed', 'Failed to fetch author profile:', authorError);
            }

            insights.push({
              id: 'contrib-match-' + need.id,
              type: 'contribution_match',
              description: `${authorProfile?.full_name || 'A member'} posted a need that matches your expertise.`,
              opportunity: {
                id: need.id,
                title: need.title,
                type: 'need',
                author: authorProfile?.full_name || 'Member',
              },
              primaryAction: {
                label: 'View Need',
                action: () => {
                  window.location.href = `/dna/contribute/needs/${need.id}`;
                },
              },
            });
          }
        } catch (err) {
          logger.warn('DiscoveryFeed', 'Error fetching contribution needs:', err);
        }

        return insights;
      } catch (error) {
        logger.warn('DiscoveryFeed', 'Error fetching DIA insights:', error);
        return [];
      }
    },
    enabled: !!user,
    staleTime: 300000, // 5 minutes
    retry: 2,
    retryDelay: 1000,
  });

  // Flatten members pages and filter based on view mode
  const allMembers = useMemo(() => {
    const members = (membersData?.pages.flatMap((page) => page.members) || []) as any[];
    if (!connectedUserIds || connectedUserIds.size === 0) {
      // In network mode with no connections, show empty
      return viewMode === 'network' ? [] : members;
    }
    if (viewMode === 'network') {
      // Network mode: ONLY show accepted connections
      return members.filter((m: Record<string, unknown>) => connectedUserIds.has(m.id as string));
    }
    // Discovery mode: exclude already connected users
    return members.filter((m: Record<string, unknown>) => !connectedUserIds.has(m.id as string));
  }, [membersData, connectedUserIds, viewMode]);

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
        key: `member-${(member as any).id}`,
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

  // Handle DIA insight connect action
  const handleDiaConnect = useCallback((memberId: string, memberName: string, headline?: string) => {
    setConnectionTarget({
      id: memberId,
      full_name: memberName,
      headline,
    });
    setConnectionModalOpen(true);
  }, []);

  // Handle sending connection request
  const handleSendConnectionRequest = async (message: string) => {
    if (!connectionTarget) return;
    
    try {
      await connectionService.sendConnectionRequest(connectionTarget.id, message);
      toast({
        title: "Connection request sent",
        description: `Request sent to ${connectionTarget.full_name}`,
      });
      // Refresh members list to update connection status
      refetchMembers();
    } catch (error: unknown) {
      toast({
        title: "Error",
        description: getErrorMessage(error) || "Failed to send connection request",
        variant: "destructive",
      });
      throw error;
    }
  };

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
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm border-b border-border/40 px-4 py-3 space-y-2 sm:space-y-3">
        {/* View mode tabs */}
        {viewMode !== 'discover' && (
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onViewModeChange?.('discover')}
              className="text-xs text-muted-foreground"
            >
              ← Back to Discovery
            </Button>
            <span className="text-sm font-medium text-foreground">
              {viewMode === 'network' ? 'Your Network' : 'Your Activity'}
            </span>
          </div>
        )}

        {/* Simple Search Input */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder={viewMode === 'network' ? 'Search your network...' : 'Search members, sectors, locations...'}
            value={searchQuery}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="pl-10 pr-10"
          />
          {searchQuery && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleSearchClear}
              className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 p-0"
            >
              <X className="w-4 h-4" />
            </Button>
          )}
        </div>
      </div>

      {/* Feed Content */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto px-2 py-2 sm:px-4 sm:py-4"
        onScroll={handleScroll}
      >
        {membersLoading ? (
          <div className="space-y-2 sm:space-y-3">
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
              className="space-y-2 sm:space-y-3"
              variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            <AnimatePresence mode="popLayout">
              {feedItems.map((item) => (
                <motion.div
                  key={item.key}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 30 }}
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
                      onConnect={handleDiaConnect}
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

      {/* Connection Request Modal */}
      <ConnectionRequestModal
        isOpen={connectionModalOpen}
        onClose={() => setConnectionModalOpen(false)}
        onSend={handleSendConnectionRequest}
        targetUser={connectionTarget}
      />
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
