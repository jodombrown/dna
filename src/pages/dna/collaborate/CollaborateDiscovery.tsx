// src/pages/dna/collaborate/CollaborateDiscovery.tsx
// Discovery mode for Collaborate hub - full spaces experience with PRD hub pattern

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Users, Plus, Search, FolderKanban, CheckSquare, UserPlus, Sparkles } from 'lucide-react';
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
import { SuggestedSpaces } from '@/components/collaboration/SuggestedSpaces';

export function CollaborateDiscovery() {
  const navigate = useNavigate();
  const { user } = useAuth();

  // Fetch stats
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['collaborate-hub-stats', user?.id],
    queryFn: async (): Promise<{
      activeSpaces: number;
      mySpaces: number;
      openTasks: number;
      collaborators: number;
    }> => {
      // Active spaces count
      const { count: activeSpacesCount } = await supabase
        .from('spaces')
        .select('id', { count: 'exact' })
        .eq('status', 'active')
        .eq('visibility', 'public');
      
      let mySpacesCount = 0;
      let openTasksCount = 0;
      let collaboratorsCount = 0;

      if (user?.id) {
        // My spaces (where I'm a member)
        const { count: myCount } = await supabase
          .from('space_members')
          .select('space_id', { count: 'exact' })
          .eq('user_id', user.id);
        mySpacesCount = myCount || 0;

        // Open tasks assigned to me
        const { count: tasksCount } = await supabase
          .from('tasks')
          .select('id', { count: 'exact' })
          .eq('assignee_id', user.id);
        openTasksCount = tasksCount || 0;

        // Distinct collaborators (approximation)
        const { count: collabCount } = await supabase
          .from('space_members')
          .select('user_id', { count: 'exact' });
        collaboratorsCount = Math.min(collabCount || 0, 999);
      }

      return {
        activeSpaces: activeSpacesCount || 0,
        mySpaces: mySpacesCount,
        openTasks: openTasksCount,
        collaborators: collaboratorsCount,
      };
    },
    staleTime: 60000,
  });

  // Fetch recent activity
  const { data: recentActivity, isLoading: activityLoading } = useQuery({
    queryKey: ['collaborate-recent-activity'],
    queryFn: async () => {
      const { data } = await supabase
        .from('spaces')
        .select('id, name, slug, tagline, created_at, updated_at')
        .eq('status', 'active')
        .eq('visibility', 'public')
        .order('updated_at', { ascending: false })
        .limit(5);

      return data || [];
    },
    staleTime: 60000,
  });

  // Hub Stats
  const hubStats: HubStat[] = [
    {
      label: 'Active Spaces',
      value: stats?.activeSpaces || 0,
      icon: FolderKanban,
      onClick: () => navigate('/dna/collaborate/spaces'),
    },
    {
      label: 'My Spaces',
      value: stats?.mySpaces || 0,
      icon: Users,
      onClick: () => navigate('/dna/collaborate/my-spaces'),
    },
    {
      label: 'Open Tasks',
      value: stats?.openTasks || 0,
      icon: CheckSquare,
      onClick: () => navigate('/dna/collaborate/my-spaces'),
    },
    {
      label: 'Collaborators',
      value: stats?.collaborators || 0,
      icon: UserPlus,
    },
  ];

  // Quick Actions
  const quickActions: QuickAction[] = [
    {
      label: 'Create Space',
      description: 'Start a new project',
      icon: Plus,
      onClick: () => navigate('/dna/collaborate/spaces/new'),
      variant: 'primary',
    },
    {
      label: 'Browse Spaces',
      description: 'Join existing projects',
      icon: Search,
      onClick: () => navigate('/dna/collaborate/spaces'),
    },
    {
      label: 'My Tasks',
      description: 'View your assignments',
      icon: CheckSquare,
      onClick: () => navigate('/dna/collaborate/my-spaces'),
    },
    {
      label: 'My Spaces',
      description: 'Spaces you\'re in',
      icon: FolderKanban,
      onClick: () => navigate('/dna/collaborate/my-spaces'),
    },
  ];

  // DIA Recommendations
  const diaRecommendations: DIARecommendation[] = [
    {
      id: 'skills-match',
      title: 'Spaces needing your skills',
      description: 'Projects looking for expertise matching your profile',
      reason: 'Based on your expertise areas and skills',
      icon: Sparkles,
      onClick: () => navigate('/dna/collaborate/spaces'),
    },
    {
      id: 'network-projects',
      title: 'Your connections\' active projects',
      description: 'See what people in your network are building',
      reason: 'Based on your network activity',
      icon: Users,
      onClick: () => navigate('/dna/collaborate/spaces'),
    },
    {
      id: 'due-tasks',
      title: 'Tasks due this week',
      description: 'Don\'t miss your upcoming deadlines',
      reason: 'Urgency nudge based on task due dates',
      icon: CheckSquare,
      onClick: () => navigate('/dna/collaborate/my-spaces'),
    },
  ];

  // Activity Feed items
  const activityItems: ActivityItem[] = (recentActivity || []).map(space => ({
    id: space.id,
    type: 'space',
    title: space.name,
    description: space.tagline || 'Collaboration space',
    timestamp: space.updated_at || space.created_at,
    icon: FolderKanban,
    onClick: () => navigate(`/dna/collaborate/spaces/${space.slug}`),
  }));

  // Sub Navigation Tabs
  const subNavTabs: SubNavTab[] = [
    { label: 'All Spaces', path: '/dna/collaborate/spaces' },
    { label: 'My Spaces', path: '/dna/collaborate/my-spaces' },
  ];

  return (
    <div className="w-full min-h-screen bg-background pb-20 md:pb-0">
      <div className="container max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4 lg:py-6 space-y-6">
        {/* Hero Section */}
        <HubHero
          hub="collaborate"
          icon={Users}
          title="COLLABORATE"
          tagline="Build Together, Achieve Together"
          primaryAction={{
            label: 'Create Space',
            icon: Plus,
            onClick: () => navigate('/dna/collaborate/spaces/new'),
          }}
          secondaryAction={{
            label: 'Find Spaces',
            icon: Search,
            onClick: () => navigate('/dna/collaborate/spaces'),
          }}
        />

        {/* Stats Bar */}
        <HubStatsBar stats={hubStats} loading={statsLoading} />

        {/* Sub Navigation */}
        <HubSubNav tabs={subNavTabs} basePath="/dna/collaborate" />

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6">
          {/* Main Content */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <HubQuickActions actions={quickActions} />

            {/* Suggested Spaces */}
            <SuggestedSpaces />
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* DIA Panel */}
            <HubDIAPanel
              hub="collaborate"
              recommendations={diaRecommendations}
              onAskDIA={() => navigate('/dna/dia?context=collaborate')}
            />

            {/* Recent Activity */}
            <HubActivityFeed
              title="Active Spaces"
              items={activityItems}
              loading={activityLoading}
              onViewAll={() => navigate('/dna/collaborate/spaces')}
              emptyMessage="No active spaces yet"
            />
          </div>
        </div>
      </div>
      <MobileBottomNav />
    </div>
  );
}

export default CollaborateDiscovery;
