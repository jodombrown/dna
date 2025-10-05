import React from 'react';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { CountryAutocomplete } from '@/components/onboarding/CountryAutocomplete';
import LocationAutocomplete from '@/components/ui/location-autocomplete';
import { LanguageAutocomplete } from '@/components/onboarding/LanguageAutocomplete';

interface Step1Props {
  data: any;
  onChange: (data: any) => void;
  onNext: () => void;
}

export const Step1DiasporaIdentity: React.FC<Step1Props> = ({ data, onChange, onNext }) => {
  const { data: countries = [] } = useQuery({
    queryKey: ['countries'],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from('countries')
        .select('*')
        .order('name');
      if (error) throw error;
      return data;
    },
  });

  const canProceed = data.country_of_origin_id && data.current_country_id && 
                     data.diaspora_story?.length >= 50;

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div>
        <h2 className="text-2xl font-bold">Tell us your diaspora story</h2>
        <p className="text-muted-foreground mt-2">
          Help us understand your journey and connection to Africa
        </p>
      </div>

      <div className="space-y-4">
        <CountryAutocomplete
          label="Country of Origin"
          value={data.country_of_origin_id}
          onChange={(countryId) => onChange({ ...data, country_of_origin_id: countryId })}
          placeholder="Start typing your country of origin..."
          required
          countries={countries}
        />

        <CountryAutocomplete
          label="Country of Residence"
          value={data.current_country_id}
          onChange={(countryId) => onChange({ ...data, current_country_id: countryId })}
          placeholder="Start typing where you currently reside..."
          required
          countries={countries}
        />

        <div>
          <Label>Current City/Province/District</Label>
          <LocationAutocomplete
            value={data.current_city || ''}
            onSelect={(loc) => onChange({ ...data, current_city: loc.label })}
            placeholder="Start typing your city, province, or district..."
          />
        </div>

        <div>
          <Label>Connection to Africa (optional)</Label>
          <p className="text-sm text-muted-foreground mb-2">
            How would you describe your relationship with Africa? (e.g., "Born and raised", "Second generation", "Never visited but deeply connected through family", etc.)
          </p>
          <Textarea
            value={data.years_in_diaspora_text || ''}
            onChange={(e) => onChange({ ...data, years_in_diaspora_text: e.target.value, years_in_diaspora: null })}
            placeholder="Share your connection to the African continent..."
            className="min-h-[80px]"
          />
        </div>

        <LanguageAutocomplete
          value={data.languages || []}
          onChange={(languages) => onChange({ ...data, languages })}
        />

        <div>
          <Label>Your Diaspora Story * (min 50 characters)</Label>
          <Textarea
            value={data.diaspora_story || ''}
            onChange={(e) => onChange({ ...data, diaspora_story: e.target.value })}
            placeholder="Share your journey... Where are you from? What brought you to where you are now? What keeps you connected to Africa?"
            className="min-h-[120px]"
          />
          <div className="text-xs text-muted-foreground mt-1">
            {data.diaspora_story?.length || 0} / 50 characters
          </div>
        </div>
      </div>

      <Button onClick={onNext} disabled={!canProceed} className="w-full">
        Continue to Professional Profile
      </Button>
    </div>
  );
};
