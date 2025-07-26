import React, { useState, useRef } from 'react';
import { Image, Video, FileText, Send, X } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface PostComposerProps {
  defaultPillar?: string;
  onPostCreated?: () => void;
}

export const EnhancedPostComposer: React.FC<PostComposerProps> = ({ 
  defaultPillar = 'feed',
  onPostCreated 
}) => {
  const [content, setContent] = useState('');
  const [pillar, setPillar] = useState(defaultPillar);
  const [postType, setPostType] = useState<'text' | 'image' | 'video' | 'article'>('text');
  const [mediaFile, setMediaFile] = useState<File | null>(null);
  const [mediaPreview, setMediaPreview] = useState<string | null>(null);
  const [isPosting, setIsPosting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { user } = useAuth();
  const { toast } = useToast();

  const handleMediaUpload = async (file: File): Promise<string | null> => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}.${fileExt}`;
    const bucket = postType === 'image' ? 'profile-images' : 'user-posts';

    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(fileName, file);

    if (error) {
      console.error('Error uploading file:', error);
      return null;
    }

    const { data: { publicUrl } } = supabase.storage
      .from(bucket)
      .getPublicUrl(data.path);

    return publicUrl;
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setMediaFile(file);

    // Create preview for images
    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setMediaPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
      setPostType('image');
    } else if (file.type.startsWith('video/')) {
      setPostType('video');
      setMediaPreview(URL.createObjectURL(file));
    }
  };

  const removeMedia = () => {
    setMediaFile(null);
    setMediaPreview(null);
    setPostType('text');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async () => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please log in to create posts",
        variant: "destructive",
      });
      return;
    }

    if (!content.trim() && !mediaFile) {
      toast({
        title: "Content required",
        description: "Please add some content or media to your post",
        variant: "destructive",
      });
      return;
    }

    setIsPosting(true);

    try {
      let mediaUrl = null;

      // Upload media if present
      if (mediaFile) {
        mediaUrl = await handleMediaUpload(mediaFile);
        if (!mediaUrl) {
          throw new Error('Failed to upload media');
        }
      }

      // Create the post
      const { data, error } = await supabase
        .from('posts')
        .insert({
          content: content.trim(),
          media_url: mediaUrl,
          type: postType,
          pillar: pillar,
          author_id: user.id,
          user_id: user.id,
        })
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Post created!",
        description: "Your post has been shared successfully.",
      });

      // Reset form
      setContent('');
      setMediaFile(null);
      setMediaPreview(null);
      setPostType('text');
      setPillar(defaultPillar);
      
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }

      onPostCreated?.();
    } catch (error) {
      console.error('Error creating post:', error);
      toast({
        title: "Error creating post",
        description: "Failed to create your post. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsPosting(false);
    }
  };

  const getPillarColor = (pillarValue: string) => {
    switch (pillarValue) {
      case 'connect': return 'bg-dna-emerald text-white';
      case 'collaborate': return 'bg-dna-copper text-white';
      case 'contribute': return 'bg-dna-gold text-black';
      default: return 'bg-dna-forest text-white';
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  if (!user) {
    return (
      <Card className="bg-background border-border">
        <CardContent className="p-6 text-center">
          <p className="text-muted-foreground">Please log in to create posts.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-background border-border">
      <CardContent className="p-6">
        <div className="flex gap-3">
          <Avatar className="h-12 w-12">
            <AvatarImage src={user.user_metadata?.avatar_url} alt={user.user_metadata?.full_name} />
            <AvatarFallback className="bg-dna-forest text-white">
              {getInitials(user.user_metadata?.full_name || 'User')}
            </AvatarFallback>
          </Avatar>
          
          <div className="flex-1 space-y-3">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-sm font-medium">Share in:</span>
              <Select value={pillar} onValueChange={setPillar}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="feed">Feed</SelectItem>
                  <SelectItem value="connect">Connect</SelectItem>
                  <SelectItem value="collaborate">Collaborate</SelectItem>
                  <SelectItem value="contribute">Contribute</SelectItem>
                </SelectContent>
              </Select>
              <Badge 
                variant="secondary" 
                className={`text-xs ${getPillarColor(pillar)}`}
              >
                {pillar.charAt(0).toUpperCase() + pillar.slice(1)}
              </Badge>
            </div>

            <Textarea
              placeholder="What's on your mind?"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="resize-none border-0 p-0 text-lg placeholder:text-muted-foreground focus-visible:ring-0"
              rows={3}
            />

            {/* Media preview */}
            {mediaPreview && (
              <div className="relative">
                {postType === 'image' && (
                  <div className="relative rounded-lg overflow-hidden border">
                    <img 
                      src={mediaPreview} 
                      alt="Preview" 
                      className="w-full h-auto max-h-64 object-cover"
                    />
                    <Button
                      variant="secondary"
                      size="sm"
                      className="absolute top-2 right-2"
                      onClick={removeMedia}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                )}
                {postType === 'video' && (
                  <div className="relative rounded-lg overflow-hidden border">
                    <video 
                      src={mediaPreview} 
                      controls 
                      className="w-full h-auto max-h-64"
                    />
                    <Button
                      variant="secondary"
                      size="sm"
                      className="absolute top-2 right-2"
                      onClick={removeMedia}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </div>
            )}

            {/* Actions */}
            <div className="flex items-center justify-between pt-3 border-t">
              <div className="flex items-center gap-2">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*,video/*"
                  onChange={handleFileSelect}
                  className="hidden"
                />
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                  className="text-muted-foreground hover:text-foreground"
                >
                  <Image className="h-4 w-4 mr-1" />
                  Photo
                </Button>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    fileInputRef.current?.click();
                  }}
                  className="text-muted-foreground hover:text-foreground"
                >
                  <Video className="h-4 w-4 mr-1" />
                  Video
                </Button>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setPostType('article')}
                  className="text-muted-foreground hover:text-foreground"
                >
                  <FileText className="h-4 w-4 mr-1" />
                  Article
                </Button>
              </div>

              <Button 
                onClick={handleSubmit}
                disabled={isPosting || (!content.trim() && !mediaFile)}
                className="bg-dna-forest hover:bg-dna-forest/90"
              >
                {isPosting ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Posting...
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Send className="h-4 w-4" />
                    Post
                  </div>
                )}
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};