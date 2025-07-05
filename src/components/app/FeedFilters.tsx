import React from 'react';
import { Button } from '@/components/ui/button';
import { Users, Handshake, Heart, Filter } from 'lucide-react';

interface FeedFiltersProps {
  activeFilter: 'all' | 'connect' | 'collaborate' | 'contribute';
  onFilterChange: (filter: 'all' | 'connect' | 'collaborate' | 'contribute') => void;
}

const FeedFilters = ({ activeFilter, onFilterChange }: FeedFiltersProps) => {
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

  return (
    <div className="flex flex-wrap gap-2 p-4 bg-white rounded-lg border mb-4">
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
  );
};

export default FeedFilters;