import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Send, 
  ImagePlus, 
  X, 
  Edit3, 
  Loader2, 
  Calendar,
  FileText,
  Lightbulb,
  ChevronUp,
  Plus
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useUploadPostMedia } from './useUploadPostMedia';
import { useAutoEmbedDetection } from '@/hooks/useAutoEmbedDetection';
import { EmbedPreview } from './EmbedPreview';
import { MediaPreview } from './MediaPreview';
import { usePostSubmission } from '@/hooks/usePostSubmission';
import { useScrollDirection } from '@/hooks/useScrollDirection';
import { useMobile } from '@/hooks/useMobile';
import { useIsAdmin } from '@/hooks/useIsAdmin';
import { cn } from '@/lib/utils';

interface EnhancedPostComposerProps {
  defaultPillar?: string;
  onPostCreated?: () => void;
}

type ContentType = 'post' | 'event' | 'article' | 'pathway';

export const EnhancedPostComposer: React.FC<EnhancedPostComposerProps> = ({ 
  defaultPillar = 'connect',
  onPostCreated 
}) => {
  const [content, setContent] = useState('');
  const [pillar, setPillar] = useState(defaultPillar);
  const [contentType, setContentType] = useState<ContentType>('post');
  const [isExpanded, setIsExpanded] = useState(true);
  const [isManuallyCollapsed, setIsManuallyCollapsed] = useState(false);
  const [isManuallyExpanded, setIsManuallyExpanded] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const composerRef = useRef<HTMLDivElement>(null);
  const manualTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastActionRef = useRef<'expand' | 'collapse' | null>(null);
  const toggleCooldownRef = useRef<number>(0);

  // Content type specific states
  const [eventData, setEventData] = useState({
    title: '',
    date: '',
    time: '',
    location: '',
    description: ''
  });
  
  const [articleData, setArticleData] = useState({
    title: '',
    excerpt: '',
    tags: [] as string[],
    category: ''
  });

  const [pathwayData, setPathwayData] = useState({
    title: '',
    objective: '',
    duration: '',
    difficulty: 'beginner' as 'beginner' | 'intermediate' | 'advanced'
  });

  const { user } = useAuth();
  const { toast } = useToast();
  const { submitPost, isSubmitting } = usePostSubmission();
  const { loading: embedLoading, embedData, handleContentChange: detectEmbeds, clearEmbedData } = useAutoEmbedDetection();
  const { isScrollingDown, isAtTop, scrollY } = useScrollDirection();
  const { isMobile } = useMobile();
  const { isAdmin } = useIsAdmin();

  // Wider hysteresis thresholds to prevent flickering
  const COLLAPSE_THRESHOLD = 150;
  const EXPAND_THRESHOLD = 50;

  // Auto-collapse/expand logic with proper hysteresis, debouncing, and cooldown
  useEffect(() => {
    if (isManuallyCollapsed || isManuallyExpanded) return;

    const timeoutId = setTimeout(() => {
      const now = Date.now();
      // Cooldown to avoid oscillation due to layout/scroll coupling
      if (now - toggleCooldownRef.current < 600) return;

      const shouldExpand = isAtTop || (!isScrollingDown && scrollY <= EXPAND_THRESHOLD);
      const shouldCollapse = isScrollingDown && scrollY >= COLLAPSE_THRESHOLD && !isAtTop;

      if (shouldExpand && !isExpanded) {
        toggleCooldownRef.current = now;
        setIsExpanded(true);
        lastActionRef.current = 'expand';
      } else if (shouldCollapse && isExpanded) {
        toggleCooldownRef.current = now;
        setIsExpanded(false);
        lastActionRef.current = 'collapse';
      }
    }, 250); // Debounce state changes

    return () => clearTimeout(timeoutId);
  }, [isScrollingDown, isAtTop, scrollY, isManuallyCollapsed, isManuallyExpanded, isExpanded]);

  const handleExpand = () => {
    if (manualTimeoutRef.current) {
      clearTimeout(manualTimeoutRef.current);
    }
    
    setIsExpanded(true);
    setIsManuallyCollapsed(false);
    setIsManuallyExpanded(true);
    lastActionRef.current = 'expand';
    
    manualTimeoutRef.current = setTimeout(() => {
      setIsManuallyExpanded(false);
    }, 2000);
  };

  const handleCollapse = () => {
    setIsExpanded(false);
    setIsManuallyCollapsed(true);
    lastActionRef.current = 'collapse';
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
    if (selectedFile) {
      removeFile();
    }
    detectEmbeds(newContent);
  };

  const handleSubmit = async (status: 'draft' | 'published' = 'published') => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please log in to create content",
        variant: "destructive",
      });
      return;
    }

    // Handle different content types
    let submissionData: any = {
      content,
      pillar,
      type: 'text',
      file: selectedFile,
      embedData
    };

    switch (contentType) {
      case 'event':
        submissionData = {
          ...submissionData,
          type: 'event',
          eventData
        };
        break;
      case 'article':
        submissionData = {
          ...submissionData,
          type: 'article',
          articleData
        };
        break;
      case 'pathway':
        submissionData = {
          ...submissionData,
          type: 'pathway',
          pathwayData
        };
        break;
    }

    const success = await submitPost(submissionData);

    if (success) {
      // Reset form
      setContent('');
      setPillar(defaultPillar);
      setContentType('post');
      removeFile();
      clearEmbedData();
      setEventData({ title: '', date: '', time: '', location: '', description: '' });
      setArticleData({ title: '', excerpt: '', tags: [], category: '' });
      setPathwayData({ title: '', objective: '', duration: '', difficulty: 'beginner' });
      
      // Collapse after posting
      setIsExpanded(false);
      setIsManuallyCollapsed(true);
      setIsManuallyExpanded(false);
      onPostCreated?.();
      
      // Reset manual collapse after a delay
      setTimeout(() => {
        setIsManuallyCollapsed(false);
      }, 2000);
    }
  };

  const getTabIcon = (type: ContentType) => {
    switch (type) {
      case 'post': return Edit3;
      case 'event': return Calendar;
      case 'article': return FileText;
      case 'pathway': return Lightbulb;
      default: return Edit3;
    }
  };

  if (!user) {
    return (
      <div className={cn(
        "w-full overflow-x-hidden sticky top-0 z-40 transition-all duration-300 ease-out",
        "bg-white/95 backdrop-blur-sm border-b border-gray-200/50",
        isMobile ? "mx-2 mb-4" : "mb-6"
      )}>
        <Card className="bg-background border-border">
          <CardContent className="p-6 text-center">
            <p className="text-muted-foreground">Please log in to create content.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div 
      ref={composerRef}
      className={cn(
        "w-full overflow-x-hidden sticky top-0 z-40 transition-all duration-300 ease-out",
        "bg-white/95 backdrop-blur-sm border-b border-gray-200/50",
        isMobile ? "mx-2 mb-4" : "mb-6"
      )}
    >
      <div className={cn("w-full", isMobile ? "px-2 py-3" : "px-4 py-4")}>
        {isExpanded ? (
          <div 
            className={cn(
              "relative animate-fade-in",
              "bg-white rounded-xl shadow-lg border border-gray-200",
              "transition-all duration-300 ease-out"
            )}
          >
            <div className="p-6">
              {/* Collapse control - keep mounted to avoid layout thrash */}
              <Button
                variant="ghost"
                size="sm"
                onClick={handleCollapse}
                className={cn(
                  "absolute top-3 right-3 h-8 w-8 p-0 bg-white/90 border border-gray-200 shadow-sm z-10",
                  (scrollY > 100 && !isAtTop) ? "opacity-100" : "opacity-0 pointer-events-none"
                )}
                aria-label="Minimize composer"
              >
                <X className="h-4 w-4" />
              </Button>

              <div className="flex gap-3 mb-4">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={user.user_metadata?.avatar_url} alt={user.user_metadata?.full_name} />
                  <AvatarFallback className="bg-dna-forest text-white">
                    {getInitials(user.user_metadata?.full_name || 'User')}
                  </AvatarFallback>
                </Avatar>
                
                <div className="flex-1 space-y-3">
                  {/* Content Type Tabs */}
                  <Tabs value={contentType} onValueChange={(v) => setContentType(v as ContentType)} className="w-full">
                    <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4">
                      <TabsTrigger value="post" className="flex items-center gap-2">
                        <Edit3 className="w-4 h-4" />
                        <span className="hidden sm:inline">Post</span>
                      </TabsTrigger>
                      <TabsTrigger value="event" className="flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        <span className="hidden sm:inline">Event</span>
                      </TabsTrigger>
                      <TabsTrigger value="article" className="flex items-center gap-2">
                        <FileText className="w-4 h-4" />
                        <span className="hidden sm:inline">Article</span>
                      </TabsTrigger>
                      <TabsTrigger value="pathway" className="flex items-center gap-2">
                        <Lightbulb className="w-4 h-4" />
                        <span className="hidden sm:inline">Pathway</span>
                      </TabsTrigger>
                    </TabsList>

                    {/* Post Content */}
                    <TabsContent value="post" className="space-y-3">
                      <Textarea
                        placeholder="What's on your mind?"
                        value={content}
                        onChange={handleTextareaChange}
                        className="resize-none border-0 p-0 text-lg placeholder:text-muted-foreground focus-visible:ring-0"
                        rows={3}
                      />
                    </TabsContent>

                    {/* Event Content */}
                    <TabsContent value="event" className="space-y-3">
                      <Input
                        placeholder="Event title"
                        value={eventData.title}
                        onChange={(e) => setEventData(prev => ({ ...prev, title: e.target.value }))}
                        className="text-lg font-semibold"
                      />
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <Input
                          type="date"
                          value={eventData.date}
                          onChange={(e) => setEventData(prev => ({ ...prev, date: e.target.value }))}
                        />
                        <Input
                          type="time"
                          value={eventData.time}
                          onChange={(e) => setEventData(prev => ({ ...prev, time: e.target.value }))}
                        />
                      </div>
                      <Input
                        placeholder="Location (optional)"
                        value={eventData.location}
                        onChange={(e) => setEventData(prev => ({ ...prev, location: e.target.value }))}
                      />
                      <Textarea
                        placeholder="Event description"
                        value={eventData.description}
                        onChange={(e) => setEventData(prev => ({ ...prev, description: e.target.value }))}
                        rows={3}
                      />
                    </TabsContent>

                    {/* Article Content */}
                    <TabsContent value="article" className="space-y-3">
                      <Input
                        placeholder="Article title"
                        value={articleData.title}
                        onChange={(e) => setArticleData(prev => ({ ...prev, title: e.target.value }))}
                        className="text-lg font-semibold"
                      />
                      <Textarea
                        placeholder="Article excerpt or summary"
                        value={articleData.excerpt}
                        onChange={(e) => setArticleData(prev => ({ ...prev, excerpt: e.target.value }))}
                        rows={2}
                      />
                      <Textarea
                        placeholder="Write your article content here..."
                        value={content}
                        onChange={handleTextareaChange}
                        rows={4}
                      />
                      <Input
                        placeholder="Category (e.g., Technology, Business)"
                        value={articleData.category}
                        onChange={(e) => setArticleData(prev => ({ ...prev, category: e.target.value }))}
                      />
                    </TabsContent>

                    {/* Pathway Content */}
                    <TabsContent value="pathway" className="space-y-3">
                      <Input
                        placeholder="Pathway title"
                        value={pathwayData.title}
                        onChange={(e) => setPathwayData(prev => ({ ...prev, title: e.target.value }))}
                        className="text-lg font-semibold"
                      />
                      <Textarea
                        placeholder="Learning objective"
                        value={pathwayData.objective}
                        onChange={(e) => setPathwayData(prev => ({ ...prev, objective: e.target.value }))}
                        rows={2}
                      />
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <Input
                          placeholder="Duration (e.g., 2 weeks)"
                          value={pathwayData.duration}
                          onChange={(e) => setPathwayData(prev => ({ ...prev, duration: e.target.value }))}
                        />
                        <Select 
                          value={pathwayData.difficulty} 
                          onValueChange={(v) => setPathwayData(prev => ({ ...prev, difficulty: v as any }))}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="beginner">Beginner</SelectItem>
                            <SelectItem value="intermediate">Intermediate</SelectItem>
                            <SelectItem value="advanced">Advanced</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <Textarea
                        placeholder="Pathway content and steps..."
                        value={content}
                        onChange={handleTextareaChange}
                        rows={4}
                      />
                    </TabsContent>
                  </Tabs>

                  {/* Link Preview */}
                  {embedData && (
                    <div className="relative">
                      <EmbedPreview
                        embedData={embedData}
                        onRemove={clearEmbedData}
                        showRemoveButton={true}
                      />
                    </div>
                  )}

                  {/* Media Preview */}
                  {selectedFile && filePreview && (
                    <MediaPreview
                      file={selectedFile}
                      preview={filePreview}
                      onRemove={removeFile}
                      uploading={isSubmitting}
                    />
                  )}

                  {/* Actions */}
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
                        disabled={isSubmitting || !!embedData}
                        className={`text-muted-foreground hover:text-foreground ${embedData ? 'opacity-50 cursor-not-allowed' : ''}`}
                      >
                        <ImagePlus className="h-4 w-4 mr-2" />
                        Add Media
                      </Button>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button 
                        onClick={() => handleSubmit('draft')}
                        disabled={isSubmitting || embedLoading}
                        variant="outline"
                        className="text-muted-foreground hover:text-foreground"
                      >
                        Save Draft
                      </Button>
                      <Button 
                        onClick={() => handleSubmit('published')}
                        disabled={isSubmitting || embedLoading}
                        className="bg-dna-forest hover:bg-dna-forest/90"
                      >
                        {isSubmitting ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Publishing...
                          </>
                        ) : (
                          <>
                            <Send className="h-4 w-4 mr-2" />
                            Publish
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div 
            className={cn(
              "animate-scale-in",
              "bg-white border border-gray-200 rounded-xl shadow-md transition-all duration-300"
            )}
          >
            <Button
              variant="ghost"
              onClick={handleExpand}
              className={cn(
                "w-full justify-start text-left h-auto p-4",
                "bg-gradient-to-r from-gray-50 to-white",
                "hover:from-gray-100 hover:to-gray-50",
                "border-0 rounded-xl transition-all duration-200",
                "hover-scale",
                isMobile ? "text-sm" : "text-base"
              )}
            >
              <div className="flex items-center space-x-4">
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 bg-gradient-to-r from-dna-mint to-dna-sage rounded-full flex items-center justify-center shadow-sm">
                    <Plus className="w-5 h-5 text-dna-forest" />
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <span className="text-gray-600 font-medium">Create something amazing...</span>
                </div>
                <div className="flex-shrink-0">
                  <ChevronUp className="w-5 h-5 text-gray-400 transition-transform duration-200 group-hover:text-gray-600" />
                </div>
              </div>
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};