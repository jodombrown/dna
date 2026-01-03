import React, { useState, useRef, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { X } from 'lucide-react';
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
  placeholder = "Type to search countries...",
  className 
}: CountryComboboxProps) {
  const [inputValue, setInputValue] = useState(value || '');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  // Sync input with external value
  useEffect(() => {
    setInputValue(value || '');
  }, [value]);

  const filteredCountries = inputValue.trim()
    ? COUNTRIES.filter(c => 
        c.name.toLowerCase().includes(inputValue.toLowerCase())
      ).slice(0, 8)
    : [];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    setShowSuggestions(true);
    setFocusedIndex(-1);
    
    // If user clears input, clear selection
    if (!newValue.trim()) {
      onValueChange('');
    }
  };

  const handleSelect = (countryName: string) => {
    setInputValue(countryName);
    onValueChange(countryName);
    setShowSuggestions(false);
    setFocusedIndex(-1);
  };

  const handleClear = () => {
    setInputValue('');
    onValueChange('');
    inputRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showSuggestions || filteredCountries.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setFocusedIndex(prev => 
          prev < filteredCountries.length - 1 ? prev + 1 : 0
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setFocusedIndex(prev => 
          prev > 0 ? prev - 1 : filteredCountries.length - 1
        );
        break;
      case 'Enter':
        e.preventDefault();
        if (focusedIndex >= 0 && focusedIndex < filteredCountries.length) {
          handleSelect(filteredCountries[focusedIndex].name);
        }
        break;
      case 'Escape':
        setShowSuggestions(false);
        break;
    }
  };

  const handleBlur = () => {
    // Delay to allow click on suggestion
    setTimeout(() => setShowSuggestions(false), 150);
  };

  return (
    <div className={cn("relative w-full", className)}>
      <div className="relative">
        <Input
          ref={inputRef}
          value={inputValue}
          onChange={handleInputChange}
          onFocus={() => inputValue.trim() && setShowSuggestions(true)}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="min-h-[44px] pr-8 bg-background"
        />
        {inputValue && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-muted-foreground hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>
      
      {showSuggestions && filteredCountries.length > 0 && (
        <ul
          ref={listRef}
          className="absolute z-[9999] w-full mt-1 max-h-48 overflow-auto rounded-md border bg-popover shadow-lg"
        >
          {filteredCountries.map((country, index) => (
            <li
              key={country.code}
              onClick={() => handleSelect(country.name)}
              className={cn(
                "px-3 py-2 cursor-pointer text-sm",
                index === focusedIndex 
                  ? "bg-accent text-accent-foreground" 
                  : "hover:bg-accent hover:text-accent-foreground"
              )}
            >
              {country.name}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
