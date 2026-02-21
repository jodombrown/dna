// src/pages/dna/contribute/ContributeDiscovery.tsx
// Discovery mode for Contribute hub - full marketplace experience with PRD hub pattern

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { HandHeart, Plus, Search, Package, Users, Sparkles, DollarSign } from 'lucide-react';
import MobileBottomNav from '@/components/mobile/MobileBottomNav';

// New Hub Components
import {
  HubHero,
  HubStatsBar,
  HubQuickActions,
  HubDIAPanel,
  HubActivityFeed,
  HubSubNav,
  type HubStat,
  type QuickAction,
  type DIARecommendation,
  type ActivityItem,
  type SubNavTab,
} from '@/components/hubs/shared';

// Existing sections
import OpportunityRecommendations from '@/components/contribute/OpportunityRecommendations';

// DIA Card System (Sprint 4A)
import { DIAHubSection } from '@/components/dia/DIAHubSection';
import { logger } from '@/lib/logger';

export function ContributeDiscovery() {
  const navigate = useNavigate();
  const { user } = useAuth();

  // Fetch stats with error handling
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['contribute-hub-stats', user?.id],
    queryFn: async (): Promise<{
      openNeeds: number;
      activeOffers: number;
      myRequests: number;
      matchesMade: number;
    }> => {
      try {
        // Open needs count
        const { count: openNeedsCount, error: needsError } = await supabase
          .from('contribution_needs')
          .select('id', { count: 'exact', head: true })
          .eq('status', 'open');
        
        if (needsError) {
          logger.warn('ContributeDiscovery', 'Failed to fetch open needs:', needsError);
        }
        
        // Active offers count
        const { count: activeOffersCount, error: offersError } = await supabase
          .from('contribution_offers')
          .select('id', { count: 'exact', head: true })
          .eq('status', 'pending');
        
        if (offersError) {
          logger.warn('ContributeDiscovery', 'Failed to fetch active offers:', offersError);
        }
        
        let myRequestsCount = 0;
        let matchesCount = 0;

        if (user?.id) {
          // My requests
          const { count: myCount, error: myError } = await supabase
            .from('contribution_needs')
            .select('id', { count: 'exact', head: true })
            .eq('created_by', user.id);
          if (!myError) myRequestsCount = myCount || 0;

          // Matches made (accepted offers)
          const { count: acceptedCount, error: acceptedError } = await supabase
            .from('contribution_offers')
            .select('id', { count: 'exact', head: true })
            .eq('status', 'accepted');
          if (!acceptedError) matchesCount = acceptedCount || 0;
        }

        return {
          openNeeds: openNeedsCount || 0,
          activeOffers: activeOffersCount || 0,
          myRequests: myRequestsCount,
          matchesMade: matchesCount,
        };
      } catch (error) {
        logger.warn('ContributeDiscovery', 'Failed to fetch stats:', error);
        return { openNeeds: 0, activeOffers: 0, myRequests: 0, matchesMade: 0 };
      }
    },
    staleTime: 60000,
    retry: 2,
    retryDelay: 1000,
  });

  // Fetch recent activity with error handling
  const { data: recentActivity, isLoading: activityLoading } = useQuery({
    queryKey: ['contribute-recent-activity'],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from('contribution_needs')
          .select('id, title, type, status, created_at')
          .eq('status', 'open')
          .order('created_at', { ascending: false })
          .limit(5);

        if (error) {
          logger.warn('ContributeDiscovery', 'Failed to fetch recent activity:', error);
          return [];
        }
        return data || [];
      } catch (error) {
        logger.warn('ContributeDiscovery', 'Error fetching recent activity:', error);
        return [];
      }
    },
    staleTime: 60000,
    retry: 1,
  });

  // Hub Stats
  const hubStats: HubStat[] = [
    {
      label: 'Open Needs',
      value: stats?.openNeeds || 0,
      icon: Package,
      onClick: () => navigate('/dna/contribute/needs'),
    },
    {
      label: 'Active Offers',
      value: stats?.activeOffers || 0,
      icon: HandHeart,
      onClick: () => navigate('/dna/contribute/needs'),
    },
    {
      label: 'My Requests',
      value: stats?.myRequests || 0,
      icon: Users,
      onClick: () => navigate('/dna/contribute/needs?filter=mine'),
    },
    {
      label: 'Matches Made',
      value: stats?.matchesMade || 0,
      icon: Sparkles,
    },
  ];

  // Quick Actions
  const quickActions: QuickAction[] = [
    {
      label: 'Post a Need',
      description: 'Request help or resources',
      icon: Plus,
      onClick: () => navigate('/dna/contribute/needs?action=create'),
      variant: 'primary',
    },
    {
      label: 'Make an Offer',
      description: 'Contribute your skills',
      icon: HandHeart,
      onClick: () => navigate('/dna/contribute/needs'),
    },
    {
      label: 'Browse Needs',
      description: 'Find ways to help',
      icon: Search,
      onClick: () => navigate('/dna/contribute/needs'),
    },
    {
      label: 'My Activity',
      description: 'Track contributions',
      icon: DollarSign,
      onClick: () => navigate('/dna/contribute/needs?filter=mine'),
    },
  ];

  // DIA Recommendations
  const diaRecommendations: DIARecommendation[] = [
    {
      id: 'skills-match',
      title: 'Needs matching your skills',
      description: 'Projects looking for expertise you have',
      reason: 'Based on your profile expertise areas',
      icon: Sparkles,
      onClick: () => navigate('/dna/contribute/needs'),
    },
    {
      id: 'network-offers',
      title: 'Offers from your network',
      description: 'See what your connections are offering',
      reason: 'Based on your network connections',
      icon: Users,
      onClick: () => navigate('/dna/contribute/needs'),
    },
    {
      id: 'high-impact',
      title: 'High-impact opportunities',
      description: 'Priority needs with community backing',
      reason: 'Based on community engagement and urgency',
      icon: HandHeart,
      onClick: () => navigate('/dna/contribute/needs?sort=priority'),
    },
  ];

  // Activity Feed items
  const activityItems: ActivityItem[] = (recentActivity || []).map(need => ({
    id: need.id,
    type: 'need',
    title: need.title,
    description: need.type || 'Contribution need',
    timestamp: need.created_at,
    icon: Package,
    onClick: () => navigate(`/dna/contribute/needs/${need.id}`),
  }));

  // Sub Navigation Tabs
  const subNavTabs: SubNavTab[] = [
    { label: 'Needs', path: '/dna/contribute/needs' },
    { label: 'My Activity', path: '/dna/contribute/needs?filter=mine' },
  ];

  return (
    <div className="w-full min-h-screen bg-background pb-20 md:pb-0">
      <div className="container max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4 lg:py-6 space-y-6">
        {/* Hero Section */}
        <HubHero
          hub="contribute"
          icon={HandHeart}
          title="CONTRIBUTE"
          tagline="Give What You Can, Get What You Need"
          primaryAction={{
            label: 'Post a Need',
            icon: Plus,
            onClick: () => navigate('/dna/contribute/needs?action=create'),
          }}
          secondaryAction={{
            label: 'Browse Needs',
            icon: Search,
            onClick: () => navigate('/dna/contribute/needs'),
          }}
        />

        {/* Stats Bar */}
        <HubStatsBar stats={hubStats} loading={statsLoading} />

        {/* Sub Navigation */}
        <HubSubNav tabs={subNavTabs} basePath="/dna/contribute" />

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6">
          {/* Main Content */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <HubQuickActions actions={quickActions} />

            {/* Personalized Recommendations */}
            <OpportunityRecommendations maxOpportunities={5} showTrending={true} />
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* DIA Intelligence Cards */}
            <DIAHubSection surface="contribute_hub" limit={2} />

            {/* DIA Panel */}
            <HubDIAPanel
              hub="contribute"
              recommendations={diaRecommendations}
              onAskDIA={() => navigate('/dna/dia?context=contribute')}
            />

            {/* Recent Activity */}
            <HubActivityFeed
              title="Latest Needs"
              items={activityItems}
              loading={activityLoading}
              onViewAll={() => navigate('/dna/contribute/needs')}
              emptyMessage="No active needs yet"
            />
          </div>
        </div>
      </div>
      <MobileBottomNav />
    </div>
  );
}

export default ContributeDiscovery;
