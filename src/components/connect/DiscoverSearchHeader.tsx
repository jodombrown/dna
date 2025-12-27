import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Search, X, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface DiscoverSearchHeaderProps {
  value: string;
  onChange: (value: string) => void;
  onClear: () => void;
  isLoading?: boolean;
  debounceMs?: number;
}

export const DiscoverSearchHeader: React.FC<DiscoverSearchHeaderProps> = ({
  value,
  onChange,
  onClear,
  isLoading = false,
  debounceMs = 300,
}) => {
  const [localValue, setLocalValue] = useState(value);
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  // Sync local value with external value
  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  // Debounced onChange
  const debouncedOnChange = useCallback(
    (newValue: string) => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
      debounceRef.current = setTimeout(() => {
        onChange(newValue);
      }, debounceMs);
    },
    [onChange, debounceMs]
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setLocalValue(newValue);
    debouncedOnChange(newValue);
  };

  const handleClear = () => {
    setLocalValue('');
    onClear();
    inputRef.current?.focus();
  };

  const handleCancel = () => {
    setLocalValue('');
    onClear();
    setIsFocused(false);
    inputRef.current?.blur();
  };

  // Cleanup debounce on unmount
  useEffect(() => {
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, []);

  return (
    <div
      className={cn(
        'sticky top-0 z-40 py-3 px-4 -mx-4 transition-all duration-200',
        'bg-background/80 backdrop-blur-md border-b border-border/50'
      )}
    >
      <div className="flex items-center gap-3">
        <div
          className={cn(
            'relative flex-1 flex items-center',
            'bg-muted/50 rounded-xl border border-border/50',
            'transition-all duration-200',
            isFocused && 'border-primary/50 bg-background ring-1 ring-primary/20'
          )}
        >
          {/* Search Icon */}
          <div className="absolute left-3 flex items-center pointer-events-none">
            {isLoading ? (
              <Loader2 className="h-4 w-4 text-muted-foreground animate-spin" />
            ) : (
              <Search className="h-4 w-4 text-muted-foreground" />
            )}
          </div>

          {/* Input */}
          <input
            ref={inputRef}
            type="text"
            placeholder="Search members..."
            value={localValue}
            onChange={handleChange}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            className={cn(
              'w-full h-11 pl-10 pr-10 bg-transparent',
              'text-sm placeholder:text-muted-foreground',
              'focus:outline-none',
              'rounded-xl'
            )}
            aria-label="Search members"
          />

          {/* Clear Button */}
          {localValue && (
            <button
              type="button"
              onClick={handleClear}
              className={cn(
                'absolute right-3 p-1 rounded-full',
                'bg-muted-foreground/20 hover:bg-muted-foreground/30',
                'transition-colors'
              )}
              aria-label="Clear search"
            >
              <X className="h-3 w-3 text-muted-foreground" />
            </button>
          )}
        </div>

        {/* Cancel Button - appears on focus */}
        {isFocused && (
          <button
            type="button"
            onClick={handleCancel}
            className={cn(
              'text-sm font-medium text-primary',
              'transition-opacity duration-200',
              'hover:text-primary/80'
            )}
          >
            Cancel
          </button>
        )}
      </div>
    </div>
  );
};
