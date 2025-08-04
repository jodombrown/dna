import React, { useState } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { ChevronDown, ChevronUp, MoreHorizontal, Edit, Trash2 } from 'lucide-react';
import { PostActions } from './PostActions';
import { PostStats } from './PostStats';
import { CommentThread } from './comments/CommentThread';
import { EditPostModal } from './EditPostModal';
import { DeletePostDialog } from './DeletePostDialog';
import { useDialogManager } from '@/hooks/useDialogManager';
import { supabase } from '@/integrations/supabase/client';
import type { Post } from './PostList';

interface PostCardProps {
  post: Post;
  onComment?: (postId: string) => void;
  onPostUpdated?: () => void;
  onPostDeleted?: () => void;
}

const getPillarColor = (pillar: string) => {
  switch (pillar) {
    case 'connect': return 'bg-dna-emerald text-white';
    case 'collaborate': return 'bg-dna-copper text-white';
    case 'contribute': return 'bg-dna-gold text-black';
    default: return 'bg-dna-forest text-white';
  }
};

const getPillarLabel = (pillar: string) => {
  return pillar.charAt(0).toUpperCase() + pillar.slice(1);
};

const getInitials = (name: string) => {
  return name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
};

export const PostCard: React.FC<PostCardProps> = ({ 
  post, 
  onComment, 
  onPostUpdated, 
  onPostDeleted 
}) => {
  const [showComments, setShowComments] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const { openDialog, closeDialog, isDialogOpen } = useDialogManager();
  
  React.useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setCurrentUser(user);
    };
    getUser();
  }, []);
  
  const handleCommentToggle = () => {
    setShowComments(!showComments);
    onComment?.(post.id);
  };

  const isAuthor = currentUser?.id === post.author_id;

  const handlePostUpdated = () => {
    closeDialog('edit');
    onPostUpdated?.();
  };

  const handlePostDeleted = () => {
    closeDialog('delete');
    onPostDeleted?.();
  };
  return (
    <Card 
      className="bg-background border-border hover:bg-accent/5 transition-colors"
      role="article"
      aria-labelledby={`post-author-${post.id}`}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start gap-3">
          <Avatar className="h-12 w-12">
            <AvatarImage 
              src={post.profiles.avatar_url} 
              alt={`${post.profiles.full_name}'s profile picture`}
            />
            <AvatarFallback className="bg-dna-forest text-white text-sm">
              {getInitials(post.profiles.full_name)}
            </AvatarFallback>
          </Avatar>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h4 
                id={`post-author-${post.id}`}
                className="font-semibold text-foreground truncate"
              >
                {post.profiles.full_name}
              </h4>
              <Badge 
                variant="secondary" 
                className={`text-xs ${getPillarColor(post.pillar)}`}
                aria-label={`Post category: ${getPillarLabel(post.pillar)}`}
              >
                {getPillarLabel(post.pillar)}
              </Badge>
            </div>
            
            {post.profiles.professional_role && (
              <p className="text-sm text-muted-foreground truncate">
                {post.profiles.professional_role}
              </p>
            )}
            
            {post.profiles.location && (
              <p className="text-xs text-muted-foreground">
                {post.profiles.location}
              </p>
            )}
          </div>
          
          {/* Post Menu for Authors */}
          {isAuthor && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => openDialog('edit')}>
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={() => openDialog('delete')}
                  className="text-destructive focus:text-destructive"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        <div className="space-y-4">
          <p className="text-foreground whitespace-pre-wrap leading-relaxed">
            {post.content}
          </p>

          {post.media_url && (
            <div className="rounded-lg overflow-hidden border">
              <img 
                src={post.media_url} 
                alt="Post media" 
                className="w-full h-auto max-h-96 object-cover"
              />
            </div>
          )}

          <div className="space-y-2">
            <PostStats
              createdAt={post.created_at}
              pillar={post.pillar}
              likeCount={post.like_count || 0}
              commentCount={post.comment_count || 0}
            />
            
            <PostActions
              postId={post.id}
              initialLikeCount={post.like_count || 0}
              initialCommentCount={post.comment_count || 0}
              initialIsLiked={post.user_has_liked || false}
              onComment={handleCommentToggle}
            />
          </div>

          {/* Comments Section Toggle */}
          {(post.comment_count || 0) > 0 && (
            <div className="pt-2 border-t">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleCommentToggle}
                className="w-full justify-between text-muted-foreground hover:text-foreground"
              >
                <span>
                  {showComments ? 'Hide' : 'View'} {post.comment_count || 0} {(post.comment_count || 0) === 1 ? 'comment' : 'comments'}
                </span>
                {showComments ? (
                  <ChevronUp className="h-4 w-4" />
                ) : (
                  <ChevronDown className="h-4 w-4" />
                )}
              </Button>
            </div>
          )}
        </div>
      </CardContent>

      {/* Expanded Comments Section */}
      {showComments && (
        <CardContent className="pt-0">
          <div className="border-t pt-4">
            <CommentThread postId={post.id} />
          </div>
        </CardContent>
      )}

      {/* Edit Post Modal */}
      <EditPostModal
        post={post}
        open={isDialogOpen('edit')}
        onOpenChange={(open) => !open && closeDialog('edit')}
        onPostUpdated={handlePostUpdated}
      />

      {/* Delete Post Dialog */}
      <DeletePostDialog
        postId={post.id}
        open={isDialogOpen('delete')}
        onOpenChange={(open) => !open && closeDialog('delete')}
        onPostDeleted={handlePostDeleted}
      />
    </Card>
  );
};