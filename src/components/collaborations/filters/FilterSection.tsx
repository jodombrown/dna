
import React from 'react';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
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
}

const FilterSection: React.FC<FilterSectionProps> = ({
  title,
  icon: Icon,
  options,
  selectedValues,
  onSelectionChange
}) => {
  return (
    <div className="space-y-3">
      <Label className="flex items-center gap-2 text-sm font-medium">
        <Icon className="w-4 h-4" />
        {title}
      </Label>
      <div className="space-y-3">
        {options.map((option) => (
          <div key={option.value} className="flex items-start space-x-3 p-2 rounded-lg hover:bg-gray-50 transition-colors">
            <Checkbox
              id={`${title.toLowerCase()}-${option.value}`}
              checked={selectedValues.includes(option.value)}
              onCheckedChange={(checked) =>
                onSelectionChange(option.value, checked as boolean)
              }
              className="mt-1"
            />
            <div className="flex-1 min-w-0">
              <Label 
                htmlFor={`${title.toLowerCase()}-${option.value}`} 
                className={`text-sm font-medium flex items-center gap-2 cursor-pointer ${option.color || ''}`}
              >
                {typeof option.icon === 'string' ? (
                  <span className="text-lg">{option.icon}</span>
                ) : option.icon ? (
                  option.icon
                ) : null}
                {option.flag && <span className="text-lg">{option.flag}</span>}
                {option.label}
              </Label>
              {option.description && (
                <p className="text-xs text-gray-500 mt-1">{option.description}</p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FilterSection;
