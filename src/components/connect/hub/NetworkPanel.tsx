import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
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
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';

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

const HERITAGE_REGIONS = [
  { id: 'west_africa', label: 'West Africa' },
  { id: 'east_africa', label: 'East Africa' },
  { id: 'north_africa', label: 'North Africa' },
  { id: 'central_africa', label: 'Central Africa' },
  { id: 'southern_africa', label: 'Southern Africa' },
];

const DIASPORA_LOCATIONS = [
  { id: 'north_america', label: 'North America' },
  { id: 'europe', label: 'Europe' },
  { id: 'caribbean', label: 'Caribbean' },
  { id: 'south_america', label: 'South America' },
  { id: 'asia_pacific', label: 'Asia Pacific' },
  { id: 'middle_east', label: 'Middle East' },
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
  const { user } = useAuth();
  const [networkSearch, setNetworkSearch] = useState('');
  const [filters, setFilters] = useState<FilterState>({
    cEngagement: 'all',
    regions: [],
    diasporaLocations: [],
  });

  // Fetch network stats
  const { data: networkStats } = useQuery({
    queryKey: ['network-stats', user?.id],
    queryFn: async () => {
      if (!user) return null;

      // Get total connections using correct column names
      const { count: totalConnections } = await supabase
        .from('connections')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'accepted')
        .or(`requester_id.eq.${user.id},recipient_id.eq.${user.id}`);

      // Get connections from last week (for trend)
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);

      const { count: newThisWeek } = await supabase
        .from('connections')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'accepted')
        .or(`requester_id.eq.${user.id},recipient_id.eq.${user.id}`)
        .gte('updated_at', weekAgo.toISOString());

      // Get pending requests using correct column name
      const { count: pendingRequests } = await supabase
        .from('connections')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'pending')
        .eq('recipient_id', user.id);

      return {
        total: totalConnections || 0,
        weeklyChange: newThisWeek || 0,
        pendingRequests: pendingRequests || 0,
      };
    },
    enabled: !!user,
    staleTime: 60000,
  });

  // Fetch activity summary
  const { data: activitySummary } = useQuery({
    queryKey: ['activity-summary', user?.id],
    queryFn: async () => {
      if (!user) return null;

      // Get profile views this week
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);

      const { count: profileViews } = await supabase
        .from('profile_views')
        .select('*', { count: 'exact', head: true })
        .eq('profile_id', user.id)
        .gte('viewed_at', weekAgo.toISOString());

      // Get new match notifications (simplified - would need notifications table)
      const newMatches = 0; // Placeholder

      return {
        profileViews: profileViews || 0,
        newMatches,
      };
    },
    enabled: !!user,
    staleTime: 60000,
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
        <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
          <CardContent className="p-4">
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
            <CardTitle className="text-sm font-medium">Diaspora Locations</CardTitle>
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
            <div className="space-y-3">
              {/* Profile Views */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Eye className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">Profile views this week</span>
                </div>
                <Badge variant="secondary" className="font-semibold">
                  {activitySummary?.profileViews ?? 0}
                </Badge>
              </div>

              {/* Pending Requests */}
              <div className="flex items-center justify-between">
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
              <div className="flex items-center justify-between">
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
