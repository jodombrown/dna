
import React, { useState, useRef, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Search, X, Filter, MapPin, Briefcase, GraduationCap, Users } from 'lucide-react';

interface SearchSuggestion {
  type: 'location' | 'skill' | 'profession' | 'company' | 'keyword';
  value: string;
  label: string;
  icon?: React.ReactNode;
  count?: number;
}

interface SmartSearchBarProps {
  value: string;
  onChange: (value: string) => void;
  onSearch: () => void;
  suggestions?: SearchSuggestion[];
  recentSearches?: string[];
  placeholder?: string;
  showAdvancedFilters?: boolean;
  onAdvancedFiltersClick?: () => void;
  activeFilters?: Array<{ label: string; value: string; onRemove: () => void }>;
  loading?: boolean;
}

const SmartSearchBar: React.FC<SmartSearchBarProps> = ({
  value,
  onChange,
  onSearch,
  suggestions = [],
  recentSearches = [],
  placeholder = "Search professionals, communities, events...",
  showAdvancedFilters = true,
  onAdvancedFiltersClick,
  activeFilters = [],
  loading = false
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);

  const getIcon = (type: string) => {
    switch (type) {
      case 'location': return <MapPin className="w-4 h-4" />;
      case 'skill': return <GraduationCap className="w-4 h-4" />;
      case 'profession': return <Briefcase className="w-4 h-4" />;
      case 'company': return <Users className="w-4 h-4" />;
      default: return <Search className="w-4 h-4" />;
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      onSearch();
      setIsOpen(false);
    }
  };

  const handleSuggestionClick = (suggestion: SearchSuggestion) => {
    onChange(suggestion.value);
    setIsOpen(false);
    onSearch();
  };

  const handleRecentSearchClick = (searchTerm: string) => {
    onChange(searchTerm);
    setIsOpen(false);
    onSearch();
  };

  const clearSearch = () => {
    onChange('');
    inputRef.current?.focus();
  };

  const filteredSuggestions = suggestions.filter(suggestion =>
    suggestion.label.toLowerCase().includes(value.toLowerCase()) ||
    suggestion.value.toLowerCase().includes(value.toLowerCase())
  ).slice(0, 8);

  const showSuggestions = value.length > 0 && filteredSuggestions.length > 0;
  const showRecent = value.length === 0 && recentSearches.length > 0;

  return (
    <div className="w-full space-y-3">
      {/* Main Search Bar */}
      <div className="relative flex gap-2">
        <Popover open={isOpen && (showSuggestions || showRecent)} onOpenChange={setIsOpen}>
          <PopoverTrigger asChild>
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <Input
                ref={inputRef}
                type="text"
                placeholder={placeholder}
                value={value}
                onChange={(e) => {
                  onChange(e.target.value);
                  setIsOpen(true);
                }}
                onKeyPress={handleKeyPress}
                onFocus={() => setIsOpen(true)}
                className="pl-12 pr-10 h-12 text-base"
              />
              {value && (
                <button
                  onClick={clearSearch}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>
          </PopoverTrigger>
          
          <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
            <Command>
              <CommandList>
                {showSuggestions && (
                  <CommandGroup heading="Suggestions">
                    {filteredSuggestions.map((suggestion, index) => (
                      <CommandItem
                        key={`${suggestion.type}-${suggestion.value}`}
                        onSelect={() => handleSuggestionClick(suggestion)}
                        className="flex items-center gap-3 px-4 py-3 cursor-pointer"
                      >
                        <div className="text-gray-500">
                          {getIcon(suggestion.type)}
                        </div>
                        <div className="flex-1">
                          <div className="font-medium">{suggestion.label}</div>
                          <div className="text-xs text-gray-500 capitalize">{suggestion.type}</div>
                        </div>
                        {suggestion.count && (
                          <Badge variant="secondary" className="text-xs">
                            {suggestion.count}
                          </Badge>
                        )}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                )}
                
                {showRecent && (
                  <CommandGroup heading="Recent Searches">
                    {recentSearches.slice(0, 5).map((search, index) => (
                      <CommandItem
                        key={search}
                        onSelect={() => handleRecentSearchClick(search)}
                        className="flex items-center gap-3 px-4 py-2 cursor-pointer"
                      >
                        <Search className="w-4 h-4 text-gray-400" />
                        <span>{search}</span>
                      </CommandItem>
                    ))}
                  </CommandGroup>
                )}
                
                {!showSuggestions && !showRecent && (
                  <CommandEmpty>No suggestions found.</CommandEmpty>
                )}
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>

        <Button 
          onClick={onSearch} 
          disabled={loading}
          className="bg-dna-emerald hover:bg-dna-forest px-6 h-12"
        >
          {loading ? (
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <Search className="w-5 h-5" />
          )}
        </Button>

        {showAdvancedFilters && (
          <Button 
            variant="outline" 
            onClick={onAdvancedFiltersClick}
            className="h-12 px-4"
          >
            <Filter className="w-5 h-5 mr-2" />
            Filters
            {activeFilters.length > 0 && (
              <Badge className="ml-2 bg-dna-emerald text-white">
                {activeFilters.length}
              </Badge>
            )}
          </Button>
        )}
      </div>

      {/* Active Filters */}
      {activeFilters.length > 0 && (
        <div className="flex flex-wrap gap-2">
          <span className="text-sm text-gray-600 flex items-center">Filters:</span>
          {activeFilters.map((filter, index) => (
            <Badge
              key={index}
              variant="secondary"
              className="flex items-center gap-1 bg-dna-emerald/10 text-dna-emerald hover:bg-dna-emerald/20"
            >
              {filter.label}
              <button
                onClick={filter.onRemove}
                className="ml-1 hover:bg-dna-emerald/20 rounded-full p-0.5"
              >
                <X className="w-3 h-3" />
              </button>
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
};

export default SmartSearchBar;
