
import React from 'react';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import { LucideIcon } from 'lucide-react';

interface FilterOption {
  value: string;
  label: string;
  icon?: string | React.ReactElement;
  description?: string;
  color?: string;
  flag?: string;
}

interface FilterSectionProps {
  title: string;
  icon: LucideIcon;
  options: FilterOption[];
  selectedValues: string[];
  onSelectionChange: (value: string, checked: boolean) => void;
  isLast?: boolean;
}

const FilterSection: React.FC<FilterSectionProps> = ({
  title,
  icon: Icon,
  options,
  selectedValues,
  onSelectionChange,
  isLast = false
}) => {
  return (
    <div className="space-y-3">
      <div className="bg-gray-50 px-3 py-2 rounded-lg border">
        <Label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
          <Icon className="w-4 h-4 text-dna-copper" />
          {title}
        </Label>
      </div>
      
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
      
      {!isLast && <Separator className="my-4" />}
    </div>
  );
};

export default FilterSection;
