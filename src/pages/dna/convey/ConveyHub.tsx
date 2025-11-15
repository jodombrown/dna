import { useState } from 'react';
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

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="bg-gradient-to-b from-primary/5 to-background border-b border-border">
        <div className="container mx-auto px-4 py-12 max-w-6xl">
          <h1 className="text-4xl font-bold text-foreground mb-4">
            CONVEY
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl">
            Stories and updates from the DNA community across the African world
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="border-b border-border bg-card/50">
        <div className="container mx-auto px-4 py-6 max-w-6xl">
          <div className="flex flex-wrap gap-4 items-center">
            <Select value={selectedType} onValueChange={handleTypeChange}>
              <SelectTrigger className="w-48">
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
              <SelectTrigger className="w-48">
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
              </SelectContent>
            </Select>

            <div className="flex items-center space-x-2">
              <Switch
                id="my-spaces"
                checked={onlyMySpaces}
                onCheckedChange={handleSpacesToggle}
              />
              <Label htmlFor="my-spaces" className="cursor-pointer">
                Only show stories from spaces I'm in
              </Label>
            </div>

            {(selectedType || selectedRegion || onlyMySpaces) && (
              <Button
                variant="ghost"
                size="sm"
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
      </div>

      {/* Feed */}
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : error ? (
          <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-6 text-center">
            <p className="text-destructive">Failed to load stories.</p>
          </div>
        ) : items?.data && items.data.length > 0 ? (
          <div className="space-y-6">
            {items.data.map((item) => (
              <ConveyFeedCard key={item.id} item={item} />
            ))}
          </div>
        ) : (
          <div className="bg-card border border-border rounded-lg p-12 text-center">
            {selectedType || selectedRegion || onlyMySpaces ? (
              <>
                <p className="text-lg text-muted-foreground mb-4">
                  No stories match these filters yet.
                </p>
                <p className="text-sm text-muted-foreground mb-4">
                  Try adjusting your filters or check back soon.
                </p>
                <Button
                  variant="outline"
                  onClick={() => {
                    setSelectedType('');
                    setSelectedRegion('');
                    setOnlyMySpaces(false);
                  }}
                >
                  Clear filters
                </Button>
              </>
            ) : (
              <p className="text-lg text-muted-foreground">
                Stories from the DNA community will appear here once they're published.
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
