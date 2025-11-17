import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Image, Video, Link2, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export function CreatePost() {
  const { user, profile } = useAuth();
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const queryClient = useQueryClient();

  const createPostMutation = useMutation({
    mutationFn: async (postContent: string) => {
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
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['universal-feed'] });
      queryClient.invalidateQueries({ queryKey: ['feed-posts'] });
      setContent('');
      toast.success('Post created successfully!');
    },
    onError: (error: any) => {
      console.error('Error creating post:', error);
      const msg = (error?.message || error?.hint || error?.details || '').toString();
      toast.error(msg ? `Post failed: ${msg}` : 'Post failed. Please try again.');
    },
  });

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
        <div className="flex-1 space-y-3">
          <Textarea
            placeholder="What's on your mind?"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="min-h-[100px] resize-none border-0 p-0 focus-visible:ring-0 text-base"
          />
        </div>
      </div>

      <div className="flex items-center justify-between border-t pt-3">
        <div className="flex gap-2">
          <Button variant="ghost" size="sm" disabled>
            <Image className="h-4 w-4 mr-2" />
            Photo
          </Button>
          <Button variant="ghost" size="sm" disabled>
            <Video className="h-4 w-4 mr-2" />
            Video
          </Button>
          <Button variant="ghost" size="sm" disabled>
            <Link2 className="h-4 w-4 mr-2" />
            Link
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
