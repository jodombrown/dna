import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { X } from 'lucide-react';

export interface FilterState {
  type: string[];
  skills: string[];
  causes: string[];
  sort: string;
}

interface OpportunityFiltersProps {
  filters: FilterState;
  onChange: (filters: FilterState) => void;
  availableSkills: { id: string; name: string }[];
  availableCauses: { id: string; name: string }[];
}

const OpportunityFilters: React.FC<OpportunityFiltersProps> = ({
  filters,
  onChange,
  availableSkills,
  availableCauses,
}) => {
  const types = ['investment', 'volunteer', 'partnership', 'donation'];
  
  const toggleFilter = (category: keyof FilterState, value: string) => {
    if (category === 'sort') {
      onChange({ ...filters, sort: value });
      return;
    }

    const currentValues = filters[category] as string[];
    const newValues = currentValues.includes(value)
      ? currentValues.filter((v) => v !== value)
      : [...currentValues, value];
    onChange({ ...filters, [category]: newValues });
  };

  const clearFilters = () => {
    onChange({
      type: [],
      skills: [],
      causes: [],
      sort: 'newest',
    });
  };

  const hasActiveFilters = 
    filters.type.length > 0 || 
    filters.skills.length > 0 || 
    filters.causes.length > 0;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold">Filters</h3>
        {hasActiveFilters && (
          <Button variant="ghost" size="sm" onClick={clearFilters}>
            Clear all
          </Button>
        )}
      </div>

      {/* Sort */}
      <div>
        <label className="text-sm font-medium mb-2 block">Sort by</label>
        <Select value={filters.sort} onValueChange={(value) => toggleFilter('sort', value)}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="newest">Newest</SelectItem>
            <SelectItem value="oldest">Oldest</SelectItem>
            <SelectItem value="relevant">Most Relevant</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Type */}
      <div>
        <label className="text-sm font-medium mb-2 block">Type</label>
        <div className="flex flex-wrap gap-2">
          {types.map((type) => (
            <Badge
              key={type}
              variant={filters.type.includes(type) ? 'default' : 'outline'}
              className="cursor-pointer capitalize"
              onClick={() => toggleFilter('type', type)}
            >
              {type}
            </Badge>
          ))}
        </div>
      </div>

      {/* Skills */}
      {availableSkills.length > 0 && (
        <div>
          <label className="text-sm font-medium mb-2 block">Skills</label>
          <Select onValueChange={(value) => toggleFilter('skills', value)}>
            <SelectTrigger>
              <SelectValue placeholder="Add skill filter" />
            </SelectTrigger>
            <SelectContent className="max-h-60">
              {availableSkills
                .filter((skill) => !filters.skills.includes(skill.id))
                .map((skill) => (
                  <SelectItem key={skill.id} value={skill.id}>
                    {skill.name}
                  </SelectItem>
                ))}
            </SelectContent>
          </Select>
          {filters.skills.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {filters.skills.map((skillId) => {
                const skill = availableSkills.find((s) => s.id === skillId);
                return skill ? (
                  <Badge key={skillId} variant="secondary" className="cursor-pointer">
                    {skill.name}
                    <X
                      className="ml-1 h-3 w-3"
                      onClick={() => toggleFilter('skills', skillId)}
                    />
                  </Badge>
                ) : null;
              })}
            </div>
          )}
        </div>
      )}

      {/* Causes */}
      {availableCauses.length > 0 && (
        <div>
          <label className="text-sm font-medium mb-2 block">Impact Areas</label>
          <div className="flex flex-wrap gap-2">
            {availableCauses.map((cause) => (
              <Badge
                key={cause.id}
                variant={filters.causes.includes(cause.id) ? 'default' : 'outline'}
                className="cursor-pointer"
                onClick={() => toggleFilter('causes', cause.id)}
              >
                {cause.name}
              </Badge>
            ))}
          </div>
        </div>
      )}

      {/* Active Filter Chips */}
      {hasActiveFilters && (
        <div className="pt-4 border-t">
          <label className="text-sm font-medium mb-2 block">Active Filters</label>
          <div className="flex flex-wrap gap-2">
            {filters.type.map((type) => (
              <Badge key={type} className="capitalize cursor-pointer">
                {type}
                <X
                  className="ml-1 h-3 w-3"
                  onClick={() => toggleFilter('type', type)}
                />
              </Badge>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default OpportunityFilters;
