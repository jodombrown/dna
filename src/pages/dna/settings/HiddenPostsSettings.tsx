import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { SettingsLayout } from '@/components/settings/SettingsLayout';
import { Loader2, EyeOff, AlertCircle, Clock } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { formatDistanceToNow } from 'date-fns';

interface HiddenPost {
  hidden_id: string;
  post_id: string;
  author_full_name: string;
  author_avatar_url?: string;
  content_preview: string;
  hidden_at: string;
}

export default function HiddenPostsSettings() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [unhidingPost, setUnhidingPost] = useState<HiddenPost | null>(null);

  const { data: hiddenPosts, isLoading, error } = useQuery({
    queryKey: ['hidden-posts'],
    queryFn: async (): Promise<HiddenPost[]> => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      const { data: hiddenRows, error: hiddenError } = await supabase
        .from('hidden_posts')
        .select('id, post_id, created_at')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (hiddenError) throw hiddenError;
      if (!hiddenRows || hiddenRows.length === 0) return [];

      const postIds = hiddenRows.map((row) => row.post_id);
      const { data: posts, error: postsError } = await supabase
        .from('posts')
        .select('id, content, author_id')
        .in('id', postIds);

      if (postsError) throw postsError;

      const postById = new Map((posts || []).map((post) => [post.id, post]));
      const authorIds = [...new Set((posts || []).map((post) => post.author_id))];

      const { data: profiles, error: profilesError } = authorIds.length > 0
        ? await supabase.from('profiles').select('id, full_name, avatar_url').in('id', authorIds)
        : { data: [], error: null };

      if (profilesError) throw profilesError;

      const profileById = new Map((profiles || []).map((profile) => [profile.id, profile]));

      return hiddenRows.map((row) => {
        const post = postById.get(row.post_id);
        const profile = post ? profileById.get(post.author_id) : undefined;
        return {
          hidden_id: row.id,
          post_id: row.post_id,
          author_full_name: profile?.full_name || 'Unknown User',
          author_avatar_url: profile?.avatar_url,
          content_preview: post?.content ? post.content.slice(0, 120) : 'This post is no longer available.',
          hidden_at: row.created_at,
        };
      });
    },
  });

  const unhideMutation = useMutation({
    mutationFn: async (postId: string) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('hidden_posts')
        .delete()
        .eq('user_id', user.id)
        .eq('post_id', postId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hidden-posts'] });
      queryClient.invalidateQueries({ queryKey: ['universal-feed'] });
      toast({
        title: 'Post restored',
        description: 'This post will appear in your feed again.',
      });
      setUnhidingPost(null);
    },
    onError: (error: Error) => {
      toast({
        title: 'Failed to restore post',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const handleUnhide = () => {
    if (unhidingPost) {
      unhideMutation.mutate(unhidingPost.post_id);
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  if (isLoading) {
    return (
      <SettingsLayout title="Hidden Posts" description="Restore posts you've hidden from your feed">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </SettingsLayout>
    );
  }

  if (error) {
    return (
      <SettingsLayout title="Hidden Posts" description="Restore posts you've hidden from your feed">
        <Card>
          <CardContent className="py-12">
            <div className="flex flex-col items-center text-center text-muted-foreground">
              <AlertCircle className="h-12 w-12 mb-4 text-destructive" />
              <p>Failed to load hidden posts</p>
              <Button
                variant="outline"
                className="mt-4"
                onClick={() => queryClient.invalidateQueries({ queryKey: ['hidden-posts'] })}
              >
                Try Again
              </Button>
            </div>
          </CardContent>
        </Card>
      </SettingsLayout>
    );
  }

  return (
    <SettingsLayout
      title="Hidden Posts"
      description="Restore posts you've hidden from your feed"
    >
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Hidden Posts ({hiddenPosts?.length || 0})</CardTitle>
            <CardDescription>
              Posts you've hidden won't show up in your feed until you restore them
            </CardDescription>
          </CardHeader>
          <CardContent>
            {!hiddenPosts || hiddenPosts.length === 0 ? (
              <div className="py-12 text-center">
                <EyeOff className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
                <p className="text-muted-foreground">You haven't hidden any posts.</p>
              </div>
            ) : (
              <div className="divide-y">
                {hiddenPosts.map((post) => (
                  <div
                    key={post.hidden_id}
                    className="flex items-center justify-between py-4 first:pt-0 last:pb-0"
                  >
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={post.author_avatar_url} alt={post.author_full_name} />
                        <AvatarFallback>{getInitials(post.author_full_name)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{post.author_full_name}</p>
                        <p className="text-sm text-muted-foreground line-clamp-2">{post.content_preview}</p>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground mt-0.5">
                          <Clock className="h-3 w-3" />
                          <span>Hidden {formatDistanceToNow(new Date(post.hidden_at), { addSuffix: true })}</span>
                        </div>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setUnhidingPost(post)}
                      disabled={unhideMutation.isPending}
                    >
                      Restore
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <AlertDialog open={!!unhidingPost} onOpenChange={() => setUnhidingPost(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Restore this post?</AlertDialogTitle>
            <AlertDialogDescription>
              This post will appear in your feed again. You can hide it again at any time.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={unhideMutation.isPending}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleUnhide}
              disabled={unhideMutation.isPending}
            >
              {unhideMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Restoring...
                </>
              ) : (
                'Restore'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </SettingsLayout>
  );
}
