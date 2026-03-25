// src/pages/dna/collaborate/CollaborateDiscovery.tsx
// Redesigned Collaborate hub - Project Marketplace experience

import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { FolderKanban, CheckSquare, Users } from 'lucide-react';

import { CollaborateHubHeader } from '@/components/collaborate/CollaborateHubHeader';
import { CollaborateTabBar, type CollaborateTab } from '@/components/collaborate/CollaborateTabBar';
import { CollaborateZeroState } from '@/components/collaborate/CollaborateZeroState';
import { CollaborateSpaceCard, type CollaborateSpaceCardProps } from '@/components/collaborate/CollaborateSpaceCard';
import { SpaceDiscoveryLane } from '@/components/collaborate/SpaceDiscoveryLane';
import { SpaceCreationWizard } from '@/components/collaborate/SpaceCreationWizard';
import { DIAHubSection } from '@/components/dia/DIAHubSection';
import { logger } from '@/lib/logger';

export function CollaborateDiscovery() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<CollaborateTab>('spaces');
  const [showCreateWizard, setShowCreateWizard] = useState(false);

  // Fetch user profile for skill matching
  const { data: userProfile } = useQuery({
    queryKey: ['collaborate-user-profile', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      const { data, error } = await supabase
        .from('profiles')
        .select('focus_areas, current_location')
        .eq('id', user.id)
        .single();
      if (error) {
        logger.warn('CollaborateDiscovery', 'Failed to fetch profile:', error);
        return null;
      }
      return data;
    },
    enabled: !!user?.id,
    staleTime: 120000,
  });

  const hasProfileSkills = !!(userProfile?.focus_areas && userProfile.focus_areas.length > 0);

  // Fetch all public active spaces with member data
  const { data: spacesRaw, isLoading: spacesLoading } = useQuery({
    queryKey: ['collaborate-spaces-discovery'],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from('spaces')
          .select('id, slug, name, tagline, space_type, status, visibility, focus_areas, region, created_at, updated_at, created_by')
          .eq('status', 'active')
          .eq('visibility', 'public')
          .order('updated_at', { ascending: false })
          .limit(50);

        if (error) {
          logger.warn('CollaborateDiscovery', 'Failed to fetch spaces:', error);
          return [];
        }
        return data || [];
      } catch (error) {
        logger.warn('CollaborateDiscovery', 'Error fetching spaces:', error);
        return [];
      }
    },
    staleTime: 60000,
  });

  // Fetch member counts per space
  const spaceIds = spacesRaw?.map(s => s.id) || [];
  const { data: memberData } = useQuery({
    queryKey: ['collaborate-space-members', spaceIds.join(',')],
    queryFn: async () => {
      if (spaceIds.length === 0) return {};
      const { data, error } = await supabase
        .from('space_members')
        .select('space_id, user_id, profiles:user_id(id, full_name, avatar_url)')
        .in('space_id', spaceIds);

      if (error) {
        logger.warn('CollaborateDiscovery', 'Failed to fetch members:', error);
        return {};
      }

      // Group by space
      const grouped: Record<string, { count: number; previews: { id: string; avatar_url?: string; full_name?: string }[] }> = {};
      for (const m of (data || [])) {
        if (!grouped[m.space_id]) grouped[m.space_id] = { count: 0, previews: [] };
        grouped[m.space_id].count++;
        const profile = m.profiles as unknown as { id: string; full_name: string; avatar_url: string } | null;
        if (profile && grouped[m.space_id].previews.length < 3) {
          grouped[m.space_id].previews.push({
            id: profile.id,
            avatar_url: profile.avatar_url,
            full_name: profile.full_name,
          });
        }
      }
      return grouped;
    },
    enabled: spaceIds.length > 0,
    staleTime: 60000,
  });

  // Fetch user's memberships
  const { data: myMemberships } = useQuery({
    queryKey: ['collaborate-my-memberships', user?.id],
    queryFn: async () => {
      if (!user?.id) return new Set<string>();
      const { data, error } = await supabase
        .from('space_members')
        .select('space_id')
        .eq('user_id', user.id);
      if (error) return new Set<string>();
      return new Set((data || []).map(d => d.space_id));
    },
    enabled: !!user?.id,
    staleTime: 60000,
  });

  // Transform spaces into card props
  const spaceCards: CollaborateSpaceCardProps[] = useMemo(() => {
    if (!spacesRaw) return [];
    return spacesRaw.map((space): CollaborateSpaceCardProps => {
      const members = memberData?.[space.id];
      const userAreas = new Set(userProfile?.focus_areas || []);
      const spaceAreas = new Set(space.focus_areas || []);
      const matchCount = [...userAreas].filter(a => spaceAreas.has(a)).length;
      const matchPercent = userAreas.size > 0 && spaceAreas.size > 0
        ? Math.round((matchCount / Math.max(userAreas.size, spaceAreas.size)) * 100)
        : undefined;

      return {
        id: space.id,
        slug: space.slug || space.id,
        name: space.name,
        tagline: space.tagline || undefined,
        space_type: space.space_type || 'project',
        region: space.region || undefined,
        updated_at: space.updated_at,
        focus_areas: space.focus_areas || undefined,
        members: members?.previews || [],
        memberCount: members?.count || 0,
        isMember: myMemberships?.has(space.id) || false,
        matchPercent: matchPercent && matchPercent > 0 ? matchPercent : undefined,
      };
    });
  }, [spacesRaw, memberData, userProfile, myMemberships]);

  // Organize into discovery lanes
  const matchedSpaces = useMemo(
    () => spaceCards.filter(s => s.matchPercent && s.matchPercent > 0).sort((a, b) => (b.matchPercent || 0) - (a.matchPercent || 0)),
    [spaceCards]
  );

  const trendingSpaces = useMemo(
    () => [...spaceCards].sort((a, b) => (b.memberCount || 0) - (a.memberCount || 0)).slice(0, 10),
    [spaceCards]
  );

  const justLaunched = useMemo(() => {
    const fourteenDaysAgo = Date.now() - 14 * 24 * 60 * 60 * 1000;
    return spaceCards.filter(s => {
      // Use updated_at as proxy for created_at since we have it
      return new Date(s.updated_at).getTime() > fourteenDaysAgo;
    });
  }, [spaceCards]);

  // Stats
  const spacesCount = spaceCards.length;
  const mySpacesCount = spaceCards.filter(s => s.isMember).length;
  const hasSpaces = spacesCount > 0;

  return (
    <div className="w-full min-h-dvh bg-background pb-36 md:pb-0">
      <div className="container max-w-6xl mx-auto px-3 sm:px-6 lg:px-8 py-2 lg:py-6 space-y-0">
        {/* Hub Header */}
        <CollaborateHubHeader
          matchedSpaceCount={matchedSpaces.length}
          matchedOpportunityCount={0}
          hasProfileSkills={hasProfileSkills}
          onCreateSpace={() => setShowCreateWizard(true)}
          onPostOpportunity={() => {
            // Future: navigate to opportunity creation
          }}
        />

        {/* Tab Bar */}
        <div className="mt-4">
          <CollaborateTabBar
            activeTab={activeTab}
            onTabChange={setActiveTab}
            spacesCount={spacesCount}
            opportunitiesCount={0}
          />
        </div>

        {/* Tab Content */}
        <div className="mt-4 space-y-6">
          {activeTab === 'spaces' && (
            <>
              {spacesLoading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                </div>
              ) : !hasSpaces ? (
                <CollaborateZeroState
                  onDiscoverSpaces={() => navigate('/dna/collaborate/spaces')}
                  onCreateSpace={() => setShowCreateWizard(true)}
                />
              ) : (
                <div className="space-y-6">
                  {/* Profile skills banner */}
                  {!hasProfileSkills && (
                    <div className="px-4 py-3 rounded-dna-lg bg-muted/50 text-sm text-muted-foreground">
                      Complete your profile to see matched spaces.{' '}
                      <button
                        onClick={() => navigate('/dna/profile/edit')}
                        className="text-primary font-medium hover:underline"
                      >
                        Add your skills
                      </button>
                    </div>
                  )}

                  {/* DIA Discovery */}
                  <DIAHubSection surface="collaborate_hub" limit={1} />

                  {/* Discovery Lanes */}
                  {hasProfileSkills && matchedSpaces.length > 0 && (
                    <SpaceDiscoveryLane
                      title="Matched For You"
                      spaces={matchedSpaces}
                      onSeeAll={() => navigate('/dna/collaborate/spaces?filter=matched')}
                    />
                  )}

                  {trendingSpaces.length > 0 && (
                    <SpaceDiscoveryLane
                      title="Trending This Week"
                      spaces={trendingSpaces}
                      onSeeAll={() => navigate('/dna/collaborate/spaces')}
                    />
                  )}

                  {justLaunched.length > 0 && (
                    <SpaceDiscoveryLane
                      title="Just Launched"
                      spaces={justLaunched}
                      onSeeAll={() => navigate('/dna/collaborate/spaces?sort=newest')}
                    />
                  )}
                </div>
              )}
            </>
          )}

          {activeTab === 'opportunities' && (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="w-16 h-16 rounded-full bg-[hsl(28,48%,45%)]/10 flex items-center justify-center mb-5">
                <FolderKanban className="h-8 w-8 text-[hsl(28,48%,45%)]" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">
                Opportunities Coming Soon
              </h3>
              <p className="text-sm text-muted-foreground max-w-sm">
                The marketplace for talent, funding, mentorship, and partnerships is being built. Check back soon.
              </p>
            </div>
          )}

          {activeTab === 'activity' && (
            <div className="space-y-4">
              {mySpacesCount > 0 ? (
                <div>
                  <h3 className="text-base font-semibold text-foreground mb-3">Your Spaces</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {spaceCards
                      .filter(s => s.isMember)
                      .map(space => (
                        <CollaborateSpaceCard key={space.id} {...space} />
                      ))}
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <Users className="h-10 w-10 text-muted-foreground mb-3" />
                  <h3 className="text-base font-semibold text-foreground mb-1">No activity yet</h3>
                  <p className="text-sm text-muted-foreground">
                    Join a space to start collaborating with the community.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <SpaceCreationWizard
        open={showCreateWizard}
        onOpenChange={setShowCreateWizard}
      />
    </div>
  );
}

export default CollaborateDiscovery;
