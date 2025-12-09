import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, X } from 'lucide-react';
import { ProfileEditSectionProps, AfricaFocusArea } from './types';
import { ProfileDiscoverySection } from '@/components/profile/ProfileDiscoverySection';
import { SECTOR_OPTIONS } from '@/data/profileOptions';

// African countries list for the focus area selector
const AFRICAN_COUNTRIES = [
  'Nigeria', 'South Africa', 'Kenya', 'Ghana', 'Ethiopia', 'Egypt', 'Tanzania',
  'Uganda', 'Algeria', 'Morocco', 'Angola', 'Mozambique', 'Madagascar', 'Cameroon',
  "Côte d'Ivoire", 'Niger', 'Burkina Faso', 'Mali', 'Malawi', 'Zambia', 'Somalia',
  'Senegal', 'Chad', 'Zimbabwe', 'Guinea', 'Rwanda', 'Benin', 'Tunisia', 'Burundi',
  'South Sudan', 'Togo', 'Sierra Leone', 'Libya', 'Liberia', 'Mauritania', 'Central African Republic',
  'Eritrea', 'Gambia', 'Botswana', 'Namibia', 'Gabon', 'Lesotho', 'Guinea-Bissau',
  'Equatorial Guinea', 'Mauritius', 'Eswatini', 'Djibouti', 'Comoros', 'Cape Verde', 'Sao Tome and Principe', 'Seychelles'
].sort();

interface AfricaFocusSectionProps extends ProfileEditSectionProps {
  africaFocusAreas: AfricaFocusArea[];
  onAfricaFocusAreasChange: (areas: AfricaFocusArea[]) => void;
}

export function AfricaFocusSection({
  formData,
  onUpdate,
  africaFocusAreas,
  onAfricaFocusAreasChange,
  errors = {},
  disabled = false,
}: AfricaFocusSectionProps) {
  const addFocusArea = () => {
    onAfricaFocusAreasChange([...africaFocusAreas, { geography: '', sectors: [] }]);
  };

  const updateFocusArea = (index: number, field: 'geography' | 'sectors', value: any) => {
    const updated = [...africaFocusAreas];
    updated[index][field] = value;
    onAfricaFocusAreasChange(updated);
  };

  const removeFocusArea = (index: number) => {
    onAfricaFocusAreasChange(africaFocusAreas.filter((_, i) => i !== index));
  };

  const toggleSectorInFocusArea = (areaIndex: number, sector: string) => {
    const updated = [...africaFocusAreas];
    const currentSectors = updated[areaIndex].sectors;
    updated[areaIndex].sectors = currentSectors.includes(sector)
      ? currentSectors.filter(s => s !== sector)
      : [...currentSectors, sector];
    onAfricaFocusAreasChange(updated);
  };

  return (
    <div className="space-y-6">
      {/* Africa Focus Areas */}
      <Card className="border-l-4 border-l-primary">
        <CardHeader>
          <CardTitle>Your Africa Focus</CardTitle>
          <p className="text-sm text-muted-foreground">
            Specify the African geographies and sectors you're interested in
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          {africaFocusAreas.map((area, index) => (
            <div key={index} className="border rounded-lg p-4 space-y-3 relative">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute top-2 right-2"
                onClick={() => removeFocusArea(index)}
                disabled={disabled}
              >
                <X className="w-4 h-4" />
              </Button>

              <div>
                <Label>Geography</Label>
                <Select
                  value={area.geography}
                  onValueChange={(value) => updateFocusArea(index, 'geography', value)}
                  disabled={disabled}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select country" />
                  </SelectTrigger>
                  <SelectContent>
                    {AFRICAN_COUNTRIES.map(country => (
                      <SelectItem key={country} value={country}>{country}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Sectors</Label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-2">
                  {SECTOR_OPTIONS.map(sector => (
                    <div key={sector} className="flex items-center space-x-2">
                      <Checkbox
                        id={`sector-${index}-${sector}`}
                        checked={area.sectors.includes(sector)}
                        onCheckedChange={() => toggleSectorInFocusArea(index, sector)}
                        disabled={disabled}
                      />
                      <Label
                        htmlFor={`sector-${index}-${sector}`}
                        className="text-xs font-normal cursor-pointer"
                      >
                        {sector}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}

          <Button
            type="button"
            variant="outline"
            onClick={addFocusArea}
            disabled={disabled}
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Focus Area
          </Button>
        </CardContent>
      </Card>

      {/* Discovery Tags */}
      <Card>
        <CardHeader>
          <CardTitle>Discovery & Matching</CardTitle>
          <p className="text-sm text-muted-foreground">
            Help others find you by tagging your expertise, regional focus, and industries
          </p>
        </CardHeader>
        <CardContent>
          <ProfileDiscoverySection
            focusAreas={formData.focus_areas || []}
            regionalExpertise={formData.regional_expertise || []}
            industries={formData.industries || []}
            onFocusAreasChange={(values) => onUpdate('focus_areas', values)}
            onRegionalExpertiseChange={(values) => onUpdate('regional_expertise', values)}
            onIndustriesChange={(values) => onUpdate('industries', values)}
          />
        </CardContent>
      </Card>
    </div>
  );
}

export default AfricaFocusSection;
