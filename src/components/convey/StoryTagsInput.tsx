import { useState, KeyboardEvent } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { X, Tag, Plus } from 'lucide-react';

interface StoryTagsInputProps {
  value: string[];
  onChange: (tags: string[]) => void;
  maxTags?: number;
  suggestedTags?: string[];
}

const DEFAULT_SUGGESTIONS = [
  'Entrepreneurship',
  'Tech',
  'Diaspora',
  'Investment',
  'Culture',
  'Education',
  'Healthcare',
  'Agriculture',
  'Climate',
  'Youth',
  'Women',
  'Innovation',
  'Community',
  'Impact',
  'Leadership',
];

export function StoryTagsInput({ 
  value = [], 
  onChange, 
  maxTags = 5,
  suggestedTags = DEFAULT_SUGGESTIONS 
}: StoryTagsInputProps) {
  const [inputValue, setInputValue] = useState('');

  const addTag = (tag: string) => {
    const normalizedTag = tag.trim().toLowerCase();
    if (
      normalizedTag && 
      !value.some(t => t.toLowerCase() === normalizedTag) && 
      value.length < maxTags
    ) {
      onChange([...value, tag.trim()]);
      setInputValue('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    onChange(value.filter(tag => tag !== tagToRemove));
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addTag(inputValue);
    } else if (e.key === 'Backspace' && !inputValue && value.length > 0) {
      removeTag(value[value.length - 1]);
    }
  };

  const availableSuggestions = suggestedTags.filter(
    tag => !value.some(v => v.toLowerCase() === tag.toLowerCase())
  );

  return (
    <div className="space-y-3">
      <Label className="flex items-center gap-2">
        <Tag className="h-4 w-4" />
        Topics & Tags
        <span className="text-muted-foreground font-normal">({value.length}/{maxTags})</span>
      </Label>

      {/* Selected tags */}
      {value.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {value.map((tag) => (
            <Badge 
              key={tag} 
              variant="secondary"
              className="flex items-center gap-1 pr-1"
            >
              {tag}
              <button
                type="button"
                onClick={() => removeTag(tag)}
                className="ml-1 hover:bg-muted rounded-full p-0.5"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
        </div>
      )}

      {/* Input */}
      {value.length < maxTags && (
        <div className="relative">
          <Input
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type a tag and press Enter..."
            className="pr-10"
          />
          {inputValue && (
            <button
              type="button"
              onClick={() => addTag(inputValue)}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-1 hover:bg-muted rounded"
            >
              <Plus className="h-4 w-4 text-muted-foreground" />
            </button>
          )}
        </div>
      )}

      {/* Suggestions */}
      {value.length < maxTags && availableSuggestions.length > 0 && (
        <div className="space-y-2">
          <span className="text-xs text-muted-foreground">Suggested topics:</span>
          <div className="flex flex-wrap gap-1.5">
            {availableSuggestions.slice(0, 8).map((tag) => (
              <button
                key={tag}
                type="button"
                onClick={() => addTag(tag)}
                className="text-xs px-2 py-1 rounded-full border border-border hover:bg-muted transition-colors"
              >
                + {tag}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
