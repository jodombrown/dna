
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { EnhancedCard } from '@/components/ui/enhanced-card';
import { EnhancedButton } from '@/components/ui/enhanced-button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Search, Filter, X, Users, Building, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';

interface EnhancedSearchSectionProps {
  searchTerm: string;
  onSearchChange: (term: string) => void;
  onSearch: () => void;
  onClearSearch: () => void;
  loading: boolean;
  filters: any;
  onFiltersChange: (filters: any) => void;
  resultCounts: {
    professionals: number;
    communities: number;
    events: number;
  };
}

const EnhancedSearchSection: React.FC<EnhancedSearchSectionProps> = ({
  searchTerm,
  onSearchChange,
  onSearch,
  onClearSearch,
  loading,
  filters,
  onFiltersChange,
  resultCounts
}) => {
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const hasActiveFilters = Object.values(filters).some((filterGroup: any) => 
    Array.isArray(filterGroup) ? filterGroup.length > 0 : false
  );

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      onSearch();
    }
  };

  const clearAllFilters = () => {
    onFiltersChange({
      skills: [],
      industries: [],
      locations: [],
      experience_levels: [],
      categories: [],
      event_types: []
    });
  };

  const totalResults = resultCounts.professionals + resultCounts.communities + resultCounts.events;

  return (
    <div className="space-y-6 mb-8">
      {/* Main Search Card */}
      <EnhancedCard hover className="overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-gray-50 to-white border-b">
          <CardTitle className="flex items-center gap-2 text-gray-900">
            <Search className="w-5 h-5 text-dna-emerald" />
            Discover Your Network
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Input
                placeholder="Search professionals, communities, events..."
                value={searchTerm}
                onChange={(e) => onSearchChange(e.target.value)}
                onKeyPress={handleKeyPress}
                className="pl-10 h-12 text-base border-2 border-gray-200 focus:border-dna-emerald focus:ring-0"
                disabled={loading}
              />
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              {searchTerm && (
                <button
                  onClick={() => {
                    onSearchChange('');
                    onClearSearch();
                  }}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
            
            <div className="flex gap-2">
              <Sheet open={isFilterOpen} onOpenChange={setIsFilterOpen}>
                <SheetTrigger asChild>
                  <EnhancedButton 
                    variant="outline" 
                    className="h-12 px-6 border-2"
                    disabled={loading}
                  >
                    <Filter className="w-4 h-4 mr-2" />
                    Filters
                    {hasActiveFilters && (
                      <Badge className="ml-2 bg-dna-emerald text-white">
                        Active
                      </Badge>
                    )}
                  </EnhancedButton>
                </SheetTrigger>
                <SheetContent className="w-[400px] sm:w-[540px]">
                  <SheetHeader>
                    <SheetTitle>Advanced Filters</SheetTitle>
                    <SheetDescription>
                      Refine your search to find exactly who you're looking for
                    </SheetDescription>
                  </SheetHeader>
                  <div className="mt-6 space-y-6">
                    {hasActiveFilters && (
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Active Filters</span>
                        <Button variant="ghost" size="sm" onClick={clearAllFilters}>
                          Clear All
                        </Button>
                      </div>
                    )}
                    
                    {/* Professional Filters */}
                    <div className="space-y-3">
                      <h4 className="font-medium text-gray-900">Professional Focus</h4>
                      <div className="grid grid-cols-2 gap-2">
                        {['Technology', 'Finance', 'Healthcare', 'Education', 'Agriculture', 'Creative Arts'].map((skill) => (
                          <div key={skill} className="flex items-center space-x-2">
                            <Checkbox 
                              id={skill}
                              checked={filters.skills?.includes(skill)}
                              onCheckedChange={(checked) => {
                                const newSkills = checked 
                                  ? [...(filters.skills || []), skill]
                                  : (filters.skills || []).filter((s: string) => s !== skill);
                                onFiltersChange({ ...filters, skills: newSkills });
                              }}
                            />
                            <label 
                              htmlFor={skill} 
                              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                            >
                              {skill}
                            </label>
                          </div>
                        ))}
                      </div>
                    </div>

                    <Separator />

                    {/* Location Filters */}
                    <div className="space-y-3">
                      <h4 className="font-medium text-gray-900">Location</h4>
                      <div className="grid grid-cols-2 gap-2">
                        {['Lagos', 'Nairobi', 'Cape Town', 'Accra', 'London', 'New York'].map((location) => (
                          <div key={location} className="flex items-center space-x-2">
                            <Checkbox 
                              id={location}
                              checked={filters.locations?.includes(location)}
                              onCheckedChange={(checked) => {
                                const newLocations = checked 
                                  ? [...(filters.locations || []), location]
                                  : (filters.locations || []).filter((l: string) => l !== location);
                                onFiltersChange({ ...filters, locations: newLocations });
                              }}
                            />
                            <label 
                              htmlFor={location} 
                              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                            >
                              {location}
                            </label>
                          </div>
                        ))}
                      </div>
                    </div>

                    <Separator />

                    {/* Experience Level */}
                    <div className="space-y-3">
                      <h4 className="font-medium text-gray-900">Experience Level</h4>
                      <div className="space-y-2">
                        {['Entry Level', 'Mid Level', 'Senior Level', 'Executive'].map((level) => (
                          <div key={level} className="flex items-center space-x-2">
                            <Checkbox 
                              id={level}
                              checked={filters.experience_levels?.includes(level)}
                              onCheckedChange={(checked) => {
                                const newLevels = checked 
                                  ? [...(filters.experience_levels || []), level]
                                  : (filters.experience_levels || []).filter((l: string) => l !== level);
                                onFiltersChange({ ...filters, experience_levels: newLevels });
                              }}
                            />
                            <label 
                              htmlFor={level} 
                              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                            >
                              {level}
                            </label>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </SheetContent>
              </Sheet>

              <EnhancedButton
                onClick={onSearch}
                className="h-12 px-8"
                disabled={loading}
              >
                {loading ? 'Searching...' : 'Search'}
              </EnhancedButton>
            </div>
          </div>
        </CardContent>
      </EnhancedCard>

      {/* Results Summary */}
      {(searchTerm || hasActiveFilters) && (
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white rounded-lg border p-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm text-gray-600">
              {totalResults > 0 ? `Found ${totalResults} results` : 'No results found'}
              {searchTerm && ` for "${searchTerm}"`}
            </span>
            {hasActiveFilters && (
              <Badge variant="outline" className="text-xs">
                Filtered Results
              </Badge>
            )}
          </div>
          
          <div className="flex items-center gap-4 text-sm text-gray-500">
            <div className="flex items-center gap-1">
              <Users className="w-4 h-4" />
              <span>{resultCounts.professionals}</span>
            </div>
            <div className="flex items-center gap-1">
              <Building className="w-4 h-4" />
              <span>{resultCounts.communities}</span>
            </div>
            <div className="flex items-center gap-1">
              <Calendar className="w-4 h-4" />
              <span>{resultCounts.events}</span>
            </div>
          </div>
        </div>
      )}

      {/* Active Filters Display */}
      {hasActiveFilters && (
        <div className="flex flex-wrap gap-2">
          {Object.entries(filters).map(([key, values]) => 
            Array.isArray(values) && values.length > 0 && values.map((value: any) => (
              <Badge 
                key={`${key}-${value}`} 
                variant="secondary" 
                className="pl-3 pr-2 py-1 bg-dna-emerald/10 text-dna-emerald border-dna-emerald/20 hover:bg-dna-emerald/20 transition-colors"
              >
                {value}
                <button
                  onClick={() => {
                    const newValues = values.filter((v: any) => v !== value);
                    onFiltersChange({ ...filters, [key]: newValues });
                  }}
                  className="ml-2 hover:bg-dna-emerald/30 rounded-full p-0.5 transition-colors"
                >
                  <X className="w-3 h-3" />
                </button>
              </Badge>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default EnhancedSearchSection;
