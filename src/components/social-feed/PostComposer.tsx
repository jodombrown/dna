import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Send, ImagePlus, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useUploadPostMedia } from './useUploadPostMedia';
import { useAutoEmbedDetection } from '@/hooks/useAutoEmbedDetection';
import { EmbedPreview } from './EmbedPreview';

interface PostComposerProps {
  defaultPillar?: string;
  onPostCreated?: () => void;
}

export const PostComposer: React.FC<PostComposerProps> = ({ 
  defaultPillar = 'connect',
  onPostCreated 
}) => {
  const [content, setContent] = useState('');
  const [pillar, setPillar] = useState(defaultPillar);
  const [isPosting, setIsPosting] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { user } = useAuth();
  const { toast } = useToast();
  const { uploadMedia, uploading } = useUploadPostMedia();
  const { loading: embedLoading, embedData, handleContentChange: detectEmbeds, clearEmbedData } = useAutoEmbedDetection();

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

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setFilePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeFile = () => {
    setSelectedFile(null);
    setFilePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newContent = e.target.value;
    setContent(newContent);
    detectEmbeds(newContent);
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

    if (!content.trim()) {
      toast({
        title: "Content required",
        description: "Please add some content to your post",
        variant: "destructive",
      });
      return;
    }

    setIsPosting(true);

    try {
      let mediaUrl = null;
      let postType = 'text';
      
      // Upload file if selected
      if (selectedFile) {
        mediaUrl = await uploadMedia(selectedFile);
        if (!mediaUrl) {
          setIsPosting(false);
          return; // Upload failed, don't create post
        }
        postType = selectedFile.type.startsWith('video/') ? 'video' : 'image';
      } else if (embedData) {
        postType = 'link';
      }

      const { error } = await supabase
        .from('posts')
        .insert({
          content: content.trim(),
          type: postType,
          pillar: pillar,
          author_id: user.id,
          user_id: user.id,
          visibility: 'public',
          media_url: mediaUrl,
          embed_metadata: embedData ? JSON.parse(JSON.stringify(embedData)) : null
        });

      if (error) throw error;

      toast({
        title: "Post created!",
        description: "Your post has been shared successfully.",
      });

      // Reset form
      setContent('');
      setPillar(defaultPillar);
      removeFile();
      clearEmbedData();
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
              placeholder="What's on your mind? (Paste URLs to auto-preview links)"
              value={content}
              onChange={handleTextareaChange}
              className="resize-none border-0 p-0 text-lg placeholder:text-muted-foreground focus-visible:ring-0"
              rows={3}
            />

            {/* Embed Preview */}
            {embedData && (
              <EmbedPreview 
                embedData={embedData} 
                onRemove={clearEmbedData}
                showRemoveButton={true}
              />
            )}

            {/* Media Preview */}
            {filePreview && (
              <div className="relative rounded-lg overflow-hidden border">
                {selectedFile?.type.startsWith('video/') ? (
                  <video 
                    src={filePreview} 
                    controls
                    className="w-full h-auto max-h-96 object-cover"
                  >
                    Your browser does not support the video tag.
                  </video>
                ) : (
                  <img 
                    src={filePreview} 
                    alt="Upload preview" 
                    className="w-full h-auto max-h-96 object-cover"
                  />
                )}
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={removeFile}
                  className="absolute top-2 right-2"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            )}

            <div className="flex items-center justify-between pt-3 border-t">
              <div className="flex items-center gap-2">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/jpg,image/png,image/webp,image/gif,video/mp4,video/mov,video/avi,video/webm"
                  onChange={handleFileSelect}
                  className="hidden"
                />
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading || isPosting}
                  className="text-muted-foreground hover:text-foreground"
                >
                  <ImagePlus className="h-4 w-4 mr-2" />
                  {uploading ? 'Uploading...' : 'Add Media'}
                </Button>
              </div>
              <Button 
                onClick={handleSubmit}
                disabled={isPosting || !content.trim() || embedLoading || uploading}
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