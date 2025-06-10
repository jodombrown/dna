
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Plus, X } from 'lucide-react';

interface CulturalBackgroundSectionProps {
  formData: {
    country_of_origin: string;
    current_country: string;
    years_in_diaspora: string;
    languages: string;
  };
  diasporaNetworks: string[];
  newNetwork: string;
  onInputChange: (field: string, value: string) => void;
  onNetworkChange: (value: string) => void;
  onAddNetwork: () => void;
  onRemoveNetwork: (network: string) => void;
}

const CulturalBackgroundSection: React.FC<CulturalBackgroundSectionProps> = ({
  formData,
  diasporaNetworks,
  newNetwork,
  onInputChange,
  onNetworkChange,
  onAddNetwork,
  onRemoveNetwork,
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-dna-forest">Cultural Background & Diaspora Identity</CardTitle>
        <CardDescription>Your cultural heritage and diaspora journey</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="country_of_origin">Country of Origin</Label>
            <Input
              id="country_of_origin"
              value={formData.country_of_origin}
              onChange={(e) => onInputChange('country_of_origin', e.target.value)}
              placeholder="Nigeria, Ghana, Kenya, etc."
            />
          </div>
          <div>
            <Label htmlFor="current_country">Current Country</Label>
            <Input
              id="current_country"
              value={formData.current_country}
              onChange={(e) => onInputChange('current_country', e.target.value)}
              placeholder="United States, Canada, UK, etc."
            />
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="years_in_diaspora">Years in Diaspora</Label>
            <Input
              id="years_in_diaspora"
              type="number"
              value={formData.years_in_diaspora}
              onChange={(e) => onInputChange('years_in_diaspora', e.target.value)}
              placeholder="5"
            />
          </div>
          <div>
            <Label htmlFor="languages">Languages</Label>
            <Input
              id="languages"
              value={formData.languages}
              onChange={(e) => onInputChange('languages', e.target.value)}
              placeholder="English, French, Yoruba, Swahili, etc."
            />
          </div>
        </div>

        <div>
          <Label>Diaspora Networks & Organizations</Label>
          <div className="flex gap-2 mb-2">
            <Input
              value={newNetwork}
              onChange={(e) => onNetworkChange(e.target.value)}
              placeholder="African diaspora organizations you're part of..."
              onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), onAddNetwork())}
            />
            <Button type="button" onClick={onAddNetwork} size="sm">
              <Plus className="w-4 h-4" />
            </Button>
          </div>
          <div className="flex flex-wrap gap-2">
            {diasporaNetworks.map((network, index) => (
              <Badge key={index} variant="outline" className="text-dna-gold border-dna-gold">
                {network}
                <X
                  className="w-3 h-3 ml-1 cursor-pointer"
                  onClick={() => onRemoveNetwork(network)}
                />
              </Badge>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default CulturalBackgroundSection;
