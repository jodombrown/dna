
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Search, Filter, X } from 'lucide-react';

interface AdvancedSearchProps {
  onSearch: (filters: SearchFilters) => void;
  onClear: () => void;
  loading?: boolean;
}

export interface SearchFilters {
  searchTerm: string;
  location: string;
  profession: string;
  skills: string[];
  experience: string;
  isMentor: boolean;
  isInvestor: boolean;
  lookingForOpportunities: boolean;
  countryOfOrigin: string;
}

const AdvancedSearch: React.FC<AdvancedSearchProps> = ({ onSearch, onClear, loading = false }) => {
  const [filters, setFilters] = useState<SearchFilters>({
    searchTerm: '',
    location: '',
    profession: '',
    skills: [],
    experience: '',
    isMentor: false,
    isInvestor: false,
    lookingForOpportunities: false,
    countryOfOrigin: ''
  });

  const [showAdvanced, setShowAdvanced] = useState(false);
  const [skillInput, setSkillInput] = useState('');

  const handleSearch = () => {
    onSearch(filters);
  };

  const handleClear = () => {
    setFilters({
      searchTerm: '',
      location: '',
      profession: '',
      skills: [],
      experience: '',
      isMentor: false,
      isInvestor: false,
      lookingForOpportunities: false,
      countryOfOrigin: ''
    });
    setSkillInput('');
    onClear();
  };

  const addSkill = () => {
    if (skillInput.trim() && !filters.skills.includes(skillInput.trim())) {
      setFilters(prev => ({
        ...prev,
        skills: [...prev.skills, skillInput.trim()]
      }));
      setSkillInput('');
    }
  };

  const removeSkill = (skill: string) => {
    setFilters(prev => ({
      ...prev,
      skills: prev.skills.filter(s => s !== skill)
    }));
  };

  const professions = [
    'Software Engineer', 'Data Scientist', 'Product Manager', 'Designer',
    'Marketing Manager', 'Business Analyst', 'Consultant', 'Doctor',
    'Lawyer', 'Teacher', 'Entrepreneur', 'Other'
  ];

  const countries = [
    'Nigeria', 'Ghana', 'Kenya', 'South Africa', 'Ethiopia',
    'Egypt', 'Morocco', 'Tunisia', 'Uganda', 'Tanzania', 'Other'
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Search className="w-5 h-5" />
          Advanced Search
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Basic Search */}
        <div className="flex gap-2">
          <div className="flex-1">
            <Input
              placeholder="Search by name, company, or expertise..."
              value={filters.searchTerm}
              onChange={(e) => setFilters(prev => ({ ...prev, searchTerm: e.target.value }))}
              className="w-full"
            />
          </div>
          <Button
            variant="outline"
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="flex items-center gap-2"
          >
            <Filter className="w-4 h-4" />
            Filters
          </Button>
        </div>

        {/* Advanced Filters */}
        {showAdvanced && (
          <div className="space-y-4 border-t pt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Location</label>
                <Input
                  placeholder="City, Country"
                  value={filters.location}
                  onChange={(e) => setFilters(prev => ({ ...prev, location: e.target.value }))}
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Profession</label>
                <Select value={filters.profession} onValueChange={(value) => setFilters(prev => ({ ...prev, profession: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select profession" />
                  </SelectTrigger>
                  <SelectContent>
                    {professions.map(profession => (
                      <SelectItem key={profession} value={profession}>
                        {profession}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Years of Experience</label>
                <Select value={filters.experience} onValueChange={(value) => setFilters(prev => ({ ...prev, experience: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select experience" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0-2">0-2 years</SelectItem>
                    <SelectItem value="3-5">3-5 years</SelectItem>
                    <SelectItem value="6-10">6-10 years</SelectItem>
                    <SelectItem value="11-15">11-15 years</SelectItem>
                    <SelectItem value="15+">15+ years</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Country of Origin</label>
                <Select value={filters.countryOfOrigin} onValueChange={(value) => setFilters(prev => ({ ...prev, countryOfOrigin: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select country" />
                  </SelectTrigger>
                  <SelectContent>
                    {countries.map(country => (
                      <SelectItem key={country} value={country}>
                        {country}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Skills */}
            <div>
              <label className="text-sm font-medium mb-2 block">Skills</label>
              <div className="flex gap-2 mb-2">
                <Input
                  placeholder="Add a skill..."
                  value={skillInput}
                  onChange={(e) => setSkillInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && addSkill()}
                />
                <Button onClick={addSkill} size="sm">Add</Button>
              </div>
              {filters.skills.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {filters.skills.map(skill => (
                    <Badge key={skill} variant="secondary" className="flex items-center gap-1">
                      {skill}
                      <X
                        className="w-3 h-3 cursor-pointer"
                        onClick={() => removeSkill(skill)}
                      />
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            {/* Checkboxes */}
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="mentor"
                  checked={filters.isMentor}
                  onCheckedChange={(checked) => setFilters(prev => ({ ...prev, isMentor: !!checked }))}
                />
                <label htmlFor="mentor" className="text-sm">Available as Mentor</label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="investor"
                  checked={filters.isInvestor}
                  onCheckedChange={(checked) => setFilters(prev => ({ ...prev, isInvestor: !!checked }))}
                />
                <label htmlFor="investor" className="text-sm">Angel Investor</label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="opportunities"
                  checked={filters.lookingForOpportunities}
                  onCheckedChange={(checked) => setFilters(prev => ({ ...prev, lookingForOpportunities: !!checked }))}
                />
                <label htmlFor="opportunities" className="text-sm">Looking for Opportunities</label>
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-2 pt-4">
          <Button
            onClick={handleSearch}
            disabled={loading}
            className="bg-dna-emerald hover:bg-dna-forest text-white"
          >
            {loading ? 'Searching...' : 'Search'}
          </Button>
          <Button variant="outline" onClick={handleClear}>
            Clear All
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default AdvancedSearch;
