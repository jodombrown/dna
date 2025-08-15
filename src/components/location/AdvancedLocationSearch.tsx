import React, { useState, useEffect, useRef } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, MapPin } from 'lucide-react';

export interface LocationResult {
  place_id: string;
  display_name: string;
  lat: string;
  lon: string;
  type: string;
  importance: number;
  address?: {
    city?: string;
    state?: string;
    country?: string;
    country_code?: string;
  };
}

export interface SelectedLocation {
  display_name: string;
  city?: string;
  state?: string;
  country?: string;
  coordinates?: { lat: number; lng: number };
  label: string; // Add for compatibility
}

interface AdvancedLocationSearchProps {
  id?: string;
  label?: string;
  value: string;
  onChange: (value: string) => void;
  onSelect?: (location: SelectedLocation) => void;
  placeholder?: string;
  className?: string;
  required?: boolean;
}

const AdvancedLocationSearch: React.FC<AdvancedLocationSearchProps> = ({
  id = 'location',
  label,
  value,
  onChange,
  onSelect,
  placeholder = 'Search for any location worldwide...',
  className = '',
  required = false,
}) => {
  const [searchTerm, setSearchTerm] = useState(value);
  const [results, setResults] = useState<LocationResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState(-1);
  
  const debounceTimer = useRef<NodeJS.Timeout>();
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setSearchTerm(value);
  }, [value]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
        setFocusedIndex(-1);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const searchLocations = async (query: string) => {
    if (!query || query.length < 2) {
      setResults([]);
      setShowDropdown(false);
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
          query
        )}&limit=8&addressdetails=1&extratags=1`
      );
      
      if (response.ok) {
        const data: LocationResult[] = await response.json();
        setResults(data);
        setShowDropdown(data.length > 0);
        setFocusedIndex(-1);
      }
    } catch (error) {
      console.error('Error searching locations:', error);
      setResults([]);
      setShowDropdown(false);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setSearchTerm(newValue);
    onChange(newValue);

    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    debounceTimer.current = setTimeout(() => {
      searchLocations(newValue);
    }, 300);
  };

  const handleResultSelect = (result: LocationResult) => {
    const selectedLocation: SelectedLocation = {
      display_name: result.display_name,
      city: result.address?.city,
      state: result.address?.state,
      country: result.address?.country,
      coordinates: {
        lat: parseFloat(result.lat),
        lng: parseFloat(result.lon),
      },
      label: result.display_name, // Add for compatibility
    };

    setSearchTerm(result.display_name);
    onChange(result.display_name);
    onSelect?.(selectedLocation);
    setShowDropdown(false);
    setFocusedIndex(-1);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!showDropdown || results.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setFocusedIndex(prev => 
          prev < results.length - 1 ? prev + 1 : 0
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setFocusedIndex(prev => 
          prev > 0 ? prev - 1 : results.length - 1
        );
        break;
      case 'Enter':
        e.preventDefault();
        if (focusedIndex >= 0 && results[focusedIndex]) {
          handleResultSelect(results[focusedIndex]);
        }
        break;
      case 'Escape':
        setShowDropdown(false);
        setFocusedIndex(-1);
        inputRef.current?.blur();
        break;
    }
  };

  const formatDisplayName = (displayName: string) => {
    // Remove country code and clean up display
    return displayName.split(',').slice(0, 3).join(', ');
  };

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      {label && (
        <Label htmlFor={id} className="block mb-1 text-sm font-medium text-foreground">
          {label}
          {required && <span className="text-destructive ml-1">*</span>}
        </Label>
      )}
      
      <div className="relative">
        <Input
          ref={inputRef}
          id={id}
          type="text"
          value={searchTerm}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={() => {
            if (results.length > 0) {
              setShowDropdown(true);
            }
          }}
          placeholder={placeholder}
          className="pr-10"
          autoComplete="off"
          required={required}
        />
        
        <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
          ) : (
            <MapPin className="h-4 w-4 text-muted-foreground" />
          )}
        </div>
      </div>

      {showDropdown && results.length > 0 && (
        <div className="absolute z-50 w-full mt-1 bg-background border rounded-md shadow-lg max-h-60 overflow-auto">
          {results.map((result, index) => (
            <button
              key={result.place_id}
              type="button"
              className={`w-full px-4 py-3 text-left hover:bg-muted transition-colors border-b border-border last:border-b-0 ${
                index === focusedIndex ? 'bg-muted' : ''
              }`}
              onClick={() => handleResultSelect(result)}
              onMouseEnter={() => setFocusedIndex(index)}
            >
              <div className="flex items-start gap-2">
                <MapPin className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                <div className="min-w-0 flex-1">
                  <div className="font-medium text-sm text-foreground truncate">
                    {formatDisplayName(result.display_name)}
                  </div>
                  {result.address?.country && (
                    <div className="text-xs text-muted-foreground mt-1">
                      {result.address.country}
                    </div>
                  )}
                </div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdvancedLocationSearch;