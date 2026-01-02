/**
 * ContributeFocus - Focus Mode Content for Contribute Module
 *
 * Displays actionable Contribute content including:
 * - Opportunity matches based on user skills
 * - User's active listings with interest counts
 * - Recent opportunities in the marketplace
 * - Aspiration mode for when marketplace is launching
 */

import React from 'react';
import { Link } from 'react-router-dom';
import { Gift, Briefcase, Heart, TrendingUp, Bell, FileText, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useContributeFocusData, type OpportunityMatch, type UserListing } from '@/hooks/useContributeFocusData';

function MatchCard({ match }: { match: OpportunityMatch }) {
  const typeIcons: Record<string, React.ReactNode> = {
    job: <Briefcase className="w-4 h-4" />,
    mentorship: <Heart className="w-4 h-4" />,
    investment: <TrendingUp className="w-4 h-4" />,
    service: <Gift className="w-4 h-4" />,
    other: <FileText className="w-4 h-4" />,
  };

  return (
    <Link
      to={`/dna/contribute/needs/${match.id}`}
      className="block p-3 border border-neutral-100 rounded-lg hover:border-neutral-200 transition-colors"
    >
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-lg bg-dna-copper/10 flex items-center justify-center shrink-0 text-dna-copper">
          {typeIcons[match.type] || typeIcons.other}
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="font-medium text-sm text-neutral-900 line-clamp-2">
            {match.title}
          </h4>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-xs text-neutral-500">
              {match.isRemote ? 'Remote' : match.location || 'Location TBD'}
            </span>
            <Badge variant="outline" className="text-xs text-dna-emerald border-dna-emerald/30">
              {match.matchScore}% match
            </Badge>
          </div>
          {match.matchReason && (
            <p className="text-xs text-dna-copper mt-1">{match.matchReason}</p>
          )}
        </div>
      </div>
    </Link>
  );
}

function ListingCard({ listing }: { listing: UserListing }) {
  return (
    <Link
      to={`/dna/contribute/needs/${listing.id}`}
      className="block p-3 bg-neutral-50 rounded-lg hover:bg-neutral-100 transition-colors"
    >
      <div className="flex items-center justify-between">
        <div className="flex-1 min-w-0">
          <h4 className="font-medium text-sm text-neutral-900 truncate">
            {listing.title}
          </h4>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-xs text-neutral-500">
              {listing.interestedCount} interested
            </span>
            {listing.newInterestToday > 0 && (
              <Badge className="text-xs bg-dna-emerald">
                +{listing.newInterestToday} today
              </Badge>
            )}
          </div>
        </div>
        <Button size="sm" variant="ghost" className="text-dna-emerald">
          Manage
        </Button>
      </div>
    </Link>
  );
}

function AspirationMode() {
  return (
    <div className="text-center py-6">
      <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-dna-copper/10 flex items-center justify-center">
        <Gift className="w-8 h-8 text-dna-copper" />
      </div>
      <h3 className="font-semibold text-neutral-900 mb-2">The marketplace is coming soon</h3>
      <p className="text-sm text-neutral-500 mb-4">
        Jobs, mentorship, investment, services — exchange value within the diaspora community.
      </p>
      <div className="space-y-2">
        <Button variant="outline" className="w-full">
          <Bell className="w-4 h-4 mr-2" />
          Notify Me When It Opens
        </Button>
        <Link to="/dna/contribute/early-access">
          <Button variant="ghost" className="w-full text-dna-emerald">
            <FileText className="w-4 h-4 mr-2" />
            Post an Opportunity Early
          </Button>
        </Link>
      </div>
    </div>
  );
}

export function ContributeFocus() {
  const {
    matches,
    userListings,
    recentOpportunities,
    isLoading,
    matchCount,
    listingCount,
  } = useContributeFocusData();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-6 h-6 animate-spin text-dna-emerald" />
      </div>
    );
  }

  // Show aspiration mode if no matches, no listings, and no recent opportunities
  if (matchCount === 0 && listingCount === 0 && recentOpportunities.length === 0) {
    return <AspirationMode />;
  }

  return (
    <div className="space-y-6">
      {/* Opportunity Matches */}
      {matchCount > 0 && (
        <section>
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-sm text-neutral-900">
              Opportunities For You ({matchCount})
            </h3>
            <Link
              to="/dna/contribute"
              className="text-xs text-dna-emerald hover:underline"
            >
              See All
            </Link>
          </div>
          <div className="space-y-2">
            {matches.slice(0, 3).map((match) => (
              <MatchCard key={match.id} match={match} />
            ))}
          </div>
        </section>
      )}

      {/* User's Active Listings */}
      {listingCount > 0 && (
        <section>
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-sm text-neutral-900">
              Your Listings ({listingCount})
            </h3>
            <Link
              to="/dna/contribute/my"
              className="text-xs text-dna-emerald hover:underline"
            >
              Manage All
            </Link>
          </div>
          <div className="space-y-2">
            {userListings.slice(0, 2).map((listing) => (
              <ListingCard key={listing.id} listing={listing} />
            ))}
          </div>
        </section>
      )}

      {/* Recent Opportunities - only show if user has no matches */}
      {matchCount === 0 && recentOpportunities.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-sm text-neutral-900">
              New in the Marketplace
            </h3>
            <Link
              to="/dna/contribute"
              className="text-xs text-dna-emerald hover:underline"
            >
              Browse All
            </Link>
          </div>
          <div className="space-y-2">
            {recentOpportunities.slice(0, 3).map((opp) => (
              <Link
                key={opp.id}
                to={`/dna/contribute/needs/${opp.id}`}
                className="block p-3 border border-neutral-100 rounded-lg hover:border-neutral-200 transition-colors"
              >
                <h4 className="font-medium text-sm text-neutral-900 truncate">
                  {opp.title}
                </h4>
                <p className="text-xs text-neutral-500 mt-1">
                  Posted by {opp.createdByName}
                </p>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

export default ContributeFocus;
