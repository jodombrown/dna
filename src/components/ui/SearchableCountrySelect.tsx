import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { COUNTRIES } from '@/data/countries';

interface SearchableCountrySelectProps {
  value: string;
  onChange: (code: string, name: string) => void;
}

export default function SearchableCountrySelect({ value, onChange }: SearchableCountrySelectProps) {
  const handleChange = (countryName: string) => {
    const country = COUNTRIES.find((c) => c.name === countryName);

    if (country) {
      onChange(country.code, country.name);
    } else {
      onChange('', countryName);
    }
  };

  return (
    <Select value={value} onValueChange={handleChange}>
      <SelectTrigger className="min-h-[44px] w-full bg-background">
        <SelectValue placeholder="Select your current country..." />
      </SelectTrigger>
      <SelectContent>
        {COUNTRIES.map((country) => (
          <SelectItem key={country.code} value={country.name}>
            {country.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
