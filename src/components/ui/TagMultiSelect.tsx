import { Badge } from "@/components/ui/badge";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { X, Check, Plus, ChevronsUpDown } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

export interface TagMultiSelectProps {
  /** Label for the field */
  label: string;
  /** Available options to select from */
  options: readonly string[];
  /** Currently selected values */
  selected: string[];
  /** Callback when selection changes */
  onChange: (selected: string[]) => void;
  /** CSS classes for the badge styling */
  colorClass?: string;
  /** Placeholder text when nothing is selected */
  placeholder?: string;
  /** Allow adding custom tags not in the options list */
  allowCustom?: boolean;
  /** Maximum number of items that can be selected */
  maxItems?: number;
  /** Disable the component */
  disabled?: boolean;
  /** Show error state */
  error?: boolean;
  /** Error message to display */
  errorMessage?: string;
  /** Accessible label for screen readers */
  'aria-label'?: string;
}

/**
 * Unified multi-select component for tags like skills, interests, sectors, etc.
 *
 * Features:
 * - Searchable dropdown
 * - Multi-select with visual checkmarks
 * - Custom tag support (optional)
 * - Badge display for selected items
 * - Touch-friendly with 44px minimum tap target
 * - Accessible with proper ARIA attributes
 */
export function TagMultiSelect({
  label,
  options,
  selected = [],
  onChange,
  colorClass = "bg-dna-emerald/10 text-dna-emerald border-dna-emerald/20",
  placeholder,
  allowCustom = true,
  maxItems,
  disabled = false,
  error = false,
  errorMessage,
  'aria-label': ariaLabel,
}: TagMultiSelectProps) {
  const [open, setOpen] = useState(false);
  const [inputValue, setInputValue] = useState("");

  // Defensive: Ensure selected is always an array
  const safeSelected = Array.isArray(selected) ? selected : [];

  // Check if we've reached the max items limit
  const atMaxItems = maxItems !== undefined && safeSelected.length >= maxItems;

  // Handle selection from options
  const handleSelect = (normalizedValue: string) => {
    const originalOption = options.find(
      opt => opt.toLowerCase() === normalizedValue.toLowerCase()
    );

    if (!originalOption) return;

    if (safeSelected.includes(originalOption)) {
      onChange(safeSelected.filter(item => item !== originalOption));
    } else if (!atMaxItems) {
      onChange([...safeSelected, originalOption]);
    }
    setInputValue("");
  };

  // Allow users to add custom entries not in the options list
  const handleAddCustom = () => {
    if (atMaxItems) return;

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
    !safeSelected.some(s => s.toLowerCase() === inputValue.trim().toLowerCase()) &&
    !atMaxItems;

  const removeTag = (tagToRemove: string) => {
    onChange(safeSelected.filter(tag => tag !== tagToRemove));
  };

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-foreground">{label}</label>
      <Popover open={open} onOpenChange={disabled ? undefined : setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={cn(
              "w-full justify-between text-left font-normal min-h-[44px] bg-background",
              error && "border-destructive focus:ring-destructive",
              disabled && "opacity-50 cursor-not-allowed"
            )}
            role="combobox"
            aria-expanded={open}
            aria-label={ariaLabel || placeholder || `Select ${label.toLowerCase()}`}
            disabled={disabled}
          >
            <span className={cn(safeSelected.length === 0 && "text-muted-foreground")}>
              {safeSelected.length === 0
                ? (placeholder || `Select ${label.toLowerCase()}...`)
                : `${safeSelected.length} selected${maxItems ? ` (max ${maxItems})` : ''}`
              }
            </span>
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent
          className="w-[var(--radix-popover-trigger-width)] p-0 bg-background border shadow-lg z-50"
          align="start"
          sideOffset={4}
        >
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
              {atMaxItems && (
                <div className="px-2 py-1.5 text-sm text-muted-foreground bg-muted/50">
                  Maximum {maxItems} items reached
                </div>
              )}
              <CommandGroup>
                {filteredOptions.map(option => {
                  const isSelected = safeSelected.includes(option);
                  return (
                    <CommandItem
                      key={option}
                      value={option}
                      onSelect={handleSelect}
                      className={cn(
                        "cursor-pointer",
                        atMaxItems && !isSelected && "opacity-50"
                      )}
                      disabled={atMaxItems && !isSelected}
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
                disabled={disabled}
                aria-label={`Remove ${item}`}
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
        </div>
      )}

      {error && errorMessage && (
        <p className="text-sm text-destructive">{errorMessage}</p>
      )}
    </div>
  );
}

export default TagMultiSelect;
