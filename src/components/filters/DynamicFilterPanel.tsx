
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Search, Filter, X, ChevronDown, ChevronRight, Sliders } from 'lucide-react';

export interface FilterOption {
  value: string;
  label: string;
  count?: number;
  icon?: string;
  description?: string;
}

export interface FilterSection {
  key: string;
  title: string;
  type: 'text' | 'select' | 'multiselect' | 'checkbox' | 'range' | 'tags';
  options?: FilterOption[];
  placeholder?: string;
  defaultOpen?: boolean;
  searchable?: boolean;
}

interface DynamicFilterPanelProps {
  sections: FilterSection[];
  filters: Record<string, any>;
  onFilterChange: (key: string, value: any) => void;
  onClearFilters: () => void;
  hasActiveFilters: boolean;
  activeFilterCount: number;
  resultCount?: number;
  loading?: boolean;
  className?: string;
}

const DynamicFilterPanel: React.FC<DynamicFilterPanelProps> = ({
  sections,
  filters,
  onFilterChange,
  onClearFilters,
  hasActiveFilters,
  activeFilterCount,
  resultCount,
  loading = false,
  className
}) => {
  const [openSections, setOpenSections] = useState<Set<string>>(
    new Set(sections.filter(s => s.defaultOpen).map(s => s.key))
  );
  const [searchTerms, setSearchTerms] = useState<Record<string, string>>({});

  const toggleSection = (sectionKey: string) => {
    const newOpenSections = new Set(openSections);
    if (newOpenSections.has(sectionKey)) {
      newOpenSections.delete(sectionKey);
    } else {
      newOpenSections.add(sectionKey);
    }
    setOpenSections(newOpenSections);
  };

  const handleTagToggle = (sectionKey: string, value: string) => {
    const currentValues = filters[sectionKey] || [];
    const newValues = currentValues.includes(value)
      ? currentValues.filter((v: string) => v !== value)
      : [...currentValues, value];
    onFilterChange(sectionKey, newValues);
  };

  const getFilteredOptions = (section: FilterSection) => {
    if (!section.searchable || !searchTerms[section.key]) {
      return section.options || [];
    }
    const searchTerm = searchTerms[section.key].toLowerCase();
    return (section.options || []).filter(option =>
      option.label.toLowerCase().includes(searchTerm) ||
      option.value.toLowerCase().includes(searchTerm)
    );
  };

  const renderFilterSection = (section: FilterSection) => {
    const isOpen = openSections.has(section.key);
    const filteredOptions = getFilteredOptions(section);

    return (
      <Collapsible key={section.key} open={isOpen} onOpenChange={() => toggleSection(section.key)}>
        <CollapsibleTrigger className="w-full">
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
            <Label className="flex items-center gap-2 text-sm font-semibold text-gray-700 cursor-pointer">
              <Sliders className="w-4 h-4 text-dna-copper" />
              {section.title}
              {filters[section.key] && (
                <Badge className="bg-dna-emerald text-white text-xs">
                  {Array.isArray(filters[section.key]) 
                    ? filters[section.key].length
                    : filters[section.key] === true ? '✓' : '1'
                  }
                </Badge>
              )}
            </Label>
            {isOpen ? (
              <ChevronDown className="w-4 h-4 text-gray-500" />
            ) : (
              <ChevronRight className="w-4 h-4 text-gray-500" />
            )}
          </div>
        </CollapsibleTrigger>
        
        <CollapsibleContent className="mt-2">
          <div className="px-2 pb-3">
            {section.searchable && section.options && section.options.length > 5 && (
              <div className="mb-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder={`Search ${section.title.toLowerCase()}...`}
                    value={searchTerms[section.key] || ''}
                    onChange={(e) => setSearchTerms(prev => ({ ...prev, [section.key]: e.target.value }))}
                    className="pl-10 text-sm"
                  />
                </div>
              </div>
            )}
            
            {section.type === 'text' && (
              <Input
                placeholder={section.placeholder}
                value={filters[section.key] || ''}
                onChange={(e) => onFilterChange(section.key, e.target.value)}
                className="w-full"
              />
            )}

            {section.type === 'select' && (
              <Select 
                value={filters[section.key] || ''} 
                onValueChange={(value) => onFilterChange(section.key, value)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder={section.placeholder || `Select ${section.title}`} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All {section.title}</SelectItem>
                  {filteredOptions.map(option => (
                    <SelectItem key={option.value} value={option.value}>
                      <div className="flex items-center justify-between w-full">
                        <span>{option.icon && `${option.icon} `}{option.label}</span>
                        {option.count && (
                          <Badge variant="secondary" className="ml-2 text-xs">
                            {option.count}
                          </Badge>
                        )}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}

            {section.type === 'tags' && (
              <div className="space-y-2">
                <div className="flex flex-wrap gap-2">
                  {filteredOptions.map(option => {
                    const isSelected = (filters[section.key] || []).includes(option.value);
                    return (
                      <Badge
                        key={option.value}
                        variant={isSelected ? "default" : "outline"}
                        className={`cursor-pointer transition-all hover:scale-105 ${
                          isSelected 
                            ? 'bg-dna-emerald hover:bg-dna-forest text-white' 
                            : 'hover:bg-dna-emerald hover:text-white'
                        }`}
                        onClick={() => handleTagToggle(section.key, option.value)}
                      >
                        {option.icon && `${option.icon} `}
                        {option.label}
                        {isSelected && <X className="ml-1 w-3 h-3" />}
                        {option.count && !isSelected && (
                          <span className="ml-1 text-xs opacity-70">({option.count})</span>
                        )}
                      </Badge>
                    );
                  })}
                </div>
              </div>
            )}

            {section.type === 'checkbox' && (
              <div className="space-y-3">
                {filteredOptions.map(option => (
                  <div key={option.value} className="flex items-start space-x-3 p-2 rounded-md hover:bg-gray-50">
                    <Checkbox
                      id={`${section.key}-${option.value}`}
                      checked={(filters[section.key] || []).includes(option.value)}
                      onCheckedChange={(checked) => {
                        const currentValues = filters[section.key] || [];
                        const newValues = checked
                          ? [...currentValues, option.value]
                          : currentValues.filter((v: string) => v !== option.value);
                        onFilterChange(section.key, newValues);
                      }}
                      className="mt-0.5"
                    />
                    <div className="flex-1">
                      <Label 
                        htmlFor={`${section.key}-${option.value}`}
                        className="text-sm font-medium cursor-pointer flex items-center gap-2"
                      >
                        {option.icon && <span>{option.icon}</span>}
                        <span>{option.label}</span>
                        {option.count && (
                          <Badge variant="secondary" className="text-xs">
                            {option.count}
                          </Badge>
                        )}
                      </Label>
                      {option.description && (
                        <p className="text-xs text-gray-500 mt-1">{option.description}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </CollapsibleContent>
      </Collapsible>
    );
  };

  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Filter className="w-5 h-5 text-dna-copper" />
            Advanced Filters
            {activeFilterCount > 0 && (
              <Badge className="bg-dna-copper text-white">
                {activeFilterCount}
              </Badge>
            )}
          </CardTitle>
          {hasActiveFilters && (
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={onClearFilters}
              className="text-gray-600 hover:text-gray-800"
            >
              Clear All
            </Button>
          )}
        </div>
        {resultCount !== undefined && (
          <p className="text-sm text-gray-600">
            {loading ? 'Filtering...' : `${resultCount} results found`}
          </p>
        )}
      </CardHeader>
      
      <CardContent className="p-0">
        <ScrollArea className="h-[600px]">
          <div className="px-4 space-y-3">
            {sections.map((section, index) => (
              <div key={section.key}>
                {renderFilterSection(section)}
                {index < sections.length - 1 && <Separator className="my-3" />}
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};

export default DynamicFilterPanel;
