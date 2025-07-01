
import React, { useState, useMemo } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import Header from '@/components/Header';
import DynamicFilterPanel, { FilterSection } from '@/components/filters/DynamicFilterPanel';
import SmartSearchBar from '@/components/filters/SmartSearchBar';
import { useAdvancedFilters, ProfessionalFilters, CommunityFilters, EventFilters } from '@/hooks/useAdvancedFilters';
import { enhancedDemoProfessionals, enhancedDemoCommunities, enhancedDemoEvents } from '@/data/enhancedDemoData';

const EnhancedSearchPage = () => {
  const [activeTab, setActiveTab] = useState('professionals');
  const [showFilters, setShowFilters] = useState(true);

  // Professional filters configuration
  const professionalFilterSections: FilterSection[] = [
    {
      key: 'searchTerm',
      title: 'Search',
      type: 'text',
      placeholder: 'Search by name, skills, company...',
      defaultOpen: true
    },
    {
      key: 'location',
      title: 'Location',
      type: 'select',
      defaultOpen: true,
      options: [
        { value: 'Nigeria', label: 'Nigeria', icon: '🇳🇬', count: 45 },
        { value: 'Ghana', label: 'Ghana', icon: '🇬🇭', count: 32 },
        { value: 'Kenya', label: 'Kenya', icon: '🇰🇪', count: 28 },
        { value: 'South Africa', label: 'South Africa', icon: '🇿🇦', count: 38 },
        { value: 'United States', label: 'United States', icon: '🇺🇸', count: 156 },
        { value: 'United Kingdom', label: 'United Kingdom', icon: '🇬🇧', count: 89 },
        { value: 'Canada', label: 'Canada', icon: '🇨🇦', count: 67 },
        { value: 'Germany', label: 'Germany', icon: '🇩🇪', count: 34 }
      ]
    },
    {
      key: 'skills',
      title: 'Skills & Expertise',
      type: 'tags',
      defaultOpen: true,
      searchable: true,
      options: [
        { value: 'Software Development', label: 'Software Development', icon: '💻', count: 89 },
        { value: 'Data Science', label: 'Data Science', icon: '📊', count: 67 },
        { value: 'Product Management', label: 'Product Management', icon: '🚀', count: 45 },
        { value: 'Digital Marketing', label: 'Digital Marketing', icon: '📱', count: 56 },
        { value: 'Finance', label: 'Finance', icon: '💰', count: 78 },
        { value: 'Healthcare', label: 'Healthcare', icon: '🏥', count: 34 },
        { value: 'Education', label: 'Education', icon: '🎓', count: 52 },
        { value: 'Agriculture', label: 'Agriculture', icon: '🌾', count: 29 },
        { value: 'Energy', label: 'Energy', icon: '⚡', count: 23 },
        { value: 'Creative Arts', label: 'Creative Arts', icon: '🎨', count: 41 }
      ]
    },
    {
      key: 'profession',
      title: 'Profession',
      type: 'select',
      searchable: true,
      options: [
        { value: 'Engineer', label: 'Engineer', count: 98 },
        { value: 'Doctor', label: 'Doctor', count: 67 },
        { value: 'Teacher', label: 'Teacher', count: 89 },
        { value: 'Entrepreneur', label: 'Entrepreneur', count: 134 },
        { value: 'Consultant', label: 'Consultant', count: 76 },
        { value: 'Artist', label: 'Artist', count: 43 },
        { value: 'Researcher', label: 'Researcher', count: 54 }
      ]
    },
    {
      key: 'experience',
      title: 'Years of Experience',
      type: 'select',
      options: [
        { value: '0-2', label: 'Entry Level (0-2 years)', count: 89 },
        { value: '3-5', label: 'Mid Level (3-5 years)', count: 134 },
        { value: '6-10', label: 'Senior (6-10 years)', count: 98 },
        { value: '11-15', label: 'Lead (11-15 years)', count: 67 },
        { value: '15+', label: 'Executive (15+ years)', count: 45 }
      ]
    },
    {
      key: 'availability',
      title: 'Professional Status',
      type: 'checkbox',
      options: [
        { value: 'is_mentor', label: 'Available as Mentor', icon: '🎯', count: 78 },
        { value: 'is_investor', label: 'Active Investor', icon: '💰', count: 34 },
        { value: 'looking_for_opportunities', label: 'Open to Opportunities', icon: '🚀', count: 156 }
      ]
    }
  ];

  // Initialize professional filters
  const initialProfessionalFilters: ProfessionalFilters = {
    searchTerm: '',
    location: '',
    skills: [],
    interests: [],
    profession: '',
    company: '',
    experience: '',
    is_mentor: false,
    is_investor: false,
    looking_for_opportunities: false,
    countryOfOrigin: '',
    yearsExperience: '',
    education: '',
    languages: [],
    availability: [],
    sortBy: 'relevance',
    sortOrder: 'desc'
  };

  const professionalFilterFunction = (professionals: any[], filters: ProfessionalFilters) => {
    return professionals.filter(prof => {
      const matchesSearch = !filters.searchTerm || 
        prof.full_name.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
        prof.profession?.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
        prof.company?.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
        prof.bio?.toLowerCase().includes(filters.searchTerm.toLowerCase());

      const matchesLocation = !filters.location || 
        prof.location?.includes(filters.location) ||
        prof.country_of_origin?.includes(filters.location);

      const matchesSkills = filters.skills.length === 0 || 
        filters.skills.some(skill => 
          prof.skills?.some((pSkill: string) => pSkill.toLowerCase().includes(skill.toLowerCase()))
        );

      const matchesProfession = !filters.profession ||
        prof.profession?.toLowerCase().includes(filters.profession.toLowerCase());

      const matchesExperience = !filters.experience || 
        (filters.experience === '0-2' && prof.years_experience <= 2) ||
        (filters.experience === '3-5' && prof.years_experience >= 3 && prof.years_experience <= 5) ||
        (filters.experience === '6-10' && prof.years_experience >= 6 && prof.years_experience <= 10) ||
        (filters.experience === '11-15' && prof.years_experience >= 11 && prof.years_experience <= 15) ||
        (filters.experience === '15+' && prof.years_experience > 15);

      return matchesSearch && matchesLocation && matchesSkills && matchesProfession && matchesExperience;
    });
  };

  const {
    filters: professionalFilters,
    filteredData: filteredProfessionals,
    loading: professionalLoading,
    updateFilter: updateProfessionalFilter,
    clearFilters: clearProfessionalFilters,
    hasActiveFilters: hasActiveProfessionalFilters,
    activeFilterCount: activeProfessionalFilterCount
  } = useAdvancedFilters(
    initialProfessionalFilters,
    enhancedDemoProfessionals,
    professionalFilterFunction
  );

  // Search suggestions
  const searchSuggestions = useMemo(() => [
    { type: 'skill' as const, value: 'Software Development', label: 'Software Development', count: 89 },
    { type: 'location' as const, value: 'Nigeria', label: 'Lagos, Nigeria', count: 45 },
    { type: 'profession' as const, value: 'Engineer', label: 'Software Engineer', count: 67 },
    { type: 'company' as const, value: 'Google', label: 'Google', count: 12 },
    { type: 'skill' as const, value: 'Data Science', label: 'Data Science', count: 56 }
  ], []);

  const activeFilters = useMemo(() => {
    const filters = [];
    if (professionalFilters.location) {
      filters.push({
        label: `📍 ${professionalFilters.location}`,
        value: professionalFilters.location,
        onRemove: () => updateProfessionalFilter('location', '')
      });
    }
    professionalFilters.skills.forEach(skill => {
      filters.push({
        label: skill,
        value: skill,
        onRemove: () => updateProfessionalFilter('skills', 
          professionalFilters.skills.filter(s => s !== skill)
        )
      });
    });
    return filters;
  }, [professionalFilters, updateProfessionalFilter]);

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Enhanced Professional Network Search
          </h1>
          
          <SmartSearchBar
            value={professionalFilters.searchTerm}
            onChange={(value) => updateProfessionalFilter('searchTerm', value)}
            onSearch={() => {}}
            suggestions={searchSuggestions}
            recentSearches={['Software Engineer', 'Data Scientist', 'Product Manager']}
            activeFilters={activeFilters}
            onAdvancedFiltersClick={() => setShowFilters(!showFilters)}
            loading={professionalLoading}
          />
        </div>

        <div className="grid lg:grid-cols-4 gap-8">
          {showFilters && (
            <div className="lg:col-span-1">
              <DynamicFilterPanel
                sections={professionalFilterSections}
                filters={professionalFilters}
                onFilterChange={updateProfessionalFilter}
                onClearFilters={clearProfessionalFilters}
                hasActiveFilters={hasActiveProfessionalFilters}
                activeFilterCount={activeProfessionalFilterCount}
                resultCount={filteredProfessionals.length}
                loading={professionalLoading}
              />
            </div>
          )}
          
          <div className={showFilters ? "lg:col-span-3" : "lg:col-span-4"}>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold">
                    {filteredProfessionals.length} Professionals Found
                  </h2>
                  <div className="text-sm text-gray-600">
                    {professionalLoading ? 'Searching...' : 'Results updated'}
                  </div>
                </div>
                
                <div className="grid gap-6">
                  {filteredProfessionals.slice(0, 10).map((professional) => (
                    <div key={professional.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                      <div className="flex items-start gap-4">
                        <div className="w-16 h-16 bg-dna-emerald/10 rounded-full flex items-center justify-center">
                          <span className="text-dna-emerald font-semibold text-lg">
                            {professional.full_name.split(' ').map((n: string) => n[0]).join('')}
                          </span>
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-lg">{professional.full_name}</h3>
                          <p className="text-dna-copper">{professional.profession}</p>
                          <p className="text-gray-600">{professional.company}</p>
                          <p className="text-sm text-gray-500 mt-2">{professional.bio}</p>
                          <div className="flex flex-wrap gap-2 mt-3">
                            {professional.skills?.slice(0, 3).map((skill: string) => (
                              <span key={skill} className="px-2 py-1 bg-dna-emerald/10 text-dna-emerald text-xs rounded">
                                {skill}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

export default EnhancedSearchPage;
