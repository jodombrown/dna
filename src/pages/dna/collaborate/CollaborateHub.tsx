// COLLABORATE hub landing (Arc 3, Frame 1). One destination, three lenses on the
// shared LensBar primitive:
//
//   discover   Spaces the caller is NOT on: open, joinable work in the community.
//   mine       Spaces where the caller holds a roster seat (an active membership).
//   completed  Finished work, the proof surface: every Space that has completed.
//
// The active lens lives in the URL (?lens=<id>) and is owned by the LensBar, so
// this page reads it but never writes tab state. Query keys are shared with
// MySpaces and SpacesIndex so the cache is reused rather than duplicated.

import { useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Plus, Search, Telescope, UsersRound, BadgeCheck } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useUniversalComposer } from '@/contexts/ComposerContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { SpacesShell } from '@/components/collaborate/SpacesShell';
import { SpaceListCard, type SpaceListItem } from '@/components/collaborate/SpaceListCard';
import {
  CollaborateLensBar,
  COLLABORATE_LENSES,
  type CollaborateLensId,
} from '@/components/collaborate/CollaborateLensBar';
import { LensEmpty } from '@/components/collaborate/SpacesLensEmpty';
import { useJoinSpace } from '@/hooks/collaborate/useJoinSpace';
import type { SpaceVisibility } from '@/types/collaborate';
import { HubTabsRow } from '@/components/shell/HubTabsRow';
import { useMobile } from '@/hooks/useMobile';

interface SpaceRow {
  id: string;
  slug: string;
  name: string;
  tagline: string | null;
  space_type: string;
  status: string;
  visibility: string;
  space_members: { count: number }[] | null;
}

const SPACE_COLUMNS =
  'id, slug, name, tagline, space_type, status, visibility, space_members(count)';

// Spaces open enough to appear in Discover. Completed / paused / abandoned work
// is not joinable and does not belong in the marketplace lens; completed work
// has its own lens.
const OPEN_STATUSES = new Set(['idea', 'forming', 'active']);

function mapSpace(s: SpaceRow): SpaceListItem {
  return {
    id: s.id,
    slug: s.slug,
    name: s.name,
    tagline: s.tagline,
    space_type: s.space_type,
    status: s.status,
    visibility: s.visibility,
    memberCount: s.space_members?.[0]?.count ?? 0,
  };
}

const VALID_LENS_IDS = COLLABORATE_LENSES.map((l) => l.id);

export default function CollaborateHub() {
  const { user } = useAuth();
  const { isMobile } = useMobile();
  const joinSpace = useJoinSpace();
  const composer = useUniversalComposer();
  const [searchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState('');

  const lensParam = searchParams.get('lens');
  const activeLens: CollaborateLensId = (
    lensParam && VALID_LENS_IDS.includes(lensParam) ? lensParam : 'discover'
  ) as CollaborateLensId;

  // Spaces the caller is an active member of (shares MySpaces' cache).
  const { data: mySpaces = [], isLoading: myLoading } = useQuery({
    queryKey: ['my-spaces', 'active', user?.id],
    queryFn: async (): Promise<SpaceListItem[]> => {
      if (!user) return [];
      const { data: memberRows, error: memberErr } = await supabase
        .from('space_members')
        .select('space_id')
        .eq('user_id', user.id)
        .eq('status', 'active');
      if (memberErr) throw memberErr;
      const ids = (memberRows ?? []).map((r) => r.space_id);
      if (ids.length === 0) return [];
      const { data, error } = await supabase
        .from('spaces')
        .select(SPACE_COLUMNS)
        .in('id', ids)
        .order('last_activity_at', { ascending: false, nullsFirst: false });
      if (error) throw error;
      return (data as SpaceRow[]).map(mapSpace);
    },
    enabled: !!user,
  });

  // All spaces, for the discover shelf (shares SpacesIndex' cache).
  const { data: allSpaces = [], isLoading: discoverLoading } = useQuery({
    queryKey: ['spaces', 'index'],
    queryFn: async (): Promise<SpaceListItem[]> => {
      const { data, error } = await supabase
        .from('spaces')
        .select(SPACE_COLUMNS)
        .order('last_activity_at', { ascending: false, nullsFirst: false });
      if (error) throw error;
      return (data as SpaceRow[]).map(mapSpace);
    },
  });

  // Completed work: the proof surface. Every finished Space, community-wide,
  // newest first. Not scoped to the caller: completion is shared proof.
  const { data: completedSpaces = [], isLoading: completedLoading } = useQuery({
    queryKey: ['spaces', 'completed'],
    queryFn: async (): Promise<SpaceListItem[]> => {
      const { data, error } = await supabase
        .from('spaces')
        .select(SPACE_COLUMNS)
        .eq('status', 'completed')
        .order('last_activity_at', { ascending: false, nullsFirst: false });
      if (error) throw error;
      return (data as SpaceRow[]).map(mapSpace);
    },
  });

  // Which spaces the caller already belongs to (and whether still pending).
  const { data: memberships } = useQuery({
    queryKey: ['my-spaces', 'membership-map', user?.id],
    queryFn: async () => {
      if (!user) return {} as Record<string, string>;
      const { data, error } = await supabase
        .from('space_members')
        .select('space_id, status')
        .eq('user_id', user.id);
      if (error) throw error;
      const map: Record<string, string> = {};
      for (const row of data ?? []) map[row.space_id] = row.status ?? 'active';
      return map;
    },
    enabled: !!user,
  });

  const membershipMap = useMemo(() => memberships ?? {}, [memberships]);

  // Client-side search filter shared by every lens.
  const matchesQuery = (s: SpaceListItem) => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return true;
    return (
      s.name.toLowerCase().includes(q) ||
      (s.tagline?.toLowerCase().includes(q) ?? false)
    );
  };

  // Discover: community/public spaces the caller has not joined, still open.
  const discover = useMemo(
    () =>
      allSpaces.filter(
        (s) =>
          !membershipMap[s.id] &&
          (s.visibility === 'public' || s.visibility === 'community') &&
          OPEN_STATUSES.has(s.status) &&
          matchesQuery(s),
      ),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [allSpaces, membershipMap, searchQuery],
  );

  const mine = useMemo(
    () => mySpaces.filter(matchesQuery),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [mySpaces, searchQuery],
  );

  const completed = useMemo(
    () => completedSpaces.filter(matchesQuery),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [completedSpaces, searchQuery],
  );

  const loadingByLens: Record<CollaborateLensId, boolean> = {
    discover: discoverLoading,
    mine: myLoading,
    completed: completedLoading,
  };

  function renderLensBody() {
    const isLoading = loadingByLens[activeLens];
    if (isLoading) {
      return (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-28 w-full rounded-xl" />
          ))}
        </div>
      );
    }

    if (activeLens === 'discover') {
      const searchField = (
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" aria-hidden="true" />
          <Input
            placeholder="Search Spaces"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      );

      if (discover.length === 0) {
        return (
          <div className="space-y-4">
            {searchField}
            <LensEmpty
              icon={Telescope}
              title="No open Spaces to join right now"
              body="When a member opens a Space to the community, it lands here for you to join. Until then, the first move is yours."
              action={
                <Button onClick={() => composer.open('space')}>
                  <Plus className="mr-1.5 h-4 w-4" aria-hidden="true" />
                  Start a Space
                </Button>
              }
            />
          </div>
        );
      }
      return (
        <div className="space-y-4">
          {searchField}
          <div className="space-y-3">
            {discover.map((space) => (
              <SpaceListCard
                key={space.id}
                space={space}
                isMember={!!membershipMap[space.id]}
                isPending={membershipMap[space.id] === 'invited'}
                isJoining={joinSpace.isPending && joinSpace.variables?.spaceId === space.id}
                onJoin={(s) =>
                  joinSpace.mutate({
                    spaceId: s.id,
                    visibility: s.visibility as SpaceVisibility,
                  })
                }
              />
            ))}
          </div>
        </div>
      );
    }

    if (activeLens === 'mine') {
      if (mine.length === 0) {
        return (
          <LensEmpty
            icon={UsersRound}
            title="You do not hold a seat in any Space yet"
            body="A Space is a place the diaspora builds together. Find one to join in Discover, or start your own."
            action={
              <div className="flex flex-wrap items-center justify-center gap-2">
                <Button asChild variant="outline">
                  <Link to="/dna/collaborate?lens=discover">Browse Discover</Link>
                </Button>
                <Button onClick={() => composer.open('space')}>
                  <Plus className="mr-1.5 h-4 w-4" aria-hidden="true" />
                  Start a Space
                </Button>
              </div>
            }
          />
        );
      }
      return (
        <div className="space-y-3">
          {mine.map((space) => (
            <SpaceListCard key={space.id} space={space} isMember />
          ))}
        </div>
      );
    }

    // completed
    if (completed.length === 0) {
      return (
        <LensEmpty
          icon={BadgeCheck}
          title="No Space has completed yet"
          body="When a Space finishes what it set out to do, the full roster and the proof of the work land here. This surface fills itself, in time."
        />
      );
    }
    return (
      <div className="space-y-3">
        {completed.map((space) => (
          <SpaceListCard key={space.id} space={space} isMember={!!membershipMap[space.id]} />
        ))}
      </div>
    );
  }

  return (
    <SpacesShell
      tabs={
        <HubTabsRow>
          <CollaborateLensBar />
        </HubTabsRow>
      }
    >
      <div className="flex flex-col gap-6">
        {!isMobile && <CollaborateLensBar />}

        {renderLensBody()}
      </div>
    </SpacesShell>
  );
}
