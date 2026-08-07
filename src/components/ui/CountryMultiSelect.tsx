import React, { useMemo, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Check, ChevronsUpDown, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { CONTINENT_COUNTRY_LIST, getCountryNameByAlpha3, type CountryOption } from '@/lib/dna-place';

export interface CountryMultiSelectProps {
  /** Selected ISO 3166-1 alpha-3 country codes */
  value: string[];
  /** Callback when the selection changes, receives the updated alpha-3 code list */
  onChange: (codes: string[]) => void;
  /** Placeholder text when nothing is selected */
  placeholder?: string;
  /** Disable the component */
  disabled?: boolean;
  /** Additional class names for the trigger button */
  className?: string;
  /** Show error state */
  error?: boolean;
  /** Accessible label for screen readers */
  'aria-label'?: string;
}

const ALL_COUNTRIES: CountryOption[] = Object.values(CONTINENT_COUNTRY_LIST)
  .flat()
  .sort((a, b) => a.name.localeCompare(b.name));

/**
 * Multi-select country picker keyed on ISO 3166-1 alpha-3 codes, built on
 * the same dna-place.ts taxonomy (D054 Charter) that backs profiles.country
 * and CountryCombobox. Use this for any array-of-countries field instead of
 * hand-rolling a new picker.
 */
export function CountryMultiSelect({
  value,
  onChange,
  placeholder = 'Select countries...',
  disabled = false,
  className,
  error = false,
  'aria-label': ariaLabel,
}: CountryMultiSelectProps) {
  const [open, setOpen] = useState(false);
  const safeValue = Array.isArray(value) ? value : [];

  const selectedCountries = useMemo(
    () => safeValue.map((alpha3) => ({ alpha3, name: getCountryNameByAlpha3(alpha3) ?? alpha3 })),
    [safeValue]
  );

  const handleSelect = (alpha3: string) => {
    if (safeValue.includes(alpha3)) {
      onChange(safeValue.filter((code) => code !== alpha3));
    } else {
      onChange([...safeValue, alpha3]);
    }
  };

  const removeCountry = (alpha3: string) => {
    onChange(safeValue.filter((code) => code !== alpha3));
  };

  return (
    <div className="space-y-2">
      <Popover open={open} onOpenChange={disabled ? undefined : setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            aria-label={ariaLabel || placeholder}
            disabled={disabled}
            className={cn(
              'w-full justify-between text-left font-normal min-h-[44px] bg-background',
              error && 'border-destructive focus:ring-destructive',
              disabled && 'opacity-50 cursor-not-allowed',
              className
            )}
          >
            <span className={cn(safeValue.length === 0 && 'text-muted-foreground')}>
              {safeValue.length === 0 ? placeholder : `${safeValue.length} selected`}
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
                {ALL_COUNTRIES.map((country) => {
                  const isSelected = safeValue.includes(country.alpha3);
                  return (
                    <CommandItem
                      key={country.alpha3}
                      value={country.name}
                      onSelect={() => handleSelect(country.alpha3)}
                      className="cursor-pointer"
                    >
                      <Check
                        className={cn('mr-2 h-4 w-4', isSelected ? 'opacity-100' : 'opacity-0')}
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

      {selectedCountries.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-2">
          {selectedCountries.map((country) => (
            <Badge key={country.alpha3} className="pr-1 bg-dna-ocean/10 text-dna-ocean border-dna-ocean/20">
              {country.name}
              <button
                type="button"
                className="ml-1 rounded-full hover:bg-black/10 p-0.5"
                onClick={() => removeCountry(country.alpha3)}
                disabled={disabled}
                aria-label={`Remove ${country.name}`}
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
}

export default CountryMultiSelect;
