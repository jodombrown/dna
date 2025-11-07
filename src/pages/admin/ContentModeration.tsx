import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { CheckCircle, XCircle, Flag, Eye, Clock, MessageSquare, FileText } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface FlaggedPost {
  id: string;
  author_id: string;
  content: string;
  flagged_at: string;
  flagged_by: string;
  flag_reason: string;
  moderation_status: string;
  author_name: string;
  author_email: string;
  flagger_name: string;
  moderation_notes?: string;
  post_type: string;
}

interface FlaggedComment {
  id: string;
  post_id: string;
  user_id: string;
  content: string;
  flagged_at: string;
  flagged_by: string;
  flag_reason: string;
  moderation_status: string;
  author_name: string;
  author_email: string;
  flagger_name: string;
  moderation_notes?: string;
}

const ContentModeration = () => {
  const [flaggedPosts, setFlaggedPosts] = useState<FlaggedPost[]>([]);
  const [flaggedComments, setFlaggedComments] = useState<FlaggedComment[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPost, setSelectedPost] = useState<FlaggedPost | null>(null);
  const [selectedComment, setSelectedComment] = useState<FlaggedComment | null>(null);
  const [reviewNotes, setReviewNotes] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    fetchFlaggedContent();
  }, []);

  const fetchFlaggedContent = async () => {
    try {
      setLoading(true);

      // Fetch flagged posts
      const { data: postsData, error: postsError } = await supabase
        .from('posts')
        .select(`
          id,
          author_id,
          content,
          post_type,
          flagged_at,
          flagged_by,
          flag_reason,
          moderation_status,
          moderation_notes,
          author:profiles!posts_author_id_fkey(display_name, email),
          flagger:profiles!posts_flagged_by_fkey(display_name)
        `)
        .in('moderation_status', ['pending', 'flagged'])
        .order('flagged_at', { ascending: false });

      if (postsError) throw postsError;

      // Fetch flagged comments
      const { data: commentsData, error: commentsError } = await supabase
        .from('post_comments')
        .select(`
          id,
          post_id,
          user_id,
          content,
          flagged_at,
          flagged_by,
          flag_reason,
          moderation_status,
          moderation_notes,
          author:profiles!post_comments_user_id_fkey(display_name, email),
          flagger:profiles!post_comments_flagged_by_fkey(display_name)
        `)
        .in('moderation_status', ['pending', 'flagged'])
        .order('flagged_at', { ascending: false });

      if (commentsError) throw commentsError;

      setFlaggedPosts(
        postsData?.map((item: any) => ({
          id: item.id,
          author_id: item.author_id,
          content: item.content,
          post_type: item.post_type,
          flagged_at: item.flagged_at,
          flagged_by: item.flagged_by,
          flag_reason: item.flag_reason,
          moderation_status: item.moderation_status,
          author_name: item.author?.display_name || 'Unknown',
          author_email: item.author?.email || '',
          flagger_name: item.flagger?.display_name || 'Unknown',
          moderation_notes: item.moderation_notes
        })) || []
      );

      setFlaggedComments(
        commentsData?.map((item: any) => ({
          id: item.id,
          post_id: item.post_id,
          user_id: item.user_id,
          content: item.content,
          flagged_at: item.flagged_at,
          flagged_by: item.flagged_by,
          flag_reason: item.flag_reason,
          moderation_status: item.moderation_status,
          author_name: item.author?.display_name || 'Unknown',
          author_email: item.author?.email || '',
          flagger_name: item.flagger?.display_name || 'Unknown',
          moderation_notes: item.moderation_notes
        })) || []
      );
    } catch (error) {
      console.error('Error fetching flagged content:', error);
      toast({
        title: "Error",
        description: "Failed to fetch flagged content",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePostModeration = async (postId: string, status: 'approved' | 'rejected') => {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('posts')
        .update({
          moderation_status: status,
          moderated_by: user.user.id,
          moderated_at: new Date().toISOString(),
          moderation_notes: reviewNotes || undefined
        })
        .eq('id', postId);

      if (error) throw error;

      toast({
        title: "Success",
        description: `Post ${status} successfully`,
      });

      fetchFlaggedContent();
      setSelectedPost(null);
      setReviewNotes('');
    } catch (error) {
      console.error('Error moderating post:', error);
      toast({
        title: "Error",
        description: "Failed to moderate post",
        variant: "destructive",
      });
    }
  };

  const handleCommentModeration = async (commentId: string, status: 'approved' | 'rejected') => {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('post_comments')
        .update({
          moderation_status: status,
          moderated_by: user.user.id,
          moderated_at: new Date().toISOString(),
          moderation_notes: reviewNotes || undefined
        })
        .eq('id', commentId);

      if (error) throw error;

      toast({
        title: "Success",
        description: `Comment ${status} successfully`,
      });

      fetchFlaggedContent();
      setSelectedComment(null);
      setReviewNotes('');
    } catch (error) {
      console.error('Error moderating comment:', error);
      toast({
        title: "Error",
        description: "Failed to moderate comment",
        variant: "destructive",
      });
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="bg-yellow-500/10 text-yellow-600 border-yellow-500"><Clock className="h-3 w-3 mr-1" />Pending</Badge>;
      case 'flagged':
        return <Badge variant="outline" className="bg-red-500/10 text-red-600 border-red-500"><Flag className="h-3 w-3 mr-1" />Flagged</Badge>;
      case 'approved':
        return <Badge variant="outline" className="bg-green-500/10 text-green-600 border-green-500"><CheckCircle className="h-3 w-3 mr-1" />Approved</Badge>;
      case 'rejected':
        return <Badge variant="destructive"><XCircle className="h-3 w-3 mr-1" />Rejected</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Content Moderation</h2>
        <p className="text-muted-foreground">Review and moderate flagged posts and comments</p>
      </div>

      <Tabs defaultValue="posts" className="w-full">
        <TabsList>
          <TabsTrigger value="posts" className="gap-2">
            <FileText className="h-4 w-4" />
            Flagged Posts ({flaggedPosts.length})
          </TabsTrigger>
          <TabsTrigger value="comments" className="gap-2">
            <MessageSquare className="h-4 w-4" />
            Flagged Comments ({flaggedComments.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="posts" className="mt-6">
          <div className="border rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Author</TableHead>
                  <TableHead>Content</TableHead>
                  <TableHead>Reason</TableHead>
                  <TableHead>Flagged By</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Flagged</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {flaggedPosts.map((post) => (
                  <TableRow key={post.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{post.author_name}</div>
                        <div className="text-sm text-muted-foreground">{post.author_email}</div>
                      </div>
                    </TableCell>
                    <TableCell className="max-w-xs">
                      <p className="truncate text-sm">{post.content}</p>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{post.flag_reason}</Badge>
                    </TableCell>
                    <TableCell className="text-sm">{post.flagger_name}</TableCell>
                    <TableCell>{getStatusBadge(post.moderation_status)}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {new Date(post.flagged_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setSelectedPost(post);
                              setReviewNotes(post.moderation_notes || '');
                            }}
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            Review
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-3xl">
                          <DialogHeader>
                            <DialogTitle>Review Flagged Post</DialogTitle>
                          </DialogHeader>
                          {selectedPost && (
                            <div className="space-y-6">
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <label className="text-sm font-medium">Author</label>
                                  <p className="text-sm">{selectedPost.author_name}</p>
                                </div>
                                <div>
                                  <label className="text-sm font-medium">Flagged By</label>
                                  <p className="text-sm">{selectedPost.flagger_name}</p>
                                </div>
                              </div>

                              <div>
                                <label className="text-sm font-medium">Flag Reason</label>
                                <p className="text-sm bg-muted p-3 rounded mt-1">
                                  {selectedPost.flag_reason}
                                </p>
                              </div>

                              <div>
                                <label className="text-sm font-medium">Post Content</label>
                                <p className="text-sm bg-muted p-3 rounded mt-1">
                                  {selectedPost.content}
                                </p>
                              </div>

                              <div>
                                <label className="text-sm font-medium">Moderation Notes</label>
                                <Textarea
                                  value={reviewNotes}
                                  onChange={(e) => setReviewNotes(e.target.value)}
                                  placeholder="Add moderation notes..."
                                  rows={3}
                                />
                              </div>

                              <div className="flex justify-end gap-3">
                                <Button
                                  variant="destructive"
                                  onClick={() => handlePostModeration(selectedPost.id, 'rejected')}
                                >
                                  <XCircle className="h-4 w-4 mr-1" />
                                  Reject
                                </Button>
                                <Button
                                  className="bg-green-600 hover:bg-green-700 text-white"
                                  onClick={() => handlePostModeration(selectedPost.id, 'approved')}
                                >
                                  <CheckCircle className="h-4 w-4 mr-1" />
                                  Approve
                                </Button>
                              </div>
                            </div>
                          )}
                        </DialogContent>
                      </Dialog>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {flaggedPosts.length === 0 && (
            <div className="text-center py-12 border rounded-lg">
              <Flag className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No flagged posts to review</p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="comments" className="mt-6">
          <div className="border rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Author</TableHead>
                  <TableHead>Content</TableHead>
                  <TableHead>Reason</TableHead>
                  <TableHead>Flagged By</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Flagged</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {flaggedComments.map((comment) => (
                  <TableRow key={comment.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{comment.author_name}</div>
                        <div className="text-sm text-muted-foreground">{comment.author_email}</div>
                      </div>
                    </TableCell>
                    <TableCell className="max-w-xs">
                      <p className="truncate text-sm">{comment.content}</p>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{comment.flag_reason}</Badge>
                    </TableCell>
                    <TableCell className="text-sm">{comment.flagger_name}</TableCell>
                    <TableCell>{getStatusBadge(comment.moderation_status)}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {new Date(comment.flagged_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setSelectedComment(comment);
                              setReviewNotes(comment.moderation_notes || '');
                            }}
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            Review
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-3xl">
                          <DialogHeader>
                            <DialogTitle>Review Flagged Comment</DialogTitle>
                          </DialogHeader>
                          {selectedComment && (
                            <div className="space-y-6">
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <label className="text-sm font-medium">Author</label>
                                  <p className="text-sm">{selectedComment.author_name}</p>
                                </div>
                                <div>
                                  <label className="text-sm font-medium">Flagged By</label>
                                  <p className="text-sm">{selectedComment.flagger_name}</p>
                                </div>
                              </div>

                              <div>
                                <label className="text-sm font-medium">Flag Reason</label>
                                <p className="text-sm bg-muted p-3 rounded mt-1">
                                  {selectedComment.flag_reason}
                                </p>
                              </div>

                              <div>
                                <label className="text-sm font-medium">Comment Content</label>
                                <p className="text-sm bg-muted p-3 rounded mt-1">
                                  {selectedComment.content}
                                </p>
                              </div>

                              <div>
                                <label className="text-sm font-medium">Moderation Notes</label>
                                <Textarea
                                  value={reviewNotes}
                                  onChange={(e) => setReviewNotes(e.target.value)}
                                  placeholder="Add moderation notes..."
                                  rows={3}
                                />
                              </div>

                              <div className="flex justify-end gap-3">
                                <Button
                                  variant="destructive"
                                  onClick={() => handleCommentModeration(selectedComment.id, 'rejected')}
                                >
                                  <XCircle className="h-4 w-4 mr-1" />
                                  Reject
                                </Button>
                                <Button
                                  className="bg-green-600 hover:bg-green-700 text-white"
                                  onClick={() => handleCommentModeration(selectedComment.id, 'approved')}
                                >
                                  <CheckCircle className="h-4 w-4 mr-1" />
                                  Approve
                                </Button>
                              </div>
                            </div>
                          )}
                        </DialogContent>
                      </Dialog>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {flaggedComments.length === 0 && (
            <div className="text-center py-12 border rounded-lg">
              <MessageSquare className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No flagged comments to review</p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ContentModeration;
