import React, { useState, useRef } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { ImagePlus, X, Loader2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { uploadMedia } from '@/lib/uploadMedia';
import { EventLocationAutocomplete, LocationData } from '@/components/location/EventLocationAutocomplete';

export interface EventFormData {
  title: string;
  subtitle?: string;
  description: string;
  format: 'in_person' | 'virtual' | 'hybrid';
  eventDate: string;
  eventTime: string;
  eventEndDate: string;
  eventEndTime: string;
  timezone?: string;
  location?: string;
  locationData?: LocationData;
  meetingUrl?: string;
  coverImageUrl?: string;
  dressCode?: string;
  maxAttendees?: number;
  tags?: string[];
  agenda?: Array<{ time: string; title: string }>;
}

// Common timezones with Africa prioritized for DNA platform
const timezoneOptions = [
  // Africa
  { value: 'Africa/Lagos', label: 'Lagos, Nigeria (WAT)' },
  { value: 'Africa/Nairobi', label: 'Nairobi, Kenya (EAT)' },
  { value: 'Africa/Johannesburg', label: 'Johannesburg, South Africa (SAST)' },
  { value: 'Africa/Cairo', label: 'Cairo, Egypt (EET)' },
  { value: 'Africa/Accra', label: 'Accra, Ghana (GMT)' },
  { value: 'Africa/Casablanca', label: 'Casablanca, Morocco (WET)' },
  { value: 'Africa/Addis_Ababa', label: 'Addis Ababa, Ethiopia (EAT)' },
  { value: 'Africa/Dakar', label: 'Dakar, Senegal (GMT)' },
  { value: 'Africa/Kigali', label: 'Kigali, Rwanda (CAT)' },
  { value: 'Africa/Kinshasa', label: 'Kinshasa, DRC (WAT)' },
  // Americas
  { value: 'America/New_York', label: 'New York (EST/EDT)' },
  { value: 'America/Chicago', label: 'Chicago (CST/CDT)' },
  { value: 'America/Denver', label: 'Denver (MST/MDT)' },
  { value: 'America/Los_Angeles', label: 'Los Angeles (PST/PDT)' },
  { value: 'America/Toronto', label: 'Toronto (EST/EDT)' },
  { value: 'America/Sao_Paulo', label: 'São Paulo (BRT)' },
  { value: 'America/Mexico_City', label: 'Mexico City (CST)' },
  // Europe
  { value: 'Europe/London', label: 'London (GMT/BST)' },
  { value: 'Europe/Paris', label: 'Paris (CET/CEST)' },
  { value: 'Europe/Berlin', label: 'Berlin (CET/CEST)' },
  { value: 'Europe/Amsterdam', label: 'Amsterdam (CET/CEST)' },
  // Middle East / Asia
  { value: 'Asia/Dubai', label: 'Dubai (GST)' },
  { value: 'Asia/Singapore', label: 'Singapore (SGT)' },
  { value: 'Asia/Tokyo', label: 'Tokyo (JST)' },
  // Caribbean
  { value: 'America/Jamaica', label: 'Jamaica (EST)' },
  { value: 'America/Port_of_Spain', label: 'Trinidad & Tobago (AST)' },
  { value: 'America/Barbados', label: 'Barbados (AST)' },
  // UTC
  { value: 'UTC', label: 'UTC (Coordinated Universal Time)' },
];

interface EventFormFieldsProps {
  formData: EventFormData;
  onChange: (updates: Partial<EventFormData>) => void;
  showAuthorInfo?: boolean;
}

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

export function EventFormFields({ formData, onChange }: EventFormFieldsProps) {
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
          currentImageUrl={formData.coverImageUrl}
          onUpload={(url) => onChange({ coverImageUrl: url })}
          onRemove={() => onChange({ coverImageUrl: undefined })}
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
              {timezoneOptions.map((tz) => (
                <SelectItem key={tz.value} value={tz.value}>
                  {tz.label}
                </SelectItem>
              ))}
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
          <EventLocationAutocomplete
            value={formData.locationData || formData.location || ''}
            onChange={(locationData) => {
              onChange({
                location: locationData.displayName,
                locationData: locationData,
              });
            }}
            placeholder="Search for a venue or address..."
            className="mt-1.5"
          />
          <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
            <span>ℹ️</span> Start typing to search for venues, addresses, or cities
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
          value={formData.description}
          onChange={(e) => onChange({ description: e.target.value })}
          className="min-h-[100px] resize-y mt-1.5"
        />
        <p className="text-xs text-muted-foreground mt-1">
          {formData.description.length < 50 
            ? `${formData.description.length}/50 characters minimum`
            : `${formData.description.length} characters`
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
              JPG, PNG, or WebP up to 5MB
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
