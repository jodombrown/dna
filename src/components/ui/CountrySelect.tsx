import React, { useState } from 'react';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Check, ChevronsUpDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { COUNTRIES } from '@/data/countries';

export default function CountrySelect({
  value,
  onChange,
  placeholder = "Select country...",
}: {
  value: string;
  onChange: (code: string, name: string) => void;
  placeholder?: string;
}) {
  const [open, setOpen] = useState(false);

  const handleSelect = (normalizedValue: string) => {
    // Command component normalizes values to lowercase, so we need to find the original country
    const country = COUNTRIES.find(c => c.name.toLowerCase() === normalizedValue.toLowerCase());

    if (country) {
      onChange(country.code, country.name);
      setOpen(false);
    }
  };

  // Find the selected country for display
  const selectedCountry = COUNTRIES.find(c => c.name === value);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="min-h-[44px] w-full justify-between bg-background font-normal"
        >
          {selectedCountry ? selectedCountry.name : placeholder}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0" align="start">
        <Command>
          <CommandInput placeholder="Search countries..." />
          <CommandEmpty>No country found.</CommandEmpty>
          <CommandGroup className="max-h-64 overflow-auto">
            {COUNTRIES.map((country) => {
              const isSelected = value === country.name;
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
