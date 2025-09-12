import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Search, Filter, X, Save, Star } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface SearchFilters {
  query: string;
  industry: string;
  location: string;
  experience: number[];
  availability: string[];
  skills: string[];
  investorType: string;
  fundingStage: string;
  mentorshipAreas: string[];
  connectionStatus: string;
  isOnline: boolean;
}

interface AdvancedSearchProps {
  onSearch: (filters: SearchFilters) => void;
  onSaveSearch?: (name: string, filters: SearchFilters) => void;
  savedSearches?: Array<{ name: string; filters: SearchFilters }>;
  className?: string;
}

const industries = [
  'Technology', 'Healthcare', 'Finance', 'Education', 'Agriculture',
  'Manufacturing', 'Renewable Energy', 'Real Estate', 'Media', 'Consulting'
];

const locations = [
  'Nigeria', 'Ghana', 'Kenya', 'South Africa', 'Ethiopia', 'Uganda',
  'Tanzania', 'Rwanda', 'Senegal', 'Ivory Coast', 'United States',
  'United Kingdom', 'Canada', 'Germany', 'France', 'Netherlands'
];

const skillSuggestions = [
  'Software Development', 'Data Science', 'Digital Marketing', 'Product Management',
  'UI/UX Design', 'Business Development', 'Finance', 'Operations', 'Sales',
  'Project Management', 'AI/ML', 'Blockchain', 'Mobile Development'
];

const mentorshipAreas = [
  'Entrepreneurship', 'Career Development', 'Technical Skills', 'Leadership',
  'Fundraising', 'Market Entry', 'Product Development', 'Sales & Marketing'
];

export const AdvancedSearch: React.FC<AdvancedSearchProps> = ({
  onSearch,
  onSaveSearch,
  savedSearches = [],
  className
}) => {
  const [filters, setFilters] = useState<SearchFilters>({
    query: '',
    industry: '',
    location: '',
    experience: [0, 20],
    availability: [],
    skills: [],
    investorType: '',
    fundingStage: '',
    mentorshipAreas: [],
    connectionStatus: '',
    isOnline: false
  });

  const [activeTab, setActiveTab] = useState('people');
  const [saveSearchName, setSaveSearchName] = useState('');
  const [showSaveSearch, setShowSaveSearch] = useState(false);

  const updateFilter = (key: keyof SearchFilters, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const addToArrayFilter = (key: keyof SearchFilters, value: string) => {
    const currentArray = filters[key] as string[];
    if (!currentArray.includes(value)) {
      updateFilter(key, [...currentArray, value]);
    }
  };

  const removeFromArrayFilter = (key: keyof SearchFilters, value: string) => {
    const currentArray = filters[key] as string[];
    updateFilter(key, currentArray.filter(item => item !== value));
  };

  const handleSearch = () => {
    onSearch(filters);
  };

  const handleSaveSearch = () => {
    if (saveSearchName.trim() && onSaveSearch) {
      onSaveSearch(saveSearchName.trim(), filters);
      setSaveSearchName('');
      setShowSaveSearch(false);
    }
  };

  const loadSavedSearch = (savedSearch: { name: string; filters: SearchFilters }) => {
    setFilters(savedSearch.filters);
    onSearch(savedSearch.filters);
  };

  const clearFilters = () => {
    setFilters({
      query: '',
      industry: '',
      location: '',
      experience: [0, 20],
      availability: [],
      skills: [],
      investorType: '',
      fundingStage: '',
      mentorshipAreas: [],
      connectionStatus: '',
      isOnline: false
    });
  };

  return (
    <Card className={cn("w-full", className)}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Search className="w-5 h-5" />
          Advanced Search
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Search Query */}
        <div className="space-y-2">
          <Label htmlFor="search-query">Search</Label>
          <div className="relative">
            <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
            <Input
              id="search-query"
              placeholder="Search by name, company, or expertise..."
              value={filters.query}
              onChange={(e) => updateFilter('query', e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="people">People</TabsTrigger>
            <TabsTrigger value="investors">Investors</TabsTrigger>
            <TabsTrigger value="mentors">Mentors</TabsTrigger>
          </TabsList>

          <TabsContent value="people" className="space-y-4">
            {/* Basic Filters */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Industry</Label>
                <Select value={filters.industry} onValueChange={(value) => updateFilter('industry', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select industry" />
                  </SelectTrigger>
                  <SelectContent>
                    {industries.map(industry => (
                      <SelectItem key={industry} value={industry}>{industry}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Location</Label>
                <Select value={filters.location} onValueChange={(value) => updateFilter('location', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select location" />
                  </SelectTrigger>
                  <SelectContent>
                    {locations.map(location => (
                      <SelectItem key={location} value={location}>{location}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Experience Range */}
            <div className="space-y-3">
              <Label>Years of Experience: {filters.experience[0]} - {filters.experience[1]} years</Label>
              <Slider
                value={filters.experience}
                onValueChange={(value) => updateFilter('experience', value)}
                max={20}
                min={0}
                step={1}
                className="w-full"
              />
            </div>

            {/* Skills */}
            <div className="space-y-3">
              <Label>Skills</Label>
              <div className="flex flex-wrap gap-2 mb-2">
                {skillSuggestions.map(skill => (
                  <Button
                    key={skill}
                    variant={filters.skills.includes(skill) ? "default" : "outline"}
                    size="sm"
                    onClick={() => filters.skills.includes(skill) 
                      ? removeFromArrayFilter('skills', skill)
                      : addToArrayFilter('skills', skill)
                    }
                  >
                    {skill}
                  </Button>
                ))}
              </div>
              {filters.skills.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {filters.skills.map(skill => (
                    <Badge key={skill} variant="secondary" className="flex items-center gap-1">
                      {skill}
                      <X 
                        className="w-3 h-3 cursor-pointer" 
                        onClick={() => removeFromArrayFilter('skills', skill)}
                      />
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            {/* Online Status */}
            <div className="flex items-center space-x-2">
              <Switch
                id="online-only"
                checked={filters.isOnline}
                onCheckedChange={(checked) => updateFilter('isOnline', checked)}
              />
              <Label htmlFor="online-only">Show only online users</Label>
            </div>
          </TabsContent>

          <TabsContent value="investors" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Investor Type</Label>
                <Select value={filters.investorType} onValueChange={(value) => updateFilter('investorType', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select investor type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="angel">Angel Investor</SelectItem>
                    <SelectItem value="vc">Venture Capital</SelectItem>
                    <SelectItem value="institutional">Institutional</SelectItem>
                    <SelectItem value="impact">Impact Investor</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Funding Stage</Label>
                <Select value={filters.fundingStage} onValueChange={(value) => updateFilter('fundingStage', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select funding stage" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pre-seed">Pre-Seed</SelectItem>
                    <SelectItem value="seed">Seed</SelectItem>
                    <SelectItem value="series-a">Series A</SelectItem>
                    <SelectItem value="series-b">Series B+</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="mentors" className="space-y-4">
            <div className="space-y-3">
              <Label>Mentorship Areas</Label>
              <div className="flex flex-wrap gap-2">
                {mentorshipAreas.map(area => (
                  <Button
                    key={area}
                    variant={filters.mentorshipAreas.includes(area) ? "default" : "outline"}
                    size="sm"
                    onClick={() => filters.mentorshipAreas.includes(area)
                      ? removeFromArrayFilter('mentorshipAreas', area)
                      : addToArrayFilter('mentorshipAreas', area)
                    }
                  >
                    {area}
                  </Button>
                ))}
              </div>
            </div>
          </TabsContent>
        </Tabs>

        {/* Saved Searches */}
        {savedSearches.length > 0 && (
          <div className="space-y-2">
            <Label>Saved Searches</Label>
            <div className="flex flex-wrap gap-2">
              {savedSearches.map((savedSearch, index) => (
                <Button
                  key={index}
                  variant="outline"
                  size="sm"
                  onClick={() => loadSavedSearch(savedSearch)}
                  className="flex items-center gap-1"
                >
                  <Star className="w-3 h-3" />
                  {savedSearch.name}
                </Button>
              ))}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-2">
          <Button onClick={handleSearch} className="flex items-center gap-2">
            <Search className="w-4 h-4" />
            Search
          </Button>
          
          <Button variant="outline" onClick={clearFilters}>
            <Filter className="w-4 h-4 mr-2" />
            Clear Filters
          </Button>

          {onSaveSearch && (
            <Button 
              variant="secondary" 
              onClick={() => setShowSaveSearch(!showSaveSearch)}
              className="flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              Save Search
            </Button>
          )}
        </div>

        {/* Save Search Form */}
        {showSaveSearch && (
          <div className="flex gap-2 p-3 border rounded-lg bg-muted/30">
            <Input
              placeholder="Name this search..."
              value={saveSearchName}
              onChange={(e) => setSaveSearchName(e.target.value)}
            />
            <Button onClick={handleSaveSearch} size="sm">Save</Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setShowSaveSearch(false)}
            >
              Cancel
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};