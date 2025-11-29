import { Badge } from "@/components/ui/badge";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { X, Check } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

interface TagMultiSelectProps {
  label: string;
  options: readonly string[];
  selected: string[];
  onChange: (selected: string[]) => void;
  colorClass?: string;
  placeholder?: string;
}

export function TagMultiSelect({ 
  label, 
  options, 
  selected = [], 
  onChange, 
  colorClass = "bg-dna-emerald/10 text-dna-emerald border-dna-emerald/20",
  placeholder
}: TagMultiSelectProps) {
  const [open, setOpen] = useState(false);
  
  // Ensure selected is always an array
  const safeSelected = Array.isArray(selected) ? selected : [];

  const handleSelect = (option: string) => {
    if (safeSelected.includes(option)) {
      onChange(safeSelected.filter(item => item !== option));
    } else {
      onChange([...safeSelected, option]);
    }
  };

  const removeTag = (tagToRemove: string) => {
    onChange(safeSelected.filter(tag => tag !== tagToRemove));
  };

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-foreground">{label}</label>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button 
            variant="outline" 
            className="w-full justify-start text-left font-normal min-h-[44px]"
            role="combobox"
            aria-expanded={open}
          >
            {safeSelected.length === 0 
              ? (placeholder || `Select ${label.toLowerCase()}...`)
              : `${safeSelected.length} selected`
            }
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-full p-0" align="start">
          <Command>
            <CommandInput placeholder={`Search ${label.toLowerCase()}...`} />
            <CommandEmpty>No options found.</CommandEmpty>
            <CommandGroup className="max-h-64 overflow-auto">
              {options.map(option => {
                const isSelected = safeSelected.includes(option);
                return (
                  <CommandItem 
                    key={option} 
                    value={option}
                    onSelect={(value) => handleSelect(value)}
                    className="cursor-pointer"
                  >
                    <div className={cn(
                      "mr-2 flex h-4 w-4 items-center justify-center rounded-sm border border-primary",
                      isSelected
                        ? "bg-dna-emerald text-white"
                        : "opacity-50 [&_svg]:invisible"
                    )}>
                      <Check className="h-4 w-4" />
                    </div>
                    <span>{option}</span>
                  </CommandItem>
                );
              })}
            </CommandGroup>
          </Command>
        </PopoverContent>
      </Popover>
      
      {safeSelected.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-2">
          {safeSelected.map(item => (
            <Badge key={item} className={cn("pr-1", colorClass)}>
              {item}
              <button
                type="button"
                className="ml-1 rounded-full hover:bg-black/10 p-0.5"
                onClick={() => removeTag(item)}
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
}
