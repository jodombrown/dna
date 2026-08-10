/**
 * DNA | CONVENE — the mobile "Narrow" control: the same six facets as the
 * Rail, behind one sheet instead of taking lane-header space at every width.
 * md:hidden — the Rail takes over from md: up.
 */
import { useState } from 'react';
import { SlidersHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { ConveneFacetControls, type ConveneFacetKey, type ConveneFacetValues } from './ConveneFacetControls';

interface ConveneNarrowSheetProps {
  values: ConveneFacetValues;
  onChange: (key: ConveneFacetKey, value: string) => void;
  countries: string[];
  categories: string[];
  activeCount: number;
}

export function ConveneNarrowSheet({ values, onChange, countries, categories, activeCount }: ConveneNarrowSheetProps) {
  const [open, setOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="outline" size="sm" className="md:hidden rounded-full gap-1.5">
          <SlidersHorizontal className="w-4 h-4" />
          Narrow
          {activeCount > 0 && (
            <span className="flex h-4 min-w-4 items-center justify-center rounded-full bg-dna-copper px-1 text-micro text-white">
              {activeCount}
            </span>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent side="bottom">
        <SheetHeader>
          <SheetTitle className="text-h3">Narrow Results</SheetTitle>
        </SheetHeader>
        <ConveneFacetControls
          values={values}
          onChange={onChange}
          countries={countries}
          categories={categories}
          className="space-y-4 py-4"
        />
      </SheetContent>
    </Sheet>
  );
}

export default ConveneNarrowSheet;
