import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { ConveyItemType, ConveyItemVisibility, ConveyItemStatus } from '@/types/conveyTypes';
import { Loader2 } from 'lucide-react';
import { RichTextEditor } from './RichTextEditor';
import { CoverImageEditor } from './CoverImageEditor';
import { StoryTagsInput } from './StoryTagsInput';
import { StorySeriesSelect } from './StorySeriesSelect';

interface ConveyItemFormData {
  type: ConveyItemType;
  title: string;
  subtitle: string;
  body: string;
  visibility: ConveyItemVisibility;
  region: string;
  coverImage?: string;
  tags?: string[];
  seriesId?: string;
}

interface ConveyItemFormProps {
  initialData?: Partial<ConveyItemFormData>;
  spaceId?: string;
  spaceName?: string;
  spaceVisibility?: 'public' | 'invite_only';
  eventId?: string;
  eventTitle?: string;
  needId?: string;
  isAdmin?: boolean;
  onSubmit: (data: ConveyItemFormData & { status: ConveyItemStatus }) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

export function ConveyItemForm({
  initialData,
  spaceId,
  spaceName,
  spaceVisibility,
  eventId,
  eventTitle,
  needId,
  isAdmin = false,
  onSubmit,
  onCancel,
  isLoading = false,
}: ConveyItemFormProps) {
  const [savingAs, setSavingAs] = useState<ConveyItemStatus | null>(null);

  const defaultVisibility = spaceId && spaceVisibility === 'invite_only'
    ? 'space_members_only'
    : 'public';

  const isImpactMode = initialData?.type === 'impact' || needId;

  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<ConveyItemFormData>({
    defaultValues: {
      type: initialData?.type || 'update',
      title: initialData?.title || '',
      subtitle: initialData?.subtitle || '',
      body: initialData?.body || '',
      visibility: initialData?.visibility || defaultVisibility,
      region: initialData?.region || '',
      coverImage: initialData?.coverImage || '',
      tags: initialData?.tags || [],
      seriesId: initialData?.seriesId || undefined,
    },
  });

  const selectedType = watch('type');
  const selectedVisibility = watch('visibility');

  const handleFormSubmit = async (data: ConveyItemFormData, status: ConveyItemStatus) => {
    setSavingAs(status);
    try {
      await onSubmit({ ...data, status });
    } finally {
      setSavingAs(null);
    }
  };

  return (
    <form className="space-y-6">
      {/* Impact Mode Indicator */}
      {isImpactMode && needId && (
        <div className="bg-primary/10 border border-primary/20 rounded-lg p-4">
          <p className="text-sm text-foreground">
            <strong>Impact Story Mode:</strong> You're creating an impact story based on validated contributions from this Need.
          </p>
        </div>
      )}

      {/* Type Selection */}
      <div className="space-y-2">
        <Label>Content Type</Label>
        <RadioGroup
          value={selectedType}
          onValueChange={(value) => setValue('type', value as ConveyItemType)}
          disabled={!!isImpactMode}
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="update" id="type-update" disabled={!!isImpactMode} />
            <Label htmlFor="type-update" className="cursor-pointer font-normal">
              Update – Share progress, milestones, or news
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="story" id="type-story" disabled={!!isImpactMode} />
            <Label htmlFor="type-story" className="cursor-pointer font-normal">
              Story – Tell a deeper narrative or impact story
            </Label>
          </div>
          {isImpactMode && (
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="impact" id="type-impact" disabled={true} />
              <Label htmlFor="type-impact" className="cursor-pointer font-normal">
                Impact – Celebrate validated contributions and outcomes
              </Label>
            </div>
          )}
        </RadioGroup>
      </div>

      {/* Title */}
      <div className="space-y-2">
        <Label htmlFor="title">Title *</Label>
        <Input
          id="title"
          {...register('title', { required: 'Title is required' })}
          placeholder="Give your story a clear title"
        />
        {errors.title && (
          <p className="text-sm text-destructive">{errors.title.message}</p>
        )}
      </div>

      {/* Subtitle */}
      <div className="space-y-2">
        <Label htmlFor="subtitle">Subtitle (optional)</Label>
        <Input
          id="subtitle"
          {...register('subtitle')}
          placeholder="Add a brief subtitle or tagline"
        />
      </div>

      {/* Cover Image - Tier 2 */}
      <CoverImageEditor
        value={watch('coverImage')}
        onChange={(url) => setValue('coverImage', url)}
      />

      {/* Body - Rich Text Editor */}
      <div className="space-y-2">
        <Label htmlFor="body">Story *</Label>
        <RichTextEditor
          value={watch('body')}
          onChange={(val) => setValue('body', val)}
          placeholder="Share your story..."
          minHeight="300px"
          error={errors.body?.message}
        />
      </div>

      {/* Tags/Topics - Tier 2 */}
      <StoryTagsInput
        value={watch('tags') || []}
        onChange={(tags) => setValue('tags', tags)}
      />

      {/* Series/Collection - Tier 2 */}
      <StorySeriesSelect
        value={watch('seriesId')}
        onChange={(seriesId) => setValue('seriesId', seriesId)}
      />

      {/* Visibility */}
      <div className="space-y-2">
        <Label htmlFor="visibility">Visibility *</Label>
        <Select
          value={selectedVisibility}
          onValueChange={(value) => setValue('visibility', value as ConveyItemVisibility)}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="public">
              Public – Anyone can see this story
            </SelectItem>
            <SelectItem value="members_only">
              Members only – All DNA members can see this
            </SelectItem>
            {spaceId && (
              <SelectItem value="space_members_only">
                Space members only – Only members of this space
              </SelectItem>
            )}
          </SelectContent>
        </Select>
      </div>

      {/* Region */}
      <div className="space-y-2">
        <Label htmlFor="region">Region (optional)</Label>
        <Select
          value={watch('region')}
          onValueChange={(value) => setValue('region', value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select a region" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">No specific region</SelectItem>
            <SelectItem value="East Africa">East Africa</SelectItem>
            <SelectItem value="West Africa">West Africa</SelectItem>
            <SelectItem value="Southern Africa">Southern Africa</SelectItem>
            <SelectItem value="Central Africa">Central Africa</SelectItem>
            <SelectItem value="North Africa">North Africa</SelectItem>
            <SelectItem value="Diaspora - North America">Diaspora - North America</SelectItem>
            <SelectItem value="Diaspora - Europe">Diaspora - Europe</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Linked Space (read-only if set) */}
      {spaceId && spaceName && (
        <div className="space-y-2">
          <Label>Linked to Space</Label>
          <div className="bg-muted/50 border border-border rounded-lg p-3">
            <p className="font-medium">{spaceName}</p>
            <p className="text-sm text-muted-foreground">
              This story will appear in this space's updates section
            </p>
          </div>
        </div>
      )}

      {/* Linked Event (read-only if set) */}
      {eventId && eventTitle && (
        <div className="space-y-2">
          <Label>Linked to Event</Label>
          <div className="bg-muted/50 border border-border rounded-lg p-3">
            <p className="font-medium">{eventTitle}</p>
            <p className="text-sm text-muted-foreground">
              This story will appear on the event page
            </p>
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-3 pt-4">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isLoading}
        >
          Cancel
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={handleSubmit((data) => handleFormSubmit(data, 'draft'))}
          disabled={isLoading}
        >
          {savingAs === 'draft' && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Save draft
        </Button>
        <Button
          type="button"
          onClick={handleSubmit((data) => handleFormSubmit(data, 'published'))}
          disabled={isLoading}
        >
          {savingAs === 'published' && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Publish
        </Button>
      </div>
    </form>
  );
}
