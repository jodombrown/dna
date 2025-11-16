import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { X, Filter } from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

interface DiscoverFiltersProps {
  filters: {
    country_of_origin?: string;
    current_country?: string;
    focus_areas?: string[];
    regional_expertise?: string[];
    industries?: string[];
    skills?: string[];
  };
  onFilterChange: (filters: any) => void;
  onClearFilters: () => void;
}

const FOCUS_AREAS = [
  'Agriculture & Food Systems',
  'Technology & Innovation',
  'Healthcare & Wellness',
  'Education & Training',
  'Finance & Investment',
  'Arts & Culture',
  'Policy & Governance',
  'Infrastructure & Energy',
  'Trade & Commerce',
  'Environment & Climate'
];

const INDUSTRIES = [
  'Agriculture',
  'Technology',
  'Healthcare',
  'Education',
  'Finance',
  'Manufacturing',
  'Retail',
  'Energy',
  'Real Estate',
  'Creative Industries'
];

const SKILLS = [
  'Leadership',
  'Project Management',
  'Software Development',
  'Marketing',
  'Sales',
  'Design',
  'Data Analysis',
  'Strategy',
  'Operations',
  'Research'
];

const REGIONAL_EXPERTISE = [
  'West Africa',
  'East Africa',
  'Southern Africa',
  'Central Africa',
  'North Africa',
  'Diaspora - North America',
  'Diaspora - Europe',
  'Diaspora - Caribbean',
  'Diaspora - Asia',
  'Diaspora - South America'
];

export const DiscoverFilters: React.FC<DiscoverFiltersProps> = ({
  filters,
  onFilterChange,
  onClearFilters,
}) => {
  const [isOpen, setIsOpen] = React.useState(false);

  const toggleArrayFilter = (key: 'focus_areas' | 'regional_expertise' | 'industries' | 'skills', value: string) => {
    const current = filters[key] || [];
    const updated = current.includes(value)
      ? current.filter(v => v !== value)
      : [...current, value];
    
    onFilterChange({ ...filters, [key]: updated.length > 0 ? updated : undefined });
  };

  const hasActiveFilters = Object.values(filters).some(v => v && (Array.isArray(v) ? v.length > 0 : true));

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4" />
            <CardTitle className="text-base">Filters</CardTitle>
            {hasActiveFilters && (
              <Badge variant="secondary" className="ml-2">
                Active
              </Badge>
            )}
          </div>
          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onClearFilters}
              className="h-8 text-xs"
            >
              Clear all
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Country Filters */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="country_of_origin">Country of Origin</Label>
            <Select
              value={filters.country_of_origin ?? 'all'}
              onValueChange={(value) => 
                onFilterChange({ ...filters, country_of_origin: value === 'all' ? undefined : value })
              }
            >
              <SelectTrigger id="country_of_origin">
                <SelectValue placeholder="Any country" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Any country</SelectItem>
                <SelectItem value="Nigeria">Nigeria</SelectItem>
                <SelectItem value="Kenya">Kenya</SelectItem>
                <SelectItem value="Ghana">Ghana</SelectItem>
                <SelectItem value="South Africa">South Africa</SelectItem>
                <SelectItem value="Ethiopia">Ethiopia</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="current_country">Current Country</Label>
            <Select
              value={filters.current_country ?? 'all'}
              onValueChange={(value) => 
                onFilterChange({ ...filters, current_country: value === 'all' ? undefined : value })
              }
            >
              <SelectTrigger id="current_country">
                <SelectValue placeholder="Any country" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Any country</SelectItem>
                <SelectItem value="United States">United States</SelectItem>
                <SelectItem value="United Kingdom">United Kingdom</SelectItem>
                <SelectItem value="Canada">Canada</SelectItem>
                <SelectItem value="Nigeria">Nigeria</SelectItem>
                <SelectItem value="Kenya">Kenya</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <Collapsible open={isOpen} onOpenChange={setIsOpen}>
          <CollapsibleTrigger asChild>
            <Button variant="ghost" size="sm" className="w-full">
              {isOpen ? 'Hide' : 'Show'} Advanced Filters
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent className="space-y-4 mt-4">
            {/* Regional Expertise */}
            <div className="space-y-2">
              <Label>Regional Expertise</Label>
              <div className="flex flex-wrap gap-2">
                {REGIONAL_EXPERTISE.map((region) => (
                  <Badge
                    key={region}
                    variant={filters.regional_expertise?.includes(region) ? 'default' : 'outline'}
                    className="cursor-pointer"
                    onClick={() => toggleArrayFilter('regional_expertise', region)}
                  >
                    {region}
                    {filters.regional_expertise?.includes(region) && (
                      <X className="ml-1 h-3 w-3" />
                    )}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Focus Areas */}
            <div className="space-y-2">
              <Label>Focus Areas</Label>
              <div className="flex flex-wrap gap-2">
                {FOCUS_AREAS.map((area) => (
                  <Badge
                    key={area}
                    variant={filters.focus_areas?.includes(area) ? 'default' : 'outline'}
                    className="cursor-pointer"
                    onClick={() => toggleArrayFilter('focus_areas', area)}
                  >
                    {area}
                    {filters.focus_areas?.includes(area) && (
                      <X className="ml-1 h-3 w-3" />
                    )}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Industries */}
            <div className="space-y-2">
              <Label>Industries</Label>
              <div className="flex flex-wrap gap-2">
                {INDUSTRIES.map((industry) => (
                  <Badge
                    key={industry}
                    variant={filters.industries?.includes(industry) ? 'default' : 'outline'}
                    className="cursor-pointer"
                    onClick={() => toggleArrayFilter('industries', industry)}
                  >
                    {industry}
                    {filters.industries?.includes(industry) && (
                      <X className="ml-1 h-3 w-3" />
                    )}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Skills */}
            <div className="space-y-2">
              <Label>Skills</Label>
              <div className="flex flex-wrap gap-2">
                {SKILLS.map((skill) => (
                  <Badge
                    key={skill}
                    variant={filters.skills?.includes(skill) ? 'default' : 'outline'}
                    className="cursor-pointer"
                    onClick={() => toggleArrayFilter('skills', skill)}
                  >
                    {skill}
                    {filters.skills?.includes(skill) && (
                      <X className="ml-1 h-3 w-3" />
                    )}
                  </Badge>
                ))}
              </div>
            </div>
          </CollapsibleContent>
        </Collapsible>
      </CardContent>
    </Card>
  );
};
