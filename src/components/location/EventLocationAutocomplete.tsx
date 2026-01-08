import { useEffect, useState, useRef } from 'react';
import { MapPin, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface LocationData {
  displayName: string;
  venueName?: string;
  city?: string;
  country?: string;
  lat?: number;
  lng?: number;
}

interface EventLocationAutocompleteProps {
  value: LocationData | string;
  onChange: (location: LocationData) => void;
  placeholder?: string;
  className?: string;
}

interface NominatimResult {
  place_id: number;
  display_name: string;
  lat: string;
  lon: string;
  address?: {
    house_number?: string;
    road?: string;
    neighbourhood?: string;
    suburb?: string;
    city?: string;
    town?: string;
    village?: string;
    state?: string;
    country?: string;
    postcode?: string;
  };
  type?: string;
  class?: string;
}

export function EventLocationAutocomplete({
  value,
  onChange,
  placeholder = "Search for a venue or address...",
  className,
}: EventLocationAutocompleteProps) {
  const displayValue = typeof value === 'string' ? value : value?.displayName || '';
  const [query, setQuery] = useState(displayValue);
  const [results, setResults] = useState<NominatimResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [focused, setFocused] = useState(false);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  // Sync query with external value changes
  useEffect(() => {
    const newDisplayValue = typeof value === 'string' ? value : value?.displayName || '';
    if (newDisplayValue !== query) {
      setQuery(newDisplayValue);
    }
  }, [value]);

  // Debounced search
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    
    const trimmed = query.trim();
    if (!trimmed || trimmed.length < 3) {
      setResults([]);
      return;
    }

    debounceRef.current = setTimeout(async () => {
      setLoading(true);
      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/search?` +
          new URLSearchParams({
            q: trimmed,
            format: 'json',
            addressdetails: '1',
            limit: '8',
            'accept-language': 'en'
          }),
          {
            headers: {
              'User-Agent': 'DNA-Platform/1.0'
            }
          }
        );
        
        if (!response.ok) {
          setResults([]);
          return;
        }
        
        const data: NominatimResult[] = await response.json();
        setResults(data);
        if (data.length > 0 && focused) {
          setOpen(true);
        }
      } catch (error) {
        console.error('Location search error:', error);
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 400);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query, focused]);

  const handleSelect = (result: NominatimResult) => {
    const address = result.address || {};
    const city = address.city || address.town || address.village || '';
    const country = address.country || '';
    
    // Build venue name from address components
    const venueParts = [
      address.house_number,
      address.road,
      address.neighbourhood || address.suburb
    ].filter(Boolean);
    const venueName = venueParts.length > 0 ? venueParts.join(' ') : '';
    
    // Create a clean display name
    let displayName = result.display_name;
    if (venueName && city && country) {
      displayName = `${venueName}, ${city}, ${country}`;
    } else if (city && country) {
      displayName = `${city}, ${country}`;
    }

    const locationData: LocationData = {
      displayName,
      venueName: venueName || city,
      city,
      country,
      lat: parseFloat(result.lat),
      lng: parseFloat(result.lon),
    };

    setQuery(displayName);
    onChange(locationData);
    setOpen(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setQuery(newValue);
    
    // If user is typing, update the parent with just the string value
    if (newValue.trim()) {
      onChange({
        displayName: newValue,
        venueName: undefined,
        city: undefined,
        country: undefined,
        lat: undefined,
        lng: undefined,
      });
    }
  };

  return (
    <div className={cn("relative", className)}>
      <div className="relative">
        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <input
          type="text"
          value={query}
          onChange={handleInputChange}
          onFocus={() => {
            setFocused(true);
            if (results.length > 0) setOpen(true);
          }}
          onBlur={() => {
            setFocused(false);
            setTimeout(() => setOpen(false), 200);
          }}
          placeholder={placeholder}
          className="flex h-10 w-full rounded-md border border-input bg-background pl-10 pr-10 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          role="combobox"
          aria-expanded={open}
          aria-autocomplete="list"
        />
        {loading && (
          <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-muted-foreground" />
        )}
      </div>

      {open && results.length > 0 && (
        <div className="absolute z-50 mt-1 w-full rounded-md border bg-popover shadow-lg max-h-60 overflow-auto">
          {results.map((result) => {
            const address = result.address || {};
            const city = address.city || address.town || address.village || '';
            const country = address.country || '';
            
            return (
              <button
                key={result.place_id}
                type="button"
                className="flex items-start gap-3 w-full text-left px-3 py-2.5 hover:bg-muted transition-colors border-b last:border-b-0"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => handleSelect(result)}
              >
                <MapPin className="h-4 w-4 mt-0.5 text-muted-foreground flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">
                    {result.display_name.split(',')[0]}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">
                    {city && country ? `${city}, ${country}` : result.display_name}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      )}

      {open && !loading && results.length === 0 && query.length >= 3 && (
        <div className="absolute z-50 mt-1 w-full rounded-md border bg-popover p-3 text-sm text-muted-foreground shadow-lg">
          No locations found. Try a different search term.
        </div>
      )}
    </div>
  );
}

export default EventLocationAutocomplete;
