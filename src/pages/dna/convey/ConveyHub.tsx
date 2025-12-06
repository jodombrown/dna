import { useState } from 'react';
import LayoutController from '@/components/LayoutController';
import { LeftNav } from '@/components/layout/columns/LeftNav';
import { RightWidgets } from '@/components/layout/columns/RightWidgets';
import { useConveyFeed } from '@/hooks/useConveyFeed';
import { ConveyFeedCard } from '@/components/convey/ConveyFeedCard';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Loader2 } from 'lucide-react';
import type { ConveyItemType } from '@/types/conveyTypes';
import { useConveyAnalytics } from '@/hooks/useConveyAnalytics';

export default function ConveyHub() {
  const { logConveyEvent } = useConveyAnalytics();
  const [selectedType, setSelectedType] = useState<ConveyItemType | ''>('');
  const [selectedRegion, setSelectedRegion] = useState('');
  const [onlyMySpaces, setOnlyMySpaces] = useState(false);

  const { data: items, isLoading, error } = useConveyFeed({
    type: selectedType || undefined,
    region: selectedRegion || undefined,
    onlyMySpaces,
  });

  // Log filter changes
  const handleTypeChange = (value: string) => {
    setSelectedType(value as ConveyItemType | '');
    logConveyEvent({
      eventType: 'feed_filtered',
      metadata: {
        type: value || null,
        region: selectedRegion || null,
        spacesOnly: onlyMySpaces,
      },
    });
  };

  const handleRegionChange = (value: string) => {
    setSelectedRegion(value);
    logConveyEvent({
      eventType: 'feed_filtered',
      metadata: {
        type: selectedType || null,
        region: value || null,
        spacesOnly: onlyMySpaces,
      },
    });
  };

  const handleSpacesToggle = (checked: boolean) => {
    setOnlyMySpaces(checked);
    logConveyEvent({
      eventType: 'feed_filtered',
      metadata: {
        type: selectedType || null,
        region: selectedRegion || null,
        spacesOnly: checked,
      },
    });
  };

  const centerColumn = (
    <div className="py-4 lg:py-8 px-4 sm:px-6">
      {/* Hero Section */}
      <div className="mb-6 lg:mb-8">
        <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-3 sm:mb-4">
          CONVEY
        </h1>
        <p className="text-base sm:text-lg text-muted-foreground max-w-2xl">
          Stories and updates from the DNA community across the African world
        </p>
      </div>

      {/* Filters */}
      <div className="mb-6 p-3 sm:p-4 bg-card border border-border rounded-lg">
        <div className="flex flex-col sm:flex-row sm:flex-wrap gap-3 sm:gap-4">
          <Select value={selectedType} onValueChange={handleTypeChange}>
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue placeholder="All types" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All types</SelectItem>
              <SelectItem value="story">Stories</SelectItem>
              <SelectItem value="update">Updates</SelectItem>
              <SelectItem value="impact">Impact Stories</SelectItem>
            </SelectContent>
          </Select>

          <Select value={selectedRegion} onValueChange={handleRegionChange}>
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue placeholder="All regions" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All regions</SelectItem>
              <SelectItem value="East Africa">East Africa</SelectItem>
              <SelectItem value="West Africa">West Africa</SelectItem>
              <SelectItem value="Southern Africa">Southern Africa</SelectItem>
              <SelectItem value="North Africa">North Africa</SelectItem>
              <SelectItem value="Central Africa">Central Africa</SelectItem>
              <SelectItem value="Diaspora - North America">Diaspora - North America</SelectItem>
              <SelectItem value="Diaspora - Europe">Diaspora - Europe</SelectItem>
              <SelectItem value="Diaspora - Caribbean">Diaspora - Caribbean</SelectItem>
              <SelectItem value="Diaspora - Asia">Diaspora - Asia</SelectItem>
            </SelectContent>
          </Select>

          <div className="flex items-center space-x-2">
            <Switch
              id="my-spaces"
              checked={onlyMySpaces}
              onCheckedChange={handleSpacesToggle}
            />
            <Label htmlFor="my-spaces" className="cursor-pointer">
              Only my spaces
            </Label>
          </div>

          {(selectedType || selectedRegion || onlyMySpaces) && (
            <Button
              variant="ghost"
              onClick={() => {
                setSelectedType('');
                setSelectedRegion('');
                setOnlyMySpaces(false);
              }}
            >
              Clear filters
            </Button>
          )}
        </div>
      </div>

      {/* Content */}
      {isLoading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      )}

      {error && (
        <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-6 text-center">
          <p className="text-destructive">
            Failed to load stories. Please try again.
          </p>
        </div>
      )}

      {!isLoading && !error && items && (
        <>
          {items.data.length === 0 ? (
            <div className="bg-card border border-border rounded-lg p-12 text-center">
              <p className="text-lg text-muted-foreground">
                {selectedType || selectedRegion || onlyMySpaces
                  ? 'No stories match these filters yet.'
                  : 'No stories available yet.'}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {items.data.map((item) => (
                <ConveyFeedCard key={item.id} item={item} />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );

  return (
    <LayoutController
      leftColumn={<LeftNav />}
      centerColumn={centerColumn}
      rightColumn={<RightWidgets variant="convey" />}
    />
  );
}
