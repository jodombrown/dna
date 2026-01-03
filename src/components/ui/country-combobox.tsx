import React, { useState } from 'react';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Check, ChevronsUpDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { COUNTRIES } from '@/data/countries';

interface CountryComboboxProps {
  value: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export default function CountryCombobox({ 
  value, 
  onValueChange, 
  placeholder = "Select a country...",
  className 
}: CountryComboboxProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');

  // Find the currently selected country by name (case-insensitive)
  // Also handle legacy values like "London, United Kingdom" by checking if value contains country name
  const selectedCountry = COUNTRIES.find((c) => 
    c.name.toLowerCase() === (value || '').toLowerCase()
  ) || COUNTRIES.find((c) => 
    (value || '').toLowerCase().includes(c.name.toLowerCase())
  );

  // CRITICAL FIX: Command component normalizes values to lowercase
  // We must do case-insensitive lookup to find the original country
  const handleSelect = (normalizedValue: string) => {
    const country = COUNTRIES.find(
      (c) => c.name.toLowerCase() === normalizedValue.toLowerCase()
    );

    if (country) {
      onValueChange(country.name);
    }
    setOpen(false);
    setSearch('');
  };

  const filteredCountries = search
    ? COUNTRIES.filter(c => c.name.toLowerCase().includes(search.toLowerCase()))
    : COUNTRIES;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn("w-full justify-between min-h-[44px] bg-background", className)}
        >
          {selectedCountry ? selectedCountry.name : placeholder}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0 bg-popover border shadow-lg z-[200]" align="start" sideOffset={4}>
        <Command shouldFilter={false}>
          <CommandInput 
            placeholder="Search countries..." 
            value={search}
            onValueChange={setSearch}
          />
          <CommandList className="max-h-64 overflow-auto">
            <CommandEmpty>No country found.</CommandEmpty>
            <CommandGroup>
              {filteredCountries.map((country) => {
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
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
