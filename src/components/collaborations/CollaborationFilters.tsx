
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  Search, 
  Filter, 
  X,
  MapPin,
  Target,
  Users,
  Clock,
  DollarSign,
  AlertCircle
} from 'lucide-react';
import { CollaborationFilters } from '@/types/collaborationTypes';

interface CollaborationFiltersProps {
  filters: CollaborationFilters;
  onFiltersChange: (filters: Partial<CollaborationFilters>) => void;
  onClearFilters: () => void;
  hasActiveFilters: boolean;
  resultCount: number;
}

const CollaborationFiltersComponent: React.FC<CollaborationFiltersProps> = ({
  filters,
  onFiltersChange,
  onClearFilters,
  hasActiveFilters,
  resultCount
}) => {
  const impactAreas = [
    { value: 'healthtech', label: 'HealthTech', icon: '🏥', description: 'Healthcare innovation' },
    { value: 'fintech', label: 'FinTech', icon: '💰', description: 'Financial services' },
    { value: 'agritech', label: 'AgriTech', icon: '🌾', description: 'Agricultural technology' },
    { value: 'edtech', label: 'EdTech', icon: '📚', description: 'Education technology' },
    { value: 'cleantech', label: 'CleanTech', icon: '🌱', description: 'Clean energy & environment' },
    { value: 'infrastructure', label: 'Infrastructure', icon: '🏗️', description: 'Physical & digital infrastructure' },
    { value: 'creative-economy', label: 'Creative Economy', icon: '🎨', description: 'Arts, culture & media' },
    { value: 'governance', label: 'Governance', icon: '🏛️', description: 'Public policy & civic tech' }
  ];

  const regions = [
    { value: 'west-africa', label: 'West Africa', flag: '🇬🇭' },
    { value: 'east-africa', label: 'East Africa', flag: '🇰🇪' },
    { value: 'north-africa', label: 'North Africa', flag: '🇪🇬' },
    { value: 'central-africa', label: 'Central Africa', flag: '🇨🇲' },
    { value: 'southern-africa', label: 'Southern Africa', flag: '🇿🇦' },
    { value: 'pan-african', label: 'Pan-African', flag: '🌍' }
  ];

  const contributionTypes = [
    { value: 'funding', label: 'Funding', icon: <DollarSign className="w-4 h-4" />, description: 'Financial investment' },
    { value: 'technical-skills', label: 'Technical Skills', icon: '⚙️', description: 'Development & engineering' },
    { value: 'business-expertise', label: 'Business Expertise', icon: '📊', description: 'Strategy & operations' },
    { value: 'mentorship', label: 'Mentorship', icon: '🤝', description: 'Guidance & advice' },
    { value: 'network', label: 'Network', icon: '🌐', description: 'Connections & partnerships' },
    { value: 'marketing', label: 'Marketing', icon: '📢', description: 'Promotion & outreach' },
    { value: 'operations', label: 'Operations', icon: '⚡', description: 'Day-to-day management' },
    { value: 'research', label: 'Research', icon: '🔬', description: 'Data & analysis' }
  ];

  const timeCommitments = [
    { value: 'flexible', label: 'Flexible', description: 'As needed basis' },
    { value: 'part-time', label: 'Part-time', description: '5-20 hours/week' },
    { value: 'full-time', label: 'Full-time', description: '40+ hours/week' }
  ];

  const urgencyLevels = [
    { value: 'high', label: 'High Priority', color: 'text-red-600', description: 'Urgent action needed' },
    { value: 'medium', label: 'Medium Priority', color: 'text-yellow-600', description: 'Important but flexible' },
    { value: 'low', label: 'Low Priority', color: 'text-green-600', description: 'Long-term opportunity' }
  ];

  const handleCheckboxChange = (
    filterKey: keyof CollaborationFilters,
    value: string,
    checked: boolean
  ) => {
    const currentArray = filters[filterKey] as string[];
    const newArray = checked
      ? [...currentArray, value]
      : currentArray.filter(item => item !== value);
    
    onFiltersChange({ [filterKey]: newArray });
  };

  return (
    <div className="space-y-6">
      <Card className="sticky top-4">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-lg font-semibold">
              <Filter className="w-5 h-5" />
              Discover Initiatives
            </CardTitle>
            {hasActiveFilters && (
              <Button
                onClick={onClearFilters}
                variant="ghost"
                size="sm"
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-4 h-4 mr-1" />
                Clear
              </Button>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="font-medium">
              {resultCount} initiative{resultCount !== 1 ? 's' : ''}
            </Badge>
            {hasActiveFilters && (
              <Badge variant="outline" className="text-dna-copper">
                Filtered
              </Badge>
            )}
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Search */}
          <div className="space-y-2">
            <Label htmlFor="search" className="text-sm font-medium">Search Initiatives</Label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                id="search"
                placeholder="Search by title, description, or skills..."
                value={filters.search_query}
                onChange={(e) => onFiltersChange({ search_query: e.target.value })}
                className="pl-10 border-gray-200 focus:border-dna-copper focus:ring-dna-copper"
              />
            </div>
          </div>

          {/* Impact Areas */}
          <div className="space-y-3">
            <Label className="flex items-center gap-2 text-sm font-medium">
              <Target className="w-4 h-4" />
              Impact Areas
            </Label>
            <div className="space-y-3">
              {impactAreas.map((area) => (
                <div key={area.value} className="flex items-start space-x-3 p-2 rounded-lg hover:bg-gray-50 transition-colors">
                  <Checkbox
                    id={`impact-${area.value}`}
                    checked={filters.impact_area.includes(area.value as any)}
                    onCheckedChange={(checked) =>
                      handleCheckboxChange('impact_area', area.value, checked as boolean)
                    }
                    className="mt-1"
                  />
                  <div className="flex-1 min-w-0">
                    <Label htmlFor={`impact-${area.value}`} className="text-sm font-medium flex items-center gap-2 cursor-pointer">
                      <span className="text-lg">{area.icon}</span>
                      {area.label}
                    </Label>
                    <p className="text-xs text-gray-500 mt-1">{area.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Regions */}
          <div className="space-y-3">
            <Label className="flex items-center gap-2 text-sm font-medium">
              <MapPin className="w-4 h-4" />
              African Regions
            </Label>
            <div className="space-y-2">
              {regions.map((region) => (
                <div key={region.value} className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-50 transition-colors">
                  <Checkbox
                    id={`region-${region.value}`}
                    checked={filters.region.includes(region.value as any)}
                    onCheckedChange={(checked) =>
                      handleCheckboxChange('region', region.value, checked as boolean)
                    }
                  />
                  <Label htmlFor={`region-${region.value}`} className="text-sm font-medium flex items-center gap-2 cursor-pointer">
                    <span className="text-lg">{region.flag}</span>
                    {region.label}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          {/* Contribution Types */}
          <div className="space-y-3">
            <Label className="flex items-center gap-2 text-sm font-medium">
              <Users className="w-4 h-4" />
              How You Can Contribute
            </Label>
            <div className="space-y-3">
              {contributionTypes.map((type) => (
                <div key={type.value} className="flex items-start space-x-3 p-2 rounded-lg hover:bg-gray-50 transition-colors">
                  <Checkbox
                    id={`contribution-${type.value}`}
                    checked={filters.contribution_types.includes(type.value as any)}
                    onCheckedChange={(checked) =>
                      handleCheckboxChange('contribution_types', type.value, checked as boolean)
                    }
                    className="mt-1"
                  />
                  <div className="flex-1 min-w-0">
                    <Label htmlFor={`contribution-${type.value}`} className="text-sm font-medium flex items-center gap-2 cursor-pointer">
                      {typeof type.icon === 'string' ? <span className="text-lg">{type.icon}</span> : type.icon}
                      {type.label}
                    </Label>
                    <p className="text-xs text-gray-500 mt-1">{type.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Time Commitment */}
          <div className="space-y-3">
            <Label className="flex items-center gap-2 text-sm font-medium">
              <Clock className="w-4 h-4" />
              Time Commitment
            </Label>
            <div className="space-y-3">
              {timeCommitments.map((commitment) => (
                <div key={commitment.value} className="flex items-start space-x-3 p-2 rounded-lg hover:bg-gray-50 transition-colors">
                  <Checkbox
                    id={`time-${commitment.value}`}
                    checked={filters.time_commitment.includes(commitment.value)}
                    onCheckedChange={(checked) =>
                      handleCheckboxChange('time_commitment', commitment.value, checked as boolean)
                    }
                    className="mt-1"
                  />
                  <div className="flex-1 min-w-0">
                    <Label htmlFor={`time-${commitment.value}`} className="text-sm font-medium cursor-pointer">
                      {commitment.label}
                    </Label>
                    <p className="text-xs text-gray-500 mt-1">{commitment.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Priority Level */}
          <div className="space-y-3">
            <Label className="flex items-center gap-2 text-sm font-medium">
              <AlertCircle className="w-4 h-4" />
              Priority Level
            </Label>
            <div className="space-y-3">
              {urgencyLevels.map((urgency) => (
                <div key={urgency.value} className="flex items-start space-x-3 p-2 rounded-lg hover:bg-gray-50 transition-colors">
                  <Checkbox
                    id={`urgency-${urgency.value}`}
                    checked={filters.urgency.includes(urgency.value)}
                    onCheckedChange={(checked) =>
                      handleCheckboxChange('urgency', urgency.value, checked as boolean)
                    }
                    className="mt-1"
                  />
                  <div className="flex-1 min-w-0">
                    <Label htmlFor={`urgency-${urgency.value}`} className={`text-sm font-medium cursor-pointer ${urgency.color}`}>
                      {urgency.label}
                    </Label>
                    <p className="text-xs text-gray-500 mt-1">{urgency.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CollaborationFiltersComponent;
