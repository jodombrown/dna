import React from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Badge } from '@/components/ui/badge';

interface Step1Props {
  data: any;
  onChange: (data: any) => void;
  onNext: () => void;
}

const commonLanguages = [
  'English', 'French', 'Portuguese', 'Arabic', 'Swahili',
  'Yoruba', 'Igbo', 'Hausa', 'Amharic', 'Zulu', 'Somali'
];

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

  const toggleLanguage = (lang: string) => {
    const current = data.languages || [];
    onChange({
      ...data,
      languages: current.includes(lang)
        ? current.filter((l: string) => l !== lang)
        : [...current, lang]
    });
  };

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
        <div>
          <Label>Country of Origin *</Label>
          <Select value={data.country_of_origin_id} onValueChange={(value) => onChange({ ...data, country_of_origin_id: value })}>
            <SelectTrigger>
              <SelectValue placeholder="Select your country of origin" />
            </SelectTrigger>
            <SelectContent>
              {countries.map((country: any) => (
                <SelectItem key={country.id} value={country.id}>
                  {country.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label>Current Country *</Label>
          <Select value={data.current_country_id} onValueChange={(value) => onChange({ ...data, current_country_id: value })}>
            <SelectTrigger>
              <SelectValue placeholder="Where are you based now?" />
            </SelectTrigger>
            <SelectContent>
              {countries.map((country: any) => (
                <SelectItem key={country.id} value={country.id}>
                  {country.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label>Current City</Label>
          <Input
            value={data.current_city || ''}
            onChange={(e) => onChange({ ...data, current_city: e.target.value })}
            placeholder="e.g., London, New York"
          />
        </div>

        <div>
          <Label>Years in Diaspora</Label>
          <Input
            type="number"
            value={data.years_in_diaspora || ''}
            onChange={(e) => onChange({ ...data, years_in_diaspora: parseInt(e.target.value) || null })}
            placeholder="How many years have you been away?"
          />
        </div>

        <div>
          <Label>Languages You Speak</Label>
          <div className="flex flex-wrap gap-2 mt-2">
            {commonLanguages.map((lang) => (
              <Badge
                key={lang}
                variant={data.languages?.includes(lang) ? 'default' : 'outline'}
                className="cursor-pointer"
                onClick={() => toggleLanguage(lang)}
              >
                {lang}
              </Badge>
            ))}
          </div>
        </div>

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
