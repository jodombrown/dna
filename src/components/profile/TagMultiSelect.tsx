import { Badge } from "@/components/ui/badge";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { X, Check, Plus } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

interface TagMultiSelectProps {
  label: string;
  options: readonly string[];
  selected: string[];
  onChange: (selected: string[]) => void;
  colorClass?: string;
  placeholder?: string;
  allowCustom?: boolean;
}

export function TagMultiSelect({ 
  label, 
  options, 
  selected = [], 
  onChange, 
  colorClass = "bg-dna-emerald/10 text-dna-emerald border-dna-emerald/20",
  placeholder,
  allowCustom = true
}: TagMultiSelectProps) {
  const [open, setOpen] = useState(false);
  const [inputValue, setInputValue] = useState("");
  
  // Defensive: Ensure selected is always an array
  const safeSelected = Array.isArray(selected) ? selected : [];

  // CRITICAL FIX: Command component normalizes values to lowercase
  // We must do case-insensitive lookup to find the original option
  const handleSelect = (normalizedValue: string) => {
    const originalOption = options.find(
      opt => opt.toLowerCase() === normalizedValue.toLowerCase()
    );

    if (!originalOption) return; // Guard clause

    if (safeSelected.includes(originalOption)) {
      onChange(safeSelected.filter(item => item !== originalOption));
    } else {
      onChange([...safeSelected, originalOption]);
    }
    setInputValue("");
  };

  // Allow users to add custom entries not in the options list
  const handleAddCustom = () => {
    const trimmed = inputValue.trim();
    if (!trimmed) return;
    
    // Check if already selected (case-insensitive)
    const alreadySelected = safeSelected.some(
      s => s.toLowerCase() === trimmed.toLowerCase()
    );
    if (alreadySelected) return;
    
    // Check if it matches an existing option (case-insensitive)
    const existingOption = options.find(
      opt => opt.toLowerCase() === trimmed.toLowerCase()
    );
    
    // Add the existing option or the custom value
    onChange([...safeSelected, existingOption || trimmed]);
    setInputValue("");
  };

  // Filter options based on input
  const filteredOptions = inputValue
    ? options.filter(opt => opt.toLowerCase().includes(inputValue.toLowerCase()))
    : options;

  // Check if we should show "Add custom" option
  const showAddCustom = allowCustom && 
    inputValue.trim() && 
    !options.some(opt => opt.toLowerCase() === inputValue.toLowerCase()) &&
    !safeSelected.some(s => s.toLowerCase() === inputValue.trim().toLowerCase());

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
            className="w-full justify-start text-left font-normal min-h-[44px] bg-background"
            role="combobox"
            aria-expanded={open}
          >
            {safeSelected.length === 0 
              ? (placeholder || `Select ${label.toLowerCase()}...`)
              : `${safeSelected.length} selected`
            }
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[calc(100vw-2rem)] sm:w-full max-w-md p-0 bg-background border shadow-lg z-50" align="start">
          <Command shouldFilter={false}>
            <CommandInput 
              placeholder={`Search ${label.toLowerCase()}...`} 
              value={inputValue}
              onValueChange={setInputValue}
            />
            <CommandList className="max-h-64 overflow-auto">
              {filteredOptions.length === 0 && !showAddCustom && (
                <CommandEmpty>No options found.</CommandEmpty>
              )}
              {showAddCustom && (
                <CommandGroup heading="Add Custom">
                  <CommandItem
                    onSelect={handleAddCustom}
                    className="cursor-pointer text-dna-emerald"
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    <span>Add "{inputValue.trim()}"</span>
                  </CommandItem>
                </CommandGroup>
              )}
              <CommandGroup>
                {filteredOptions.map(option => {
                  const isSelected = safeSelected.includes(option);
                  return (
                    <CommandItem 
                      key={option} 
                      value={option}
                      onSelect={handleSelect}
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
            </CommandList>
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
