import React, { useState } from 'react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import {
  Users,
  TrendingUp,
  Eye,
  UserPlus,
  Bell,
  Calendar,
  Handshake,
  Lightbulb,
  FileText,
  ChevronRight,
  ChevronDown,
  Globe,
  Zap,
  Clock,
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';
import { logger } from '@/lib/logger';

interface NetworkPanelProps {
  onFilterChange?: (filters: FilterState) => void;
  onSearchChange?: (query: string) => void;
  onViewModeChange?: (mode: 'discover' | 'network' | 'activity') => void;
  className?: string;
}

export interface FilterState {
  cEngagement: 'all' | 'convene' | 'collaborate' | 'contribute' | 'convey';
  regions: string[];
  diasporaLocations: string[];
}

const HERITAGE_REGIONS = [
  { id: 'West Africa', label: 'West Africa' },
  { id: 'East Africa', label: 'East Africa' },
  { id: 'North Africa', label: 'North Africa' },
  { id: 'Central Africa', label: 'Central Africa' },
  { id: 'Southern Africa', label: 'Southern Africa' },
];

const C_ENGAGEMENT_OPTIONS = [
  { id: 'all', label: 'All Members', icon: Users },
  { id: 'convene', label: 'Attending Your Events', icon: Calendar },
  { id: 'collaborate', label: 'In Your Projects', icon: Handshake },
  { id: 'contribute', label: 'Shared Opportunities', icon: Lightbulb },
  { id: 'convey', label: 'Engaged Your Content', icon: FileText },
];

export function NetworkPanel({
  onFilterChange,
  onSearchChange,
  onViewModeChange,
  className,
}: NetworkPanelProps) {
  const { user } = useAuth();
  const [networkSearch, setNetworkSearch] = useState('');
  const [filters, setFilters] = useState<FilterState>({
    cEngagement: 'all',
    regions: [],
    diasporaLocations: [],
  });

  const { data: networkStats } = useQuery({
    queryKey: ['network-stats', user?.id],
    queryFn: async () => {
      if (!user) return { total: 0, weeklyChange: 0, pendingRequests: 0 };
      try {
        const { count: totalConnections } = await supabase
          .from('connections')
          .select('id', { count: 'exact' })
          .eq('status', 'accepted')
          .or(`requester_id.eq.${user.id},recipient_id.eq.${user.id}`);

        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        const { count: newThisWeek } = await supabase
          .from('connections')
          .select('id', { count: 'exact' })
          .eq('status', 'accepted')
          .or(`requester_id.eq.${user.id},recipient_id.eq.${user.id}`)
          .gte('updated_at', weekAgo.toISOString());

        const { count: pendingRequests } = await supabase
          .from('connections')
          .select('id', { count: 'exact' })
          .eq('status', 'pending')
          .eq('recipient_id', user.id);

        return {
          total: totalConnections || 0,
          weeklyChange: newThisWeek || 0,
          pendingRequests: pendingRequests || 0,
        };
      } catch (error) {
        logger.warn('NetworkPanel', 'Error fetching network stats:', error);
        return { total: 0, weeklyChange: 0, pendingRequests: 0 };
      }
    },
    enabled: !!user,
    staleTime: 60000,
    retry: 2,
  });

  const { data: activitySummary } = useQuery({
    queryKey: ['activity-summary', user?.id],
    queryFn: async () => {
      if (!user) return { profileViews: 0, newMatches: 0 };
      try {
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        const { count: profileViews } = await supabase
          .from('profile_views')
          .select('id', { count: 'exact' })
          .eq('profile_id', user.id)
          .gte('viewed_at', weekAgo.toISOString());

        return { profileViews: profileViews || 0, newMatches: 0 };
      } catch (error) {
        logger.warn('NetworkPanel', 'Error fetching activity summary:', error);
        return { profileViews: 0, newMatches: 0 };
      }
    },
    enabled: !!user,
    staleTime: 60000,
    retry: 2,
  });

  const handleSearchChange = (value: string) => {
    setNetworkSearch(value);
    onSearchChange?.(value);
  };

  const handleFilterChange = (newFilters: Partial<FilterState>) => {
    const updated = { ...filters, ...newFilters };
    setFilters(updated);
    onFilterChange?.(updated);
  };

  const handleRegionToggle = (regionId: string) => {
    const updated = filters.regions.includes(regionId)
      ? filters.regions.filter((r) => r !== regionId)
      : [...filters.regions, regionId];
    handleFilterChange({ regions: updated });
  };

  const handleViewNetwork = () => {
    onViewModeChange?.('network');
  };

  const handleActivityClick = (activityType: string) => {
    // Populate center column with activity-relevant content
    onViewModeChange?.('activity');
  };

  const activeFilterCount =
    (filters.cEngagement !== 'all' ? 1 : 0) +
    filters.regions.length;

  return (
    <div className={cn('flex flex-col h-full', className)}>
      {/* Sticky Title Header - aligned with other column headers */}
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm border-b border-border/40 px-4 py-3">
        <div className="flex items-center justify-between h-11">
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-primary" />
            <h2 className="text-sm font-semibold text-foreground">Your Network</h2>
            {networkStats?.total !== undefined && networkStats.total > 0 && (
              <Badge variant="secondary" className="text-xs px-1.5 py-0">
                {networkStats.total}
              </Badge>
            )}
            {networkStats?.weeklyChange !== undefined && networkStats.weeklyChange > 0 && (
              <TooltipProvider delayDuration={200}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      type="button"
                      onClick={handleViewNetwork}
                      className="flex items-center gap-1 text-primary bg-primary/10 hover:bg-primary/20 px-2 py-0.5 rounded-full cursor-pointer transition-colors"
                    >
                      <TrendingUp className="h-3 w-3" />
                      <span className="text-xs font-medium">+{networkStats.weeklyChange}</span>
                    </button>
                  </TooltipTrigger>
                  <TooltipContent side="bottom" className="text-xs">
                    New connections this week
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="text-xs text-muted-foreground hover:text-foreground p-1 h-auto"
            onClick={handleViewNetwork}
          >
            <span>View all</span>
            <ChevronRight className="h-3.5 w-3.5 ml-0.5" />
          </Button>
        </div>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-4 space-y-4">
        {/* Filter by Engagement - Collapsible */}
        <Collapsible defaultOpen>
          <CollapsibleTrigger className="flex items-center justify-between w-full p-3 rounded-lg hover:bg-muted/50 transition-colors group">
            <span className="text-sm font-medium text-foreground">Filter by Engagement</span>
            <div className="flex items-center gap-1.5">
              {activeFilterCount > 0 && (
                <Badge variant="secondary" className="h-5 px-1.5 text-xs">
                  {activeFilterCount}
                </Badge>
              )}
              <ChevronDown className="h-4 w-4 text-muted-foreground transition-transform group-data-[state=open]:rotate-180" />
            </div>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <div className="px-1 pb-2">
              <RadioGroup
                value={filters.cEngagement}
                onValueChange={(value) =>
                  handleFilterChange({
                    cEngagement: value as FilterState['cEngagement'],
                  })
                }
                className="space-y-1"
              >
                {C_ENGAGEMENT_OPTIONS.map((option) => (
                  <div
                    key={option.id}
                    className={cn(
                      'flex items-center space-x-2 p-2 rounded-lg transition-colors cursor-pointer',
                      filters.cEngagement === option.id
                        ? 'bg-primary/10'
                        : 'hover:bg-muted/50'
                    )}
                  >
                    <RadioGroupItem value={option.id} id={option.id} />
                    <Label
                      htmlFor={option.id}
                      className="flex items-center gap-2 flex-1 cursor-pointer text-sm"
                    >
                      <option.icon className="h-4 w-4 text-muted-foreground" />
                      {option.label}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </div>
          </CollapsibleContent>
        </Collapsible>

        <div className="border-t border-border/40" />

        {/* Filter by Heritage Region - Collapsible */}
        <Collapsible defaultOpen>
          <CollapsibleTrigger className="flex items-center justify-between w-full p-3 rounded-lg hover:bg-muted/50 transition-colors group">
            <span className="text-sm font-medium text-foreground">Filter by Heritage Region</span>
            <div className="flex items-center gap-1.5">
              {filters.regions.length > 0 && (
                <Badge variant="secondary" className="h-5 px-1.5 text-xs">
                  {filters.regions.length}
                </Badge>
              )}
              <ChevronDown className="h-4 w-4 text-muted-foreground transition-transform group-data-[state=open]:rotate-180" />
            </div>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <div className="px-1 pb-2 space-y-1">
              {HERITAGE_REGIONS.map((region) => (
                <div
                  key={region.id}
                  className={cn(
                    'flex items-center space-x-2 p-2 rounded-lg transition-colors cursor-pointer',
                    filters.regions.includes(region.id) ? 'bg-primary/10' : 'hover:bg-muted/50'
                  )}
                  onClick={() => handleRegionToggle(region.id)}
                >
                  <Checkbox
                    checked={filters.regions.includes(region.id)}
                    id={region.id}
                  />
                  <Label htmlFor={region.id} className="flex items-center gap-2 text-sm cursor-pointer">
                    <Globe className="h-4 w-4 text-muted-foreground" />
                    {region.label}
                  </Label>
                </div>
              ))}
            </div>
          </CollapsibleContent>
        </Collapsible>

        <div className="border-t border-border/40" />

        {/* Your Activity - Collapsible */}
        <Collapsible defaultOpen>
          <CollapsibleTrigger className="flex items-center justify-between w-full p-3 rounded-lg hover:bg-muted/50 transition-colors group">
            <span className="text-sm font-medium text-foreground">Your Activity</span>
            <ChevronDown className="h-4 w-4 text-muted-foreground transition-transform group-data-[state=open]:rotate-180" />
          </CollapsibleTrigger>
          <CollapsibleContent>
            <div className="px-1 pb-2 space-y-1">
              <div
                className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/50 cursor-pointer transition-colors"
                onClick={() => handleActivityClick('profile_views')}
              >
                <div className="flex items-center gap-2">
                  <Eye className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">Profile views this week</span>
                </div>
                <Badge variant="secondary" className="font-semibold">
                  {activitySummary?.profileViews ?? 0}
                </Badge>
              </div>

              <div
                className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/50 cursor-pointer transition-colors"
                onClick={() => handleActivityClick('pending_requests')}
              >
                <div className="flex items-center gap-2">
                  <UserPlus className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">Pending requests</span>
                </div>
                <Badge
                  variant={networkStats?.pendingRequests ? 'default' : 'secondary'}
                  className="font-semibold"
                >
                  {networkStats?.pendingRequests ?? 0}
                </Badge>
              </div>

              <div
                className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/50 cursor-pointer transition-colors"
                onClick={() => handleActivityClick('notifications')}
              >
                <div className="flex items-center gap-2">
                  <Bell className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">New match notifications</span>
                </div>
                <Badge variant="secondary" className="font-semibold">
                  {activitySummary?.newMatches ?? 0}
                </Badge>
              </div>
            </div>
          </CollapsibleContent>
        </Collapsible>

        <div className="border-t border-border/40" />

        {/* Connection Strength - Collapsible */}
        <Collapsible>
          <CollapsibleTrigger className="flex items-center justify-between w-full p-3 rounded-lg hover:bg-muted/50 transition-colors group">
            <span className="text-sm font-medium text-foreground">Connection Strength</span>
            <ChevronDown className="h-4 w-4 text-muted-foreground transition-transform group-data-[state=open]:rotate-180" />
          </CollapsibleTrigger>
          <CollapsibleContent>
            <div className="px-1 pb-2 space-y-2">
              <div className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/50 cursor-pointer transition-colors"
                onClick={handleViewNetwork}
              >
                <div className="flex items-center gap-2">
                  <Zap className="h-4 w-4 text-amber-500" />
                  <span className="text-sm">Active connections</span>
                </div>
                <span className="text-xs text-muted-foreground">Messaged recently</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/50 cursor-pointer transition-colors"
                onClick={handleViewNetwork}
              >
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">Dormant connections</span>
                </div>
                <span className="text-xs text-muted-foreground">Reconnect</span>
              </div>
            </div>
          </CollapsibleContent>
        </Collapsible>
      </div>
    </ScrollArea>
    </div>
  );
}

export default NetworkPanel;
