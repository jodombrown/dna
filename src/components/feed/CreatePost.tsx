import { useState, useRef, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Loader2, Save, FileText } from 'lucide-react';
import { toast } from 'sonner';
import { MentionAutocomplete } from './MentionAutocomplete';
import { useDraftPosts } from '@/hooks/useDraftPosts';
import { useAutoEmbedDetection } from '@/hooks/useAutoEmbedDetection';
import { mentionService } from '@/services/mentionService';
import { VideoLinkPreview } from './VideoLinkPreview';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import type { MentionSuggestion } from '@/hooks/useMentionAutocomplete';

export function CreatePost() {
  const { user, profile } = useAuth();
  const [content, setContent] = useState('');
  const [cursorPosition, setCursorPosition] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const queryClient = useQueryClient();
  const { drafts, saveDraft, deleteDraft } = useDraftPosts();
  
  // Auto-detect video/embed links
  const { 
    loading: embedLoading, 
    embedData, 
    handleContentChange: detectEmbed, 
    clearEmbedData,
    isVideoEmbed 
  } = useAutoEmbedDetection();

  // Detect embeds when content changes
  useEffect(() => {
    detectEmbed(content);
  }, [content, detectEmbed]);

  const createPostMutation = useMutation({
    mutationFn: async (postContent: string) => {
      console.log('CreatePost: inserting post with payload:', {
        author_id: user!.id,
        content: postContent,
        post_type: 'post',
        privacy_level: 'public',
        link_url: embedData?.url || null,
        link_title: embedData?.title || null,
        link_description: embedData?.author_name || null,
      });

      const { data, error } = await supabase
        .from('posts')
        .insert({
          author_id: user!.id,
          content: postContent,
          post_type: 'post',
          privacy_level: 'public',
          linked_entity_type: null,
          linked_entity_id: null,
          space_id: null,
          event_id: null,
          // Store video/link metadata
          link_url: embedData?.url || null,
          link_title: embedData?.title || null,
          link_description: embedData?.author_name || null,
          // Store additional metadata in JSONB
          metadata: embedData ? {
            embed_type: embedData.type,
            provider_name: embedData.provider_name,
            thumbnail_url: embedData.thumbnail_url,
            is_video: isVideoEmbed,
          } : null,
        })
        .select()
        .single();

      if (error) {
        console.error('CreatePost: insert error:', error);
        throw error;
      }
      
      console.log('CreatePost: insert successful, data:', data);
      return data;
    },
    onSuccess: (data, postContent) => {
      queryClient.invalidateQueries({ queryKey: ['universal-feed'] });
      queryClient.invalidateQueries({ queryKey: ['universal-feed-infinite'] });
      queryClient.invalidateQueries({ queryKey: ['feed-posts'] });

      // Process mentions and send notifications (async, don't block UI)
      if (data && postContent) {
        mentionService.processMentionsForPost(
          postContent,
          data.id,
          user!.id,
          profile?.full_name || profile?.username || 'Someone'
        ).catch(err => console.error('Failed to process post mentions:', err));
      }

      setContent('');
      clearEmbedData();
      toast.success('Post created successfully!');
    },
    onError: (error: any) => {
      console.error('CreatePost: mutation error:', error);
      const msg = (error?.message || error?.hint || error?.details || '').toString();
      toast.error(msg ? `Post failed: ${msg}` : 'Post failed. Please try again.');
    },
  });

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setContent(e.target.value);
    setCursorPosition(e.target.selectionStart);
  };

  const handleTextareaClick = () => {
    if (textareaRef.current) {
      setCursorPosition(textareaRef.current.selectionStart);
    }
  };

  const handleMentionSelect = (mention: MentionSuggestion, startPos: number, endPos: number) => {
    const beforeMention = content.substring(0, startPos);
    const afterMention = content.substring(endPos);
    const newContent = `${beforeMention}@${mention.username} ${afterMention}`;

    setContent(newContent);

    const newCursorPos = startPos + mention.username.length + 2;
    setCursorPosition(newCursorPos);

    setTimeout(() => {
      if (textareaRef.current) {
        textareaRef.current.focus();
        textareaRef.current.setSelectionRange(newCursorPos, newCursorPos);
      }
    }, 0);
  };

  const handleSaveDraft = async () => {
    if (!content.trim()) {
      toast.error('Please write something to save');
      return;
    }
    await saveDraft.mutateAsync({ content, postType: 'post' });
  };

  const handleLoadDraft = (draftContent: string, draftId: string) => {
    setContent(draftContent);
    deleteDraft.mutate(draftId);
  };

  const handleSubmit = async () => {
    if (!content.trim()) {
      toast.error('Please write something');
      return;
    }

    if (!user) {
      toast.error('You must be logged in to post');
      return;
    }

    setIsSubmitting(true);
    try {
      await createPostMutation.mutateAsync(content);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!user) return null;

  return (
    <Card className="p-4 space-y-4">
      <div className="flex gap-3">
        <Avatar className="h-10 w-10">
          <AvatarImage src={profile?.avatar_url || ''} />
          <AvatarFallback className="bg-primary text-primary-foreground">
            {profile?.full_name?.[0] || user.email?.[0] || 'U'}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 space-y-3 relative">
          <Textarea
            ref={textareaRef}
            placeholder="What's on your mind? Paste a YouTube or Vimeo link to share a video."
            value={content}
            onChange={handleContentChange}
            onClick={handleTextareaClick}
            onKeyUp={handleTextareaClick}
            className="min-h-[100px] resize-none border-0 p-0 focus-visible:ring-0 text-base"
          />
          <MentionAutocomplete
            text={content}
            cursorPosition={cursorPosition}
            onSelectMention={handleMentionSelect}
            textareaRef={textareaRef}
          />
        </div>
      </div>

      {/* Video/Link Preview */}
      {embedLoading && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground px-2">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span>Loading preview...</span>
        </div>
      )}
      
      {embedData && !embedLoading && (
        <VideoLinkPreview
          embedData={embedData}
          showRemoveButton={false}
          size="compact"
        />
      )}

      <div className="flex items-center justify-between border-t pt-3">
        <div className="flex gap-2">
          {/* Draft Management */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm">
                <FileText className="h-4 w-4 mr-2" />
                Drafts {drafts && drafts.length > 0 && `(${drafts.length})`}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-80">
              {drafts && drafts.length > 0 ? (
                drafts.map((draft) => (
                  <DropdownMenuItem
                    key={draft.id}
                    onClick={() => handleLoadDraft(draft.content, draft.id)}
                    className="flex flex-col items-start gap-1 cursor-pointer"
                  >
                    <p className="text-sm line-clamp-2">{draft.content}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(draft.updated_at).toLocaleDateString()}
                    </p>
                  </DropdownMenuItem>
                ))
              ) : (
                <div className="p-2 text-sm text-muted-foreground text-center">
                  No saved drafts
                </div>
              )}
            </DropdownMenuContent>
          </DropdownMenu>

          <Button
            variant="ghost"
            size="sm"
            onClick={handleSaveDraft}
            disabled={!content.trim() || saveDraft.isPending}
          >
            <Save className="h-4 w-4 mr-2" />
            Save Draft
          </Button>
        </div>

        <Button
          onClick={handleSubmit}
          disabled={!content.trim() || isSubmitting}
          className="min-w-[100px]"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Posting...
            </>
          ) : (
            'Post'
          )}
        </Button>
      </div>
    </Card>
  );
}
