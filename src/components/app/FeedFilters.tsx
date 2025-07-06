import React from 'react';
import { Button } from '@/components/ui/button';
import { Users, Handshake, Heart, Filter, MapPin } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface FeedFiltersProps {
  activeFilter: 'all' | 'connect' | 'collaborate' | 'contribute';
  onFilterChange: (filter: 'all' | 'connect' | 'collaborate' | 'contribute') => void;
  activeRegion: string;
  onRegionChange: (region: string) => void;
}

const FeedFilters = ({ activeFilter, onFilterChange, activeRegion, onRegionChange }: FeedFiltersProps) => {
  const filters = [
    {
      key: 'all' as const,
      label: 'All Posts',
      icon: Filter,
      count: null // Would show post count in real implementation
    },
    {
      key: 'connect' as const,
      label: 'Connect',
      icon: Users,
      className: 'text-dna-emerald border-dna-emerald hover:bg-dna-emerald/10',
      activeClassName: 'bg-dna-emerald text-white hover:bg-dna-emerald/90'
    },
    {
      key: 'collaborate' as const,
      label: 'Collaborate',
      icon: Handshake,
      className: 'text-dna-copper border-dna-copper hover:bg-dna-copper/10',
      activeClassName: 'bg-dna-copper text-white hover:bg-dna-copper/90'
    },
    {
      key: 'contribute' as const,
      label: 'Contribute',
      icon: Heart,
      className: 'text-dna-forest border-dna-forest hover:bg-dna-forest/10',
      activeClassName: 'bg-dna-forest text-white hover:bg-dna-forest/90'
    }
  ];

  const regions = [
    { value: 'all', label: 'Global' },
    { value: 'west-africa', label: 'West Africa' },
    { value: 'east-africa', label: 'East Africa' },
    { value: 'southern-africa', label: 'Southern Africa' },
    { value: 'north-africa', label: 'North Africa' },
    { value: 'diaspora-us', label: 'US Diaspora' },
    { value: 'diaspora-uk', label: 'UK Diaspora' },
    { value: 'diaspora-canada', label: 'Canada Diaspora' },
    { value: 'diaspora-other', label: 'Other Diaspora' }
  ];

  return (
    <div className="bg-white rounded-lg border p-4 mb-4 space-y-4">
      {/* Pillar Filters */}
      <div className="flex flex-wrap gap-2">
        {filters.map((filter) => {
          const Icon = filter.icon;
          const isActive = activeFilter === filter.key;
          
          return (
            <Button
              key={filter.key}
              variant={isActive ? "default" : "outline"}
              size="sm"
              onClick={() => onFilterChange(filter.key)}
              className={
                isActive 
                  ? filter.activeClassName || 'bg-dna-emerald text-white hover:bg-dna-emerald/90'
                  : filter.className || 'hover:bg-gray-50'
              }
            >
              <Icon className="h-4 w-4 mr-2" />
              {filter.label}
              {filter.count && (
                <span className="ml-2 px-2 py-0.5 rounded-full bg-white/20 text-xs">
                  {filter.count}
                </span>
              )}
            </Button>
          );
        })}
      </div>

      {/* Region Filter */}
      <div className="flex items-center space-x-3">
        <div className="flex items-center space-x-2 text-sm text-gray-700">
          <MapPin className="h-4 w-4" />
          <span>Region:</span>
        </div>
        <Select value={activeRegion} onValueChange={onRegionChange}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Select region" />
          </SelectTrigger>
          <SelectContent>
            {regions.map((region) => (
              <SelectItem key={region.value} value={region.value}>
                {region.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};

export default FeedFilters;