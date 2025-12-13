import { useState } from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { BookOpen, Plus, X } from 'lucide-react';

interface StorySeriesSelectProps {
  value?: string;
  onChange: (seriesId: string | undefined) => void;
  existingSeries?: { id: string; name: string }[];
  onCreateSeries?: (name: string) => Promise<string>;
}

// Placeholder series for demo - in production, fetch from DB
const DEMO_SERIES = [
  { id: 'founders-journey', name: 'Founders Journey' },
  { id: 'building-in-africa', name: 'Building in Africa' },
  { id: 'diaspora-voices', name: 'Diaspora Voices' },
  { id: 'tech-for-good', name: 'Tech for Good' },
];

export function StorySeriesSelect({ 
  value, 
  onChange,
  existingSeries = DEMO_SERIES,
  onCreateSeries 
}: StorySeriesSelectProps) {
  const [isCreating, setIsCreating] = useState(false);
  const [newSeriesName, setNewSeriesName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleCreateSeries = async () => {
    if (!newSeriesName.trim()) return;
    
    setIsSubmitting(true);
    try {
      if (onCreateSeries) {
        const newId = await onCreateSeries(newSeriesName.trim());
        onChange(newId);
      } else {
        // Demo mode - just use the name as ID
        onChange(newSeriesName.trim().toLowerCase().replace(/\s+/g, '-'));
      }
      setNewSeriesName('');
      setIsCreating(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedSeries = existingSeries.find(s => s.id === value);

  return (
    <div className="space-y-3">
      <Label className="flex items-center gap-2">
        <BookOpen className="h-4 w-4" />
        Series / Collection
        <span className="text-muted-foreground font-normal">(optional)</span>
      </Label>

      <p className="text-sm text-muted-foreground">
        Group related stories together in a series for easier discovery.
      </p>

      {isCreating ? (
        <div className="flex gap-2">
          <Input
            value={newSeriesName}
            onChange={(e) => setNewSeriesName(e.target.value)}
            placeholder="Enter series name..."
            className="flex-1"
            autoFocus
          />
          <Button
            type="button"
            size="sm"
            onClick={handleCreateSeries}
            disabled={!newSeriesName.trim() || isSubmitting}
          >
            Create
          </Button>
          <Button
            type="button"
            size="sm"
            variant="ghost"
            onClick={() => {
              setIsCreating(false);
              setNewSeriesName('');
            }}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      ) : (
        <div className="flex gap-2">
          <Select
            value={value || ''}
            onValueChange={(val) => onChange(val || undefined)}
          >
            <SelectTrigger className="flex-1">
              <SelectValue placeholder="Select a series..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">No series</SelectItem>
              {existingSeries.map((series) => (
                <SelectItem key={series.id} value={series.id}>
                  {series.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            type="button"
            size="icon"
            variant="outline"
            onClick={() => setIsCreating(true)}
            title="Create new series"
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      )}

      {selectedSeries && (
        <div className="bg-muted/50 border border-border rounded-lg p-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BookOpen className="h-4 w-4 text-primary" />
            <span className="font-medium">{selectedSeries.name}</span>
          </div>
          <button
            type="button"
            onClick={() => onChange(undefined)}
            className="text-muted-foreground hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}
    </div>
  );
}
