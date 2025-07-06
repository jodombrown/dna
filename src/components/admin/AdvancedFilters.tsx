import React from 'react';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Calendar } from '@/components/ui/calendar';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Filter, 
  X, 
  Calendar as CalendarIcon,
  Users,
  Clock
} from 'lucide-react';

interface FilterState {
  status: string[];
  joinedAfter: Date | null;
  joinedBefore: Date | null;
  hasActivity: boolean | null;
  onboardingStatus: string | null;
  minPosts: number | null;
  maxPosts: number | null;
}

interface AdvancedFiltersProps {
  filters: FilterState;
  onFiltersChange: (filters: FilterState) => void;
  onClearFilters: () => void;
  activeFilterCount: number;
}

export function AdvancedFilters({
  filters,
  onFiltersChange,
  onClearFilters,
  activeFilterCount
}: AdvancedFiltersProps) {
  const updateFilter = (key: keyof FilterState, value: any) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  const toggleStatus = (status: string) => {
    const newStatuses = filters.status.includes(status)
      ? filters.status.filter(s => s !== status)
      : [...filters.status, status];
    updateFilter('status', newStatuses);
  };

  return (
    <div className="flex items-center space-x-2">
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline" size="sm" className="relative">
            <Filter className="w-4 h-4 mr-2" />
            Advanced Filters
            {activeFilterCount > 0 && (
              <Badge className="ml-2 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs">
                {activeFilterCount}
              </Badge>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-80 p-4" align="end">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-medium">Filter Users</h4>
              {activeFilterCount > 0 && (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={onClearFilters}
                  className="h-8 px-2"
                >
                  <X className="w-4 h-4 mr-1" />
                  Clear All
                </Button>
              )}
            </div>
            
            <Separator />

            {/* Status Filter */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Status</Label>
              <div className="flex flex-wrap gap-2">
                {['active', 'pending', 'suspended'].map((status) => (
                  <Button
                    key={status}
                    variant={filters.status.includes(status) ? "default" : "outline"}
                    size="sm"
                    onClick={() => toggleStatus(status)}
                    className="capitalize"
                  >
                    {status}
                  </Button>
                ))}
              </div>
            </div>

            <Separator />

            {/* Join Date Range */}
            <div className="space-y-2">
              <Label className="text-sm font-medium flex items-center">
                <CalendarIcon className="w-4 h-4 mr-1" />
                Joined Date Range
              </Label>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label className="text-xs text-gray-500">After</Label>
                  <Input
                    type="date"
                    value={filters.joinedAfter?.toISOString().split('T')[0] || ''}
                    onChange={(e) => updateFilter('joinedAfter', e.target.value ? new Date(e.target.value) : null)}
                    className="text-xs"
                  />
                </div>
                <div>
                  <Label className="text-xs text-gray-500">Before</Label>
                  <Input
                    type="date"
                    value={filters.joinedBefore?.toISOString().split('T')[0] || ''}
                    onChange={(e) => updateFilter('joinedBefore', e.target.value ? new Date(e.target.value) : null)}
                    className="text-xs"
                  />
                </div>
              </div>
            </div>

            <Separator />

            {/* Activity Filter */}
            <div className="space-y-2">
              <Label className="text-sm font-medium flex items-center">
                <Clock className="w-4 h-4 mr-1" />
                Activity Status
              </Label>
              <Select 
                value={filters.hasActivity?.toString() || 'all'} 
                onValueChange={(value) => updateFilter('hasActivity', value === 'all' ? null : value === 'true')}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select activity status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Users</SelectItem>
                  <SelectItem value="true">Has Recent Activity</SelectItem>
                  <SelectItem value="false">No Recent Activity</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Separator />

            {/* Onboarding Status */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Onboarding Status</Label>
              <Select 
                value={filters.onboardingStatus || 'all'} 
                onValueChange={(value) => updateFilter('onboardingStatus', value === 'all' ? null : value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select onboarding status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Users</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Separator />

            {/* Post Count Range */}
            <div className="space-y-2">
              <Label className="text-sm font-medium flex items-center">
                <Users className="w-4 h-4 mr-1" />
                Post Count
              </Label>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label className="text-xs text-gray-500">Min</Label>
                  <Input
                    type="number"
                    min="0"
                    value={filters.minPosts?.toString() || ''}
                    onChange={(e) => updateFilter('minPosts', e.target.value ? parseInt(e.target.value) : null)}
                    placeholder="0"
                    className="text-xs"
                  />
                </div>
                <div>
                  <Label className="text-xs text-gray-500">Max</Label>
                  <Input
                    type="number"
                    min="0"
                    value={filters.maxPosts?.toString() || ''}
                    onChange={(e) => updateFilter('maxPosts', e.target.value ? parseInt(e.target.value) : null)}
                    placeholder="∞"
                    className="text-xs"
                  />
                </div>
              </div>
            </div>
          </div>
        </PopoverContent>
      </Popover>

      {activeFilterCount > 0 && (
        <Button variant="ghost" size="sm" onClick={onClearFilters}>
          <X className="w-4 h-4 mr-1" />
          Clear Filters
        </Button>
      )}
    </div>
  );
}