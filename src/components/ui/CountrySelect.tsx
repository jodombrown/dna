import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const COUNTRIES: { code: string; name: string }[] = [
  { code: 'NG', name: 'Nigeria' },
  { code: 'GH', name: 'Ghana' },
  { code: 'KE', name: 'Kenya' },
  { code: 'ZA', name: 'South Africa' },
  { code: 'ET', name: 'Ethiopia' },
  { code: 'EG', name: 'Egypt' },
  { code: 'US', name: 'United States' },
  { code: 'CA', name: 'Canada' },
  { code: 'GB', name: 'United Kingdom' },
  { code: 'FR', name: 'France' },
  { code: 'DE', name: 'Germany' },
  { code: 'NL', name: 'Netherlands' },
  { code: 'BR', name: 'Brazil' },
  { code: 'JM', name: 'Jamaica' },
];

export default function CountrySelect({
  value,
  onChange,
}: {
  value: string;
  onChange: (code: string, name: string) => void;
}) {
  return (
    <Select value={value} onValueChange={(code) => {
      const found = COUNTRIES.find(c => c.code === code);
      onChange(code, found?.name || '');
    }}>
      <SelectTrigger className="bg-white">
        <SelectValue placeholder="Select your current country" />
      </SelectTrigger>
      <SelectContent className="bg-white border border-gray-200 shadow-lg z-50 max-h-[300px]">
        {COUNTRIES.map(({ code, name }) => (
          <SelectItem key={code} value={code} className="hover:bg-dna-mint/20">
            {name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
