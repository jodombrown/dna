import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Send, ImagePlus, X, Edit3 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useUploadPostMedia } from './useUploadPostMedia';
import { useAutoEmbedDetection } from '@/hooks/useAutoEmbedDetection';
import { EmbedPreview } from './EmbedPreview';
import { useScrollDirection } from '@/hooks/useScrollDirection';

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
  const [isExpanded, setIsExpanded] = useState(false);
  const [isUserInteracting, setIsUserInteracting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const composerRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth();
  const { toast } = useToast();
  const { uploadMedia, uploading } = useUploadPostMedia();
  const { loading: embedLoading, embedData, handleContentChange: detectEmbeds, clearEmbedData } = useAutoEmbedDetection();
  const { isScrollingDown, isAtTop } = useScrollDirection(30);

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

  const removeFile = () => {
    setSelectedFile(null);
    setFilePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Clear embed data when file is selected
      clearEmbedData();
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setFilePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newContent = e.target.value;
    setContent(newContent);
    setIsUserInteracting(true);
    // Clear file when user adds embed-able content
    if (selectedFile) {
      removeFile();
    }
    detectEmbeds(newContent);
  };

  const handleExpand = () => {
    setIsExpanded(true);
    setIsUserInteracting(true);
    // Focus on textarea after expansion
    setTimeout(() => {
      const textarea = composerRef.current?.querySelector('textarea');
      textarea?.focus();
    }, 100);
  };

  const handleCollapse = () => {
    if (!content.trim() && !selectedFile && !embedData) {
      setIsExpanded(false);
      setIsUserInteracting(false);
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
      }
      // Don't change type for embeds - keep as 'text' with embed_metadata

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
      setIsExpanded(false);
      setIsUserInteracting(false);
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

  // Determine if composer should be collapsed
  const shouldCollapse = !isAtTop && isScrollingDown && !isUserInteracting && !content.trim() && !selectedFile && !embedData;
  const isCollapsed = shouldCollapse && !isExpanded;

  // Auto-expand on scroll up or when user has content
  useEffect(() => {
    if (!isScrollingDown || isUserInteracting || content.trim() || selectedFile || embedData) {
      setIsExpanded(true);
    }
  }, [isScrollingDown, isUserInteracting, content, selectedFile, embedData]);

  if (!user) {
    return (
      <div className={`sticky top-0 z-40 transition-all duration-300 ${isAtTop ? '' : 'backdrop-blur-sm bg-background/80'}`}>
        <Card className="bg-background border-border">
          <CardContent className="p-6 text-center">
            <p className="text-muted-foreground">Please log in to create posts.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div 
      ref={composerRef}
      className={`sticky top-0 z-40 transition-all duration-300 ${
        isAtTop ? '' : 'backdrop-blur-sm bg-background/95 border-b border-border'
      }`}
    >
      <Card className={`bg-transparent border-transparent transition-all duration-300 ${
        isCollapsed ? 'shadow-none' : 'bg-background border-border'
      }`}>
        <CardContent className={`transition-all duration-300 ${isCollapsed ? 'p-3' : 'p-6'}`}>
          {isCollapsed ? (
            // Collapsed State
            <div 
              className="flex items-center gap-3 cursor-pointer hover:bg-muted/50 rounded-lg p-3 transition-colors"
              onClick={handleExpand}
            >
              <Avatar className="h-8 w-8">
                <AvatarImage src={user.user_metadata?.avatar_url} alt={user.user_metadata?.full_name} />
                <AvatarFallback className="bg-dna-forest text-white text-sm">
                  {getInitials(user.user_metadata?.full_name || 'User')}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 flex items-center gap-2">
                <Edit3 className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">Share your thoughts...</span>
              </div>
              <Badge 
                variant="secondary" 
                className={`text-xs ${getPillarColor(pillar)}`}
              >
                {pillar.charAt(0).toUpperCase() + pillar.slice(1)}
              </Badge>
            </div>
          ) : (
            // Expanded State
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
                  {!isAtTop && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleCollapse}
                      className="ml-auto text-muted-foreground hover:text-foreground"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>

                <Textarea
                  placeholder="What's on your mind?"
                  value={content}
                  onChange={handleTextareaChange}
                  onFocus={() => setIsUserInteracting(true)}
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
                      disabled={uploading || isPosting || !!embedData}
                      className={`text-muted-foreground hover:text-foreground ${embedData ? 'opacity-50 cursor-not-allowed' : ''}`}
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
          )}
        </CardContent>
      </Card>
    </div>
  );
};