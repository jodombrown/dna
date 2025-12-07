import { useState, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Image, Video, Link2, Loader2, Save, FileText } from 'lucide-react';
import { toast } from 'sonner';
import { MentionAutocomplete } from './MentionAutocomplete';
import { useDraftPosts } from '@/hooks/useDraftPosts';
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

  const createPostMutation = useMutation({
    mutationFn: async (postContent: string) => {
      console.log('CreatePost: inserting post with payload:', {
        author_id: user!.id,
        content: postContent,
        post_type: 'post',
        privacy_level: 'public',
      });

      const { data, error } = await supabase
        .from('posts')
        .insert({
          author_id: user!.id,
          content: postContent,
          post_type: 'post', // Valid post_type per database constraint
          privacy_level: 'public',
          linked_entity_type: null,
          linked_entity_id: null,
          space_id: null,
          event_id: null,
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
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['universal-feed'] });
      queryClient.invalidateQueries({ queryKey: ['universal-feed-infinite'] });
      queryClient.invalidateQueries({ queryKey: ['feed-posts'] });
      setContent('');
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
    // Replace the @query with @username
    const beforeMention = content.substring(0, startPos);
    const afterMention = content.substring(endPos);
    const newContent = `${beforeMention}@${mention.username} ${afterMention}`;

    setContent(newContent);

    // Move cursor after the inserted mention
    const newCursorPos = startPos + mention.username.length + 2; // +2 for @ and space
    setCursorPosition(newCursorPos);

    // Focus textarea and set cursor position
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
    // Delete the draft after loading
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
            placeholder="What's on your mind?"
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
