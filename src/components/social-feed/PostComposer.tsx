import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
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
import { useMobile } from '@/hooks/useMobile';
import { useIsAdmin } from '@/hooks/useIsAdmin';

interface PostComposerProps {
  defaultPillar?: string;
  onPostCreated?: () => void;
}

type PostType = 'text' | 'image' | 'video' | 'link' | 'poll' | 'opportunity' | 'question' | 'spotlight';

export const PostComposer: React.FC<PostComposerProps> = ({ 
  defaultPillar = 'connect',
  onPostCreated 
}) => {
  const [content, setContent] = useState('');
  const [pillar, setPillar] = useState(defaultPillar);
  const [postType, setPostType] = useState<PostType>('text');
  const [isPosting, setIsPosting] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isUserInteracting, setIsUserInteracting] = useState(false);
  const [isManuallyExpanded, setIsManuallyExpanded] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const composerRef = useRef<HTMLDivElement>(null);
  const manualTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const { user } = useAuth();
  const { toast } = useToast();
  const { uploadMedia, uploading } = useUploadPostMedia();
  const { loading: embedLoading, embedData, handleContentChange: detectEmbeds, clearEmbedData } = useAutoEmbedDetection();
  const { isScrollingDown, isAtTop } = useScrollDirection(30);
  const { isMobile } = useMobile();
  const { isAdmin } = useIsAdmin();

  // Expanded post type states
  const [pollOptions, setPollOptions] = useState<string[]>(['', '']);
  const [pollExpiresAt, setPollExpiresAt] = useState<string | null>(null);
  const [opportunityType, setOpportunityType] = useState('');
  const [opportunityLink, setOpportunityLink] = useState('');

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

  // Poll option handlers
  const updatePollOption = (index: number, value: string) => {
    setPollOptions((opts) => opts.map((o, i) => (i === index ? value : o)));
  };
  const addPollOption = () => {
    setPollOptions((opts) => (opts.length < 5 ? [...opts, ''] : opts));
  };
  const removePollOption = (index: number) => {
    setPollOptions((opts) => opts.filter((_, i) => i !== index));
  };
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Clear embed data when file is selected
      clearEmbedData();
      setSelectedFile(file);
      setPostType(file.type.startsWith('video/') ? 'video' : 'image');
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
    // Clear any existing timeout
    if (manualTimeoutRef.current) {
      clearTimeout(manualTimeoutRef.current);
    }
    
    setIsExpanded(true);
    setIsUserInteracting(true);
    setIsManuallyExpanded(true);
    
    // Clear manual expand state after 2 seconds to resume auto behavior
    manualTimeoutRef.current = setTimeout(() => {
      setIsManuallyExpanded(false);
    }, 2000);
    
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

  const handleSubmit = async (status: 'draft' | 'published' = 'published') => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please log in to create posts",
        variant: "destructive",
      });
      return;
    }

    if (!content.trim() && !selectedFile && !embedData) {
      toast({
        title: "Content required",
        description: "Add text, media, or a link",
        variant: "destructive",
      });
      return;
    }

    setIsPosting(true);

    try {
      let mediaUrl: string | null = null;

      // Upload file if selected
      if (selectedFile) {
        mediaUrl = await uploadMedia(selectedFile);
        if (!mediaUrl) {
          setIsPosting(false);
          return; // Upload failed, don't create post
        }
      }

      // Determine final type
      let finalType: PostType = postType;
      if (selectedFile) {
        finalType = selectedFile.type.startsWith('video/') ? 'video' : 'image';
      } else if (embedData) {
        finalType = 'link';
      }

      // Enforce admin-only spotlight
      if (finalType === 'spotlight' && !isAdmin) {
        finalType = 'text';
      }

      const finalStatus = finalType === 'spotlight' ? 'featured' : status;

      // Build payload for RPC function
      const payload: any = {
        content: content.trim(),
        type: finalType,
        pillar: pillar,
        visibility: 'public',
        status: finalStatus,
        media_url: mediaUrl,
      };

      if (embedData) {
        payload.embed_metadata = JSON.parse(JSON.stringify(embedData));
        if (finalType === 'link') {
          payload.link_url = embedData.url || null;
          payload.link_metadata = JSON.parse(JSON.stringify(embedData));
        }
      }

      if (finalType === 'poll') {
        const options = pollOptions.map(o => o.trim()).filter(Boolean);
        if (options.length < 2) {
          toast({
            title: "Add poll options",
            description: "Provide at least 2 options for your poll",
            variant: "destructive",
          });
          setIsPosting(false);
          return;
        }
        payload.poll_options = { options };
        payload.poll_expires_at = pollExpiresAt ? new Date(pollExpiresAt).toISOString() : null;
      }

      if (finalType === 'opportunity') {
        payload.opportunity_type = opportunityType || null;
        payload.opportunity_link = opportunityLink || null;
      }

      // Use RPC function for proper post creation with validation
      const { data: postId, error } = await supabase.rpc('rpc_create_post', payload);

      if (error) {
        console.error('Post creation error:', error);
        throw error;
      }

      console.log('Post created successfully with ID:', postId);

      toast({
        title: status === 'draft' ? "Draft saved!" : "Post created!",
        description: status === 'draft' ? "Your draft has been saved." : "Your post has been shared successfully.",
      });

      // Reset form
      setContent('');
      setPillar(defaultPillar);
      setPostType('text');
      removeFile();
      clearEmbedData();
      setIsExpanded(false);
      setIsUserInteracting(false);
      setIsManuallyExpanded(false);

      // Clear any manual timeouts
      if (manualTimeoutRef.current) {
        clearTimeout(manualTimeoutRef.current);
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

  // Determine if composer should be collapsed - only when not manually expanded
  const shouldCollapse = !isAtTop && isScrollingDown && !isUserInteracting && !content.trim() && !selectedFile && !embedData && !isManuallyExpanded;
  const isCollapsed = shouldCollapse && !isExpanded;

  // Auto-expand on scroll up or when user has content - only when not manually expanded
  useEffect(() => {
    if (isManuallyExpanded) return;
    
    if (!isScrollingDown || isUserInteracting || content.trim() || selectedFile || embedData) {
      setIsExpanded(true);
    }
  }, [isScrollingDown, isUserInteracting, content, selectedFile, embedData, isManuallyExpanded]);

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
      className={`${isMobile ? '' : 'sticky top-0 z-40'} transition-all duration-300 ${
        !isMobile && !isAtTop ? 'backdrop-blur-sm bg-background/95 border-b border-border' : ''
      }`}
    >
      <Card className={`${isMobile ? 'bg-white border-border shadow-sm overflow-hidden' : `bg-transparent border-transparent transition-all duration-300 ${
        isCollapsed ? 'shadow-none' : 'bg-background border-border'
      } overflow-hidden`}`}>
        <CardContent className={`${isMobile ? 'p-4' : `transition-all duration-300 ${isCollapsed ? 'p-3' : 'p-6'}`}`}>
          {!isMobile && isCollapsed ? (
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
            // Expanded State (Desktop) or Mobile State
            <div className="flex gap-3">
              <Avatar className="h-12 w-12">
                <AvatarImage src={user.user_metadata?.avatar_url} alt={user.user_metadata?.full_name} />
                <AvatarFallback className="bg-dna-forest text-white">
                  {getInitials(user.user_metadata?.full_name || 'User')}
                </AvatarFallback>
              </Avatar>
              
              <div className="flex-1 space-y-3">
                {/* Mobile: Stack layout */}
                {isMobile ? (
                  <div className="space-y-3 mb-4">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium whitespace-nowrap">Share in:</span>
                      <Select value={pillar} onValueChange={setPillar}>
                        <SelectTrigger className="flex-1 min-w-0">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="z-50 bg-background">
                          <SelectItem value="connect">Connect</SelectItem>
                          <SelectItem value="collaborate">Collaborate</SelectItem>
                          <SelectItem value="contribute">Contribute</SelectItem>
                        </SelectContent>
                      </Select>
                      <Badge 
                        variant="secondary" 
                        className={`text-xs whitespace-nowrap ${getPillarColor(pillar)}`}
                      >
                        {pillar.charAt(0).toUpperCase() + pillar.slice(1)}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground whitespace-nowrap">Type:</span>
                      <Select value={postType} onValueChange={(v) => setPostType(v as PostType)}>
                        <SelectTrigger className="flex-1 min-w-0">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="z-50 bg-background">
                          <SelectItem value="text">Text</SelectItem>
                          <SelectItem value="link" disabled={!embedData}>Link</SelectItem>
                          <SelectItem value="image" disabled={!selectedFile || (selectedFile && !selectedFile.type.startsWith('image/'))}>Image</SelectItem>
                          <SelectItem value="video" disabled={!selectedFile || (selectedFile && !selectedFile.type.startsWith('video/'))}>Video</SelectItem>
                          <SelectItem value="opportunity">Opportunity</SelectItem>
                          {isAdmin && <SelectItem value="spotlight">Spotlight</SelectItem>}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                ) : (
                  /* Desktop: Single row layout */
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-sm font-medium">Share in:</span>
                    <Select value={pillar} onValueChange={setPillar}>
                      <SelectTrigger className="w-40">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="z-50 bg-background">
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
                    {/* Post type selector */}
                    <div className="ml-auto flex items-center gap-2">
                      <span className="text-sm text-muted-foreground">Type:</span>
                      <Select value={postType} onValueChange={(v) => setPostType(v as PostType)}>
                        <SelectTrigger className="w-40">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="z-50 bg-background">
                          <SelectItem value="text">Text</SelectItem>
                          <SelectItem value="link" disabled={!embedData}>Link</SelectItem>
                          <SelectItem value="image" disabled={!selectedFile || (selectedFile && !selectedFile.type.startsWith('image/'))}>Image</SelectItem>
                          <SelectItem value="video" disabled={!selectedFile || (selectedFile && !selectedFile.type.startsWith('video/'))}>Video</SelectItem>
                          <SelectItem value="opportunity">Opportunity</SelectItem>
                          {isAdmin && <SelectItem value="spotlight">Spotlight</SelectItem>}
                        </SelectContent>
                      </Select>
                      {!isAtTop && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={handleCollapse}
                          className="text-muted-foreground hover:text-foreground hidden sm:inline-flex"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                )}

                <Textarea
                  placeholder="What's on your mind?"
                  value={content}
                  onChange={handleTextareaChange}
                  onFocus={() => setIsUserInteracting(true)}
                  className="resize-none border-0 p-0 text-lg placeholder:text-muted-foreground focus-visible:ring-0"
                  rows={3}
                />

                {/* Link Preview */}
                {embedData && (
                  <EmbedPreview 
                    embedData={embedData} 
                    onRemove={clearEmbedData}
                    showRemoveButton={true}
                  />
                )}

                {/* Poll Builder */}
                {postType === 'poll' && (
                  <div className="space-y-3 border rounded-lg p-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Poll Options</span>
                      <Button type="button" variant="outline" size="sm" onClick={addPollOption} disabled={pollOptions.length >= 5}>Add option</Button>
                    </div>
                    <div className="space-y-2">
                      {pollOptions.map((opt, i) => (
                        <div key={i} className="flex items-center gap-2">
                          <Input
                            value={opt}
                            onChange={(e) => updatePollOption(i, e.target.value)}
                            placeholder={`Option ${i + 1}`}
                          />
                          {pollOptions.length > 2 && (
                            <Button type="button" variant="ghost" size="sm" onClick={() => removePollOption(i)}>Remove</Button>
                          )}
                        </div>
                      ))}
                    </div>
                    <div className="flex items-center gap-2">
                      <label className="text-sm text-muted-foreground">Expires:</label>
                      <Input type="datetime-local" value={pollExpiresAt ?? ''} onChange={(e) => setPollExpiresAt(e.target.value || null)} className="max-w-xs" />
                    </div>
                  </div>
                )}

                {/* Opportunity Details */}
                {postType === 'opportunity' && (
                  <div className="space-y-3 border rounded-lg p-3">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div>
                        <label className="text-sm text-muted-foreground">Opportunity Type</label>
                        <Input value={opportunityType} onChange={(e) => setOpportunityType(e.target.value)} placeholder="e.g., Grant, Job, RFP" />
                      </div>
                      <div>
                        <label className="text-sm text-muted-foreground">Link</label>
                        <Input type="url" value={opportunityLink} onChange={(e) => setOpportunityLink(e.target.value)} placeholder="https://..." />
                      </div>
                    </div>
                  </div>
                )}

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

                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between pt-3 border-t">
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
                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    <Button 
                      onClick={() => handleSubmit('draft')}
                      disabled={isPosting || embedLoading || uploading || !(content.trim() || embedData || selectedFile || (postType === 'poll' && pollOptions.some(o => o.trim())) || (postType === 'opportunity' && opportunityLink.trim()))}
                      variant="outline"
                      className="text-muted-foreground hover:text-foreground whitespace-nowrap flex-1 sm:flex-none"
                    >
                      Save Draft
                    </Button>
                    <Button 
                      onClick={() => handleSubmit('published')}
                      disabled={isPosting || embedLoading || uploading || !(content.trim() || embedData || selectedFile || (postType === 'poll' && pollOptions.some(o => o.trim())) || (postType === 'opportunity' && opportunityLink.trim()))}
                      className="bg-dna-forest hover:bg-dna-forest/90 whitespace-nowrap flex-1 sm:flex-none"
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
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};