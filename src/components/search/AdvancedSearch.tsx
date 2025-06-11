import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { X, Search, RotateCcw } from 'lucide-react';
import { SearchFilters } from '@/types/searchTypes';

interface AdvancedSearchProps {
  onSearch: (filters: SearchFilters) => void;
  onClear: () => void;
  loading: boolean;
}

const defaultFilters: SearchFilters = {
  searchTerm: '',
  location: '',
  profession: '',
  skills: [],
  experience: '',
  isMentor: false,
  isInvestor: false,
  lookingForOpportunities: false,
  countryOfOrigin: ''
};

const AdvancedSearch: React.FC<AdvancedSearchProps> = ({ onSearch, onClear, loading }) => {
  const [filters, setFilters] = useState<SearchFilters>(defaultFilters);
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFilters(prevFilters => ({
      ...prevFilters,
      [name]: value
    }));
  };

  const handleCheckboxChange = (name: string, checked: boolean) => {
    setFilters(prevFilters => ({
      ...prevFilters,
      [name]: checked
    }));
  };

  const handleSkillSelect = (skill: string) => {
    if (selectedSkills.includes(skill)) {
      setSelectedSkills(selectedSkills.filter(s => s !== skill));
      setFilters(prevFilters => ({
        ...prevFilters,
        skills: prevFilters.skills.filter(s => s !== skill)
      }));
    } else {
      setSelectedSkills([...selectedSkills, skill]);
      setFilters(prevFilters => ({
        ...prevFilters,
        skills: [...prevFilters.skills, skill]
      }));
    }
  };

  const handleSearch = () => {
    onSearch(filters);
  };

  const handleClear = () => {
    setFilters(defaultFilters);
    setSelectedSkills([]);
    onClear();
  };

  const skillsOptions = [
    'Software Development',
    'Data Science',
    'Project Management',
    'Marketing',
    'Finance',
    'Design',
    'Sales',
    'Human Resources'
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Advanced Search</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="searchTerm">Search Term</Label>
          <Input
            type="text"
            id="searchTerm"
            name="searchTerm"
            value={filters.searchTerm}
            onChange={handleInputChange}
            placeholder="Enter keyword"
          />
        </div>
        <div>
          <Label htmlFor="location">Location</Label>
          <Input
            type="text"
            id="location"
            name="location"
            value={filters.location}
            onChange={handleInputChange}
            placeholder="Enter location"
          />
        </div>
        <div>
          <Label htmlFor="profession">Profession</Label>
          <Input
            type="text"
            id="profession"
            name="profession"
            value={filters.profession}
            onChange={handleInputChange}
            placeholder="Enter profession"
          />
        </div>
        <div>
          <Label htmlFor="countryOfOrigin">Country of Origin</Label>
          <Input
            type="text"
            id="countryOfOrigin"
            name="countryOfOrigin"
            value={filters.countryOfOrigin}
            onChange={handleInputChange}
            placeholder="Enter country of origin"
          />
        </div>
        <div>
          <Label>Skills</Label>
          <div className="flex flex-wrap gap-2">
            {skillsOptions.map(skill => (
              <Badge
                key={skill}
                variant={selectedSkills.includes(skill) ? 'default' : 'outline'}
                className={`cursor-pointer ${selectedSkills.includes(skill) ? 'bg-dna-emerald text-white hover:bg-dna-forest' : ''}`}
                onClick={() => handleSkillSelect(skill)}
              >
                {skill}
                {selectedSkills.includes(skill) && <X className="ml-1 w-3 h-3" />}
              </Badge>
            ))}
          </div>
        </div>
        <div>
          <Label htmlFor="experience">Experience</Label>
          <Select onValueChange={(value) => setFilters(prevFilters => ({ ...prevFilters, experience: value }))}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select experience" defaultValue={filters.experience} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Any</SelectItem>
              <SelectItem value="0-2">0-2 years</SelectItem>
              <SelectItem value="3-5">3-5 years</SelectItem>
              <SelectItem value="6-10">6-10 years</SelectItem>
              <SelectItem value="11-15">11-15 years</SelectItem>
              <SelectItem value="15+">15+ years</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center space-x-2">
          <Checkbox
            id="isMentor"
            name="isMentor"
            checked={filters.isMentor}
            onCheckedChange={(checked) => handleCheckboxChange('isMentor', !!checked)}
          />
          <Label htmlFor="isMentor">Is Mentor</Label>
        </div>
        <div className="flex items-center space-x-2">
          <Checkbox
            id="isInvestor"
            name="isInvestor"
            checked={filters.isInvestor}
            onCheckedChange={(checked) => handleCheckboxChange('isInvestor', !!checked)}
          />
          <Label htmlFor="isInvestor">Is Investor</Label>
        </div>
        <div className="flex items-center space-x-2">
          <Checkbox
            id="lookingForOpportunities"
            name="lookingForOpportunities"
            checked={filters.lookingForOpportunities}
            onCheckedChange={(checked) => handleCheckboxChange('lookingForOpportunities', !!checked)}
          />
          <Label htmlFor="lookingForOpportunities">Looking for Opportunities</Label>
        </div>
        <div className="flex justify-end space-x-2">
          <Button
            variant="outline"
            onClick={handleClear}
            disabled={loading}
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            Clear
          </Button>
          <Button
            onClick={handleSearch}
            disabled={loading}
          >
            <Search className="w-4 h-4 mr-2" />
            Search
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default AdvancedSearch;
