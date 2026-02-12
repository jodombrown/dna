import { ComposerMode, ComposerContext, ComposerFormData } from '@/hooks/useUniversalComposer';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ImagePlus, X, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { useProfile } from '@/hooks/useProfile';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useState, useRef, useEffect } from 'react';
import { uploadMedia } from '@/lib/uploadMedia';
import { useToast } from '@/hooks/use-toast';
import { useAutoEmbedDetection } from '@/hooks/useAutoEmbedDetection';
import { LinkPreviewCard } from '@/components/feed/LinkPreviewCard';
import { getStoryTypeOptions, getStoryTypeConfig, type StoryType } from '@/types/storyTypes';
import { RichTextEditor } from '@/components/convey/RichTextEditor';
import { cn } from '@/lib/utils';

interface ComposerBodyProps {
  mode: ComposerMode;
  formData: ComposerFormData;
  context: ComposerContext;
  onChange: (updates: Partial<ComposerFormData>) => void;
}

export const ComposerBody = ({
  mode,
  formData,
  context,
  onChange,
}: ComposerBodyProps) => {
  const { user } = useAuth();
  const { data: profile } = useProfile();

  return (
    <div className="space-y-4">
      {/* Author Info */}
      <div className="flex items-center gap-3">
        <Avatar className="h-10 w-10">
          <AvatarImage src={profile?.avatar_url || ''} />
          <AvatarFallback>
            {profile?.display_name?.[0] || profile?.username?.[0] || 'U'}
          </AvatarFallback>
        </Avatar>
        <div>
          <p className="font-medium">
            {profile?.display_name || profile?.username || 'User'}
          </p>
          {context.spaceId && (
            <p className="text-xs text-muted-foreground">
              Posting in Space
            </p>
          )}
          {context.eventId && (
            <p className="text-xs text-muted-foreground">
              Posting in Event
            </p>
          )}
          {context.communityId && (
            <p className="text-xs text-muted-foreground">
              Posting in Community
            </p>
          )}
        </div>
      </div>

      {/* Mode-specific fields */}
      {renderModeFields(mode, formData, onChange)}
    </div>
  );
};

function PostModeFields({ 
  formData, 
  onChange 
}: { 
  formData: ComposerFormData; 
  onChange: (updates: Partial<ComposerFormData>) => void;
}) {
  const { embedData, handleContentChange, loading, clearEmbedData } = useAutoEmbedDetection();

  // Sync embed data to form when detected (only if not already set)
  useEffect(() => {
    if (embedData && !formData.linkUrl) {
      onChange({
        linkUrl: embedData.url,
        linkTitle: embedData.title || undefined,
        linkDescription: embedData.author_name || undefined,
        linkThumbnail: embedData.thumbnail_url || undefined,
        linkProviderName: embedData.provider_name || undefined,
      });
    }
  }, [embedData, formData.linkUrl]);

  const handleTextChange = (value: string) => {
    onChange({ content: value });
    // Only trigger auto-detection if we don't already have link data
    if (!formData.linkUrl) {
      handleContentChange(value);
    }
  };

  const handleRemovePreview = () => {
    clearEmbedData();
    onChange({
      linkUrl: undefined,
      linkTitle: undefined,
      linkDescription: undefined,
      linkThumbnail: undefined,
      linkProviderName: undefined,
    });
  };

  // Show preview from embedData (just detected) OR from formData (already saved)
  const hasPreview = embedData || formData.linkUrl;
  const previewData = embedData || (formData.linkUrl ? {
    url: formData.linkUrl,
    title: formData.linkTitle,
    author_name: formData.linkDescription,
    thumbnail_url: formData.linkThumbnail,
    provider_name: formData.linkProviderName,
  } : null);

  return (
    <>
      <Textarea
        placeholder="What's on your mind?"
        value={formData.content}
        onChange={(e) => handleTextChange(e.target.value)}
        className="min-h-[120px] resize-none"
      />
      
      {/* Video/Link Preview */}
      {loading && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground p-3 bg-muted/50 rounded-lg">
          <Loader2 className="h-4 w-4 animate-spin" />
          Loading preview...
        </div>
      )}
      {hasPreview && previewData && !loading && (
        <LinkPreviewCard
          data={{
            url: previewData.url,
            title: previewData.title,
            description: previewData.author_name,
            thumbnail_url: previewData.thumbnail_url,
            provider_name: previewData.provider_name,
          }}
          showRemoveButton={true}
          onRemove={handleRemovePreview}
          size="compact"
          disableLightbox={true}
        />
      )}
      
      <MediaUploadButton 
        currentMediaUrl={formData.mediaUrl}
        onUpload={(url) => onChange({ mediaUrl: url })} 
        onRemove={() => onChange({ mediaUrl: undefined })}
      />
    </>
  );
}

function StoryModeFields({ 
  formData, 
  onChange 
}: { 
  formData: ComposerFormData; 
  onChange: (updates: Partial<ComposerFormData>) => void;
}) {
  const storyTypeOptions = getStoryTypeOptions();
  const selectedType = formData.storyType || 'update';
  const config = getStoryTypeConfig(selectedType);

  return (
    <>
      {/* Story Type Selector */}
      <div>
        <Label>What type of story? *</Label>
        <Select
          value={selectedType}
          onValueChange={(value: StoryType) => onChange({ storyType: value })}
        >
          <SelectTrigger className="bg-background">
            <SelectValue placeholder="Select story type" />
          </SelectTrigger>
          <SelectContent position="item-aligned" className="bg-popover z-[9999]">
            {storyTypeOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                <div className="flex items-center gap-2">
                  <span>{option.icon}</span>
                  <div>
                    <span className="font-medium">{option.label}</span>
                    <span className="text-muted-foreground ml-2 text-sm hidden sm:inline">
                      – {option.description}
                    </span>
                  </div>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <p className="text-xs text-muted-foreground mt-1">
          {config.description}
        </p>
      </div>

      {/* Title */}
      <div>
        <Label>Title *</Label>
        <Input
          placeholder={config.placeholders.title}
          value={formData.title || ''}
          onChange={(e) => onChange({ title: e.target.value })}
        />
      </div>

      {/* Subtitle */}
      <div>
        <Label>Subtitle (optional)</Label>
        <Input
          placeholder={config.placeholders.subtitle}
          value={formData.subtitle || ''}
          onChange={(e) => onChange({ subtitle: e.target.value })}
        />
      </div>

      {/* Content - Rich Text Editor */}
      <div>
        <Label>Story *</Label>
        <RichTextEditor
          value={formData.content}
          onChange={(value) => {
            if (value.length <= 4000) {
              onChange({ content: value });
            }
          }}
          placeholder={config.placeholders.content}
          minHeight="200px"
        />
        <p className="text-xs text-muted-foreground mt-1">
          {formData.content.length < config.suggestedLength.min 
            ? `${formData.content.length}/${config.suggestedLength.min} characters (minimum for ${config.label})`
            : formData.content.length > config.suggestedLength.max - 200
              ? `${formData.content.length}/${config.suggestedLength.max} characters (nearing limit)`
              : `${formData.content.length} characters (${config.suggestedLength.min}–${config.suggestedLength.max} recommended)`
          }
        </p>
      </div>

      {/* Cover Image */}
      <StoryImageUpload 
        currentImageUrl={formData.heroImage}
        onUpload={(url) => onChange({ heroImage: url })}
        onRemove={() => onChange({ heroImage: undefined })}
      />

      {/* Gallery for Photo Essays */}
      {config.supportsGallery && (
        <StoryGalleryUpload
          galleryUrls={formData.galleryUrls || []}
          onChange={(urls) => onChange({ galleryUrls: urls })}
        />
      )}
    </>
  );
}

function StoryGalleryUpload({
  galleryUrls,
  onChange,
}: {
  galleryUrls: string[];
  onChange: (urls: string[]) => void;
}) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0 || !user) return;

    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    const maxSize = 5 * 1024 * 1024;

    setIsUploading(true);
    const newUrls: string[] = [];

    try {
      for (const file of Array.from(files)) {
        if (!validTypes.includes(file.type)) {
          toast({ title: 'Invalid file type', description: `${file.name} is not a supported image format`, variant: 'destructive' });
          continue;
        }
        if (file.size > maxSize) {
          toast({ title: 'File too large', description: `${file.name} is larger than 5MB`, variant: 'destructive' });
          continue;
        }

        const url = await uploadMedia(file, user.id, 'story-hero-images');
        newUrls.push(url);
      }

      if (newUrls.length > 0) {
        onChange([...galleryUrls, ...newUrls]);
        toast({ description: `${newUrls.length} image(s) added to gallery` });
      }
    } catch (error) {
      toast({ title: 'Upload failed', description: 'Some images could not be uploaded', variant: 'destructive' });
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const removeImage = (index: number) => {
    const updated = galleryUrls.filter((_, i) => i !== index);
    onChange(updated);
  };

  return (
    <div className="space-y-2">
      <Label>Gallery Images (optional)</Label>
      
      {galleryUrls.length > 0 && (
        <div className="grid grid-cols-3 gap-2">
          {galleryUrls.map((url, index) => (
            <div key={index} className="relative aspect-square rounded-lg overflow-hidden border border-border">
              <img src={url} alt={`Gallery ${index + 1}`} className="w-full h-full object-cover" />
              <Button
                type="button"
                size="icon"
                variant="destructive"
                className="absolute top-1 right-1 h-6 w-6"
                onClick={() => removeImage(index)}
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          ))}
        </div>
      )}

      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => fileInputRef.current?.click()}
        disabled={isUploading || galleryUrls.length >= 10}
        className="w-full"
      >
        {isUploading ? (
          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
        ) : (
          <ImagePlus className="h-4 w-4 mr-2" />
        )}
        {isUploading ? 'Uploading...' : `Add Gallery Images (${galleryUrls.length}/10)`}
      </Button>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/jpg,image/png,image/webp"
        multiple
        className="hidden"
        onChange={handleFileSelect}
      />
    </div>
  );
}

/**
 * EventModeFields - Enhanced event creation form per PRD
 */
function EventModeFields({ 
  formData, 
  onChange 
}: { 
  formData: ComposerFormData; 
  onChange: (updates: Partial<ComposerFormData>) => void;
}) {
  const formatOptions = [
    { value: 'in_person', label: 'In Person', icon: '📍', description: 'Physical location' },
    { value: 'virtual', label: 'Virtual', icon: '💻', description: 'Online meeting' },
    { value: 'hybrid', label: 'Hybrid', icon: '🌐', description: 'Both options' },
  ];

  const dressCodeOptions = [
    { value: 'casual', label: 'Casual' },
    { value: 'business_casual', label: 'Business Casual' },
    { value: 'formal', label: 'Formal' },
    { value: 'traditional', label: 'Traditional' },
    { value: 'other', label: 'Other' },
  ];

  // Handle agenda items
  const agendaItems = formData.agenda || [];
  const addAgendaItem = () => {
    onChange({ agenda: [...agendaItems, { time: '', title: '' }] });
  };
  const updateAgendaItem = (index: number, field: 'time' | 'title', value: string) => {
    const updated = [...agendaItems];
    updated[index] = { ...updated[index], [field]: value };
    onChange({ agenda: updated });
  };
  const removeAgendaItem = (index: number) => {
    onChange({ agenda: agendaItems.filter((_, i) => i !== index) });
  };

  // Handle tags
  const tags = formData.tags || [];
  const [tagInput, setTagInput] = useState('');
  const addTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      onChange({ tags: [...tags, tagInput.trim()] });
      setTagInput('');
    }
  };
  const removeTag = (tag: string) => {
    onChange({ tags: tags.filter(t => t !== tag) });
  };

  return (
    <div className="space-y-4">
      {/* Event Title */}
      <div>
        <Label className="text-sm font-medium">Event Title *</Label>
        <Input
          placeholder="Pan-African Investment Summit 2026"
          value={formData.title || ''}
          onChange={(e) => onChange({ title: e.target.value })}
          className="mt-1.5"
          maxLength={100}
        />
        <p className="text-xs text-muted-foreground mt-1">
          {(formData.title?.length || 0)}/100 characters
        </p>
      </div>

      {/* Subtitle */}
      <div>
        <Label className="text-sm font-medium">Subtitle (optional)</Label>
        <Input
          placeholder="Connecting diaspora investors with opportunities"
          value={formData.subtitle || ''}
          onChange={(e) => onChange({ subtitle: e.target.value })}
          className="mt-1.5"
          maxLength={150}
        />
      </div>

      {/* Cover Image */}
      <div>
        <Label className="text-sm font-medium">Cover Image</Label>
        <EventCoverUpload
          currentImageUrl={formData.mediaUrl}
          onUpload={(url) => onChange({ mediaUrl: url })}
          onRemove={() => onChange({ mediaUrl: undefined })}
        />
      </div>

      {/* Date & Time Row */}
      <div className="space-y-3">
        <Label className="text-sm font-medium">Date & Time *</Label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <p className="text-xs text-muted-foreground mb-1">Start</p>
            <div className="flex gap-2">
              <Input
                type="date"
                value={formData.eventDate || ''}
                onChange={(e) => onChange({ eventDate: e.target.value })}
                className="flex-1"
              />
              <Input
                type="time"
                value={formData.eventTime || ''}
                onChange={(e) => onChange({ eventTime: e.target.value })}
                className="w-24"
              />
            </div>
          </div>
          <div>
            <p className="text-xs text-muted-foreground mb-1">End</p>
            <div className="flex gap-2">
              <Input
                type="date"
                value={formData.eventEndDate || ''}
                onChange={(e) => onChange({ eventEndDate: e.target.value })}
                className="flex-1"
              />
              <Input
                type="time"
                value={formData.eventEndTime || ''}
                onChange={(e) => onChange({ eventEndTime: e.target.value })}
                className="w-24"
              />
            </div>
          </div>
        </div>

        {/* Timezone Selector */}
        <div className="mt-3">
          <Label className="text-xs text-muted-foreground mb-1 block">Timezone</Label>
          <Select
            value={formData.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone}
            onValueChange={(value) => onChange({ timezone: value })}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select timezone" />
            </SelectTrigger>
            <SelectContent className="max-h-[300px]">
              {/* Africa - prioritized */}
              <SelectItem value="Africa/Lagos">Lagos, Nigeria (WAT)</SelectItem>
              <SelectItem value="Africa/Nairobi">Nairobi, Kenya (EAT)</SelectItem>
              <SelectItem value="Africa/Johannesburg">Johannesburg, South Africa (SAST)</SelectItem>
              <SelectItem value="Africa/Cairo">Cairo, Egypt (EET)</SelectItem>
              <SelectItem value="Africa/Accra">Accra, Ghana (GMT)</SelectItem>
              <SelectItem value="Africa/Casablanca">Casablanca, Morocco (WET)</SelectItem>
              <SelectItem value="Africa/Addis_Ababa">Addis Ababa, Ethiopia (EAT)</SelectItem>
              <SelectItem value="Africa/Dakar">Dakar, Senegal (GMT)</SelectItem>
              <SelectItem value="Africa/Kigali">Kigali, Rwanda (CAT)</SelectItem>
              <SelectItem value="Africa/Kinshasa">Kinshasa, DRC (WAT)</SelectItem>
              {/* Americas */}
              <SelectItem value="America/New_York">New York (EST/EDT)</SelectItem>
              <SelectItem value="America/Chicago">Chicago (CST/CDT)</SelectItem>
              <SelectItem value="America/Denver">Denver (MST/MDT)</SelectItem>
              <SelectItem value="America/Los_Angeles">Los Angeles (PST/PDT)</SelectItem>
              <SelectItem value="America/Toronto">Toronto (EST/EDT)</SelectItem>
              <SelectItem value="America/Sao_Paulo">São Paulo (BRT)</SelectItem>
              <SelectItem value="America/Mexico_City">Mexico City (CST)</SelectItem>
              {/* Europe */}
              <SelectItem value="Europe/London">London (GMT/BST)</SelectItem>
              <SelectItem value="Europe/Paris">Paris (CET/CEST)</SelectItem>
              <SelectItem value="Europe/Berlin">Berlin (CET/CEST)</SelectItem>
              <SelectItem value="Europe/Amsterdam">Amsterdam (CET/CEST)</SelectItem>
              {/* Middle East / Asia */}
              <SelectItem value="Asia/Dubai">Dubai (GST)</SelectItem>
              <SelectItem value="Asia/Singapore">Singapore (SGT)</SelectItem>
              <SelectItem value="Asia/Tokyo">Tokyo (JST)</SelectItem>
              {/* Caribbean */}
              <SelectItem value="America/Jamaica">Jamaica (EST)</SelectItem>
              <SelectItem value="America/Port_of_Spain">Trinidad & Tobago (AST)</SelectItem>
              <SelectItem value="America/Barbados">Barbados (AST)</SelectItem>
              {/* UTC */}
              <SelectItem value="UTC">UTC (Coordinated Universal Time)</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Event Format */}
      <div>
        <Label className="text-sm font-medium">Event Type *</Label>
        <div className="grid grid-cols-3 gap-2 mt-2">
          {formatOptions.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => onChange({ format: option.value as any })}
              className={cn(
                'flex flex-col items-center p-3 rounded-lg border-2 transition-all',
                formData.format === option.value
                  ? 'border-amber-500 bg-amber-50 dark:bg-amber-500/10'
                  : 'border-border hover:border-muted-foreground/50'
              )}
            >
              <span className="text-xl mb-1">{option.icon}</span>
              <span className="text-sm font-medium">{option.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Location (for in-person/hybrid) */}
      {(formData.format === 'in_person' || formData.format === 'hybrid') && (
        <div>
          <Label className="text-sm font-medium">Location *</Label>
          <Input
            placeholder="Lagos Continental Hotel, Lagos, Nigeria"
            value={formData.location || ''}
            onChange={(e) => onChange({ location: e.target.value })}
            className="mt-1.5"
          />
          <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
            <span>ℹ️</span> Format: Venue, City, Country
          </p>
        </div>
      )}

      {/* Meeting Link (for virtual/hybrid) */}
      {(formData.format === 'virtual' || formData.format === 'hybrid') && (
        <div>
          <Label className="text-sm font-medium">Meeting Link *</Label>
          <Input
            placeholder="https://zoom.us/j/123456789"
            value={formData.meetingUrl || ''}
            onChange={(e) => onChange({ meetingUrl: e.target.value })}
            className="mt-1.5"
          />
          <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
            <span>ℹ️</span> Zoom, Google Meet, Teams, or any URL
          </p>
        </div>
      )}

      {/* Section Divider */}
      <div className="flex items-center gap-3 pt-2">
        <div className="flex-1 h-px bg-border" />
        <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Event Details</span>
        <div className="flex-1 h-px bg-border" />
      </div>

      {/* What to Expect (replaces Description) */}
      <div>
        <Label className="text-sm font-medium">What to Expect *</Label>
        <Textarea
          placeholder="What will attendees experience? What will they learn? Why should they attend?"
          value={formData.content}
          onChange={(e) => onChange({ content: e.target.value })}
          className="min-h-[100px] resize-none mt-1.5"
        />
        <p className="text-xs text-muted-foreground mt-1">
          {formData.content.length < 50 
            ? `${formData.content.length}/50 characters minimum`
            : `${formData.content.length} characters`
          }
        </p>
      </div>

      {/* Agenda Builder */}
      <div>
        <Label className="text-sm font-medium">Agenda (optional)</Label>
        <div className="space-y-2 mt-2">
          {agendaItems.map((item, index) => (
            <div key={index} className="flex gap-2 items-start">
              <Input
                type="text"
                placeholder="6:00 PM"
                value={item.time}
                onChange={(e) => updateAgendaItem(index, 'time', e.target.value)}
                className="w-24 flex-shrink-0"
              />
              <Input
                placeholder="Registration & Networking"
                value={item.title}
                onChange={(e) => updateAgendaItem(index, 'title', e.target.value)}
                className="flex-1"
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => removeAgendaItem(index)}
                className="h-10 w-10 flex-shrink-0 text-muted-foreground hover:text-destructive"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ))}
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={addAgendaItem}
            className="w-full border-dashed"
          >
            + Add agenda item
          </Button>
        </div>
        {agendaItems.length === 0 && (
          <p className="text-xs text-muted-foreground mt-2">
            Example: 6:00 PM - Registration, 6:30 PM - Keynote, 7:30 PM - Q&A
          </p>
        )}
      </div>

      {/* Dress Code & Capacity Row */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label className="text-sm font-medium">Dress Code (optional)</Label>
          <Select
            value={formData.dressCode || ''}
            onValueChange={(value) => onChange({ dressCode: value })}
          >
            <SelectTrigger className="mt-1.5">
              <SelectValue placeholder="Select..." />
            </SelectTrigger>
            <SelectContent>
              {dressCodeOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label className="text-sm font-medium">Capacity (optional)</Label>
          <Input
            type="number"
            placeholder="Unlimited"
            value={formData.maxAttendees || ''}
            onChange={(e) => onChange({ maxAttendees: e.target.value ? parseInt(e.target.value) : undefined })}
            className="mt-1.5"
            min={1}
          />
        </div>
      </div>

      {/* Tags */}
      <div>
        <Label className="text-sm font-medium">Tags (optional)</Label>
        <div className="flex flex-wrap gap-2 mt-2">
          {tags.map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center gap-1 px-2.5 py-1 bg-amber-100 dark:bg-amber-500/20 text-amber-800 dark:text-amber-300 rounded-full text-sm"
            >
              {tag}
              <button
                type="button"
                onClick={() => removeTag(tag)}
                className="hover:text-amber-600"
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          ))}
          <div className="flex gap-1">
            <Input
              type="text"
              placeholder="Add tag..."
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  addTag();
                }
              }}
              className="h-8 w-28 text-sm"
            />
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={addTag}
              className="h-8 px-2"
            >
              +
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * EventCoverUpload - Cover image upload for events
 */
function EventCoverUpload({
  currentImageUrl,
  onUpload,
  onRemove,
}: {
  currentImageUrl?: string;
  onUpload: (url: string) => void;
  onRemove: () => void;
}) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      toast({ title: 'Invalid file type', description: 'Please upload a JPG, PNG, or WebP image', variant: 'destructive' });
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast({ title: 'File too large', description: 'Image must be under 5MB', variant: 'destructive' });
      return;
    }

    setIsUploading(true);
    try {
      const url = await uploadMedia(file, user.id, 'event-images');
      onUpload(url);
      toast({ description: 'Cover image uploaded!' });
    } catch (error) {
      toast({ title: 'Upload failed', description: 'Please try again', variant: 'destructive' });
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  if (currentImageUrl) {
    return (
      <div className="relative mt-2">
        <img 
          src={currentImageUrl} 
          alt="Event cover" 
          className="w-full h-40 object-cover rounded-lg border"
        />
        <Button
          type="button"
          size="icon"
          variant="destructive"
          className="absolute top-2 right-2 h-8 w-8"
          onClick={onRemove}
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    );
  }

  return (
    <div className="mt-2">
      <div 
        className="border-2 border-dashed border-amber-300 rounded-lg p-6 text-center cursor-pointer hover:border-amber-400 hover:bg-amber-50/50 transition-colors"
        onClick={() => fileInputRef.current?.click()}
      >
        {isUploading ? (
          <div className="flex items-center justify-center gap-2">
            <Loader2 className="h-5 w-5 animate-spin text-amber-500" />
            <span className="text-sm text-muted-foreground">Uploading...</span>
          </div>
        ) : (
          <>
            <ImagePlus className="h-8 w-8 mx-auto text-amber-400 mb-2" />
            <p className="text-sm text-muted-foreground">
              Drop image here or click to upload
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Recommended: 16:9 ratio (1200×675)
            </p>
          </>
        )}
      </div>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/jpg,image/png,image/webp"
        className="hidden"
        onChange={handleFileSelect}
      />
    </div>
  );
}

function renderModeFields(
  mode: ComposerMode,
  formData: ComposerFormData,
  onChange: (updates: Partial<ComposerFormData>) => void
) {
  switch (mode) {
    case 'post':
      return <PostModeFields formData={formData} onChange={onChange} />;

    case 'story':
      return <StoryModeFields formData={formData} onChange={onChange} />;

    case 'event':
      return <EventModeFields formData={formData} onChange={onChange} />;

    case 'need':
      return <OpportunityModeFields formData={formData} onChange={onChange} />;

    case 'space':
      return <SpaceModeFields formData={formData} onChange={onChange} />;

    case 'community':
      return (
        <>
          <div>
            <Label>Title (optional)</Label>
            <Input
              placeholder="Post title"
              value={formData.title || ''}
              onChange={(e) => onChange({ title: e.target.value })}
            />
          </div>
          <Textarea
            placeholder="Share with your community..."
            value={formData.content}
            onChange={(e) => onChange({ content: e.target.value })}
            className="min-h-[120px] resize-none"
          />
          <MediaUploadButton onUpload={(url) => onChange({ mediaUrl: url })} />
        </>
      );

    default:
      return null;
  }
}

/**
 * SpaceModeFields - Enhanced space/project creation form per PRD
 */
function SpaceModeFields({ 
  formData, 
  onChange 
}: { 
  formData: ComposerFormData; 
  onChange: (updates: Partial<ComposerFormData>) => void;
}) {
  const spaceTypes = [
    { value: 'startup', icon: '🚀', label: 'Startup', description: 'Building a new venture' },
    { value: 'community', icon: '🌍', label: 'Community', description: 'Gathering people together' },
    { value: 'creative', icon: '🎨', label: 'Creative', description: 'Art, music, content' },
    { value: 'mentorship', icon: '🎓', label: 'Mentorship', description: 'Teaching & learning' },
  ];

  const visibilityOptions = [
    { value: 'public', label: 'Public', description: 'Anyone can discover and request to join' },
    { value: 'private', label: 'Private', description: 'Only visible to members' },
    { value: 'invite-only', label: 'Invite Only', description: 'Visible but requires invitation' },
  ];

  const skillOptions = [
    'Engineering', 'Design', 'Marketing', 'Finance', 'Operations', 
    'Legal', 'Sales', 'Product', 'Data', 'Content', 'Community'
  ];

  const selectedSkills = (formData as any).skillsNeeded || [];

  return (
    <div className="space-y-4">
      {/* Space Name */}
      <div>
        <Label className="text-sm font-medium">Space Name *</Label>
        <Input
          placeholder="What are you building?"
          value={formData.title || ''}
          onChange={(e) => onChange({ title: e.target.value })}
          className="mt-1.5"
          maxLength={60}
        />
      </div>

      {/* Space Type Selector */}
      <div>
        <Label className="text-sm font-medium">Space Type *</Label>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-2">
          {spaceTypes.map((type) => (
            <button
              key={type.value}
              type="button"
              onClick={() => onChange({ spaceCategory: type.value })}
              className={cn(
                'flex flex-col items-center p-3 rounded-lg border-2 transition-all text-center',
                formData.spaceCategory === type.value
                  ? 'border-dna-bevel-space bg-purple-50 dark:bg-purple-500/10'
                  : 'border-border hover:border-muted-foreground/50'
              )}
            >
              <span className="text-2xl mb-1">{type.icon}</span>
              <span className="text-sm font-medium">{type.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Description */}
      <div>
        <Label className="text-sm font-medium">Description *</Label>
        <Textarea
          placeholder="Tell people what this project is about..."
          value={formData.content}
          onChange={(e) => onChange({ content: e.target.value })}
          className="min-h-[100px] resize-none mt-1.5"
        />
      </div>

      {/* Cover Image */}
      <div>
        <Label className="text-sm font-medium">Cover Image</Label>
        <SpaceCoverUpload
          currentImageUrl={formData.mediaUrl}
          onUpload={(url) => onChange({ mediaUrl: url })}
          onRemove={() => onChange({ mediaUrl: undefined })}
        />
      </div>

      {/* Visibility */}
      <div>
        <Label className="text-sm font-medium">Visibility *</Label>
        <div className="space-y-2 mt-2">
          {visibilityOptions.map((option) => (
            <label
              key={option.value}
              className={cn(
                'flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-colors',
                formData.visibility === option.value
                  ? 'border-dna-bevel-space bg-purple-50/50 dark:bg-purple-500/5'
                  : 'border-border hover:bg-muted/50'
              )}
            >
              <input
                type="radio"
                name="visibility"
                value={option.value}
                checked={formData.visibility === option.value}
                onChange={() => onChange({ visibility: option.value as any })}
                className="mt-1"
              />
              <div>
                <span className="font-medium">{option.label}</span>
                <p className="text-xs text-muted-foreground">{option.description}</p>
              </div>
            </label>
          ))}
        </div>
      </div>

      {/* Skills Needed */}
      <div>
        <Label className="text-sm font-medium">Skills Needed (optional)</Label>
        <div className="flex flex-wrap gap-2 mt-2">
          {skillOptions.map((skill) => (
            <button
              key={skill}
              type="button"
              onClick={() => {
                const current = selectedSkills;
                const updated = current.includes(skill)
                  ? current.filter((s: string) => s !== skill)
                  : [...current, skill];
                onChange({ ...formData, skillsNeeded: updated } as any);
              }}
              className={cn(
                'px-3 py-1.5 rounded-full text-sm border transition-colors',
                selectedSkills.includes(skill)
                  ? 'bg-dna-bevel-space text-white border-dna-bevel-space'
                  : 'border-border hover:border-dna-bevel-space'
              )}
            >
              {skill}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

/**
 * SpaceCoverUpload - Cover image upload for spaces
 */
function SpaceCoverUpload({
  currentImageUrl,
  onUpload,
  onRemove,
}: {
  currentImageUrl?: string;
  onUpload: (url: string) => void;
  onRemove: () => void;
}) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      toast({ title: 'Invalid file type', description: 'Please upload a JPG, PNG, or WebP image', variant: 'destructive' });
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast({ title: 'File too large', description: 'Image must be under 5MB', variant: 'destructive' });
      return;
    }

    setIsUploading(true);
    try {
      const url = await uploadMedia(file, user.id, 'post-media');
      onUpload(url);
      toast({ description: 'Cover image uploaded!' });
    } catch (error) {
      toast({ title: 'Upload failed', description: 'Please try again', variant: 'destructive' });
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  if (currentImageUrl) {
    return (
      <div className="relative mt-2">
        <img 
          src={currentImageUrl} 
          alt="Space cover" 
          className="w-full h-32 object-cover rounded-lg border"
        />
        <Button
          type="button"
          size="icon"
          variant="destructive"
          className="absolute top-2 right-2 h-8 w-8"
          onClick={onRemove}
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    );
  }

  return (
    <div className="mt-2">
      <div 
        className="border-2 border-dashed border-purple-300 rounded-lg p-4 text-center cursor-pointer hover:border-purple-400 hover:bg-purple-50/50 transition-colors"
        onClick={() => fileInputRef.current?.click()}
      >
        {isUploading ? (
          <div className="flex items-center justify-center gap-2">
            <Loader2 className="h-5 w-5 animate-spin text-purple-500" />
            <span className="text-sm text-muted-foreground">Uploading...</span>
          </div>
        ) : (
          <>
            <ImagePlus className="h-6 w-6 mx-auto text-purple-400 mb-1" />
            <p className="text-sm text-muted-foreground">Upload cover image</p>
          </>
        )}
      </div>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/jpg,image/png,image/webp"
        className="hidden"
        onChange={handleFileSelect}
      />
    </div>
  );
}

/**
 * OpportunityModeFields - Enhanced per PRD Section 3.2
 *
 * Features: Need/Offer direction, PRD category taxonomy, compensation types,
 * diaspora-aware location relevance, duration, and budget range.
 */
function OpportunityModeFields({
  formData,
  onChange
}: {
  formData: ComposerFormData;
  onChange: (updates: Partial<ComposerFormData>) => void;
}) {
  const opportunityType = (formData as Record<string, unknown>).opportunityType as string || 'need';

  // PRD OpportunityCategory enum values
  const categories = [
    { value: 'skills_expertise', label: 'Skills & Expertise' },
    { value: 'funding_investment', label: 'Funding & Investment' },
    { value: 'mentorship_guidance', label: 'Mentorship & Guidance' },
    { value: 'partnership_collaboration', label: 'Partnership & Collaboration' },
    { value: 'knowledge_training', label: 'Knowledge & Training' },
    { value: 'network_introductions', label: 'Network & Introductions' },
    { value: 'physical_resources', label: 'Physical Resources' },
    { value: 'volunteer_time', label: 'Volunteer Time' },
  ];

  // PRD CompensationType enum values
  const compensationOptions = [
    { value: 'paid', label: 'Paid' },
    { value: 'volunteer', label: 'Volunteer' },
    { value: 'exchange', label: 'Exchange' },
    { value: 'equity', label: 'Equity' },
    { value: 'hybrid', label: 'Hybrid' },
  ];

  // PRD LocationRelevance enum values
  const locationOptions = [
    { value: 'diaspora', label: 'Diaspora', description: 'Relevant to the global African diaspora' },
    { value: 'africa_based', label: 'Africa-Based', description: 'On the continent' },
    { value: 'global', label: 'Global', description: 'Open to anyone, anywhere' },
    { value: 'specific_region', label: 'Specific Region', description: 'Limited to a particular region' },
  ];

  // PRD OpportunityDuration enum values
  const durationOptions = [
    { value: 'one_time', label: 'One-Time' },
    { value: 'short_term', label: 'Short-Term' },
    { value: 'long_term', label: 'Long-Term' },
    { value: 'ongoing', label: 'Ongoing' },
  ];

  const extData = formData as Record<string, unknown>;
  const selectedCompensation = (extData.compensationType as string) || '';
  const selectedLocation = (extData.locationRelevance as string) || '';
  const selectedDuration = (extData.duration as string) || '';

  return (
    <div className="space-y-4">
      {/* Need/Offer Toggle */}
      <div>
        <Label className="text-sm font-medium">Direction *</Label>
        <div className="grid grid-cols-2 gap-3 mt-2">
          <button
            type="button"
            onClick={() => onChange({ ...formData, opportunityType: 'need' } as Partial<ComposerFormData>)}
            className={cn(
              'flex flex-col items-center p-4 rounded-lg border-2 transition-all',
              opportunityType === 'need'
                ? 'border-[#B87333] bg-orange-50 dark:bg-orange-500/10'
                : 'border-border hover:border-muted-foreground/50'
            )}
          >
            <span className="text-2xl mb-1">I Need</span>
            <span className="text-xs text-muted-foreground">Looking for help</span>
          </button>
          <button
            type="button"
            onClick={() => onChange({ ...formData, opportunityType: 'offer' } as Partial<ComposerFormData>)}
            className={cn(
              'flex flex-col items-center p-4 rounded-lg border-2 transition-all',
              opportunityType === 'offer'
                ? 'border-[#B87333] bg-orange-50 dark:bg-orange-500/10'
                : 'border-border hover:border-muted-foreground/50'
            )}
          >
            <span className="text-2xl mb-1">I'm Offering</span>
            <span className="text-xs text-muted-foreground">Sharing resources</span>
          </button>
        </div>
      </div>

      {/* Title */}
      <div>
        <Label className="text-sm font-medium">Title *</Label>
        <Input
          placeholder={opportunityType === 'need' ? 'What do you need?' : 'What are you offering?'}
          value={formData.title || ''}
          onChange={(e) => onChange({ title: e.target.value })}
          className="mt-1.5"
          maxLength={100}
        />
      </div>

      {/* Category (PRD OpportunityCategory) */}
      <div>
        <Label className="text-sm font-medium">Category *</Label>
        <Select
          value={(extData.category as string) || ''}
          onValueChange={(value) => onChange({ ...formData, category: value } as Partial<ComposerFormData>)}
        >
          <SelectTrigger className="mt-1.5">
            <SelectValue placeholder="Select a category" />
          </SelectTrigger>
          <SelectContent>
            {categories.map((cat) => (
              <SelectItem key={cat.value} value={cat.value}>
                {cat.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Description */}
      <div>
        <Label className="text-sm font-medium">Description *</Label>
        <Textarea
          placeholder={opportunityType === 'need'
            ? 'Describe what you need in detail...'
            : 'Describe what you\'re offering...'}
          value={formData.content}
          onChange={(e) => onChange({ content: e.target.value })}
          className="min-h-[100px] resize-none mt-1.5"
        />
      </div>

      {/* Compensation Type (PRD CompensationType) */}
      <div>
        <Label className="text-sm font-medium">Compensation *</Label>
        <Select
          value={selectedCompensation}
          onValueChange={(value) => onChange({ ...formData, compensationType: value } as Partial<ComposerFormData>)}
        >
          <SelectTrigger className="mt-1.5">
            <SelectValue placeholder="Select compensation type" />
          </SelectTrigger>
          <SelectContent>
            {compensationOptions.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Budget Range (shown for paid compensation) */}
      {selectedCompensation === 'paid' && (
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label className="text-sm font-medium">Min Budget</Label>
            <Input
              type="number"
              placeholder="0"
              value={(extData.budgetMin as string) || ''}
              onChange={(e) => onChange({ ...formData, budgetMin: e.target.value } as Partial<ComposerFormData>)}
              className="mt-1.5"
            />
          </div>
          <div>
            <Label className="text-sm font-medium">Max Budget</Label>
            <Input
              type="number"
              placeholder="10000"
              value={(extData.budgetMax as string) || ''}
              onChange={(e) => onChange({ ...formData, budgetMax: e.target.value } as Partial<ComposerFormData>)}
              className="mt-1.5"
            />
          </div>
        </div>
      )}

      {/* Location Relevance (PRD LocationRelevance) */}
      <div>
        <Label className="text-sm font-medium">Location Relevance *</Label>
        <div className="space-y-2 mt-2">
          {locationOptions.map((option) => (
            <label
              key={option.value}
              className={cn(
                'flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-colors',
                selectedLocation === option.value
                  ? 'border-[#B87333] bg-orange-50/50 dark:bg-orange-500/5'
                  : 'border-border hover:bg-muted/50'
              )}
            >
              <input
                type="radio"
                name="locationRelevance"
                value={option.value}
                checked={selectedLocation === option.value}
                onChange={() => onChange({ ...formData, locationRelevance: option.value } as Partial<ComposerFormData>)}
                className="mt-1"
              />
              <div>
                <span className="font-medium">{option.label}</span>
                <p className="text-xs text-muted-foreground">{option.description}</p>
              </div>
            </label>
          ))}
        </div>

        {selectedLocation === 'specific_region' && (
          <Input
            placeholder="Enter region or country..."
            value={(extData.specificRegion as string) || ''}
            onChange={(e) => onChange({ ...formData, specificRegion: e.target.value } as Partial<ComposerFormData>)}
            className="mt-2"
          />
        )}
      </div>

      {/* Duration & Deadline */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label className="text-sm font-medium">Duration</Label>
          <Select
            value={selectedDuration}
            onValueChange={(value) => onChange({ ...formData, duration: value } as Partial<ComposerFormData>)}
          >
            <SelectTrigger className="mt-1.5">
              <SelectValue placeholder="Select duration" />
            </SelectTrigger>
            <SelectContent>
              {durationOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label className="text-sm font-medium">Deadline</Label>
          <Input
            type="date"
            value={(extData.deadline as string) || ''}
            onChange={(e) => onChange({ ...formData, deadline: e.target.value } as Partial<ComposerFormData>)}
            className="mt-1.5"
          />
        </div>
      </div>

      {/* Requirements */}
      <div>
        <Label className="text-sm font-medium">Requirements (optional)</Label>
        <Textarea
          placeholder="Skills, experience, or qualifications needed..."
          value={(extData.requirements as string) || ''}
          onChange={(e) => onChange({ ...formData, requirements: e.target.value } as Partial<ComposerFormData>)}
          className="min-h-[60px] resize-none mt-1.5"
        />
      </div>
    </div>
  );
}

function MediaUploadButton({ 
  label = 'Add Media', 
  onUpload,
  currentMediaUrl,
  onRemove
}: { 
  label?: string; 
  onUpload: (url: string) => void;
  currentMediaUrl?: string;
  onRemove?: () => void;
}) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    // Validate file type - support images and videos
    const validImageTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
    const validVideoTypes = ['video/mp4', 'video/webm', 'video/mov'];
    const isImage = validImageTypes.includes(file.type);
    const isVideo = validVideoTypes.includes(file.type);
    
    if (!isImage && !isVideo) {
      toast({
        title: 'Invalid file type',
        description: 'Please upload a JPG, PNG, WebP, GIF image or MP4, WebM video.',
        variant: 'destructive',
      });
      return;
    }

    // Validate file size (5MB for images, 50MB for videos)
    const maxSize = isVideo ? 50 * 1024 * 1024 : 5 * 1024 * 1024;
    if (file.size > maxSize) {
      toast({
        title: 'File too large',
        description: isVideo ? 'Please upload a video smaller than 50MB.' : 'Please upload an image smaller than 5MB.',
        variant: 'destructive',
      });
      return;
    }

    setIsUploading(true);
    try {
      const url = await uploadMedia(file, user.id, 'post-media');
      onUpload(url);
      toast({
        description: `${isVideo ? 'Video' : 'Image'} uploaded successfully.`,
      });
    } catch (error) {
      toast({
        title: 'Upload failed',
        description: 'We couldn\'t upload that file. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  // Show preview if media is already uploaded
  if (currentMediaUrl) {
    const isVideo = currentMediaUrl.includes('.mp4') || currentMediaUrl.includes('.webm') || currentMediaUrl.includes('.mov');
    return (
      <div className="space-y-2">
        <Label>Media</Label>
        <div className="relative rounded-lg border border-border overflow-hidden">
          {isVideo ? (
            <video 
              src={currentMediaUrl} 
              className="w-full h-40 object-cover"
              controls
            />
          ) : (
            <img 
              src={currentMediaUrl} 
              alt="Post media" 
              className="w-full h-40 object-cover"
            />
          )}
          <div className="absolute top-2 right-2 flex gap-2">
            <Button
              type="button"
              size="sm"
              variant="secondary"
              onClick={() => fileInputRef.current?.click()}
            >
              Change
            </Button>
            {onRemove && (
              <Button
                type="button"
                size="icon"
                variant="destructive"
                className="h-8 w-8"
                onClick={onRemove}
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/jpg,image/png,image/webp,image/gif,video/mp4,video/webm"
          onChange={handleFileSelect}
          className="hidden"
        />
      </div>
    );
  }

  return (
    <div>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/jpg,image/png,image/webp,image/gif,video/mp4,video/webm"
        onChange={handleFileSelect}
        className="hidden"
      />
      <Button 
        variant="outline" 
        size="sm" 
        className="w-full" 
        disabled={isUploading}
        onClick={() => fileInputRef.current?.click()}
      >
        {isUploading ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Uploading...
          </>
        ) : (
          <>
            <ImagePlus className="w-4 h-4 mr-2" />
            {label}
          </>
        )}
      </Button>
    </div>
  );
}

function StoryImageUpload({ 
  currentImageUrl,
  onUpload,
  onRemove
}: { 
  currentImageUrl?: string;
  onUpload: (url: string) => void;
  onRemove: () => void;
}) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    // Validate file type
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      toast({
        title: 'Invalid file type',
        description: 'Please upload a JPG, PNG, or WebP image.',
        variant: 'destructive',
      });
      return;
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: 'File too large',
        description: 'Please upload an image smaller than 5MB.',
        variant: 'destructive',
      });
      return;
    }

    setIsUploading(true);
    try {
      const url = await uploadMedia(file, user.id, 'story-hero-images');
      onUpload(url);
      toast({
        description: 'Hero image uploaded successfully.',
      });
    } catch (error) {
      toast({
        title: 'Upload failed',
        description: 'We couldn\'t upload that image. Try a smaller JPG or PNG.',
      });
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  if (currentImageUrl) {
    return (
      <div className="space-y-2">
        <Label>Hero Image (optional)</Label>
        <div className="relative rounded-lg border border-border overflow-hidden">
          <img 
            src={currentImageUrl} 
            alt="Story hero" 
            className="w-full h-40 object-cover"
          />
          <div className="absolute top-2 right-2 flex gap-2">
            <Button
              type="button"
              size="sm"
              variant="secondary"
              onClick={() => fileInputRef.current?.click()}
            >
              Change
            </Button>
            <Button
              type="button"
              size="sm"
              variant="destructive"
              onClick={onRemove}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/jpg,image/png,image/webp"
          onChange={handleFileSelect}
          className="hidden"
        />
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <Label>Hero Image (optional)</Label>
      <button
        type="button"
        onClick={() => fileInputRef.current?.click()}
        disabled={isUploading}
        className="w-full border-2 border-dashed border-border rounded-lg p-6 hover:border-primary/50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <div className="flex flex-col items-center gap-2 text-muted-foreground">
          {isUploading ? (
            <>
              <Loader2 className="h-8 w-8 animate-spin" />
              <p className="text-sm">Uploading...</p>
            </>
          ) : (
            <>
              <ImagePlus className="h-8 w-8" />
              <p className="text-sm font-medium">Add Hero Image</p>
              <p className="text-xs">Landscape photos work best. JPG/PNG up to 5MB.</p>
            </>
          )}
        </div>
      </button>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/jpg,image/png,image/webp"
        onChange={handleFileSelect}
        className="hidden"
      />
    </div>
  );
}
