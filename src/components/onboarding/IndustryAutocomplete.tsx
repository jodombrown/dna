import { useState, useRef, useEffect } from 'react';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { X } from 'lucide-react';

const INDUSTRIES = [
  'Technology', 'Finance', 'Healthcare', 'Education',
  'Agriculture', 'Energy', 'Manufacturing', 'Consulting',
  'Media', 'Arts & Culture', 'Government', 'Non-Profit',
  'Real Estate', 'Retail', 'Transportation', 'Tourism',
  'Construction', 'Telecommunications', 'Legal Services',
  'Mining', 'Food & Beverage', 'Fashion', 'Sports',
  'Entertainment', 'Hospitality', 'Aviation'
];

interface IndustryAutocompleteProps {
  selectedIndustries: string[];
  onChange: (industries: string[]) => void;
  label?: string;
}

export default function IndustryAutocomplete({
  selectedIndustries,
  onChange,
  label = 'Industry Sectors'
}: IndustryAutocompleteProps) {
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const filtered = INDUSTRIES.filter(
    (industry) =>
      industry.toLowerCase().includes(query.toLowerCase()) &&
      !selectedIndustries.includes(industry)
  );

  const addIndustry = (industry: string) => {
    onChange([...selectedIndustries, industry]);
    setQuery('');
    setOpen(false);
  };

  const removeIndustry = (industry: string) => {
    onChange(selectedIndustries.filter((i) => i !== industry));
  };

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div>
      <Label>{label}</Label>
      <div className="space-y-2 mt-2">
        <div ref={containerRef} className="relative">
          <input
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            value={query}
            placeholder="Search industries..."
            onChange={(e) => {
              setQuery(e.target.value);
              setOpen(true);
            }}
            onFocus={() => setOpen(true)}
            aria-autocomplete="list"
            aria-expanded={open}
          />
          {open && filtered.length > 0 && (
            <div className="absolute z-50 mt-1 w-full max-h-60 overflow-y-auto rounded-md border bg-popover shadow-lg">
              {filtered.map((industry) => (
                <button
                  key={industry}
                  className="block w-full text-left px-3 py-2 text-sm hover:bg-accent hover:text-accent-foreground cursor-pointer"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => addIndustry(industry)}
                >
                  {industry}
                </button>
              ))}
            </div>
          )}
        </div>

        {selectedIndustries.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {selectedIndustries.map((industry) => (
              <Badge key={industry} variant="default" className="gap-1 pr-1">
                {industry}
                <button
                  type="button"
                  className="ml-1 rounded-full hover:bg-primary-foreground/20 p-0.5"
                  onClick={() => removeIndustry(industry)}
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
