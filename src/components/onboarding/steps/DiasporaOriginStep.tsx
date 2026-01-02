import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertCircle, Globe, Heart, Info } from 'lucide-react';
import SearchableCountrySelect from '@/components/ui/SearchableCountrySelect';
import { CONNECTION_TYPE_OPTIONS } from '@/data/profileOptions';

interface DiasporaOriginStepProps {
  data: {
    country_of_origin: string;
    diaspora_status?: string;
  };
  onUpdate: (field: string, value: any) => void;
  errors?: Record<string, string>;
}

const DiasporaOriginStep: React.FC<DiasporaOriginStepProps> = ({ data, onUpdate, errors = {} }) => {
  return (
    <div className="space-y-6 max-w-2xl mx-auto px-4">
      <div className="text-center space-y-2 pt-6">
        <h2 className="text-xl sm:text-2xl font-bold text-dna-forest">Your Connection to Africa</h2>
        <p className="text-sm sm:text-base text-muted-foreground">
          Whether diaspora, continental African, or ally, we welcome all who support African development.
        </p>
      </div>

      <Card>
        <CardContent className="p-4 sm:p-6 space-y-6">
          {/* Why This Matters */}
          <div className="flex items-start gap-3 p-3 bg-dna-mint/10 rounded-lg border border-dna-mint/20">
            <Info className="h-5 w-5 text-dna-emerald flex-shrink-0 mt-0.5" />
            <div className="text-sm">
              <p className="font-medium text-dna-forest mb-1">DNA is inclusive</p>
              <p className="text-muted-foreground">
                We welcome diaspora members, continental Africans, and allies who believe in 
                Africa's potential. Your connection helps us match you with the right community.
              </p>
            </div>
          </div>

          {/* Connection Type */}
          <div className="space-y-2">
            <Label htmlFor="connection_type" className="text-base flex items-center gap-2">
              <Heart className="h-4 w-4 text-dna-copper" />
              How do you connect to Africa? *
            </Label>
            <Select 
              value={data.diaspora_status || ''} 
              onValueChange={(value) => onUpdate('diaspora_status', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select your connection type" />
              </SelectTrigger>
              <SelectContent>
                {CONNECTION_TYPE_OPTIONS.map(option => (
                  <SelectItem key={option.value} value={option.value}>
                    <div className="flex flex-col py-1">
                      <span className="font-medium">{option.label}</span>
                      <span className="text-xs text-muted-foreground">{option.description}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.diaspora_status && (
              <p className="text-sm text-destructive flex items-center gap-1">
                <AlertCircle className="h-4 w-4" />
                {errors.diaspora_status}
              </p>
            )}
          </div>

          {/* Country of Origin - Only show for relevant connection types */}
          <div className="space-y-2">
            <Label htmlFor="country_of_origin" className="text-base flex items-center gap-2">
              <Globe className="h-4 w-4 text-dna-copper" />
              {data.diaspora_status === 'ally' ? 'Country You Support (Optional)' : 'Country of Heritage *'}
            </Label>
            <SearchableCountrySelect
              value={data.country_of_origin}
              onChange={(code, name) => onUpdate('country_of_origin', name)}
            />
            <p className="text-xs text-muted-foreground">
              {data.diaspora_status === 'ally' 
                ? 'Which African country or region are you most connected to?'
                : 'Select the African country that represents your heritage or roots.'}
            </p>
            {errors.country_of_origin && (
              <p className="text-sm text-destructive flex items-center gap-1">
                <AlertCircle className="h-4 w-4" />
                {errors.country_of_origin}
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Encouragement */}
      <div className="text-center p-4 bg-gradient-to-r from-dna-gold/10 to-dna-copper/10 rounded-lg border border-dna-gold/20">
        <p className="text-sm font-medium text-dna-forest">
          🌍 You're joining a global network of <span className="text-dna-copper">changemakers</span> united for Africa's development.
        </p>
      </div>
    </div>
  );
};

export default DiasporaOriginStep;
