import React, { useState } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Search, X, ChevronDown, ChevronUp } from 'lucide-react';
import { OpportunityFilters as Filters } from '@/types/opportunityTypes';
import { 
  impactAreas, 
  regions, 
  contributionTypes, 
  timeCommitments, 
  urgencyLevels,
  filterIcons
} from '@/components/collaborations/filters/filterData';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

interface OpportunityFiltersProps {
  filters: Filters;
  onFiltersChange: (filters: Partial<Filters>) => void;
  onClearFilters: () => void;
  hasActiveFilters: boolean;
  resultCount: number;
}

const opportunityTypes = [
  { value: 'volunteer', label: 'Volunteer', description: 'Unpaid volunteer opportunity' },
  { value: 'internship', label: 'Internship', description: 'Internship or training position' },
  { value: 'contract', label: 'Contract', description: 'Contract or freelance work' },
  { value: 'full-time', label: 'Full-time', description: 'Full-time employment' },
  { value: 'part-time', label: 'Part-time', description: 'Part-time employment' },
];

const OpportunityFilters: React.FC<OpportunityFiltersProps> = ({
  filters,
  onFiltersChange,
  onClearFilters,
  hasActiveFilters,
  resultCount,
}) => {
  const [expandedSections, setExpandedSections] = useState({
    impact: true,
    region: true,
    contribution: true,
    time: true,
    urgency: true,
  });

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const handleCheckboxChange = (
    filterKey: keyof Filters,
    value: string,
    checked: boolean
  ) => {
    const currentValues = filters[filterKey] as string[];
    const newValues = checked
      ? [...currentValues, value]
      : currentValues.filter(v => v !== value);
    onFiltersChange({ [filterKey]: newValues });
  };

  const FilterSection = ({ 
    title, 
    section, 
    icon: Icon,
    children 
  }: { 
    title: string; 
    section: keyof typeof expandedSections;
    icon: any;
    children: React.ReactNode;
  }) => (
    <Collapsible
      open={expandedSections[section]}
      onOpenChange={() => toggleSection(section)}
      className="border-b border-border/40"
    >
      <CollapsibleTrigger className="flex w-full items-center justify-between py-4 hover:bg-accent/50 px-4 transition-colors">
        <div className="flex items-center gap-2">
          <Icon className="w-4 h-4 text-dna-copper" />
          <span className="font-medium text-sm">{title}</span>
        </div>
        {expandedSections[section] ? (
          <ChevronUp className="w-4 h-4 text-muted-foreground" />
        ) : (
          <ChevronDown className="w-4 h-4 text-muted-foreground" />
        )}
      </CollapsibleTrigger>
      <CollapsibleContent className="px-4 pb-4 space-y-3">
        {children}
      </CollapsibleContent>
    </Collapsible>
  );

  return (
    <div className="bg-card rounded-lg border border-border shadow-sm h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-border/40">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-dna-forest">Filters</h2>
          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onClearFilters}
              className="text-dna-copper hover:text-dna-copper/80"
            >
              <X className="w-4 h-4 mr-1" />
              Clear
            </Button>
          )}
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search opportunities..."
            value={filters.search}
            onChange={(e) => onFiltersChange({ search: e.target.value })}
            className="pl-10"
          />
        </div>

        {/* Results count */}
        <div className="mt-3 text-sm text-muted-foreground">
          {resultCount} {resultCount === 1 ? 'opportunity' : 'opportunities'} found
        </div>
      </div>

      {/* Filters */}
      <ScrollArea className="flex-1">
        {/* Tags (Impact Areas, Skills, etc.) */}
        <FilterSection title="Tags & Impact Areas" section="impact" icon={filterIcons.Target}>
          {impactAreas.map((area) => (
            <div key={area.value} className="flex items-start space-x-3 py-2">
              <Checkbox
                id={`tag-${area.value}`}
                checked={filters.tags.includes(area.value)}
                onCheckedChange={(checked) =>
                  handleCheckboxChange('tags', area.value, checked as boolean)
                }
              />
              <div className="flex-1">
                <label
                  htmlFor={`tag-${area.value}`}
                  className="text-sm font-medium cursor-pointer flex items-center gap-2"
                >
                  <span>{area.icon}</span>
                  {area.label}
                </label>
                <p className="text-xs text-muted-foreground mt-1">{area.description}</p>
              </div>
            </div>
          ))}
        </FilterSection>

        {/* Regions */}
        <FilterSection title="Regions" section="region" icon={filterIcons.MapPin}>
          {regions.map((region) => (
            <div key={region.value} className="flex items-start space-x-3 py-2">
              <Checkbox
                id={`region-${region.value}`}
                checked={filters.regions.includes(region.value)}
                onCheckedChange={(checked) =>
                  handleCheckboxChange('regions', region.value, checked as boolean)
                }
              />
              <div className="flex-1">
                <label
                  htmlFor={`region-${region.value}`}
                  className="text-sm font-medium cursor-pointer flex items-center gap-2"
                >
                  <span>{region.flag}</span>
                  {region.label}
                </label>
                <p className="text-xs text-muted-foreground mt-1">{region.description}</p>
              </div>
            </div>
          ))}
        </FilterSection>

        {/* Opportunity Type */}
        <FilterSection title="Opportunity Type" section="contribution" icon={filterIcons.Users}>
          {opportunityTypes.map((opType) => (
            <div key={opType.value} className="flex items-start space-x-3 py-2">
              <Checkbox
                id={`type-${opType.value}`}
                checked={filters.type.includes(opType.value)}
                onCheckedChange={(checked) =>
                  handleCheckboxChange('type', opType.value, checked as boolean)
                }
              />
              <div className="flex-1">
                <label
                  htmlFor={`type-${opType.value}`}
                  className="text-sm font-medium cursor-pointer"
                >
                  {opType.label}
                </label>
                <p className="text-xs text-muted-foreground mt-1">{opType.description}</p>
              </div>
            </div>
          ))}
        </FilterSection>

        {/* Active Filters Summary */}
        {hasActiveFilters && (
          <div className="p-4">
            <h3 className="text-sm font-medium mb-3">Active Filters</h3>
            <div className="flex flex-wrap gap-2">
              {filters.tags.map(tag => (
                <Badge
                  key={tag}
                  variant="secondary"
                  className="cursor-pointer hover:bg-destructive hover:text-destructive-foreground"
                  onClick={() => handleCheckboxChange('tags', tag, false)}
                >
                  {impactAreas.find(a => a.value === tag)?.label || tag}
                  <X className="w-3 h-3 ml-1" />
                </Badge>
              ))}
              {filters.type.map(t => (
                <Badge
                  key={t}
                  variant="secondary"
                  className="cursor-pointer hover:bg-destructive hover:text-destructive-foreground"
                  onClick={() => handleCheckboxChange('type', t, false)}
                >
                  {opportunityTypes.find(ot => ot.value === t)?.label || t}
                  <X className="w-3 h-3 ml-1" />
                </Badge>
              ))}
            </div>
          </div>
        )}
      </ScrollArea>
    </div>
  );
};

export default OpportunityFilters;
