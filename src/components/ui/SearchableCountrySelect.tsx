import React, { useState, useMemo } from 'react';
import { Check, ChevronDown } from 'lucide-react';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { COUNTRIES } from '@/data/countries';

interface SearchableCountrySelectProps {
  value: string;
  onChange: (code: string, name: string) => void;
}

export default function SearchableCountrySelect({ value, onChange }: SearchableCountrySelectProps) {
  const [open, setOpen] = useState(false);

  const selectedCountry = useMemo(() => {
    return COUNTRIES.find(c => c.code === value);
  }, [value]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between bg-background min-h-[44px] text-left"
        >
          <span className={cn(!selectedCountry && "text-muted-foreground")}>
            {selectedCountry ? selectedCountry.name : "Select your current country..."}
          </span>
          <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[calc(100vw-2rem)] sm:w-[460px] p-0" align="start">
        <Command>
          <CommandInput placeholder="Search countries..." className="h-11" />
          <CommandEmpty>No country found.</CommandEmpty>
          <CommandGroup className="max-h-[280px] overflow-auto">
            {COUNTRIES.map((country) => (
              <CommandItem
                key={country.code}
                value={country.name}
                onSelect={() => {
                  onChange(country.code, country.name);
                  setOpen(false);
                }}
                className="px-3 py-2"
              >
                {country.name}
                <Check
                  className={cn(
                    "ml-auto h-4 w-4",
                    value === country.code ? "opacity-100" : "opacity-0"
                  )}
                />
              </CommandItem>
            ))}
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
