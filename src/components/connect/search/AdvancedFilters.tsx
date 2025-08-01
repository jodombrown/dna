import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Filter, ChevronDown, ChevronUp, Search, MapPin } from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

const SKILL_OPTIONS = [
  'Technology', 'Finance', 'Healthcare', 'Agriculture', 'Education',
  'Energy', 'Creative', 'Marketing', 'Consulting', 'Legal'
];

const LOCATION_OPTIONS = [
  'London, UK', 'Toronto, Canada', 'Berlin, Germany', 'Paris, France', 
  'Dubai, UAE', 'San Francisco, USA', 'New York, USA', 'Lagos, Nigeria',
  'Accra, Ghana', 'Cape Town, South Africa', 'Nairobi, Kenya', 'Cairo, Egypt',
  'Casablanca, Morocco', 'Atlanta, USA', 'Houston, USA', 'Chicago, USA',
  'Washington DC, USA', 'Boston, USA', 'Los Angeles, USA'
];

const COUNTRIES = [
  'United Kingdom', 'Canada', 'Germany', 'France', 'UAE', 'United States',
  'Nigeria', 'Ghana', 'South Africa', 'Kenya', 'Egypt', 'Morocco'
];

interface AdvancedFiltersProps {
  filters: {
    location: string;
    skills: string[];
    isMentor: boolean;
    isInvestor: boolean;
    lookingForOpportunities: boolean;
  };
  onFiltersChange: (filters: any) => void;
  activeFilterCount: number;
}

const AdvancedFilters: React.FC<AdvancedFiltersProps> = ({
  filters,
  onFiltersChange,
  activeFilterCount
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [skillsOpen, setSkillsOpen] = useState(true);
  const [statusOpen, setStatusOpen] = useState(true);
  const [locationOpen, setLocationOpen] = useState(true);
  const [locationSearch, setLocationSearch] = useState('');

  const updateFilters = (key: string, value: any) => {
    onFiltersChange({
      ...filters,
      [key]: value
    });
  };

  const toggleSkill = (skill: string) => {
    const currentSkills = filters.skills || [];
    const updatedSkills = currentSkills.includes(skill)
      ? currentSkills.filter(s => s !== skill)
      : [...currentSkills, skill];
    updateFilters('skills', updatedSkills);
  };

  const clearAllFilters = () => {
    onFiltersChange({
      location: '',
      skills: [],
      isMentor: false,
      isInvestor: false,
      lookingForOpportunities: false
    });
  };

  const hasActiveFilters = filters.location || 
    filters.skills.length > 0 || 
    filters.isMentor || 
    filters.isInvestor || 
    filters.lookingForOpportunities;

  const handleDone = () => {
    setIsOpen(false);
  };

  // Filter locations based on search
  const filteredLocations = [...LOCATION_OPTIONS, ...COUNTRIES].filter(location =>
    location.toLowerCase().includes(locationSearch.toLowerCase())
  );

  const handleLocationSelect = (location: string) => {
    updateFilters('location', location);
    setLocationSearch('');
  };

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button variant="outline" className="relative h-12 px-6 text-base">
          <Filter className="w-4 h-4 mr-2" />
          Filters
          {activeFilterCount > 0 && (
            <Badge className="absolute -top-2 -right-2 bg-gray-700 text-white text-xs min-w-5 h-5 flex items-center justify-center p-0">
              {activeFilterCount}
            </Badge>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-[90vw] max-w-sm overflow-y-auto">
        <SheetHeader className="mb-6">
          <SheetTitle>Advanced Filters</SheetTitle>
          {hasActiveFilters && (
            <Button variant="ghost" size="sm" onClick={clearAllFilters} className="w-fit">
              Clear All Filters
            </Button>
          )}
        </SheetHeader>

        <div className="space-y-6">
          {/* Location Filter */}
          <div>
            <button
              onClick={() => setLocationOpen(!locationOpen)}
              className="flex items-center justify-between w-full text-sm font-medium mb-3 text-gray-900 hover:text-gray-700 transition-colors"
            >
              <span className="flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                Location
              </span>
              {locationOpen ? (
                <ChevronUp className="w-4 h-4" />
              ) : (
                <ChevronDown className="w-4 h-4" />
              )}
            </button>
            {locationOpen && (
              <div className="space-y-3">
                {/* Current Selection */}
                {filters.location && (
                  <div className="p-2 bg-gray-100 rounded-lg border">
                    <span className="text-sm text-gray-700 font-medium">
                      Selected: {filters.location}
                    </span>
                    <button
                      onClick={() => updateFilters('location', '')}
                      className="ml-2 text-xs text-gray-500 hover:text-gray-700 underline"
                    >
                      Clear
                    </button>
                  </div>
                )}
                
                {/* Search Input */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Search locations..."
                    value={locationSearch}
                    onChange={(e) => setLocationSearch(e.target.value)}
                    className="pl-10"
                  />
                </div>
                
                {/* Location Options */}
                <div className="max-h-40 overflow-y-auto border rounded-lg bg-gray-50">
                  <div 
                    className="p-2 hover:bg-gray-100 cursor-pointer text-sm border-b"
                    onClick={() => handleLocationSelect('')}
                  >
                    All Locations
                  </div>
                  {filteredLocations.map((location, index) => (
                    <div
                      key={index}
                      className="p-2 hover:bg-gray-100 cursor-pointer text-sm border-b last:border-b-0"
                      onClick={() => handleLocationSelect(location)}
                    >
                      {location}
                    </div>
                  ))}
                  {filteredLocations.length === 0 && locationSearch && (
                    <div className="p-2 text-sm text-gray-500 italic">
                      No locations found for "{locationSearch}"
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Skills Filter */}
          <div>
            <button
              onClick={() => setSkillsOpen(!skillsOpen)}
              className="flex items-center justify-between w-full text-sm font-medium mb-3 text-gray-900 hover:text-gray-700 transition-colors"
            >
              <span>Skills</span>
              {skillsOpen ? (
                <ChevronUp className="w-4 h-4" />
              ) : (
                <ChevronDown className="w-4 h-4" />
              )}
            </button>
            {skillsOpen && (
              <div className="grid grid-cols-1 gap-3 max-h-60 overflow-y-auto border rounded-lg p-3 bg-gray-50">
                {SKILL_OPTIONS.map(skill => (
                  <div key={skill} className="flex items-center space-x-3 py-1">
                    <Checkbox
                      id={skill}
                      checked={filters.skills?.includes(skill) || false}
                      onCheckedChange={() => toggleSkill(skill)}
                    />
                    <label 
                      htmlFor={skill} 
                      className="text-sm cursor-pointer text-gray-700 flex-1"
                    >
                      {skill}
                    </label>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Professional Filters */}
          <div>
            <button
              onClick={() => setStatusOpen(!statusOpen)}
              className="flex items-center justify-between w-full text-sm font-medium mb-3 text-gray-900 hover:text-gray-700 transition-colors"
            >
              <span>Professional Status</span>
              {statusOpen ? (
                <ChevronUp className="w-4 h-4" />
              ) : (
                <ChevronDown className="w-4 h-4" />
              )}
            </button>
            {statusOpen && (
              <div className="space-y-3 border rounded-lg p-3 bg-gray-50">
                <div className="flex items-center space-x-3">
                  <Checkbox
                    id="mentor"
                    checked={filters.isMentor || false}
                    onCheckedChange={(checked) => updateFilters('isMentor', checked)}
                  />
                  <label htmlFor="mentor" className="text-sm cursor-pointer text-gray-700">
                    Available as Mentor
                  </label>
                </div>
                <div className="flex items-center space-x-3">
                  <Checkbox
                    id="investor"
                    checked={filters.isInvestor || false}
                    onCheckedChange={(checked) => updateFilters('isInvestor', checked)}
                  />
                  <label htmlFor="investor" className="text-sm cursor-pointer text-gray-700">
                    Active Investor
                  </label>
                </div>
                <div className="flex items-center space-x-3">
                  <Checkbox
                    id="opportunities"
                    checked={filters.lookingForOpportunities || false}
                    onCheckedChange={(checked) => updateFilters('lookingForOpportunities', checked)}
                  />
                  <label htmlFor="opportunities" className="text-sm cursor-pointer text-gray-700">
                    Open to Opportunities
                  </label>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Done Button */}
        <div className="mt-8 pt-6 border-t">
          <Button 
            onClick={handleDone} 
            className="w-full bg-gray-900 hover:bg-gray-800 text-white h-12 text-base"
          >
            Apply Filters
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default AdvancedFilters;