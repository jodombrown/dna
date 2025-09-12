import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Filter, X, MapPin, Briefcase, Users } from 'lucide-react';

interface ConnectFilters {
  location: string;
  profession: string;
  skills: string[];
  searchQuery: string;
}

interface ConnectSearchFiltersProps {
  filters: ConnectFilters;
  onFiltersChange: (filters: ConnectFilters) => void;
}

const ConnectSearchFilters: React.FC<ConnectSearchFiltersProps> = ({
  filters,
  onFiltersChange
}) => {
  const africanCountries = [
    'Nigeria', 'South Africa', 'Ghana', 'Kenya', 'Ethiopia', 'Egypt', 
    'Morocco', 'Uganda', 'Tanzania', 'Rwanda', 'Senegal', 'Cameroon',
    'Zimbabwe', 'Zambia', 'Botswana', 'Mali', 'Burkina Faso', 'Madagascar'
  ];

  const diasporaLocations = [
    'United States', 'United Kingdom', 'Canada', 'Germany', 'France',
    'Netherlands', 'Belgium', 'Sweden', 'Australia', 'UAE', 'Saudi Arabia'
  ];

  const allLocations = [...africanCountries, ...diasporaLocations].sort();

  const professions = [
    'Software Engineer', 'Data Scientist', 'Product Manager', 'Designer',
    'Doctor', 'Lawyer', 'Teacher', 'Entrepreneur', 'Consultant',
    'Finance Professional', 'Marketing Specialist', 'Sales Professional',
    'Researcher', 'Engineer', 'Healthcare Professional'
  ];

  const popularSkills = [
    'JavaScript', 'Python', 'React', 'Node.js', 'Data Analysis',
    'Machine Learning', 'Project Management', 'Leadership', 'Strategy',
    'Marketing', 'Sales', 'Finance', 'Healthcare', 'Education', 'Research'
  ];

  const handleSkillAdd = (skill: string) => {
    if (!filters.skills.includes(skill)) {
      onFiltersChange({
        ...filters,
        skills: [...filters.skills, skill]
      });
    }
  };

  const handleSkillRemove = (skill: string) => {
    onFiltersChange({
      ...filters,
      skills: filters.skills.filter(s => s !== skill)
    });
  };

  const clearAllFilters = () => {
    onFiltersChange({
      location: '',
      profession: '',
      skills: [],
      searchQuery: ''
    });
  };

  const hasActiveFilters = filters.location || filters.profession || filters.skills.length > 0 || filters.searchQuery;

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <Card>
        <CardContent className="p-4">
          <Label htmlFor="search" className="text-sm font-medium mb-2 block">
            Search Professionals
          </Label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              id="search"
              placeholder="Search by name, title, or skills..."
              value={filters.searchQuery}
              onChange={(e) => onFiltersChange({ ...filters, searchQuery: e.target.value })}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Filters Card */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Filter className="w-4 h-4" />
              Filters
            </CardTitle>
            {hasActiveFilters && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearAllFilters}
                className="h-auto p-1 text-xs text-muted-foreground hover:text-foreground"
              >
                Clear All
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Location Filter */}
          <div>
            <Label className="text-sm font-medium mb-2 flex items-center gap-1">
              <MapPin className="w-3 h-3" />
              Location
            </Label>
            <Select value={filters.location} onValueChange={(value) => onFiltersChange({ ...filters, location: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Select location" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Locations</SelectItem>
                {allLocations.map((location) => (
                  <SelectItem key={location} value={location}>
                    {location}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Profession Filter */}
          <div>
            <Label className="text-sm font-medium mb-2 flex items-center gap-1">
              <Briefcase className="w-3 h-3" />
              Profession
            </Label>
            <Select value={filters.profession} onValueChange={(value) => onFiltersChange({ ...filters, profession: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Select profession" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Professions</SelectItem>
                {professions.map((profession) => (
                  <SelectItem key={profession} value={profession}>
                    {profession}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Skills Filter */}
          <div>
            <Label className="text-sm font-medium mb-2 flex items-center gap-1">
              <Users className="w-3 h-3" />
              Skills
            </Label>
            
            {/* Selected Skills */}
            {filters.skills.length > 0 && (
              <div className="flex flex-wrap gap-1 mb-2">
                {filters.skills.map((skill) => (
                  <Badge
                    key={skill}
                    variant="secondary"
                    className="text-xs bg-dna-emerald/10 text-dna-emerald border-dna-emerald/20"
                  >
                    {skill}
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-auto p-0 ml-1 hover:bg-transparent"
                      onClick={() => handleSkillRemove(skill)}
                    >
                      <X className="w-3 h-3" />
                    </Button>
                  </Badge>
                ))}
              </div>
            )}

            {/* Popular Skills */}
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground">Popular Skills:</Label>
              <div className="flex flex-wrap gap-1">
                {popularSkills
                  .filter(skill => !filters.skills.includes(skill))
                  .slice(0, 8)
                  .map((skill) => (
                    <Button
                      key={skill}
                      variant="outline"
                      size="sm"
                      className="h-6 text-xs px-2 hover:bg-dna-emerald/10 hover:border-dna-emerald/30 hover:text-dna-emerald"
                      onClick={() => handleSkillAdd(skill)}
                    >
                      + {skill}
                    </Button>
                  ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Diaspora Insights */}
      <Card className="border-l-4 border-l-dna-emerald bg-dna-emerald/5">
        <CardContent className="p-4">
          <h4 className="font-medium text-sm mb-2 text-dna-emerald">Diaspora Insights</h4>
          <div className="space-y-2 text-xs text-muted-foreground">
            <p>• 70% of professionals are open to mentoring</p>
            <p>• Most active time: 9-11 AM GMT</p>
            <p>• Top collaboration areas: Tech, Finance, Healthcare</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ConnectSearchFilters;