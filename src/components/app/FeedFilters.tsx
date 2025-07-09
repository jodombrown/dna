import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Users, Handshake, Heart, Filter, MapPin, Calendar, Building, TrendingUp, Sparkles } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface FeedFiltersProps {
  activeFilter: 'all' | 'connect' | 'collaborate' | 'contribute';
  onFilterChange: (filter: 'all' | 'connect' | 'collaborate' | 'contribute') => void;
  activeRegion: string;
  onRegionChange: (region: string) => void;
  onAdvancedFiltersChange?: (filters: AdvancedFilters) => void;
}

interface AdvancedFilters {
  interests: string[];
  industries: string[];
  trendingTopics: string[];
  communities: string[];
  nearbyEvents: boolean;
}

const FeedFilters = ({ 
  activeFilter, 
  onFilterChange, 
  activeRegion, 
  onRegionChange,
  onAdvancedFiltersChange 
}: FeedFiltersProps) => {
  const { user } = useAuth();
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [userInterests, setUserInterests] = useState<string[]>([]);
  const [userIndustries, setUserIndustries] = useState<string[]>([]);
  const [trendingTopics, setTrendingTopics] = useState<string[]>([]);
  const [activeAdvancedFilters, setActiveAdvancedFilters] = useState<AdvancedFilters>({
    interests: [],
    industries: [],
    trendingTopics: [],
    communities: [],
    nearbyEvents: false
  });

  const filters = [
    {
      key: 'all' as const,
      label: 'All Posts',
      icon: Filter,
      count: null
    },
    {
      key: 'connect' as const,
      label: 'Connect',
      icon: Users,
      className: 'text-dna-emerald border-dna-emerald hover:bg-dna-emerald/10',
      activeClassName: 'bg-dna-emerald text-white hover:bg-dna-emerald/90'
    },
    {
      key: 'collaborate' as const,
      label: 'Collaborate',
      icon: Handshake,
      className: 'text-dna-copper border-dna-copper hover:bg-dna-copper/10',
      activeClassName: 'bg-dna-copper text-white hover:bg-dna-copper/90'
    },
    {
      key: 'contribute' as const,
      label: 'Contribute',
      icon: Heart,
      className: 'text-dna-forest border-dna-forest hover:bg-dna-forest/10',
      activeClassName: 'bg-dna-forest text-white hover:bg-dna-forest/90'
    }
  ];

  const regions = [
    { value: 'all', label: 'Global' },
    { value: 'west-africa', label: 'West Africa' },
    { value: 'east-africa', label: 'East Africa' },
    { value: 'southern-africa', label: 'Southern Africa' },
    { value: 'north-africa', label: 'North Africa' },
    { value: 'diaspora-us', label: 'US Diaspora' },
    { value: 'diaspora-uk', label: 'UK Diaspora' },
    { value: 'diaspora-canada', label: 'Canada Diaspora' },
    { value: 'diaspora-other', label: 'Other Diaspora' }
  ];

  // Common interests and industries for quick filtering
  const commonInterests = [
    'Technology', 'Agriculture', 'Education', 'Healthcare', 'Finance', 
    'Entrepreneurship', 'Arts & Culture', 'Sports', 'Climate', 'Trade'
  ];

  const commonIndustries = [
    'Tech', 'Banking', 'Healthcare', 'Agriculture', 'Education', 
    'Manufacturing', 'Energy', 'Tourism', 'Media', 'Government'
  ];

  // Fetch user's ADIN profile for personalized filters
  useEffect(() => {
    const fetchUserProfile = async () => {
      if (!user) return;

      try {
        const { data } = await supabase
          .from('user_adin_profile')
          .select('interests, industries')
          .eq('user_id', user.id)
          .single();

        if (data) {
          setUserInterests(data.interests || []);
          setUserIndustries(data.industries || []);
        }
      } catch (error) {
        console.error('Error fetching user ADIN profile:', error);
      }
    };

    fetchUserProfile();
  }, [user]);

  // Mock trending topics (would be fetched from analytics in real app)
  useEffect(() => {
    setTrendingTopics(['AfricaTech2024', 'YouthEmpowerment', 'CleanEnergy', 'DigitalTransformation']);
  }, []);

  const handleAdvancedFilterToggle = (type: keyof AdvancedFilters, value: string) => {
    const newFilters = { ...activeAdvancedFilters };
    
    if (type === 'nearbyEvents') {
      newFilters.nearbyEvents = !newFilters.nearbyEvents;
    } else {
      const currentArray = newFilters[type] as string[];
      if (currentArray.includes(value)) {
        newFilters[type] = currentArray.filter(item => item !== value);
      } else {
        newFilters[type] = [...currentArray, value];
      }
    }
    
    setActiveAdvancedFilters(newFilters);
    onAdvancedFiltersChange?.(newFilters);
  };

  const getActiveAdvancedCount = () => {
    return activeAdvancedFilters.interests.length + 
           activeAdvancedFilters.industries.length + 
           activeAdvancedFilters.trendingTopics.length + 
           activeAdvancedFilters.communities.length +
           (activeAdvancedFilters.nearbyEvents ? 1 : 0);
  };

  return (
    <div className="bg-white rounded-lg border p-4 mb-4 space-y-4">
      {/* Main Pillar Filters */}
      <div className="flex flex-wrap gap-2">
        {filters.map((filter) => {
          const Icon = filter.icon;
          const isActive = activeFilter === filter.key;
          
          return (
            <Button
              key={filter.key}
              variant={isActive ? "default" : "outline"}
              size="sm"
              onClick={() => onFilterChange(filter.key)}
              className={
                isActive 
                  ? filter.activeClassName || 'bg-dna-emerald text-white hover:bg-dna-emerald/90'
                  : filter.className || 'hover:bg-gray-50'
              }
            >
              <Icon className="h-4 w-4 mr-2" />
              {filter.label}
              {filter.count && (
                <span className="ml-2 px-2 py-0.5 rounded-full bg-white/20 text-xs">
                  {filter.count}
                </span>
              )}
            </Button>
          );
        })}
      </div>

      {/* Region and Advanced Filters Row */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
        {/* Region Filter */}
        <div className="flex items-center space-x-2 text-sm text-gray-700">
          <MapPin className="h-4 w-4" />
          <span>Region:</span>
          <Select value={activeRegion} onValueChange={onRegionChange}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Select region" />
            </SelectTrigger>
            <SelectContent>
              {regions.map((region) => (
                <SelectItem key={region.value} value={region.value}>
                  {region.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Advanced Filters Toggle */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="flex items-center gap-2"
        >
          <Sparkles className="h-4 w-4" />
          Smart Filters
          {getActiveAdvancedCount() > 0 && (
            <Badge variant="secondary" className="ml-1">
              {getActiveAdvancedCount()}
            </Badge>
          )}
        </Button>
      </div>

      {/* Advanced Filters Panel */}
      {showAdvanced && (
        <div className="space-y-4 pt-3 border-t border-gray-200 animate-fade-in">
          {/* Interests */}
          {userInterests.length > 0 && (
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-2 flex items-center">
                <Users className="h-4 w-4 mr-1" />
                Your Interests
              </h4>
              <div className="flex flex-wrap gap-2">
                {userInterests.slice(0, 5).map((interest) => (
                  <Badge
                    key={interest}
                    variant={activeAdvancedFilters.interests.includes(interest) ? "default" : "outline"}
                    className="cursor-pointer hover-scale"
                    onClick={() => handleAdvancedFilterToggle('interests', interest)}
                  >
                    {interest}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Industries */}
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-2 flex items-center">
              <Building className="h-4 w-4 mr-1" />
              Industries
            </h4>
            <div className="flex flex-wrap gap-2">
              {commonIndustries.map((industry) => (
                <Badge
                  key={industry}
                  variant={activeAdvancedFilters.industries.includes(industry) ? "default" : "outline"}
                  className="cursor-pointer hover-scale"
                  onClick={() => handleAdvancedFilterToggle('industries', industry)}
                >
                  {industry}
                </Badge>
              ))}
            </div>
          </div>

          {/* Trending Topics */}
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-2 flex items-center">
              <TrendingUp className="h-4 w-4 mr-1" />
              Trending Topics
            </h4>
            <div className="flex flex-wrap gap-2">
              {trendingTopics.map((topic) => (
                <Badge
                  key={topic}
                  variant={activeAdvancedFilters.trendingTopics.includes(topic) ? "default" : "outline"}
                  className="cursor-pointer hover-scale bg-dna-gold/10 text-dna-gold border-dna-gold/30"
                  onClick={() => handleAdvancedFilterToggle('trendingTopics', topic)}
                >
                  #{topic}
                </Badge>
              ))}
            </div>
          </div>

          {/* Events Near Me */}
          <div>
            <Button
              variant={activeAdvancedFilters.nearbyEvents ? "default" : "outline"}
              size="sm"
              onClick={() => handleAdvancedFilterToggle('nearbyEvents', '')}
              className="flex items-center gap-2"
            >
              <Calendar className="h-4 w-4" />
              Events Near Me
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default FeedFilters;
