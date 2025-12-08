import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { AlertCircle, Globe, MapPin, Info } from 'lucide-react';
import SearchableCountrySelect from '@/components/ui/SearchableCountrySelect';

interface DiasporaOriginStepProps {
  data: {
    country_of_origin: string;
    diaspora_origin?: string;
  };
  onUpdate: (field: string, value: any) => void;
  errors?: Record<string, string>;
}

const DiasporaOriginStep: React.FC<DiasporaOriginStepProps> = ({ data, onUpdate, errors = {} }) => {
  return (
    <div className="space-y-6 max-w-2xl mx-auto px-4">
      <div className="text-center space-y-2 pt-6">
        <h2 className="text-xl sm:text-2xl font-bold text-dna-forest">Your Diaspora Story</h2>
        <p className="text-sm sm:text-base text-muted-foreground">
          Understanding your heritage helps us connect you with relevant opportunities and community.
        </p>
      </div>

      <Card>
        <CardContent className="p-4 sm:p-6 space-y-6">
          {/* Why This Matters */}
          <div className="flex items-start gap-3 p-3 bg-dna-mint/10 rounded-lg border border-dna-mint/20">
            <Info className="h-5 w-5 text-dna-emerald flex-shrink-0 mt-0.5" />
            <div className="text-sm">
              <p className="font-medium text-dna-forest mb-1">Why does this matter?</p>
              <p className="text-muted-foreground">
                DNA is built to mobilize the African diaspora. Your origin helps us match you with 
                region-specific opportunities, events, and community members who share your heritage.
              </p>
            </div>
          </div>

          {/* Country of Origin */}
          <div className="space-y-2">
            <Label htmlFor="country_of_origin" className="text-base flex items-center gap-2">
              <Globe className="h-4 w-4 text-dna-copper" />
              Country of Origin / Heritage *
            </Label>
            <SearchableCountrySelect
              value={data.country_of_origin}
              onChange={(code, name) => onUpdate('country_of_origin', name)}
            />
            <p className="text-xs text-muted-foreground">
              Where do your roots trace back to? Select the country that represents your heritage.
            </p>
            {errors.country_of_origin && (
              <p className="text-sm text-destructive flex items-center gap-1">
                <AlertCircle className="h-4 w-4" />
                {errors.country_of_origin}
              </p>
            )}
          </div>

          {/* Optional: Diaspora Origin / Region */}
          <div className="space-y-2">
            <Label htmlFor="diaspora_origin" className="text-base flex items-center gap-2">
              <MapPin className="h-4 w-4 text-dna-copper" />
              Diaspora Region (Optional)
            </Label>
            <select
              id="diaspora_origin"
              value={data.diaspora_origin || ''}
              onChange={(e) => onUpdate('diaspora_origin', e.target.value)}
              className="flex h-11 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              <option value="">Select a diaspora region...</option>
              <option value="North America">North America</option>
              <option value="Caribbean">Caribbean</option>
              <option value="Europe">Europe</option>
              <option value="United Kingdom">United Kingdom</option>
              <option value="South America">South America</option>
              <option value="Middle East">Middle East</option>
              <option value="Asia Pacific">Asia Pacific</option>
              <option value="Oceania">Oceania</option>
              <option value="Continental Africa">Continental Africa</option>
            </select>
            <p className="text-xs text-muted-foreground">
              Where does your diaspora journey place you? This helps with regional networking.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Encouragement */}
      <div className="text-center p-4 bg-gradient-to-r from-dna-gold/10 to-dna-copper/10 rounded-lg border border-dna-gold/20">
        <p className="text-sm font-medium text-dna-forest">
          🌍 You're joining a network of <span className="text-dna-copper">diaspora changemakers</span> from 54 African nations.
        </p>
      </div>
    </div>
  );
};

export default DiasporaOriginStep;
