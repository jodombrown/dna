import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate, Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { HandHeart, Lightbulb, Plus } from 'lucide-react';
import { supabaseClient } from '@/lib/supabaseHelpers';
import { ProfileV2Data, ProfileV2Visibility } from '@/types/profileV2';
import { ContributionNeedType, ContributionNeedStatus, ContributionOfferStatus } from '@/types/contributeTypes';
import { formatDistanceToNow } from 'date-fns';

interface ProfileV2OpportunitiesProps {
  profile: ProfileV2Data;
  visibility: ProfileV2Visibility;
  isOwner: boolean;
}

interface OpportunityDisplayItem {
  id: string;
  title: string;
  type: ContributionNeedType;
  status: ContributionNeedStatus;
  priority: 'normal' | 'high';
  description: string;
  created_at: string;
  space?: {
    id: string;
    name: string;
    slug: string;
  };
  offer_count?: number;
}

interface ContributionDisplayItem {
  id: string;
  need_id: string;
  status: ContributionOfferStatus;
  message: string;
  offered_amount?: number;
  offered_currency?: string;
  created_at: string;
  need?: {
    id: string;
    title: string;
    type: ContributionNeedType;
  };
  space?: {
    id: string;
    name: string;
    slug: string;
  };
}

// Type icons mapping
const TYPE_ICONS: Record<ContributionNeedType | string, string> = {
  funding: '💰',
  skills: '🛠️',
  time: '⏰',
  access: '🧠',
  resources: '📦',
  network: '🤝',
  knowledge: '🧠',
};

// Status badge variants
const getStatusVariant = (status: ContributionNeedStatus): 'default' | 'secondary' | 'outline' => {
  switch (status) {
    case 'open':
      return 'default';
    case 'in_progress':
      return 'secondary';
    case 'fulfilled':
    case 'closed':
      return 'outline';
    default:
      return 'secondary';
  }
};

const getOfferStatusVariant = (status: ContributionOfferStatus): 'default' | 'secondary' | 'destructive' | 'outline' => {
  switch (status) {
    case 'validated':
    case 'completed':
    case 'accepted':
      return 'default';
    case 'declined':
      return 'destructive';
    case 'pending':
    default:
      return 'secondary';
  }
};

const ProfileV2Opportunities: React.FC<ProfileV2OpportunitiesProps> = ({
  profile,
  visibility,
  isOwner,
}) => {
  const navigate = useNavigate();
  const profileUserId = profile.id;

  // Query opportunities/needs created by the profile user
  const { data: createdOpportunities = [], isLoading: createdLoading } = useQuery({
    queryKey: ['profile-created-opportunities', profileUserId, isOwner],
    queryFn: async () => {
      let query = supabaseClient
        .from('contribution_needs')
        .select(`
          id,
          title,
          type,
          status,
          priority,
          description,
          created_at,
          space:spaces(id, name, slug),
          offers:contribution_offers(count)
        `)
        .eq('created_by', profileUserId)
        .order('created_at', { ascending: false });

      // For non-owners, only show open opportunities
      if (!isOwner) {
        query = query.eq('status', 'open');
      }

      const { data, error } = await query;
      if (error) throw error;

      return (data || []).map((item: {
        id: string;
        title: string;
        type: ContributionNeedType;
        status: ContributionNeedStatus;
        priority: 'normal' | 'high';
        description: string;
        created_at: string;
        space: { id: string; name: string; slug: string } | null;
        offers: { count: number }[];
      }): OpportunityDisplayItem => ({
        id: item.id,
        title: item.title,
        type: item.type,
        status: item.status,
        priority: item.priority,
        description: item.description,
        created_at: item.created_at,
        space: item.space ?? undefined,
        offer_count: item.offers?.[0]?.count || 0,
      }));
    },
    enabled: !!profileUserId,
  });

  // Query contributions made by the profile user
  const { data: madeContributions = [], isLoading: contributionsLoading } = useQuery({
    queryKey: ['profile-made-contributions', profileUserId, isOwner],
    queryFn: async () => {
      let query = supabaseClient
        .from('contribution_offers')
        .select(`
          id,
          need_id,
          status,
          message,
          offered_amount,
          offered_currency,
          created_at,
          need:contribution_needs(id, title, type),
          space:spaces(id, name, slug)
        `)
        .eq('created_by', profileUserId)
        .order('created_at', { ascending: false });

      // For non-owners, only show completed/validated contributions
      if (!isOwner) {
        query = query.in('status', ['completed', 'validated']);
      }

      const { data, error } = await query;
      if (error) throw error;

      return (data || []).map((item: {
        id: string;
        need_id: string;
        status: ContributionOfferStatus;
        message: string;
        offered_amount: number | null;
        offered_currency: string | null;
        created_at: string;
        need: { id: string; title: string; type: ContributionNeedType } | null;
        space: { id: string; name: string; slug: string } | null;
      }): ContributionDisplayItem => ({
        id: item.id,
        need_id: item.need_id,
        status: item.status,
        message: item.message,
        offered_amount: item.offered_amount,
        offered_currency: item.offered_currency,
        created_at: item.created_at,
        need: item.need,
        space: item.space,
      }));
    },
    enabled: !!profileUserId,
  });

  // Sort opportunities: Open first, then by date
  const sortOpportunities = (opportunities: OpportunityDisplayItem[]) => {
    return [...opportunities].sort((a, b) => {
      // Open status first
      const statusOrder = { open: 0, in_progress: 1, fulfilled: 2, closed: 3 };
      const aOrder = statusOrder[a.status] ?? 4;
      const bOrder = statusOrder[b.status] ?? 4;
      if (aOrder !== bOrder) return aOrder - bOrder;
      // Then by created_at descending
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });
  };

  // Sort contributions: Validated first, then completed, then by date
  const sortContributions = (contributions: ContributionDisplayItem[]) => {
    return [...contributions].sort((a, b) => {
      const statusOrder = { validated: 0, completed: 1, accepted: 2, pending: 3, declined: 4 };
      const aOrder = statusOrder[a.status] ?? 5;
      const bOrder = statusOrder[b.status] ?? 5;
      if (aOrder !== bOrder) return aOrder - bOrder;
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });
  };

  const sortedOpportunities = sortOpportunities(createdOpportunities);
  const sortedContributions = sortContributions(madeContributions);

  const totalOpportunities = createdOpportunities.length;
  const totalContributions = madeContributions.length;
  const totalItems = totalOpportunities + totalContributions;

  const isLoading = createdLoading || contributionsLoading;
  const hasItems = totalItems > 0;

  // Hide if visibility is set to hidden and viewer is not owner
  if (visibility.opportunities === 'hidden' && !isOwner) {
    return null;
  }

  // Hide if no items and not the owner
  if (!hasItems && !isOwner && !isLoading) {
    return null;
  }

  // Loading skeleton
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lightbulb className="w-5 h-5 text-primary" />
            Opportunities
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-8 w-48" />
          <div className="grid gap-4">
            <Skeleton className="h-40 w-full" />
            <Skeleton className="h-40 w-full" />
          </div>
        </CardContent>
      </Card>
    );
  }

  const OpportunityCard = ({ opportunity }: { opportunity: OpportunityDisplayItem }) => (
    <Link to={`/dna/contribute/needs/${opportunity.id}`}>
      <Card className="hover:shadow-lg hover:border-primary/20 transition-all h-full">
        <CardContent className="pt-6 space-y-4">
          <div>
            <div className="flex items-start justify-between gap-2 mb-2">
              <h3 className="font-semibold text-lg line-clamp-2">{opportunity.title}</h3>
              <Badge
                variant={getStatusVariant(opportunity.status)}
                className="text-xs shrink-0 capitalize"
              >
                {opportunity.status === 'in_progress' ? 'In Progress' : opportunity.status}
              </Badge>
            </div>
            {opportunity.description && (
              <p className="text-sm text-muted-foreground line-clamp-2">{opportunity.description}</p>
            )}
          </div>

          <div className="flex flex-wrap gap-2">
            <Badge variant="outline" className="text-xs">
              {TYPE_ICONS[opportunity.type] || '📋'} {opportunity.type.charAt(0).toUpperCase() + opportunity.type.slice(1)}
            </Badge>
            {opportunity.priority === 'high' && (
              <Badge variant="destructive" className="text-xs">
                High Priority
              </Badge>
            )}
          </div>

          <div className="flex items-center justify-between text-xs text-muted-foreground pt-2 border-t">
            {opportunity.space && (
              <span className="truncate max-w-[60%]">📂 {opportunity.space.name}</span>
            )}
            <div className="flex items-center gap-3">
              <span>{opportunity.offer_count || 0} offers</span>
              <span>Posted {formatDistanceToNow(new Date(opportunity.created_at), { addSuffix: true })}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );

  const ContributionCard = ({ contribution }: { contribution: ContributionDisplayItem }) => (
    <Link to={`/dna/contribute/needs/${contribution.need_id}`}>
      <Card className="hover:shadow-lg hover:border-primary/20 transition-all h-full">
        <CardContent className="pt-6 space-y-4">
          <div>
            <div className="flex items-start justify-between gap-2 mb-2">
              <h3 className="font-semibold text-lg line-clamp-2">
                {contribution.need?.title || 'Contribution'}
              </h3>
              <Badge
                variant={getOfferStatusVariant(contribution.status)}
                className="text-xs shrink-0 capitalize"
              >
                {contribution.status === 'validated' ? 'Validated ✓' : contribution.status}
              </Badge>
            </div>
            {contribution.message && (
              <p className="text-sm text-muted-foreground line-clamp-2">{contribution.message}</p>
            )}
          </div>

          <div className="flex flex-wrap gap-2">
            {contribution.need?.type && (
              <Badge variant="outline" className="text-xs">
                {TYPE_ICONS[contribution.need.type] || '📋'} {contribution.need.type.charAt(0).toUpperCase() + contribution.need.type.slice(1)}
              </Badge>
            )}
            {contribution.offered_amount && (
              <Badge variant="secondary" className="text-xs">
                {contribution.offered_currency || '$'}{contribution.offered_amount.toLocaleString()}
              </Badge>
            )}
          </div>

          <div className="flex items-center justify-between text-xs text-muted-foreground pt-2 border-t">
            {contribution.space && (
              <span className="truncate max-w-[60%]">📂 {contribution.space.name}</span>
            )}
            <span>Submitted {formatDistanceToNow(new Date(contribution.created_at), { addSuffix: true })}</span>
          </div>
        </CardContent>
      </Card>
    </Link>
  );

  const renderOpportunitiesList = (
    opportunities: OpportunityDisplayItem[],
    emptyTitle: string,
    emptyDescription: string,
    emptyAction: { label: string; path: string }
  ) => {
    if (opportunities.length === 0) {
      return (
        <div className="text-center py-12 px-4">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
            <Lightbulb className="w-8 h-8 text-primary" />
          </div>
          <p className="text-lg font-medium text-foreground mb-2">{emptyTitle}</p>
          <p className="text-sm text-muted-foreground mb-4">
            {emptyDescription}
          </p>
          {isOwner && (
            <Button onClick={() => navigate(emptyAction.path)}>
              {emptyAction.label}
            </Button>
          )}
        </div>
      );
    }

    return (
      <div className="grid gap-4 sm:grid-cols-1 lg:grid-cols-2">
        {opportunities.map((opportunity) => (
          <OpportunityCard key={opportunity.id} opportunity={opportunity} />
        ))}
      </div>
    );
  };

  const renderContributionsList = (
    contributions: ContributionDisplayItem[],
    emptyTitle: string,
    emptyDescription: string,
    emptyAction: { label: string; path: string }
  ) => {
    if (contributions.length === 0) {
      return (
        <div className="text-center py-12 px-4">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
            <HandHeart className="w-8 h-8 text-primary" />
          </div>
          <p className="text-lg font-medium text-foreground mb-2">{emptyTitle}</p>
          <p className="text-sm text-muted-foreground mb-4">
            {emptyDescription}
          </p>
          {isOwner && (
            <Button onClick={() => navigate(emptyAction.path)}>
              {emptyAction.label}
            </Button>
          )}
        </div>
      );
    }

    return (
      <div className="grid gap-4 sm:grid-cols-1 lg:grid-cols-2">
        {contributions.map((contribution) => (
          <ContributionCard key={contribution.id} contribution={contribution} />
        ))}
      </div>
    );
  };

  return (
    <Card>
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Lightbulb className="w-5 h-5 text-primary" />
            Opportunities
            <Badge variant="secondary" className="ml-2">
              {totalItems}
            </Badge>
          </div>
          {isOwner && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/dna/contribute/needs')}
            >
              <Plus className="w-4 h-4 mr-2" />
              Browse Needs
            </Button>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* Stats Summary */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="flex items-center gap-3 p-3 bg-secondary/50 rounded-lg">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <Lightbulb className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-xl sm:text-2xl font-bold text-primary">{totalOpportunities}</p>
              <p className="text-xs sm:text-sm text-muted-foreground">Opportunities</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 bg-secondary/50 rounded-lg">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <HandHeart className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-xl sm:text-2xl font-bold text-primary">{totalContributions}</p>
              <p className="text-xs sm:text-sm text-muted-foreground">Contributions</p>
            </div>
          </div>
        </div>

        <Tabs defaultValue="created" className="space-y-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="created" className="flex items-center gap-2">
              <span>Opportunities Created</span>
              <Badge variant="outline" className="text-xs">
                {totalOpportunities}
              </Badge>
            </TabsTrigger>
            <TabsTrigger value="contributions" className="flex items-center gap-2">
              <span>Contributions Made</span>
              <Badge variant="outline" className="text-xs">
                {totalContributions}
              </Badge>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="created" className="mt-4">
            {renderOpportunitiesList(
              sortedOpportunities,
              'No opportunities posted yet',
              isOwner
                ? 'Post opportunities to get help from the community!'
                : `${profile.full_name || 'This user'} hasn't posted any open opportunities yet.`,
              { label: 'Create Opportunity', path: '/dna/collaborate/spaces' }
            )}
          </TabsContent>

          <TabsContent value="contributions" className="mt-4">
            {renderContributionsList(
              sortedContributions,
              'No contributions yet',
              isOwner
                ? 'Start contributing by browsing active opportunities!'
                : `${profile.full_name || 'This user'} hasn't made any contributions yet.`,
              { label: 'Discover Opportunities', path: '/dna/contribute/needs' }
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default ProfileV2Opportunities;
