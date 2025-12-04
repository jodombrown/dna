import React, { useState } from 'react';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Check, ChevronsUpDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { COUNTRIES } from '@/data/countries';

interface CountrySelectProps {
  value: string;
  onChange: (code: string, name: string) => void;
}

export default function CountrySelect({ value, onChange }: CountrySelectProps) {
  const [open, setOpen] = useState(false);

  // Find the currently selected country by code
  const selectedCountry = COUNTRIES.find((c) => c.code === value);

  // CRITICAL FIX: Command component normalizes values to lowercase
  // We must do case-insensitive lookup to find the original country
  const handleSelect = (normalizedValue: string) => {
    const country = COUNTRIES.find(
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
          className="w-full justify-between min-h-[44px] bg-background"
        >
          {selectedCountry ? selectedCountry.name : "Select your current country"}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0 bg-background border shadow-lg z-50" align="start">
        <Command>
          <CommandInput placeholder="Search countries..." />
          <CommandEmpty>No country found.</CommandEmpty>
          <CommandGroup className="max-h-64 overflow-auto">
            {COUNTRIES.map((country) => {
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
                      "mr-2 h-4 w-4",
                      isSelected ? "opacity-100" : "opacity-0"
                    )}
                  />
                  {country.name}
                </CommandItem>
              );
            })}
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
