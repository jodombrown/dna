import React, { useState, useRef } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  ImagePlus, 
  Send, 
  X, 
  Calendar, 
  Lightbulb, 
  Target, 
  ChevronDown, 
  ChevronUp,
  MapPin,
  Clock,
  Users,
  ThumbsUp,
  MessageCircle,
  Share2,
  Bookmark
} from 'lucide-react';
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
  const [showPreview, setShowPreview] = useState(false);

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
      removeImage('image');
      removeImage('banner');
      setIsExpanded(false);
      setShowPreview(false);
    } catch (error) {
      console.error('Error creating post:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setContent('');
    setTitle('');
    setLocation('');
    setDateTime('');
    removeImage('image');
    removeImage('banner');
    setIsExpanded(false);
    setShowPreview(false);
  };

  const getTabInfo = (type: ContentType) => {
    switch (type) {
      case 'post':
        return { icon: <Target className="w-4 h-4" />, label: 'Post', color: 'text-blue-600' };
      case 'event':
        return { icon: <Calendar className="w-4 h-4" />, label: 'Event', color: 'text-purple-600' };
      case 'initiative':
        return { icon: <Lightbulb className="w-4 h-4" />, label: 'Initiative', color: 'text-green-600' };
      case 'opportunity':
        return { icon: <Target className="w-4 h-4" />, label: 'Opportunity', color: 'text-orange-600' };
      default:
        return { icon: <Target className="w-4 h-4" />, label: 'Post', color: 'text-blue-600' };
    }
  };

  // Preview Component - Shows exactly how the post will look
  const PreviewCard = () => {
    const tabInfo = getTabInfo(activeTab);
    const displayTitle = title || (activeTab !== 'post' ? `New ${tabInfo.label}` : '');
    const displayContent = content || `Share your ${activeTab} with the diaspora community...`;

    return (
      <Card className="mt-4 border-2 border-dashed border-gray-300">
        <CardHeader className="text-center py-2">
          <p className="text-xs text-gray-500 font-medium">PREVIEW - How your {activeTab} will appear</p>
        </CardHeader>
        <CardContent className="p-6">
          {/* Post Header */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-start gap-3">
              <Avatar className="w-12 h-12">
                <AvatarImage src={profile?.avatar_url || profile?.profile_picture_url} />
                <AvatarFallback>{profile?.full_name?.charAt(0) || 'U'}</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-sm">{profile?.display_name || profile?.full_name || 'Your Name'}</h3>
                  {activeTab !== 'post' && (
                    <Badge variant="outline" className={`text-xs flex items-center gap-1 ${tabInfo.color}`}>
                      {tabInfo.icon}
                      {tabInfo.label}
                    </Badge>
                  )}
                </div>
                <p className="text-xs text-gray-500">{profile?.profession || 'Professional'}</p>
                <p className="text-xs text-gray-400">Just now</p>
              </div>
            </div>
          </div>

          {/* Banner Image */}
          {bannerPreview && (
            <div className="rounded-lg overflow-hidden mb-4">
              <img 
                src={bannerPreview} 
                alt="Banner preview"
                className="w-full h-32 object-cover"
              />
            </div>
          )}

          {/* Content */}
          <div className="mb-4">
            {displayTitle && (
              <h2 className="text-lg font-semibold mb-2">{displayTitle}</h2>
            )}
            <p className="text-sm text-gray-900 leading-relaxed whitespace-pre-wrap">{displayContent}</p>
            
            {imagePreview && (
              <div className="rounded-lg overflow-hidden mt-3">
                <img 
                  src={imagePreview} 
                  alt="Content preview"
                  className="w-full max-h-64 object-cover"
                />
              </div>
            )}

            {/* Event/Initiative specific fields */}
            {(activeTab === 'event' || activeTab === 'initiative') && (
              <div className="mt-3 flex flex-wrap gap-3 text-sm text-gray-600">
                {location && (
                  <div className="flex items-center gap-1">
                    <MapPin className="w-4 h-4" />
                    <span>{location}</span>
                  </div>
                )}
                {dateTime && (
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    <span>{new Date(dateTime).toLocaleDateString()}</span>
                  </div>
                )}
              </div>
            )}
          </div>

          <Separator className="mb-4" />

          {/* Action Buttons Preview */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1">
              <Button variant="ghost" size="sm" className="flex items-center gap-2 text-xs text-gray-600" disabled>
                <ThumbsUp className="w-4 h-4" />
                Like
              </Button>
              <Button variant="ghost" size="sm" className="flex items-center gap-2 text-xs text-gray-600" disabled>
                <MessageCircle className="w-4 h-4" />
                Comment
              </Button>
              <Button variant="ghost" size="sm" className="flex items-center gap-2 text-xs text-gray-600" disabled>
                <Share2 className="w-4 h-4" />
                Share
              </Button>
            </div>
            <Button variant="ghost" size="sm" className="text-xs text-gray-600" disabled>
              <Bookmark className="w-4 h-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  };

  if (!user) return null;

  return (
    <Card className="bg-white shadow-sm">
      <CardContent className="p-4">
        {/* Collapsed State */}
        {!isExpanded && (
          <div 
            className="flex items-center gap-3 cursor-pointer"
            onClick={() => setIsExpanded(true)}
          >
            <Avatar className="w-10 h-10">
              <AvatarImage src={profile?.avatar_url || profile?.profile_picture_url} />
              <AvatarFallback>{profile?.full_name?.charAt(0) || 'U'}</AvatarFallback>
            </Avatar>
            <div 
              className="flex-1 bg-gray-100 rounded-full px-4 py-3 text-gray-500 text-sm cursor-text"
            >
              Share something with the diaspora community...
            </div>
          </div>
        )}

        {/* Expanded State */}
        {isExpanded && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Avatar className="w-10 h-10">
                  <AvatarImage src={profile?.avatar_url || profile?.profile_picture_url} />
                  <AvatarFallback>{profile?.full_name?.charAt(0) || 'U'}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium text-sm">{profile?.display_name || profile?.full_name}</p>
                  <p className="text-xs text-gray-500">{profile?.profession}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowPreview(!showPreview)}
                  className="text-xs"
                >
                  {showPreview ? 'Edit' : 'Preview'}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={resetForm}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {!showPreview ? (
              <>
                {/* Content Type Tabs */}
                <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as ContentType)}>
                  <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="post" className="flex items-center gap-1 text-xs">
                      <Target className="w-3 h-3" />
                      Post
                    </TabsTrigger>
                    <TabsTrigger value="event" className="flex items-center gap-1 text-xs">
                      <Calendar className="w-3 h-3" />
                      Event
                    </TabsTrigger>
                    <TabsTrigger value="initiative" className="flex items-center gap-1 text-xs">
                      <Lightbulb className="w-3 h-3" />
                      Initiative
                    </TabsTrigger>
                    <TabsTrigger value="opportunity" className="flex items-center gap-1 text-xs">
                      <Target className="w-3 h-3" />
                      Opportunity
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="post" className="space-y-3">
                    <Textarea
                      placeholder="What's on your mind? Share your thoughts, insights, or experiences with the diaspora community..."
                      value={content}
                      onChange={(e) => setContent(e.target.value)}
                      className="min-h-[100px] resize-none"
                    />
                  </TabsContent>

                  <TabsContent value="event" className="space-y-3">
                    <Input
                      placeholder="Event title"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                    />
                    <div className="grid grid-cols-2 gap-3">
                      <Input
                        placeholder="Location"
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                      />
                      <Input
                        type="datetime-local"
                        value={dateTime}
                        onChange={(e) => setDateTime(e.target.value)}
                      />
                    </div>
                    <Textarea
                      placeholder="Event description, agenda, or details..."
                      value={content}
                      onChange={(e) => setContent(e.target.value)}
                      className="min-h-[100px] resize-none"
                    />
                  </TabsContent>

                  <TabsContent value="initiative" className="space-y-3">
                    <Input
                      placeholder="Initiative title"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                    />
                    <Input
                      placeholder="Impact area or focus region"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                    />
                    <Textarea
                      placeholder="Describe your initiative, goals, and how others can contribute..."
                      value={content}
                      onChange={(e) => setContent(e.target.value)}
                      className="min-h-[100px] resize-none"
                    />
                  </TabsContent>

                  <TabsContent value="opportunity" className="space-y-3">
                    <Input
                      placeholder="Opportunity title"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                    />
                    <Input
                      placeholder="Location or region"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                    />
                    <Textarea
                      placeholder="Describe the opportunity, requirements, and application process..."
                      value={content}
                      onChange={(e) => setContent(e.target.value)}
                      className="min-h-[100px] resize-none"
                    />
                  </TabsContent>
                </Tabs>

                {/* Media Upload */}
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => imageInputRef.current?.click()}
                      disabled={uploading}
                      className="text-xs"
                    >
                      <ImagePlus className="w-4 h-4 mr-1" />
                      Add Image
                    </Button>
                    
                    {activeTab !== 'post' && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => bannerInputRef.current?.click()}
                        disabled={uploading}
                        className="text-xs"
                      >
                        <ImagePlus className="w-4 h-4 mr-1" />
                        Add Banner
                      </Button>
                    )}
                  </div>
                </div>

                {/* Image Previews */}
                {imagePreview && (
                  <div className="relative">
                    <img src={imagePreview} alt="Preview" className="w-full h-40 object-cover rounded-lg" />
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => removeImage('image')}
                      className="absolute top-2 right-2"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                )}

                {bannerPreview && (
                  <div className="relative">
                    <img src={bannerPreview} alt="Banner Preview" className="w-full h-32 object-cover rounded-lg" />
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => removeImage('banner')}
                      className="absolute top-2 right-2"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                )}

                {/* Hidden file inputs */}
                <input
                  ref={imageInputRef}
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleImageSelect(e, 'image')}
                  className="hidden"
                />
                <input
                  ref={bannerInputRef}
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleImageSelect(e, 'banner')}
                  className="hidden"
                />
              </>
            ) : (
              <PreviewCard />
            )}

            {/* Action Buttons */}
            <div className="flex items-center justify-between pt-3 border-t">
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowPreview(!showPreview)}
                  className="text-xs"
                >
                  {showPreview ? (
                    <>
                      <ChevronUp className="w-4 h-4 mr-1" />
                      Edit
                    </>
                  ) : (
                    <>
                      <ChevronDown className="w-4 h-4 mr-1" />
                      Preview
                    </>
                  )}
                </Button>
              </div>
              
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={resetForm}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSubmit}
                  disabled={(!content.trim() && !title.trim()) || isSubmitting || uploading}
                  size="sm"
                  className="bg-dna-emerald hover:bg-dna-forest text-white"
                >
                  {isSubmitting ? (
                    'Posting...'
                  ) : (
                    <>
                      <Send className="w-4 h-4 mr-1" />
                      Post
                    </>
                  )}
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