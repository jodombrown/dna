
import React, { useState } from 'react';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { LucideIcon } from 'lucide-react';

interface FilterOption {
  value: string;
  label: string;
  icon?: string | React.ReactElement;
  description?: string;
  color?: string;
  flag?: string;
}

interface CollapsibleFilterSectionProps {
  title: string;
  icon: LucideIcon;
  options: FilterOption[];
  selectedValues: string[];
  onSelectionChange: (value: string, checked: boolean) => void;
  defaultOpen?: boolean;
  useToggleButtons?: boolean;
}

const CollapsibleFilterSection: React.FC<CollapsibleFilterSectionProps> = ({
  title,
  icon: Icon,
  options,
  selectedValues,
  onSelectionChange,
  defaultOpen = false,
  useToggleButtons = false
}) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  if (useToggleButtons) {
    return (
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger className="w-full">
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border hover:bg-gray-100 transition-colors">
            <Label className="flex items-center gap-2 text-sm font-semibold text-gray-700 cursor-pointer">
              <Icon className="w-4 h-4 text-dna-copper" />
              {title}
              {selectedValues.length > 0 && (
                <span className="bg-dna-copper text-white text-xs px-2 py-0.5 rounded-full">
                  {selectedValues.length}
                </span>
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
          <div className="px-2">
            <ToggleGroup 
              type="multiple" 
              value={selectedValues}
              onValueChange={(values) => {
                // Handle toggle group changes
                options.forEach(option => {
                  const isCurrentlySelected = selectedValues.includes(option.value);
                  const shouldBeSelected = values.includes(option.value);
                  
                  if (isCurrentlySelected !== shouldBeSelected) {
                    onSelectionChange(option.value, shouldBeSelected);
                  }
                });
              }}
              className="flex flex-wrap gap-2 justify-start"
            >
              {options.map((option) => (
                <ToggleGroupItem
                  key={option.value}
                  value={option.value}
                  className="h-8 px-3 text-xs data-[state=on]:bg-dna-copper data-[state=on]:text-white border-gray-200 hover:bg-gray-100"
                >
                  {typeof option.icon === 'string' ? (
                    <span className="text-sm mr-1">{option.icon}</span>
                  ) : option.icon ? (
                    <span className="mr-1">{option.icon}</span>
                  ) : null}
                  {option.flag && <span className="text-sm mr-1">{option.flag}</span>}
                  <span>{option.label}</span>
                </ToggleGroupItem>
              ))}
            </ToggleGroup>
          </div>
        </CollapsibleContent>
      </Collapsible>
    );
  }

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <CollapsibleTrigger className="w-full">
        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border hover:bg-gray-100 transition-colors">
          <Label className="flex items-center gap-2 text-sm font-semibold text-gray-700 cursor-pointer">
            <Icon className="w-4 h-4 text-dna-copper" />
            {title}
            {selectedValues.length > 0 && (
              <span className="bg-dna-copper text-white text-xs px-2 py-0.5 rounded-full">
                {selectedValues.length}
              </span>
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
        <div className="space-y-2 px-1">
          {options.map((option) => (
            <div key={option.value} className="flex items-start space-x-2 p-2 rounded-md hover:bg-gray-50 transition-colors border border-transparent hover:border-gray-200">
              <Checkbox
                id={`${title.toLowerCase().replace(/\s+/g, '-')}-${option.value}`}
                checked={selectedValues.includes(option.value)}
                onCheckedChange={(checked) =>
                  onSelectionChange(option.value, checked as boolean)
                }
                className="mt-0.5 data-[state=checked]:bg-dna-copper data-[state=checked]:border-dna-copper"
              />
              <div className="flex-1 min-w-0">
                <Label 
                  htmlFor={`${title.toLowerCase().replace(/\s+/g, '-')}-${option.value}`} 
                  className={`text-sm font-medium flex items-center gap-2 cursor-pointer ${option.color || 'text-gray-700'}`}
                >
                  {typeof option.icon === 'string' ? (
                    <span className="text-base">{option.icon}</span>
                  ) : option.icon ? (
                    option.icon
                  ) : null}
                  {option.flag && <span className="text-base">{option.flag}</span>}
                  <span className="leading-tight">{option.label}</span>
                </Label>
                {option.description && (
                  <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">{option.description}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
};

export default CollapsibleFilterSection;
