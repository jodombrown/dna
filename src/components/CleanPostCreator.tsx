
import React, { useState, useRef } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { ImagePlus, Send, X, Hash } from 'lucide-react';
import { useAuth } from '@/contexts/CleanAuthContext';
import { useCleanSocialPosts } from '@/hooks/useCleanSocialPosts';
import { useImageUpload } from '@/hooks/useImageUpload';

const PREDEFINED_TAGS = [
  'entrepreneurship', 'technology', 'healthcare', 'education', 'finance',
  'agriculture', 'renewable-energy', 'diaspora-business', 'investment-opportunities',
  'mentorship', 'networking', 'cultural-heritage', 'innovation', 'sustainability'
];

const CleanPostCreator: React.FC = () => {
  const { user, profile } = useAuth();
  const { createPost } = useCleanSocialPosts();
  const { uploadImage, uploading } = useImageUpload();
  const [content, setContent] = useState('');
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onload = () => setImagePreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setSelectedImage(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const toggleTag = (tag: string) => {
    setSelectedTags(prev => 
      prev.includes(tag) 
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    );
  };

  const extractHashtagsFromContent = (text: string): string[] => {
    const hashtagRegex = /#([a-zA-Z0-9_]+)/g;
    const matches = text.match(hashtagRegex);
    return matches ? matches.map(tag => tag.substring(1).toLowerCase()) : [];
  };

  const handleSubmit = async () => {
    if ((!content.trim() && !selectedImage) || isSubmitting) return;

    setIsSubmitting(true);
    try {
      let imageUrl = null;
      if (selectedImage) {
        imageUrl = await uploadImage(selectedImage);
        if (!imageUrl) {
          setIsSubmitting(false);
          return;
        }
      }

      const contentHashtags = extractHashtagsFromContent(content);
      const allTags = [...new Set([...selectedTags, ...contentHashtags])];

      await createPost(content.trim(), 'text', imageUrl, allTags);
      
      // Reset form
      setContent('');
      setSelectedImage(null);
      setImagePreview(null);
      setSelectedTags([]);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!user) return null;

  const canSubmit = (content.trim() || selectedImage) && !isSubmitting && !uploading;

  return (
    <Card className="mb-6">
      <CardContent className="p-6">
        <div className="flex gap-4">
          <Avatar className="w-12 h-12">
            <AvatarImage src={profile?.avatar_url} alt={profile?.full_name} />
            <AvatarFallback className="bg-dna-mint text-dna-forest">
              {profile?.full_name?.charAt(0) || user.email?.charAt(0) || 'U'}
            </AvatarFallback>
          </Avatar>
          
          <div className="flex-1 space-y-4">
            <Textarea
              placeholder="Share your thoughts with the DNA community..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="min-h-[100px] resize-none border-none shadow-none text-base placeholder:text-gray-500 focus-visible:ring-0"
              maxLength={500}
            />

            {imagePreview && (
              <div className="relative inline-block">
                <img 
                  src={imagePreview} 
                  alt="Post preview" 
                  className="max-w-full h-auto max-h-64 rounded-lg border"
                />
                <button
                  onClick={removeImage}
                  className="absolute top-2 right-2 p-1 bg-black bg-opacity-50 text-white rounded-full hover:bg-opacity-75"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}

            {selectedTags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {selectedTags.map(tag => (
                  <Badge
                    key={tag}
                    variant="secondary"
                    className="bg-dna-mint text-dna-forest cursor-pointer"
                    onClick={() => toggleTag(tag)}
                  >
                    <Hash className="w-3 h-3 mr-1" />
                    {tag}
                    <X className="w-3 h-3 ml-1" />
                  </Badge>
                ))}
              </div>
            )}

            <div className="border-t pt-3">
              <div className="flex flex-wrap gap-2 mb-3">
                <span className="text-sm text-gray-600 font-medium">Add tags:</span>
                {PREDEFINED_TAGS.filter(tag => !selectedTags.includes(tag)).slice(0, 8).map(tag => (
                  <Badge
                    key={tag}
                    variant="outline"
                    className="cursor-pointer hover:bg-dna-mint hover:text-dna-forest text-xs"
                    onClick={() => toggleTag(tag)}
                  >
                    <Hash className="w-3 h-3 mr-1" />
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleImageSelect}
                  accept="image/*"
                  className="hidden"
                />
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="text-gray-500"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                >
                  <ImagePlus className="w-4 h-4 mr-1" />
                  {uploading ? 'Uploading...' : 'Photo'}
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
        </div>
      </CardContent>
    </Card>
  );
};

export default CleanPostCreator;
