import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useOpportunityRecommendations } from '@/hooks/useOpportunityMatching';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  RefreshCw,
  Sparkles,
  TrendingUp,
  Users,
  DollarSign,
  Clock,
  Key,
  Package,
  ArrowRight,
  Target,
} from 'lucide-react';
import type { MatchingOpportunity } from '@/services/opportunityMatchingService';
import type { ContributionNeedWithSpace, ContributionNeedType } from '@/types/contributeTypes';

// Icon mapping for contribution types
const typeIcons: Record<ContributionNeedType, React.ElementType> = {
  funding: DollarSign,
  skills: Users,
  time: Clock,
  access: Key,
  resources: Package,
};

// Colors for match score badges
function getMatchScoreColor(score: number): string {
  if (score >= 80) return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200';
  if (score >= 60) return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
  if (score >= 40) return 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200';
  return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
}

interface OpportunityCardProps {
  opportunity: MatchingOpportunity | ContributionNeedWithSpace;
  showMatchScore?: boolean;
}

function OpportunityCard({ opportunity, showMatchScore = false }: OpportunityCardProps) {
  const Icon = typeIcons[opportunity.type];
  const matchScore = 'matchScore' in opportunity ? opportunity.matchScore : undefined;
  const matchReasons = 'matchReasons' in opportunity ? opportunity.matchReasons : [];

  return (
    <Link to={`/dna/contribute/needs/${opportunity.id}`}>
      <Card className="h-full hover:shadow-md transition-shadow cursor-pointer group">
        <CardContent className="pt-4">
          <div className="flex items-start justify-between gap-2 mb-3">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-md bg-primary/10">
                <Icon className="h-4 w-4 text-primary" />
              </div>
              <Badge variant="outline" className="text-xs">
                {opportunity.type}
              </Badge>
            </div>
            {showMatchScore && matchScore !== undefined && (
              <Badge className={`${getMatchScoreColor(matchScore)} border-0 text-xs font-medium`}>
                {matchScore}% match
              </Badge>
            )}
          </div>

          <h4 className="font-semibold text-sm line-clamp-2 mb-1 group-hover:text-primary transition-colors">
            {opportunity.title}
          </h4>
          <p className="text-xs text-muted-foreground line-clamp-1 mb-2">
            {opportunity.space?.name || 'Project'}
          </p>

          {matchReasons.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {matchReasons.slice(0, 2).map((reason, idx) => (
                <Badge
                  key={idx}
                  variant="secondary"
                  className="text-[10px] font-normal px-1.5 py-0"
                >
                  {reason}
                </Badge>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </Link>
  );
}

function LoadingSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
      {[1, 2, 3, 4, 5].map((i) => (
        <Card key={i}>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2 mb-3">
              <Skeleton className="h-8 w-8 rounded-md" />
              <Skeleton className="h-4 w-16" />
            </div>
            <Skeleton className="h-4 w-full mb-2" />
            <Skeleton className="h-3 w-2/3" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function EmptyState() {
  return (
    <Card>
      <CardContent className="py-8 text-center">
        <Target className="h-8 w-8 text-muted-foreground/50 mx-auto mb-3" />
        <p className="text-sm text-muted-foreground">
          Complete your profile to get personalized opportunity recommendations
        </p>
        <Button variant="outline" size="sm" className="mt-4" asChild>
          <Link to="/dna/profile/edit">
            Complete Profile <ArrowRight className="ml-2 h-3 w-3" />
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}

function UnauthenticatedState() {
  return (
    <Card>
      <CardContent className="py-8 text-center">
        <Sparkles className="h-8 w-8 text-muted-foreground/50 mx-auto mb-3" />
        <p className="text-sm text-muted-foreground mb-4">
          Sign in to see opportunities matched to your profile
        </p>
        <Button variant="default" size="sm" asChild>
          <Link to="/auth">Sign In</Link>
        </Button>
      </CardContent>
    </Card>
  );
}

interface OpportunityRecommendationsProps {
  maxOpportunities?: number;
  showTrending?: boolean;
  showRefresh?: boolean;
  compact?: boolean;
}

export default function OpportunityRecommendations({
  maxOpportunities = 5,
  showTrending = true,
  showRefresh = true,
  compact = false,
}: OpportunityRecommendationsProps) {
  const { user } = useAuth();
  const { matching, trending, isLoading, refetch } = useOpportunityRecommendations();

  const [isRefreshing, setIsRefreshing] = React.useState(false);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refetch();
    setIsRefreshing(false);
  };

  // Show unauthenticated state if not logged in
  if (!user) {
    return (
      <section className={compact ? 'mb-6' : 'mb-12'}>
        <div className="flex items-center gap-2 mb-4">
          <Sparkles className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-semibold">Opportunities For You</h3>
        </div>
        <UnauthenticatedState />
      </section>
    );
  }

  const matchedOpportunities = matching.data?.slice(0, maxOpportunities) || [];
  const trendingOpportunities = trending.data?.slice(0, 3) || [];

  return (
    <section className={compact ? 'mb-6' : 'mb-12'}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-semibold">Opportunities For You</h3>
        </div>
        {showRefresh && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleRefresh}
            disabled={isLoading || isRefreshing}
            className="gap-1.5"
          >
            <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Refresh</span>
          </Button>
        )}
      </div>

      {/* Loading State */}
      {isLoading ? (
        <LoadingSkeleton />
      ) : matchedOpportunities.length === 0 ? (
        <EmptyState />
      ) : (
        <>
          {/* Matched Opportunities */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 mb-6">
            {matchedOpportunities.map((opportunity) => (
              <OpportunityCard
                key={opportunity.id}
                opportunity={opportunity}
                showMatchScore
              />
            ))}
          </div>

          {/* View All Link */}
          <div className="flex justify-center">
            <Button variant="outline" size="sm" asChild>
              <Link to="/dna/contribute/needs">
                View All Opportunities <ArrowRight className="ml-2 h-3 w-3" />
              </Link>
            </Button>
          </div>
        </>
      )}

      {/* Trending Section */}
      {showTrending && trendingOpportunities.length > 0 && (
        <div className="mt-8">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="h-5 w-5 text-orange-500" />
            <h4 className="text-md font-medium text-muted-foreground">Trending Now</h4>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {trendingOpportunities.map((opportunity) => (
              <OpportunityCard
                key={opportunity.id}
                opportunity={opportunity}
                showMatchScore={false}
              />
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
