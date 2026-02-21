import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { FOCUS_AREAS, REGIONAL_EXPERTISE, INDUSTRIES } from "@/lib/constants/discoveryTags";

interface DiscoveryFiltersProps {
  filters: {
    focusAreas: string[];
    regionalExpertise: string[];
    industries: string[];
    countryOfOrigin: string;
    locationCountry: string;
  };
  onFilterChange: (filters: any) => void;
}

export function DiscoveryFilters({ filters, onFilterChange }: DiscoveryFiltersProps) {
  const toggleFilter = (category: keyof typeof filters, value: string) => {
    const current = filters[category];
    if (Array.isArray(current)) {
      const updated = current.includes(value)
        ? current.filter(v => v !== value)
        : [...current, value];
      onFilterChange({ ...filters, [category]: updated });
    }
  };

  const clearAll = () => {
    onFilterChange({
      focusAreas: [],
      regionalExpertise: [],
      industries: [],
      countryOfOrigin: '',
      locationCountry: ''
    });
  };

  const activeCount = 
    filters.focusAreas.length +
    filters.regionalExpertise.length +
    filters.industries.length +
    (filters.countryOfOrigin ? 1 : 0) +
    (filters.locationCountry ? 1 : 0);

  return (
    <Card className="sticky top-4">
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <CardTitle className="text-lg font-semibold">Filters</CardTitle>
        {activeCount > 0 && (
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="bg-[hsl(151,75%,50%)]/10 text-[hsl(151,75%,30%)]">
              {activeCount}
            </Badge>
            <Button variant="ghost" size="sm" onClick={clearAll} className="h-8 text-xs">
              Clear
            </Button>
          </div>
        )}
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Focus Areas */}
        <div className="space-y-3">
          <Label className="font-semibold text-sm text-[hsl(30,10%,10%)]">Focus Areas</Label>
          <div className="space-y-2 max-h-48 overflow-y-auto pr-2">
            {FOCUS_AREAS.map(area => (
              <div key={area} className="flex items-center space-x-2">
                <Checkbox
                  id={`focus-${area}`}
                  checked={filters.focusAreas.includes(area)}
                  onCheckedChange={() => toggleFilter('focusAreas', area)}
                  className="border-[hsl(30,10%,80%)]"
                />
                <Label 
                  htmlFor={`focus-${area}`} 
                  className="text-sm font-normal cursor-pointer text-[hsl(30,10%,10%)] leading-tight"
                >
                  {area}
                </Label>
              </div>
            ))}
          </div>
        </div>

        {/* Regional Expertise */}
        <div className="space-y-3">
          <Label className="font-semibold text-sm text-[hsl(30,10%,10%)]">Regional Expertise</Label>
          <div className="space-y-2">
            {REGIONAL_EXPERTISE.map(region => (
              <div key={region} className="flex items-center space-x-2">
                <Checkbox
                  id={`region-${region}`}
                  checked={filters.regionalExpertise.includes(region)}
                  onCheckedChange={() => toggleFilter('regionalExpertise', region)}
                  className="border-[hsl(30,10%,80%)]"
                />
                <Label 
                  htmlFor={`region-${region}`} 
                  className="text-sm font-normal cursor-pointer text-[hsl(30,10%,10%)]"
                >
                  {region}
                </Label>
              </div>
            ))}
          </div>
        </div>

        {/* Industries */}
        <div className="space-y-3">
          <Label className="font-semibold text-sm text-[hsl(30,10%,10%)]">Industries</Label>
          <div className="space-y-2 max-h-48 overflow-y-auto pr-2">
            {INDUSTRIES.map(industry => (
              <div key={industry} className="flex items-center space-x-2">
                <Checkbox
                  id={`industry-${industry}`}
                  checked={filters.industries.includes(industry)}
                  onCheckedChange={() => toggleFilter('industries', industry)}
                  className="border-[hsl(30,10%,80%)]"
                />
                <Label 
                  htmlFor={`industry-${industry}`} 
                  className="text-sm font-normal cursor-pointer text-[hsl(30,10%,10%)] leading-tight"
                >
                  {industry}
                </Label>
              </div>
            ))}
          </div>
        </div>

        {/* Heritage */}
        <div className="space-y-2">
          <Label className="font-semibold text-sm text-[hsl(30,10%,10%)]">Country of Origin</Label>
          <Input
            placeholder="e.g., Nigeria"
            value={filters.countryOfOrigin}
            onChange={(e) => onFilterChange({ ...filters, countryOfOrigin: e.target.value })}
            className="border-[hsl(30,10%,80%)]"
          />
        </div>

        {/* Location */}
        <div className="space-y-2">
          <Label className="font-semibold text-sm text-[hsl(30,10%,10%)]">Current Location</Label>
          <Input
            placeholder="e.g., United States"
            value={filters.locationCountry}
            onChange={(e) => onFilterChange({ ...filters, locationCountry: e.target.value })}
            className="border-[hsl(30,10%,80%)]"
          />
        </div>
      </CardContent>
    </Card>
  );
}
