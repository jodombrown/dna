import { ConveyItemType, ConveyFilters } from '@/types/conveyTypes';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

interface ConveyFeedFiltersProps {
  filters: ConveyFilters;
  onFiltersChange: (filters: ConveyFilters) => void;
}

export function ConveyFeedFilters({ filters, onFiltersChange }: ConveyFeedFiltersProps) {
  const handleTypeChange = (value: string) => {
    onFiltersChange({
      ...filters,
      type: value === 'all' ? undefined : (value as ConveyItemType),
    });
  };

  const handleRegionChange = (value: string) => {
    onFiltersChange({
      ...filters,
      region: value === 'all' ? undefined : value,
    });
  };

  const handleMySpacesToggle = (checked: boolean) => {
    onFiltersChange({
      ...filters,
      onlyMySpaces: checked,
    });
  };

  return (
    <div className="bg-card border border-border rounded-lg p-4 mb-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Content Type */}
        <div className="space-y-2">
          <Label className="text-sm font-medium">Content Type</Label>
          <Select
            value={filters.type || 'all'}
            onValueChange={handleTypeChange}
          >
            <SelectTrigger>
              <SelectValue placeholder="All types" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All types</SelectItem>
              <SelectItem value="story">Stories</SelectItem>
              <SelectItem value="update">Updates</SelectItem>
              <SelectItem value="impact">Impact</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Region */}
        <div className="space-y-2">
          <Label className="text-sm font-medium">Region</Label>
          <Select
            value={filters.region || 'all'}
            onValueChange={handleRegionChange}
          >
            <SelectTrigger>
              <SelectValue placeholder="All regions" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All regions</SelectItem>
              <SelectItem value="East Africa">East Africa</SelectItem>
              <SelectItem value="West Africa">West Africa</SelectItem>
              <SelectItem value="Southern Africa">Southern Africa</SelectItem>
              <SelectItem value="Central Africa">Central Africa</SelectItem>
              <SelectItem value="North Africa">North Africa</SelectItem>
              <SelectItem value="Diaspora - North America">Diaspora - North America</SelectItem>
              <SelectItem value="Diaspora - Europe">Diaspora - Europe</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Focus Areas - placeholder for now */}
        <div className="space-y-2">
          <Label className="text-sm font-medium">Focus Areas</Label>
          <Select disabled value="all">
            <SelectTrigger>
              <SelectValue placeholder="All focus areas" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All focus areas</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* My Spaces Toggle */}
        <div className="space-y-2">
          <Label className="text-sm font-medium">Filter by</Label>
          <div className="flex items-center gap-2 h-10">
            <Switch
              id="my-spaces"
              checked={filters.onlyMySpaces || false}
              onCheckedChange={handleMySpacesToggle}
            />
            <Label htmlFor="my-spaces" className="cursor-pointer">
              Spaces I'm in
            </Label>
          </div>
        </div>
      </div>
    </div>
  );
}
