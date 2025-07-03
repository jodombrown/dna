import React, { useState, useRef } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ImagePlus, Send, X, Calendar, Lightbulb, Target, ChevronDown, ChevronUp } from 'lucide-react';
import { useAuth } from '@/contexts/CleanAuthContext';
import { useCleanSocialPosts } from '@/hooks/useCleanSocialPosts';
import { useImageUpload } from '@/hooks/useImageUpload';

type ContentType = 'post' | 'event' | 'initiative' | 'opportunity';

const UnifiedContentCreator: React.FC = () => {
  const { user, profile } = useAuth();
  const { createPost } = useCleanSocialPosts();
  const { uploadImage, uploading } = useImageUpload();
  const [isExpanded, setIsExpanded] = useState(false);
  const [activeTab, setActiveTab] = useState<ContentType>('post');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form states
  const [content, setContent] = useState('');
  const [title, setTitle] = useState('');
  const [location, setLocation] = useState('');
  const [dateTime, setDateTime] = useState('');
  
  // Image states
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [selectedBanner, setSelectedBanner] = useState<File | null>(null);
  const [bannerPreview, setBannerPreview] = useState<string | null>(null);
  
  const imageInputRef = useRef<HTMLInputElement>(null);
  const bannerInputRef = useRef<HTMLInputElement>(null);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>, type: 'image' | 'banner') => {
    const file = e.target.files?.[0];
    if (file) {
      if (type === 'image') {
        setSelectedImage(file);
        const reader = new FileReader();
        reader.onload = () => setImagePreview(reader.result as string);
        reader.readAsDataURL(file);
      } else {
        setSelectedBanner(file);
        const reader = new FileReader();
        reader.onload = () => setBannerPreview(reader.result as string);
        reader.readAsDataURL(file);
      }
    }
  };

  const removeImage = (type: 'image' | 'banner') => {
    if (type === 'image') {
      setSelectedImage(null);
      setImagePreview(null);
      if (imageInputRef.current) imageInputRef.current.value = '';
    } else {
      setSelectedBanner(null);
      setBannerPreview(null);
      if (bannerInputRef.current) bannerInputRef.current.value = '';
    }
  };

  const handleSubmit = async () => {
    if ((!content.trim() && !title.trim()) || isSubmitting) return;

    setIsSubmitting(true);
    try {
      let imageUrl = null;
      let bannerUrl = null;

      if (selectedImage) {
        imageUrl = await uploadImage(selectedImage);
        if (!imageUrl) {
          setIsSubmitting(false);
          return;
        }
      }

      if (selectedBanner) {
        bannerUrl = await uploadImage(selectedBanner);
        if (!bannerUrl) {
          setIsSubmitting(false);
          return;
        }
      }

      const finalContent = title ? `${title}\n\n${content}` : content;
      await createPost(finalContent.trim(), activeTab, imageUrl, [], {
        banner_url: bannerUrl,
        location: location || null,
        date_time: dateTime || null
      });
      
      // Reset form
      setContent('');
      setTitle('');
      setLocation('');
      setDateTime('');
      setSelectedImage(null);
      setImagePreview(null);
      setSelectedBanner(null);
      setBannerPreview(null);
      setIsExpanded(false);
      if (imageInputRef.current) imageInputRef.current.value = '';
      if (bannerInputRef.current) bannerInputRef.current.value = '';
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!user) return null;

  const getTabIcon = (type: ContentType) => {
    switch (type) {
      case 'event': return Calendar;
      case 'initiative': return Lightbulb;
      case 'opportunity': return Target;
      default: return Send;
    }
  };

  const getTabLabel = (type: ContentType) => {
    switch (type) {
      case 'event': return 'Event';
      case 'initiative': return 'Initiative';
      case 'opportunity': return 'Opportunity';
      default: return 'Post';
    }
  };

  const getPlaceholder = (type: ContentType) => {
    switch (type) {
      case 'event': return 'Share details about your event...';
      case 'initiative': return 'Describe your initiative and how others can get involved...';
      case 'opportunity': return 'Share this opportunity with the DNA community...';
      default: return 'Share your thoughts with the DNA community...';
    }
  };

  const canSubmit = (content.trim() || title.trim() || selectedImage || selectedBanner) && !isSubmitting && !uploading;

  return (
    <Card className="mb-6">
      <CardContent className="p-4">
        {!isExpanded ? (
          // Collapsed state
          <div className="flex items-center gap-4 cursor-pointer" onClick={() => setIsExpanded(true)}>
            <Avatar className="w-10 h-10">
              <AvatarImage src={profile?.avatar_url} alt={profile?.full_name} />
              <AvatarFallback className="bg-dna-mint text-dna-forest">
                {profile?.full_name?.charAt(0) || user.email?.charAt(0) || 'U'}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 bg-gray-50 rounded-full px-4 py-3 text-gray-500 hover:bg-gray-100 transition-colors">
              What would you like to share?
            </div>
            <ChevronDown className="w-5 h-5 text-gray-400" />
          </div>
        ) : (
          // Expanded state
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Avatar className="w-10 h-10">
                  <AvatarImage src={profile?.avatar_url} alt={profile?.full_name} />
                  <AvatarFallback className="bg-dna-mint text-dna-forest">
                    {profile?.full_name?.charAt(0) || user.email?.charAt(0) || 'U'}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium text-sm">{profile?.full_name || 'DNA Member'}</p>
                  <p className="text-xs text-gray-500">{profile?.profession || 'Professional'}</p>
                </div>
              </div>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setIsExpanded(false)}
                className="p-1"
              >
                <ChevronUp className="w-4 h-4" />
              </Button>
            </div>

            <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as ContentType)}>
              <TabsList className="grid w-full grid-cols-4">
                {(['post', 'event', 'initiative', 'opportunity'] as ContentType[]).map((type) => {
                  const Icon = getTabIcon(type);
                  return (
                    <TabsTrigger key={type} value={type} className="flex items-center gap-2">
                      <Icon className="w-4 h-4" />
                      <span className="hidden sm:inline">{getTabLabel(type)}</span>
                    </TabsTrigger>
                  );
                })}
              </TabsList>

              {(['post', 'event', 'initiative', 'opportunity'] as ContentType[]).map((type) => (
                <TabsContent key={type} value={type} className="space-y-4 mt-4">
                  {(type === 'event' || type === 'initiative' || type === 'opportunity') && (
                    <Input
                      placeholder={`${getTabLabel(type)} title...`}
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      className="font-medium"
                    />
                  )}

                  <Textarea
                    placeholder={getPlaceholder(type)}
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    className="min-h-[80px] resize-none border-none shadow-none focus-visible:ring-0"
                    maxLength={500}
                  />

                  {type === 'event' && (
                    <div className="grid grid-cols-2 gap-3">
                      <Input
                        placeholder="Event location"
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                      />
                      <Input
                        type="datetime-local"
                        value={dateTime}
                        onChange={(e) => setDateTime(e.target.value)}
                      />
                    </div>
                  )}

                  {bannerPreview && (
                    <div className="relative">
                      <img 
                        src={bannerPreview} 
                        alt="Banner preview" 
                        className="w-full h-32 object-cover rounded-lg border"
                      />
                      <button
                        onClick={() => removeImage('banner')}
                        className="absolute top-2 right-2 p-1 bg-black bg-opacity-50 text-white rounded-full hover:bg-opacity-75"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  )}

                  {imagePreview && (
                    <div className="relative inline-block">
                      <img 
                        src={imagePreview} 
                        alt="Image preview" 
                        className="max-w-full h-auto max-h-48 rounded-lg border"
                      />
                      <button
                        onClick={() => removeImage('image')}
                        className="absolute top-2 right-2 p-1 bg-black bg-opacity-50 text-white rounded-full hover:bg-opacity-75"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </TabsContent>
              ))}
            </Tabs>
            
            <div className="flex items-center justify-between pt-3 border-t">
              <div className="flex items-center gap-2">
                <input
                  type="file"
                  ref={bannerInputRef}
                  onChange={(e) => handleImageSelect(e, 'banner')}
                  accept="image/*"
                  className="hidden"
                />
                <input
                  type="file"
                  ref={imageInputRef}
                  onChange={(e) => handleImageSelect(e, 'image')}
                  accept="image/*"
                  className="hidden"
                />
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="text-gray-500"
                  onClick={() => bannerInputRef.current?.click()}
                  disabled={uploading}
                >
                  <ImagePlus className="w-4 h-4 mr-1" />
                  Banner
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="text-gray-500"
                  onClick={() => imageInputRef.current?.click()}
                  disabled={uploading}
                >
                  <ImagePlus className="w-4 h-4 mr-1" />
                  Image
                </Button>
              </div>
              
              <div className="flex items-center gap-2">
                {content.length > 0 && (
                  <span className="text-xs text-gray-500">
                    {content.length}/500
                  </span>
                )}
                <Button
                  onClick={handleSubmit}
                  disabled={!canSubmit}
                  className="bg-dna-emerald hover:bg-dna-forest text-white"
                >
                  {isSubmitting ? 'Sharing...' : 'Share'}
                </Button>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default UnifiedContentCreator;