/**
 * DNA | CONVENE — Location Selector
 * Luma-style "[City] >" tappable selector with dropdown/bottom-sheet.
 */

import React, { useState } from 'react';
import { ChevronDown, MapPin, Globe } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';

interface CityOption {
  city: string;
  country: string | null;
  count: number;
}

interface ConveneLocationSelectorProps {
  selectedCity: string | null;
  userCity: string | null;
  cities: CityOption[];
  onCityChange: (city: string | null) => void;
}

export function ConveneLocationSelector({
  selectedCity,
  userCity,
  cities,
  onCityChange,
}: ConveneLocationSelectorProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');

  const displayCity = selectedCity || userCity || 'Explore All';

  const filteredCities = search.trim()
    ? cities.filter((c) =>
        c.city.toLowerCase().includes(search.toLowerCase())
      )
    : cities;

  const handleSelect = (city: string | null) => {
    onCityChange(city);
    setOpen(false);
    setSearch('');
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          className={cn(
            'flex items-center gap-1.5 text-left transition-colors',
            'hover:text-[hsl(var(--module-convene))] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-md px-1 -mx-1',
          )}
        >
          <MapPin className="w-4 h-4 text-[hsl(var(--module-convene))]" />
          <span className="text-lg font-bold text-foreground">{displayCity}</span>
          <ChevronDown className="w-4 h-4 text-muted-foreground" />
        </button>
      </PopoverTrigger>

      <PopoverContent
        align="start"
        className="w-[260px] p-0 overflow-hidden"
      >
        {/* Search */}
        <div className="p-2 border-b border-border">
          <Input
            placeholder="Search cities..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-8 text-sm"
            autoFocus
          />
        </div>

        {/* City list */}
        <div className="max-h-[240px] overflow-y-auto py-1">
          {/* Explore All */}
          <button
            className={cn(
              'w-full flex items-center gap-2 px-3 py-2 text-sm text-left hover:bg-accent transition-colors',
              !selectedCity && 'text-[hsl(var(--module-convene))] font-medium',
            )}
            onClick={() => handleSelect(null)}
          >
            <Globe className="w-3.5 h-3.5 text-muted-foreground" />
            Explore All
          </button>

          {filteredCities.map((c) => (
            <button
              key={c.city}
              className={cn(
                'w-full flex items-center justify-between px-3 py-2 text-sm text-left hover:bg-accent transition-colors',
                selectedCity?.toLowerCase() === c.city.toLowerCase() &&
                  'text-[hsl(var(--module-convene))] font-medium',
              )}
              onClick={() => handleSelect(c.city)}
            >
              <span className="truncate">{c.city}</span>
              <span className="text-xs text-muted-foreground shrink-0 ml-2">
                {c.count}
              </span>
            </button>
          ))}

          {filteredCities.length === 0 && (
            <p className="px-3 py-4 text-sm text-muted-foreground text-center">
              No cities found
            </p>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
