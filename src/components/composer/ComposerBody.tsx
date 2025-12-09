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
import { VideoLinkPreview } from '@/components/feed/VideoLinkPreview';

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
        <VideoLinkPreview
          embedData={{
            url: previewData.url,
            title: previewData.title,
            author_name: previewData.author_name,
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

function renderModeFields(
  mode: ComposerMode,
  formData: ComposerFormData,
  onChange: (updates: Partial<ComposerFormData>) => void
) {
  switch (mode) {
    case 'post':
      return <PostModeFields formData={formData} onChange={onChange} />;

    case 'story':
      return (
        <>
          <div>
            <Label>Story title *</Label>
            <Input
              placeholder="Story title"
              value={formData.title || ''}
              onChange={(e) => onChange({ title: e.target.value })}
            />
          </div>
          <div>
            <Label>Subtitle (optional)</Label>
            <Input
              placeholder="Optional short line to frame your story"
              value={formData.subtitle || ''}
              onChange={(e) => onChange({ subtitle: e.target.value })}
            />
          </div>
          <div>
            <Label>Content *</Label>
            <Textarea
              placeholder="Your story (minimum 400 characters)"
              value={formData.content}
              onChange={(e) => {
                const value = e.target.value;
                if (value.length <= 4000) {
                  onChange({ content: value });
                }
              }}
              className="min-h-[200px] resize-none"
            />
            <p className="text-xs text-muted-foreground mt-1">
              {formData.content.length < 400 
                ? `${formData.content.length}/400 characters (minimum for Stories)`
                : formData.content.length > 3500
                  ? `${formData.content.length}/4,000 characters (nearing limit)`
                  : `${formData.content.length} characters (400–2,500 recommended)`
              }
            </p>
          </div>
          <StoryImageUpload 
            currentImageUrl={formData.heroImage}
            onUpload={(url) => onChange({ heroImage: url })}
            onRemove={() => onChange({ heroImage: undefined })}
          />
        </>
      );

    case 'event':
      return (
        <>
          <div>
            <Label>Event Title *</Label>
            <Input
              placeholder="Event name"
              value={formData.title || ''}
              onChange={(e) => onChange({ title: e.target.value })}
            />
          </div>
          <div>
            <Label>Description *</Label>
            <Textarea
              placeholder="Event details..."
              value={formData.content}
              onChange={(e) => onChange({ content: e.target.value })}
              className="min-h-[100px] resize-none"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Date *</Label>
              <Input
                type="date"
                value={formData.eventDate || ''}
                onChange={(e) => onChange({ eventDate: e.target.value })}
              />
            </div>
            <div>
              <Label>Time *</Label>
              <Input
                type="time"
                value={formData.eventTime || ''}
                onChange={(e) => onChange({ eventTime: e.target.value })}
              />
            </div>
          </div>
          <div>
            <Label>Location</Label>
            <Input
              placeholder="Event location or virtual link"
              value={formData.location || ''}
              onChange={(e) => onChange({ location: e.target.value })}
            />
          </div>
          <div>
            <Label>Format</Label>
            <Select
              value={formData.format || 'in_person'}
              onValueChange={(value: any) => onChange({ format: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="in_person">In Person</SelectItem>
                <SelectItem value="virtual">Virtual</SelectItem>
                <SelectItem value="hybrid">Hybrid</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <MediaUploadButton label="Cover Image" onUpload={(url) => onChange({ mediaUrl: url })} />
        </>
      );

    case 'need':
      return (
        <>
          <div>
            <Label>Title *</Label>
            <Input
              placeholder="What do you need?"
              value={formData.title || ''}
              onChange={(e) => onChange({ title: e.target.value })}
            />
          </div>
          <div>
            <Label>Type</Label>
            <Select
              value={formData.needType || 'expertise'}
              onValueChange={(value: any) => onChange({ needType: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="funding">Funding</SelectItem>
                <SelectItem value="expertise">Expertise</SelectItem>
                <SelectItem value="resources">Resources</SelectItem>
                <SelectItem value="volunteers">Volunteers</SelectItem>
                <SelectItem value="partnership">Partnership</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Description *</Label>
            <Textarea
              placeholder="Describe what you need..."
              value={formData.content}
              onChange={(e) => onChange({ content: e.target.value })}
              className="min-h-[120px] resize-none"
            />
          </div>
        </>
      );

    case 'space':
      return (
        <>
          <div>
            <Label>Space Name *</Label>
            <Input
              placeholder="Name your space or project"
              value={formData.title || ''}
              onChange={(e) => onChange({ title: e.target.value })}
            />
          </div>
          <div>
            <Label>Description *</Label>
            <Textarea
              placeholder="What is this space about?"
              value={formData.content}
              onChange={(e) => onChange({ content: e.target.value })}
              className="min-h-[120px] resize-none"
            />
          </div>
          <div>
            <Label>Visibility</Label>
            <Select
              value={formData.visibility || 'public'}
              onValueChange={(value: any) => onChange({ visibility: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="public">Public</SelectItem>
                <SelectItem value="private">Private</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <MediaUploadButton label="Space Image" onUpload={(url) => onChange({ mediaUrl: url })} />
        </>
      );

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
      console.error('Upload error:', error);
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
      console.error('Upload error:', error);
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
