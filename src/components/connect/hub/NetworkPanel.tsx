import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  Search,
  Users,
  TrendingUp,
  TrendingDown,
  Eye,
  UserPlus,
  Bell,
  Calendar,
  Handshake,
  Lightbulb,
  FileText,
  ChevronRight,
  HelpCircle,
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';
import { logger } from '@/lib/logger';
import { CulturalPattern } from '@/components/shared/CulturalPattern';

interface NetworkPanelProps {
  onFilterChange?: (filters: FilterState) => void;
  onSearchChange?: (query: string) => void;
  className?: string;
}

export interface FilterState {
  cEngagement: 'all' | 'convene' | 'collaborate' | 'contribute' | 'convey';
  regions: string[];
  diasporaLocations: string[];
}

// CRITICAL: Values must match EXACTLY what's stored in profiles.regional_expertise
// The DB stores display-friendly values like "West Africa", NOT snake_case
const HERITAGE_REGIONS = [
  { id: 'West Africa', label: 'West Africa' },
  { id: 'East Africa', label: 'East Africa' },
  { id: 'North Africa', label: 'North Africa' },
  { id: 'Central Africa', label: 'Central Africa' },
  { id: 'Southern Africa', label: 'Southern Africa' },
];

// NOTE: The DB currently only stores "African Diaspora" as a single value
// These are UI-friendly display options that map to it
// Future: If DB is updated with specific diaspora locations, update these mappings
const DIASPORA_LOCATIONS = [
  { id: 'African Diaspora', label: 'African Diaspora' },
];

const C_ENGAGEMENT_OPTIONS = [
  { id: 'all', label: 'All Members', icon: Users },
  { id: 'convene', label: 'Attending Your Events', icon: Calendar },
  { id: 'collaborate', label: 'In Your Projects', icon: Handshake },
  { id: 'contribute', label: 'Shared Opportunities', icon: Lightbulb },
  { id: 'convey', label: 'Engaged Your Content', icon: FileText },
];

/**
 * NetworkPanel - Left column of CONNECT hub
 *
 * PRD Components:
 * 1. Network Stats Card - Total connections with week-over-week change
 * 2. Search Network Input - Quick search existing connections
 * 3. Filter by C Engagement - Radio buttons for Five C's activity
 * 4. Filter by Region - Checkboxes for heritage/diaspora regions
 * 5. Your Activity Summary - Profile views, pending requests, notifications
 */
export function NetworkPanel({
  onFilterChange,
  onSearchChange,
  className,
}: NetworkPanelProps) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [networkSearch, setNetworkSearch] = useState('');
  const [filters, setFilters] = useState<FilterState>({
    cEngagement: 'all',
    regions: [],
    diasporaLocations: [],
  });

  // Fetch network stats with robust error handling
  const { data: networkStats } = useQuery({
    queryKey: ['network-stats', user?.id],
    queryFn: async () => {
      if (!user) return { total: 0, weeklyChange: 0, pendingRequests: 0 };

      try {
        // Get total connections using correct column names
        const { count: totalConnections, error: totalError } = await supabase
          .from('connections')
          .select('id', { count: 'exact' })
          .eq('status', 'accepted')
          .or(`requester_id.eq.${user.id},recipient_id.eq.${user.id}`);

        if (totalError) {
          logger.warn('NetworkPanel', 'Failed to fetch total connections:', totalError);
        }

        // Get connections from last week (for trend)
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);

        const { count: newThisWeek, error: weekError } = await supabase
          .from('connections')
          .select('id', { count: 'exact' })
          .eq('status', 'accepted')
          .or(`requester_id.eq.${user.id},recipient_id.eq.${user.id}`)
          .gte('updated_at', weekAgo.toISOString());

        if (weekError) {
          logger.warn('NetworkPanel', 'Failed to fetch weekly connections:', weekError);
        }

        // Get pending requests using correct column name
        const { count: pendingRequests, error: pendingError } = await supabase
          .from('connections')
          .select('id', { count: 'exact' })
          .eq('status', 'pending')
          .eq('recipient_id', user.id);

        if (pendingError) {
          logger.warn('NetworkPanel', 'Failed to fetch pending requests:', pendingError);
        }

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
    retryDelay: 1000,
  });

  // Fetch activity summary with robust error handling
  const { data: activitySummary } = useQuery({
    queryKey: ['activity-summary', user?.id],
    queryFn: async () => {
      if (!user) return { profileViews: 0, newMatches: 0 };

      try {
        // Get profile views this week
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);

        const { count: profileViews, error } = await supabase
          .from('profile_views')
          .select('id', { count: 'exact' })
          .eq('profile_id', user.id)
          .gte('viewed_at', weekAgo.toISOString());

        if (error) {
          logger.warn('NetworkPanel', 'Failed to fetch profile views:', error);
        }

        // Get new match notifications (simplified - would need notifications table)
        const newMatches = 0; // Placeholder

        return {
          profileViews: profileViews || 0,
          newMatches,
        };
      } catch (error) {
        logger.warn('NetworkPanel', 'Error fetching activity summary:', error);
        return { profileViews: 0, newMatches: 0 };
      }
    },
    enabled: !!user,
    staleTime: 60000,
    retry: 2,
    retryDelay: 1000,
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

  const handleDiasporaToggle = (locationId: string) => {
    const updated = filters.diasporaLocations.includes(locationId)
      ? filters.diasporaLocations.filter((l) => l !== locationId)
      : [...filters.diasporaLocations, locationId];
    handleFilterChange({ diasporaLocations: updated });
  };

  const activeFilterCount =
    (filters.cEngagement !== 'all' ? 1 : 0) +
    filters.regions.length +
    filters.diasporaLocations.length;

  return (
    <ScrollArea className={cn('h-full', className)}>
      <div className="p-4 space-y-4">
        {/* Network Stats Card */}
        <Card className="relative overflow-hidden bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
          <CulturalPattern pattern="kente" opacity={0.08} />
          <CardContent className="relative p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-primary/10">
                  <Users className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">
                    Your Network
                  </p>
                  <p className="text-2xl font-bold text-foreground">
                    {networkStats?.total ?? '—'}
                  </p>
                </div>
              </div>

              {/* Weekly change indicator */}
              {networkStats?.weeklyChange !== undefined && networkStats.weeklyChange > 0 && (
                <div className="flex items-center gap-1 text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full">
                  <TrendingUp className="h-3 w-3" />
                  <span className="text-xs font-medium">+{networkStats.weeklyChange}</span>
                </div>
              )}
            </div>

            <Button
              variant="ghost"
              size="sm"
              className="w-full justify-between text-muted-foreground hover:text-foreground"
              onClick={() => navigate('/dna/connect/network')}
            >
              <span>View full network</span>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </CardContent>
        </Card>

        {/* Search Network */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search your connections..."
            value={networkSearch}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="pl-9 bg-muted/50"
          />
        </div>

        {/* Filter by C Engagement */}
        <Card>
          <CardHeader className="p-3 pb-2">
            <CardTitle className="text-sm font-medium flex items-center justify-between">
              <span>Filter by Engagement</span>
              {activeFilterCount > 0 && (
                <Badge variant="secondary" className="h-5 px-1.5 text-xs">
                  {activeFilterCount}
                </Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-3 pt-0">
            <RadioGroup
              value={filters.cEngagement}
              onValueChange={(value) =>
                handleFilterChange({
                  cEngagement: value as FilterState['cEngagement'],
                })
              }
              className="space-y-2"
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
          </CardContent>
        </Card>

        {/* Filter by Region */}
        <Card>
          <CardHeader className="p-3 pb-2">
            <CardTitle className="text-sm font-medium">Heritage Regions</CardTitle>
          </CardHeader>
          <CardContent className="p-3 pt-0 space-y-2">
            {HERITAGE_REGIONS.map((region) => (
              <div
                key={region.id}
                className={cn(
                  'flex items-center space-x-2 p-2 rounded-lg transition-colors cursor-pointer',
                  filters.regions.includes(region.id) ? 'bg-dna-terra/10' : 'hover:bg-muted/50'
                )}
                onClick={() => handleRegionToggle(region.id)}
              >
                <Checkbox
                  checked={filters.regions.includes(region.id)}
                  id={region.id}
                />
                <Label htmlFor={region.id} className="text-sm cursor-pointer">
                  {region.label}
                </Label>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Filter by Diaspora Location */}
        <Card>
          <CardHeader className="p-3 pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-1">
              <span>Diaspora Locations</span>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <HelpCircle className="h-3.5 w-3.5 text-muted-foreground cursor-help" />
                  </TooltipTrigger>
                  <TooltipContent side="right" className="max-w-[200px]">
                    <p className="text-xs">Filter by members who identify as part of the African Diaspora living outside the continent.</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-3 pt-0 space-y-2">
            {DIASPORA_LOCATIONS.map((location) => (
              <div
                key={location.id}
                className={cn(
                  'flex items-center space-x-2 p-2 rounded-lg transition-colors cursor-pointer',
                  filters.diasporaLocations.includes(location.id)
                    ? 'bg-dna-ochre/10'
                    : 'hover:bg-muted/50'
                )}
                onClick={() => handleDiasporaToggle(location.id)}
              >
                <Checkbox
                  checked={filters.diasporaLocations.includes(location.id)}
                  id={location.id}
                />
                <Label htmlFor={location.id} className="text-sm cursor-pointer">
                  {location.label}
                </Label>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Activity Summary */}
        <Card className="bg-muted/30">
          <CardHeader className="p-3 pb-2">
            <CardTitle className="text-sm font-medium">Your Activity</CardTitle>
          </CardHeader>
          <CardContent className="p-3 pt-0">
            <div className="space-y-1">
              {/* Profile Views */}
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div 
                      className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/50 cursor-pointer transition-colors"
                      onClick={() => navigate('/dna/settings/profile')}
                    >
                      <div className="flex items-center gap-2">
                        <Eye className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">Profile views this week</span>
                      </div>
                      <Badge variant="secondary" className="font-semibold">
                        {activitySummary?.profileViews ?? 0}
                      </Badge>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent side="right">
                    <p className="text-xs">Click to view your profile settings</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>

              {/* Pending Requests */}
              <div 
                className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/50 cursor-pointer transition-colors"
                onClick={() => navigate('/dna/connect/network?tab=requests')}
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

              {/* New Match Notifications */}
              <div 
                className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/50 cursor-pointer transition-colors"
                onClick={() => navigate('/dna/notifications')}
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
          </CardContent>
        </Card>
      </div>
    </ScrollArea>
  );
}

export default NetworkPanel;
