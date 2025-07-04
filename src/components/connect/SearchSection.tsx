
import React from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Loader2, X, Filter } from 'lucide-react';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface SearchSectionProps {
  searchTerm: string;
  onSearchChange: (term: string) => void;
  onSearch: () => void;
  onClearSearch: () => void;
  loading: boolean;
  filters?: {
    location: string;
    skills: string[];
    isMentor: boolean;
    isInvestor: boolean;
    lookingForOpportunities: boolean;
  };
  onFiltersChange?: (filters: any) => void;
  resultCounts?: {
    professionals: number;
    communities: number;
    events: number;
  };
}

const SKILL_OPTIONS = [
  'Technology', 'Finance', 'Healthcare', 'Agriculture', 'Education',
  'Energy', 'Creative', 'Marketing', 'Consulting', 'Legal'
];

const LOCATION_OPTIONS = [
  'Nigeria', 'Ghana', 'Kenya', 'South Africa', 'Morocco', 'Egypt',
  'United States', 'United Kingdom', 'Canada', 'France', 'Germany'
];

const SearchSection: React.FC<SearchSectionProps> = ({
  searchTerm,
  onSearchChange,
  onSearch,
  onClearSearch,
  loading,
  filters,
  onFiltersChange,
  resultCounts
}) => {
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      onSearch();
    }
  };

  const handleClearSearch = () => {
    onSearchChange('');
    onClearSearch();
  };

  const updateFilters = (key: string, value: any) => {
    if (onFiltersChange && filters) {
      onFiltersChange({
        ...filters,
        [key]: value
      });
    }
  };

  const toggleSkill = (skill: string) => {
    if (filters && onFiltersChange) {
      const currentSkills = filters.skills || [];
      const updatedSkills = currentSkills.includes(skill)
        ? currentSkills.filter(s => s !== skill)
        : [...currentSkills, skill];
      updateFilters('skills', updatedSkills);
    }
  };

  const clearAllFilters = () => {
    if (onFiltersChange) {
      onFiltersChange({
        location: '',
        skills: [],
        isMentor: false,
        isInvestor: false,
        lookingForOpportunities: false
      });
    }
  };

  const hasActiveFilters = filters && (
    filters.location || 
    filters.skills.length > 0 || 
    filters.isMentor || 
    filters.isInvestor || 
    filters.lookingForOpportunities
  );

  const activeFilterCount = filters ? [
    filters.location,
    ...(filters.skills || []),
    filters.isMentor && 'Mentor',
    filters.isInvestor && 'Investor',
    filters.lookingForOpportunities && 'Open to Opportunities'
  ].filter(Boolean).length : 0;

  return (
    <div className="mb-8 space-y-4">
      {/* Main Search Bar */}
      <div className="flex gap-4 max-w-4xl mx-auto">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            type="text"
            placeholder="Search professionals, communities, events..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            onKeyPress={handleKeyPress}
            className="pl-10 pr-10"
          />
          {searchTerm && (
            <button
              onClick={handleClearSearch}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
        
        <Button 
          onClick={onSearch} 
          disabled={loading}
          className="bg-dna-emerald hover:bg-dna-forest"
        >
          {loading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Search className="w-4 h-4" />
          )}
        </Button>

        {/* Advanced Filters */}
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" className="relative">
              <Filter className="w-4 h-4 mr-2" />
              Filters
              {activeFilterCount > 0 && (
                <Badge className="absolute -top-2 -right-2 bg-dna-emerald text-white text-xs min-w-5 h-5 flex items-center justify-center p-0">
                  {activeFilterCount}
                </Badge>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80 p-4">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-medium">Advanced Filters</h4>
                {hasActiveFilters && (
                  <Button variant="ghost" size="sm" onClick={clearAllFilters}>
                    Clear All
                  </Button>
                )}
              </div>

              {/* Location Filter */}
              <div>
                <label className="text-sm font-medium mb-2 block">Location</label>
                <Select 
                  value={filters?.location || ''} 
                  onValueChange={(value) => updateFilters('location', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select location..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Locations</SelectItem>
                    {LOCATION_OPTIONS.map(location => (
                      <SelectItem key={location} value={location}>
                        {location}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Skills Filter */}
              <div>
                <label className="text-sm font-medium mb-2 block">Skills</label>
                <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto">
                  {SKILL_OPTIONS.map(skill => (
                    <div key={skill} className="flex items-center space-x-2">
                      <Checkbox
                        id={skill}
                        checked={filters?.skills?.includes(skill) || false}
                        onCheckedChange={() => toggleSkill(skill)}
                      />
                      <label 
                        htmlFor={skill} 
                        className="text-sm cursor-pointer"
                      >
                        {skill}
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Professional Filters */}
              <div>
                <label className="text-sm font-medium mb-2 block">Professional Status</label>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="mentor"
                      checked={filters?.isMentor || false}
                      onCheckedChange={(checked) => updateFilters('isMentor', checked)}
                    />
                    <label htmlFor="mentor" className="text-sm cursor-pointer">
                      Available as Mentor
                    </label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="investor"
                      checked={filters?.isInvestor || false}
                      onCheckedChange={(checked) => updateFilters('isInvestor', checked)}
                    />
                    <label htmlFor="investor" className="text-sm cursor-pointer">
                      Active Investor
                    </label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="opportunities"
                      checked={filters?.lookingForOpportunities || false}
                      onCheckedChange={(checked) => updateFilters('lookingForOpportunities', checked)}
                    />
                    <label htmlFor="opportunities" className="text-sm cursor-pointer">
                      Open to Opportunities
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </PopoverContent>
        </Popover>
      </div>

      {/* Active Filters Display */}
      {hasActiveFilters && (
        <div className="flex flex-wrap gap-2 max-w-4xl mx-auto">
          <span className="text-sm text-gray-600">Active filters:</span>
          {filters?.location && (
            <Badge variant="secondary" className="flex items-center gap-1">
              📍 {filters.location}
              <button onClick={() => updateFilters('location', '')}>
                <X className="w-3 h-3" />
              </button>
            </Badge>
          )}
          {filters?.skills?.map(skill => (
            <Badge key={skill} variant="secondary" className="flex items-center gap-1">
              {skill}
              <button onClick={() => toggleSkill(skill)}>
                <X className="w-3 h-3" />
              </button>
            </Badge>
          ))}
          {filters?.isMentor && (
            <Badge variant="secondary" className="flex items-center gap-1">
              Mentor
              <button onClick={() => updateFilters('isMentor', false)}>
                <X className="w-3 h-3" />
              </button>
            </Badge>
          )}
          {filters?.isInvestor && (
            <Badge variant="secondary" className="flex items-center gap-1">
              Investor
              <button onClick={() => updateFilters('isInvestor', false)}>
                <X className="w-3 h-3" />
              </button>
            </Badge>
          )}
          {filters?.lookingForOpportunities && (
            <Badge variant="secondary" className="flex items-center gap-1">
              Open to Opportunities
              <button onClick={() => updateFilters('lookingForOpportunities', false)}>
                <X className="w-3 h-3" />
              </button>
            </Badge>
          )}
        </div>
      )}

      {/* Search Results Summary */}
      {(searchTerm || hasActiveFilters) && resultCounts && (
        <div className="text-center text-sm text-gray-600 max-w-4xl mx-auto">
          {searchTerm && (
            <span>
              Showing results for "<strong>{searchTerm}</strong>"
              {hasActiveFilters && " with filters applied"}
            </span>
          )}
          {!searchTerm && hasActiveFilters && (
            <span>Showing filtered results</span>
          )}
          <div className="mt-1">
            <span className="text-dna-emerald font-medium">
              {resultCounts.professionals} professionals
            </span>
            <span className="mx-2">•</span>
            <span className="text-dna-copper font-medium">
              {resultCounts.communities} communities
            </span>
            <span className="mx-2">•</span>
            <span className="text-dna-gold font-medium">
              {resultCounts.events} events
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchSection;
