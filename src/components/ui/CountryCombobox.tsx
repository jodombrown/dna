import React, { useState, useMemo } from 'react';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Check, ChevronsUpDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { COUNTRIES } from '@/data/countries';

// African country codes for filtering
const AFRICAN_COUNTRY_CODES = new Set([
  'DZ', 'AO', 'BJ', 'BW', 'BF', 'BI', 'CV', 'CM', 'CF', 'TD', 'KM', 'CG', 'CD',
  'CI', 'DJ', 'EG', 'GQ', 'ER', 'SZ', 'ET', 'GA', 'GM', 'GH', 'GN', 'GW', 'KE',
  'LS', 'LR', 'LY', 'MG', 'MW', 'ML', 'MR', 'MU', 'MA', 'MZ', 'NA', 'NE', 'NG',
  'RW', 'ST', 'SN', 'SC', 'SL', 'SO', 'ZA', 'SS', 'SD', 'TZ', 'TG', 'TN', 'UG',
  'ZM', 'ZW'
]);

export interface CountryComboboxProps {
  /** Current value - can be country code or country name */
  value: string;
  /** Callback when country is selected - receives both code and name */
  onChange: (code: string, name: string) => void;
  /** Placeholder text when no country is selected */
  placeholder?: string;
  /** Only show African countries */
  africanOnly?: boolean;
  /** Disable the component */
  disabled?: boolean;
  /** Additional class names for the trigger button */
  className?: string;
  /** Show error state */
  error?: boolean;
  /** Accessible label for screen readers */
  'aria-label'?: string;
}

/**
 * Unified country selector component with search functionality.
 * Replaces both CountrySelect and SearchableCountrySelect.
 *
 * Features:
 * - Searchable dropdown with 200+ countries
 * - Optional African-only filter
 * - Supports value by code or name
 * - Touch-friendly with 44px minimum tap target
 * - Accessible with proper ARIA attributes
 */
export default function CountryCombobox({
  value,
  onChange,
  placeholder = 'Select a country...',
  africanOnly = false,
  disabled = false,
  className,
  error = false,
  'aria-label': ariaLabel,
}: CountryComboboxProps) {
  const [open, setOpen] = useState(false);

  // Filter countries based on africanOnly prop
  const availableCountries = useMemo(() => {
    if (africanOnly) {
      return COUNTRIES.filter(c => AFRICAN_COUNTRY_CODES.has(c.code));
    }
    return COUNTRIES;
  }, [africanOnly]);

  // Find the currently selected country by code OR name (case-insensitive)
  const selectedCountry = useMemo(() => {
    if (!value) return null;
    const normalizedValue = value.toLowerCase();
    return availableCountries.find(
      (c) =>
        c.code.toLowerCase() === normalizedValue ||
        c.name.toLowerCase() === normalizedValue
    );
  }, [value, availableCountries]);

  // Handle selection - Command component normalizes values to lowercase
  const handleSelect = (normalizedValue: string) => {
    const country = availableCountries.find(
      (c) => c.name.toLowerCase() === normalizedValue.toLowerCase()
    );

    if (country) {
      onChange(country.code, country.name);
    }
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          aria-label={ariaLabel || placeholder}
          disabled={disabled}
          className={cn(
            'w-full justify-between min-h-[44px] bg-background',
            error && 'border-destructive focus:ring-destructive',
            disabled && 'opacity-50 cursor-not-allowed',
            className
          )}
        >
          <span className={cn(!selectedCountry && 'text-muted-foreground')}>
            {selectedCountry ? selectedCountry.name : placeholder}
          </span>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="w-[var(--radix-popover-trigger-width)] p-0 bg-background border shadow-lg z-50"
        align="start"
      >
        <Command>
          <CommandInput placeholder="Search countries..." />
          <CommandList className="max-h-64 overflow-auto">
            <CommandEmpty>No country found.</CommandEmpty>
            <CommandGroup>
              {availableCountries.map((country) => {
                const isSelected = selectedCountry?.code === country.code;
                return (
                  <CommandItem
                    key={country.code}
                    value={country.name}
                    onSelect={handleSelect}
                    className="cursor-pointer"
                  >
                    <Check
                      className={cn(
                        'mr-2 h-4 w-4',
                        isSelected ? 'opacity-100' : 'opacity-0'
                      )}
                    />
                    {country.name}
                  </CommandItem>
                );
              })}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

// Named export for flexibility
export { CountryCombobox };
