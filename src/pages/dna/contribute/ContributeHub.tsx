// CONTRIBUTE hub landing (Arc 3, Frame 8). One destination, three lenses on the
// shared LensBar primitive, replacing the manifest-and-room scroll that predated
// the arc:
//
//   needs      Everything open: public asks from across the diaspora.
//   mine       Your asks AND your contributions, two sections in one lens.
//   fulfilled  The closed loop: your asks that reached fulfilled.
//
// The active lens lives in the URL (?lens=<id>) and is owned by the LensBar, so
// this page reads it but never writes tab state.
//
// Data note: the canonical need_declarations model records no contributor ledger
// and no Space link, so this hub never shows a contributor count and never
// fabricates one. The Mine "contributions" section and the Fulfilled "back to
// its Space" link (Frames 9 and 13) wait on that model, and render as honest
// empty copy here rather than invented data. Flagged in the PR, not papered over.

import { useMemo } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Megaphone, UserRound, CircleCheckBig, Plus } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { ContributeShell } from '@/components/contribute/ContributeShell';
import {
  ContributeLensBar,
  CONTRIBUTE_LENSES,
  type ContributeLensId,
} from '@/components/contribute/ContributeLensBar';
import { NeedListItem } from '@/components/contribute/needs/NeedListItem';
import { LensEmpty } from '@/components/hubs/shared/LensEmpty';
import { useOwnNeeds, useOpenNeeds } from '@/hooks/contribute/useNeeds';

const VALID_LENS_IDS = CONTRIBUTE_LENSES.map((l) => l.id);

function LensSkeletons() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 3 }).map((_, i) => (
        <Skeleton key={i} className="h-28 w-full rounded-xl" />
      ))}
    </div>
  );
}

export default function ContributeHub() {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();

  const lensParam = searchParams.get('lens');
  const activeLens: ContributeLensId = (
    lensParam && VALID_LENS_IDS.includes(lensParam) ? lensParam : 'needs'
  ) as ContributeLensId;

  const { data: openNeeds = [], isLoading: needsLoading } = useOpenNeeds();
  const { data: ownNeeds = [], isLoading: ownLoading } = useOwnNeeds();

  const myAsks = ownNeeds;
  const myFulfilled = useMemo(
    () => ownNeeds.filter((n) => n.status === 'fulfilled'),
    [ownNeeds],
  );

  function renderNeeds() {
    if (needsLoading) return <LensSkeletons />;
    if (openNeeds.length === 0) {
      return (
        <LensEmpty
          icon={Megaphone}
          title="No open Needs right now"
          body="When a member posts an ask the community can meet, it lands here. If you are carrying one, name it and the right people can find it."
          action={
            <Button asChild>
              <Link to="/dna/contribute/my-needs">
                <Plus className="mr-1.5 h-4 w-4" aria-hidden="true" />
                Post a Need
              </Link>
            </Button>
          }
        />
      );
    }
    return (
      <div className="space-y-3">
        {openNeeds.map((need) => (
          <NeedListItem key={need.id} need={need} />
        ))}
      </div>
    );
  }

  function renderMine() {
    if (ownLoading) return <LensSkeletons />;
    return (
      <div className="space-y-8">
        <section className="space-y-3">
          <h2 className="text-h2 text-foreground">My asks</h2>
          {myAsks.length === 0 ? (
            <LensEmpty
              icon={Megaphone}
              title="You have not posted a Need yet"
              body="A Need is one specific ask, met by named people or honestly closed unmet. Name what would move your work and the community can answer."
              action={
                <Button asChild>
                  <Link to="/dna/contribute/my-needs">
                    <Plus className="mr-1.5 h-4 w-4" aria-hidden="true" />
                    Post a Need
                  </Link>
                </Button>
              }
            />
          ) : (
            <div className="space-y-3">
              {myAsks.map((need) => (
                <NeedListItem key={need.id} need={need} showStatus />
              ))}
            </div>
          )}
        </section>

        <section className="space-y-3">
          <h2 className="text-h2 text-foreground">My contributions</h2>
          {/* Frame 13: Mine must distinguish "never contributed" from
              "contributed privately". The canonical model records no contribution
              yet, so only the "never" branch is truthful today. The private
              branch is named, not fabricated: a real ledger will light it. */}
          <LensEmpty
            icon={UserRound}
            title="You have not recorded a contribution yet"
            body="When you answer a Need, it appears here. A contribution you choose to keep private stays visible to you alone and to no one else."
          />
        </section>
      </div>
    );
  }

  function renderFulfilled() {
    if (ownLoading) return <LensSkeletons />;
    if (myFulfilled.length === 0) {
      return (
        <LensEmpty
          icon={CircleCheckBig}
          title="No Need has closed its loop yet"
          body="When one of your asks is met and marked fulfilled, it moves here as the record that it happened. This surface fills itself, in time."
        />
      );
    }
    return (
      <div className="space-y-3">
        {myFulfilled.map((need) => (
          <NeedListItem key={need.id} need={need} showStatus />
        ))}
      </div>
    );
  }

  function renderLensBody() {
    if (!user) {
      return (
        <p className="text-body text-muted-foreground">Sign in to post and answer Needs.</p>
      );
    }
    if (activeLens === 'mine') return renderMine();
    if (activeLens === 'fulfilled') return renderFulfilled();
    return renderNeeds();
  }

  return (
    <ContributeShell bubblePlaceholder="Search Needs">
      <div className="flex flex-col gap-6">
        <ContributeLensBar />

        {renderLensBody()}
      </div>
    </ContributeShell>
  );
}
