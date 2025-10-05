import { useState, useEffect, useRef } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface CountryAutocompleteProps {
  label: string;
  value: string;
  onChange: (countryId: string, countryName: string) => void;
  placeholder?: string;
  required?: boolean;
  countries: Array<{ id: string; name: string }>;
}

export const CountryAutocomplete = ({
  label,
  value,
  onChange,
  placeholder = 'Start typing country name...',
  required = false,
  countries = [],
}: CountryAutocompleteProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const [filteredCountries, setFilteredCountries] = useState<Array<{ id: string; name: string }>>([]);
  const wrapperRef = useRef<HTMLDivElement>(null);

  // Set initial search term from value
  useEffect(() => {
    if (value && countries.length > 0) {
      const country = countries.find(c => c.id === value);
      if (country) {
        setSearchTerm(country.name);
      }
    }
  }, [value, countries]);

  // Utility: normalize strings for flexible matching (diacritics-insensitive)
  const normalize = (s: string) =>
    (s || '')
      .normalize('NFD')
      .replace(/\p{Diacritic}/gu, '')
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '');

  // Filter countries based on search term (robust matching)
  useEffect(() => {
    const s = normalize(searchTerm);
    if (!s) {
      setFilteredCountries([]);
      return;
    }

    const filtered = countries
      .map((country) => ({ country, norm: normalize(country.name) }))
      .filter(({ norm }) => norm.includes(s) || s.includes(norm))
      .slice(0, 20)
      .map(({ country }) => country);

    setFilteredCountries(filtered);
  }, [searchTerm, countries]);

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelectCountry = (country: { id: string; name: string }) => {
    setSearchTerm(country.name);
    onChange(country.id, country.name);
    setShowDropdown(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setSearchTerm(newValue);
    setShowDropdown(true);
    
    // Clear selection if user is typing
    if (newValue !== searchTerm) {
      onChange('', '');
    }
  };

  return (
    <div ref={wrapperRef} className="relative">
      <Label>
        {label} {required && '*'}
      </Label>
      <Input
        type="text"
        value={searchTerm}
        onChange={handleInputChange}
        onFocus={() => setShowDropdown(true)}
        placeholder={placeholder}
        className="w-full"
      />
      {showDropdown && filteredCountries.length > 0 && (
        <div className="absolute z-50 w-full mt-1 max-h-60 overflow-y-auto bg-background border border-input rounded-md shadow-lg">
          {filteredCountries.map((country) => (
            <button
              key={country.id}
              type="button"
              className="w-full px-3 py-2 text-left hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground transition-colors"
              onClick={() => handleSelectCountry(country)}
            >
              {country.name}
            </button>
          ))}
        </div>
      )}
      {showDropdown && searchTerm && filteredCountries.length === 0 && (
        <div className="absolute z-50 w-full mt-1 bg-background border border-input rounded-md shadow-lg p-3 text-sm text-muted-foreground">
          No countries found matching "{searchTerm}"
        </div>
      )}
    </div>
  );
};
