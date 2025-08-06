import React, { useState, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
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
import { EmbedPreview } from './EmbedPreview';
import type { Post } from './PostList';

interface EditPostModalProps {
  isOpen: boolean;
  onClose: () => void;
  post: Post;
  onPostUpdated?: () => void;
}

export const EditPostModal: React.FC<EditPostModalProps> = ({
  isOpen,
  onClose,
  post,
  onPostUpdated
}) => {
  const [content, setContent] = useState(post.content || '');
  const [pillar, setPillar] = useState(post.pillar);
  const [isUpdating, setIsUpdating] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { user } = useAuth();
  const { toast } = useToast();
  const { uploadMedia, uploading } = useUploadPostMedia();

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
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setFilePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async () => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please log in to edit posts",
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

    setIsUpdating(true);

    try {
      let mediaUrl = post.media_url; // Keep existing media by default
      let postType = post.type;
      
      // Upload new file if selected
      if (selectedFile) {
        const newMediaUrl = await uploadMedia(selectedFile);
        if (!newMediaUrl) {
          setIsUpdating(false);
          return; // Upload failed, don't update post
        }
        mediaUrl = newMediaUrl;
        postType = selectedFile.type.startsWith('video/') ? 'video' : 'image';
      }

      const { error } = await supabase
        .from('posts')
        .update({
          content: content.trim(),
          type: postType,
          pillar: pillar,
          media_url: mediaUrl,
          updated_at: new Date().toISOString()
        })
        .eq('id', post.id)
        .eq('author_id', user.id);

      if (error) throw error;

      toast({
        title: "Post updated!",
        description: "Your post has been updated successfully.",
      });

      onPostUpdated?.();
      onClose();
    } catch (error) {
      console.error('Error updating post:', error);
      toast({
        title: "Error updating post",
        description: "Failed to update your post. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleClose = () => {
    setContent(post.content || '');
    setPillar(post.pillar);
    removeFile();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Post</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex gap-3">
            <Avatar className="h-12 w-12">
              <AvatarImage src={user?.user_metadata?.avatar_url} alt={user?.user_metadata?.full_name} />
              <AvatarFallback className="bg-dna-forest text-white">
                {getInitials(user?.user_metadata?.full_name || 'User')}
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
                placeholder="What's on your mind?"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="resize-none border-0 p-0 text-lg placeholder:text-muted-foreground focus-visible:ring-0"
                rows={5}
              />

              {/* Show existing media if no new file selected */}
              {!selectedFile && post.media_url && (
                <div className="rounded-lg overflow-hidden border">
                  {post.type === 'video' ? (
                    <video 
                      src={post.media_url} 
                      controls
                      className="w-full h-auto max-h-96 object-cover"
                    >
                      Your browser does not support the video tag.
                    </video>
                  ) : (
                    <img 
                      src={post.media_url} 
                      alt="Post media" 
                      className="w-full h-auto max-h-96 object-cover"
                    />
                  )}
                </div>
              )}

              {/* New media preview */}
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

              {/* Embed preview for existing posts */}
              {post.embed_metadata && (
                <EmbedPreview 
                  embedData={post.embed_metadata} 
                  onRemove={() => {}} 
                  showRemoveButton={false}
                />
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
                    disabled={uploading || isUpdating}
                    className="text-muted-foreground hover:text-foreground"
                  >
                    <ImagePlus className="h-4 w-4 mr-2" />
                    {uploading ? 'Uploading...' : 'Change Media'}
                  </Button>
                </div>
                
                <div className="flex items-center gap-2">
                  <Button variant="outline" onClick={handleClose}>
                    Cancel
                  </Button>
                  <Button 
                    onClick={handleSubmit}
                    disabled={isUpdating || !content.trim() || uploading}
                    className="bg-dna-forest hover:bg-dna-forest/90"
                  >
                    {isUpdating ? (
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Updating...
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <Send className="h-4 w-4" />
                        Update Post
                      </div>
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};