/**
 * DNA | CONVENE — the mobile "Narrow" control: the same six facets as the
 * Rail, behind one sheet instead of taking lane-header space at every width.
 * md:hidden — the Rail takes over from md: up.
 */
import { useState } from 'react';
import { SlidersHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerTrigger } from '@/components/ui/drawer';
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
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerTrigger asChild>
        <Button variant="outline" size="sm" className="md:hidden rounded-full gap-1.5">
          <SlidersHorizontal className="w-4 h-4" />
          Narrow
          {activeCount > 0 && (
            <span className="flex h-4 min-w-4 items-center justify-center rounded-full bg-dna-copper px-1 text-micro text-white">
              {activeCount}
            </span>
          )}
        </Button>
      </DrawerTrigger>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle className="text-h3">Narrow Results</DrawerTitle>
        </DrawerHeader>
        <ConveneFacetControls
          values={values}
          onChange={onChange}
          countries={countries}
          categories={categories}
          className="space-y-4 px-4 pb-6"
        />
      </DrawerContent>
    </Drawer>
  );
}

export default ConveneNarrowSheet;
