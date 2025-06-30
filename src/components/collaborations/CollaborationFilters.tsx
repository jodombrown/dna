
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
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
    { value: 'healthtech', label: 'HealthTech', icon: '🏥' },
    { value: 'fintech', label: 'FinTech', icon: '💰' },
    { value: 'agritech', label: 'AgriTech', icon: '🌾' },
    { value: 'edtech', label: 'EdTech', icon: '📚' },
    { value: 'cleantech', label: 'CleanTech', icon: '🌱' },
    { value: 'infrastructure', label: 'Infrastructure', icon: '🏗️' },
    { value: 'creative-economy', label: 'Creative Economy', icon: '🎨' },
    { value: 'governance', label: 'Governance', icon: '🏛️' }
  ];

  const regions = [
    { value: 'west-africa', label: 'West Africa' },
    { value: 'east-africa', label: 'East Africa' },
    { value: 'north-africa', label: 'North Africa' },
    { value: 'central-africa', label: 'Central Africa' },
    { value: 'southern-africa', label: 'Southern Africa' },
    { value: 'pan-african', label: 'Pan-African' }
  ];

  const contributionTypes = [
    { value: 'funding', label: 'Funding', icon: <DollarSign className="w-4 h-4" /> },
    { value: 'technical-skills', label: 'Technical Skills', icon: '⚙️' },
    { value: 'business-expertise', label: 'Business Expertise', icon: '📊' },
    { value: 'mentorship', label: 'Mentorship', icon: '🤝' },
    { value: 'network', label: 'Network', icon: '🌐' },
    { value: 'marketing', label: 'Marketing', icon: '📢' },
    { value: 'operations', label: 'Operations', icon: '⚡' },
    { value: 'research', label: 'Research', icon: '🔬' }
  ];

  const timeCommitments = [
    { value: 'flexible', label: 'Flexible' },
    { value: 'part-time', label: 'Part-time' },
    { value: 'full-time', label: 'Full-time' }
  ];

  const urgencyLevels = [
    { value: 'high', label: 'High', color: 'text-red-600' },
    { value: 'medium', label: 'Medium', color: 'text-yellow-600' },
    { value: 'low', label: 'Low', color: 'text-green-600' }
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
    <Card className="sticky top-4">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Filter className="w-5 h-5" />
            Discover Projects
          </CardTitle>
          {hasActiveFilters && (
            <Button
              onClick={onClearFilters}
              variant="ghost"
              size="sm"
              className="text-gray-500"
            >
              <X className="w-4 h-4 mr-1" />
              Clear
            </Button>
          )}
        </div>
        <p className="text-sm text-gray-600">
          {resultCount} project{resultCount !== 1 ? 's' : ''} found
        </p>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Search */}
        <div>
          <Label htmlFor="search">Search Projects</Label>
          <div className="relative mt-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              id="search"
              placeholder="Search by title, description, or skills..."
              value={filters.search_query}
              onChange={(e) => onFiltersChange({ search_query: e.target.value })}
              className="pl-10"
            />
          </div>
        </div>

        {/* Impact Areas */}
        <div>
          <Label className="flex items-center gap-2 mb-3">
            <Target className="w-4 h-4" />
            Impact Areas
          </Label>
          <div className="grid grid-cols-2 gap-2">
            {impactAreas.map((area) => (
              <div key={area.value} className="flex items-center space-x-2">
                <Checkbox
                  id={`impact-${area.value}`}
                  checked={filters.impact_area.includes(area.value as any)}
                  onCheckedChange={(checked) =>
                    handleCheckboxChange('impact_area', area.value, checked as boolean)
                  }
                />
                <Label htmlFor={`impact-${area.value}`} className="text-sm flex items-center gap-1">
                  <span>{area.icon}</span>
                  {area.label}
                </Label>
              </div>
            ))}
          </div>
        </div>

        {/* Regions */}
        <div>
          <Label className="flex items-center gap-2 mb-3">
            <MapPin className="w-4 h-4" />
            Regions
          </Label>
          <div className="space-y-2">
            {regions.map((region) => (
              <div key={region.value} className="flex items-center space-x-2">
                <Checkbox
                  id={`region-${region.value}`}
                  checked={filters.region.includes(region.value as any)}
                  onCheckedChange={(checked) =>
                    handleCheckboxChange('region', region.value, checked as boolean)
                  }
                />
                <Label htmlFor={`region-${region.value}`} className="text-sm">
                  {region.label}
                </Label>
              </div>
            ))}
          </div>
        </div>

        {/* Contribution Types */}
        <div>
          <Label className="flex items-center gap-2 mb-3">
            <Users className="w-4 h-4" />
            How You Can Help
          </Label>
          <div className="space-y-2">
            {contributionTypes.map((type) => (
              <div key={type.value} className="flex items-center space-x-2">
                <Checkbox
                  id={`contribution-${type.value}`}
                  checked={filters.contribution_types.includes(type.value as any)}
                  onCheckedChange={(checked) =>
                    handleCheckboxChange('contribution_types', type.value, checked as boolean)
                  }
                />
                <Label htmlFor={`contribution-${type.value}`} className="text-sm flex items-center gap-1">
                  {typeof type.icon === 'string' ? <span>{type.icon}</span> : type.icon}
                  {type.label}
                </Label>
              </div>
            ))}
          </div>
        </div>

        {/* Time Commitment */}
        <div>
          <Label className="flex items-center gap-2 mb-3">
            <Clock className="w-4 h-4" />
            Time Commitment
          </Label>
          <div className="space-y-2">
            {timeCommitments.map((commitment) => (
              <div key={commitment.value} className="flex items-center space-x-2">
                <Checkbox
                  id={`time-${commitment.value}`}
                  checked={filters.time_commitment.includes(commitment.value)}
                  onCheckedChange={(checked) =>
                    handleCheckboxChange('time_commitment', commitment.value, checked as boolean)
                  }
                />
                <Label htmlFor={`time-${commitment.value}`} className="text-sm">
                  {commitment.label}
                </Label>
              </div>
            ))}
          </div>
        </div>

        {/* Urgency */}
        <div>
          <Label className="flex items-center gap-2 mb-3">
            <AlertCircle className="w-4 h-4" />
            Priority Level
          </Label>
          <div className="space-y-2">
            {urgencyLevels.map((urgency) => (
              <div key={urgency.value} className="flex items-center space-x-2">
                <Checkbox
                  id={`urgency-${urgency.value}`}
                  checked={filters.urgency.includes(urgency.value)}
                  onCheckedChange={(checked) =>
                    handleCheckboxChange('urgency', urgency.value, checked as boolean)
                  }
                />
                <Label htmlFor={`urgency-${urgency.value}`} className={`text-sm ${urgency.color}`}>
                  {urgency.label} Priority
                </Label>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default CollaborationFiltersComponent;
