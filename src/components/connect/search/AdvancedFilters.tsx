import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Filter, X } from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetClose,
} from "@/components/ui/sheet";

const SKILL_OPTIONS = [
  'Technology', 'Finance', 'Healthcare', 'Agriculture', 'Education',
  'Energy', 'Creative', 'Marketing', 'Consulting', 'Legal'
];

const LOCATION_OPTIONS = [
  'Nigeria', 'Ghana', 'Kenya', 'South Africa', 'Morocco', 'Egypt',
  'United States', 'United Kingdom', 'Canada', 'France', 'Germany'
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

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button variant="outline" className="relative h-12 px-6 text-base">
          <Filter className="w-4 h-4 mr-2" />
          Filters
          {activeFilterCount > 0 && (
            <Badge className="absolute -top-2 -right-2 bg-dna-emerald text-white text-xs min-w-5 h-5 flex items-center justify-center p-0">
              {activeFilterCount}
            </Badge>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-[65%] sm:w-[350px] overflow-y-auto">
        <SheetHeader className="mb-6">
          <div className="flex items-center justify-between">
            <SheetTitle>Advanced Filters</SheetTitle>
            <SheetClose asChild>
              <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                <X className="w-4 h-4" />
              </Button>
            </SheetClose>
          </div>
          {hasActiveFilters && (
            <Button variant="ghost" size="sm" onClick={clearAllFilters} className="w-fit">
              Clear All Filters
            </Button>
          )}
        </SheetHeader>

        <div className="space-y-6">
          {/* Location Filter */}
          <div>
            <label className="text-sm font-medium mb-3 block text-gray-900">Location</label>
            <Select 
              value={filters.location || ''} 
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
            <label className="text-sm font-medium mb-3 block text-gray-900">Skills</label>
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
          </div>

          {/* Professional Filters */}
          <div>
            <label className="text-sm font-medium mb-3 block text-gray-900">Professional Status</label>
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
          </div>
        </div>

        {/* Done Button */}
        <div className="mt-8 pt-6 border-t">
          <Button 
            onClick={handleDone} 
            className="w-full bg-dna-emerald hover:bg-dna-forest text-white h-12 text-base"
          >
            Apply Filters
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default AdvancedFilters;