import { useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { PostWithAuthor } from '@/types/posts';
import { Heart, MessageCircle, MoreHorizontal, Globe, Users } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface PostCardProps {
  post: PostWithAuthor;
  currentUserId: string;
  onUpdate?: () => void;
  onCommentClick?: () => void;
  showComments?: boolean;
}

export function PostCard({
  post,
  currentUserId,
  onUpdate,
  onCommentClick,
  showComments = false,
}: PostCardProps) {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLiking, setIsLiking] = useState(false);
  const [localLiked, setLocalLiked] = useState(post.user_has_liked);
  const [localLikesCount, setLocalLikesCount] = useState(post.likes_count);

  const isOwnPost = post.author_id === currentUserId;

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const timeAgo = formatDistanceToNow(new Date(post.created_at), { addSuffix: true });

  const getPostTypeDisplay = () => {
    const types = {
      update: { label: 'Update', icon: '📝', color: 'text-blue-600' },
      article: { label: 'Article', icon: '📄', color: 'text-purple-600' },
      question: { label: 'Question', icon: '❓', color: 'text-orange-600' },
      celebration: { label: 'Celebration', icon: '🎉', color: 'text-pink-600' },
    };
    return types[post.post_type] || types.update;
  };

  const postTypeDisplay = getPostTypeDisplay();

  const handleLike = async () => {
    if (isLiking) return;

    setIsLiking(true);
    const wasLiked = localLiked;
    
    // Optimistic update
    setLocalLiked(!wasLiked);
    setLocalLikesCount((prev) => (wasLiked ? prev - 1 : prev + 1));

    try {
      if (wasLiked) {
        // Unlike
        const { error } = await supabase
          .from('post_likes')
          .delete()
          .eq('post_id', post.post_id)
          .eq('user_id', currentUserId);

        if (error) throw error;
      } else {
        // Like
        const { error } = await supabase
          .from('post_likes')
          .insert({ post_id: post.post_id, user_id: currentUserId });

        if (error) throw error;
      }

      onUpdate?.();
    } catch (error) {
      console.error('Error toggling like:', error);
      // Revert optimistic update
      setLocalLiked(wasLiked);
      setLocalLikesCount((prev) => (wasLiked ? prev + 1 : prev - 1));
      toast({
        title: 'Error',
        description: 'Failed to update like',
        variant: 'destructive',
      });
    } finally {
      setIsLiking(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this post?')) return;

    try {
      const { error } = await supabase
        .from('posts')
        .update({ is_deleted: true })
        .eq('id', post.post_id);

      if (error) throw error;

      toast({
        title: 'Post deleted',
        description: 'Your post has been deleted',
      });

      onUpdate?.();
    } catch (error) {
      console.error('Error deleting post:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete post',
        variant: 'destructive',
      });
    }
  };

  return (
    <Card className="p-6">
      {/* Header */}
      <div className="flex items-start gap-3 mb-4">
        <Avatar
          className="h-12 w-12 cursor-pointer"
          onClick={() => navigate(`/dna/${post.author_username}`)}
        >
          <AvatarImage src={post.author_avatar_url} alt={post.author_full_name} />
          <AvatarFallback className="bg-[hsl(151,75%,50%)] text-white">
            {getInitials(post.author_full_name)}
          </AvatarFallback>
        </Avatar>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3
              className="font-semibold cursor-pointer hover:text-[hsl(151,75%,50%)] transition-colors"
              onClick={() => navigate(`/dna/${post.author_username}`)}
            >
              {post.author_full_name}
            </h3>
            {post.is_connection && (
              <Badge variant="outline" className="text-xs">
                <Users className="h-3 w-3 mr-1" />
                Connection
              </Badge>
            )}
          </div>
          
          {post.author_headline && (
            <p className="text-sm text-muted-foreground line-clamp-1">
              {post.author_headline}
            </p>
          )}

          <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
            <span>{timeAgo}</span>
            <span>•</span>
            <span className={cn('flex items-center gap-1', postTypeDisplay.color)}>
              <span>{postTypeDisplay.icon}</span>
              <span>{postTypeDisplay.label}</span>
            </span>
            <span>•</span>
            {post.privacy_level === 'public' ? (
              <Globe className="h-3 w-3" />
            ) : (
              <Users className="h-3 w-3" />
            )}
          </div>
        </div>

        {isOwnPost && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={handleDelete} className="text-destructive">
                Delete Post
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>

      {/* Content */}
      <div className="mb-4">
        <p className="whitespace-pre-wrap break-words">{post.content}</p>
      </div>

      {/* Image */}
      {post.image_url && (
        <div className="mb-4 rounded-lg overflow-hidden">
          <img
            src={post.image_url}
            alt="Post image"
            className="w-full h-auto object-cover max-h-96"
          />
        </div>
      )}

      {/* Link Preview */}
      {post.link_url && (
        <a
          href={post.link_url}
          target="_blank"
          rel="noopener noreferrer"
          className="block mb-4 border rounded-lg p-4 hover:bg-accent transition-colors"
        >
          {post.link_title && (
            <h4 className="font-semibold text-sm mb-1 line-clamp-2">{post.link_title}</h4>
          )}
          {post.link_description && (
            <p className="text-xs text-muted-foreground line-clamp-2 mb-2">
              {post.link_description}
            </p>
          )}
          <p className="text-xs text-[hsl(151,75%,50%)] truncate">{post.link_url}</p>
        </a>
      )}

      {/* Stats */}
      {(localLikesCount > 0 || post.comments_count > 0) && (
        <div className="flex items-center gap-4 pb-3 mb-3 border-b text-sm text-muted-foreground">
          {localLikesCount > 0 && (
            <span>
              {localLikesCount} {localLikesCount === 1 ? 'like' : 'likes'}
            </span>
          )}
          {post.comments_count > 0 && (
            <span>
              {post.comments_count} {post.comments_count === 1 ? 'comment' : 'comments'}
            </span>
          )}
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={handleLike}
          disabled={isLiking}
          className={cn(
            'flex-1',
            localLiked && 'text-red-500 hover:text-red-600'
          )}
        >
          <Heart className={cn('h-4 w-4 mr-2', localLiked && 'fill-current')} />
          {localLiked ? 'Liked' : 'Like'}
        </Button>

        <Button
          variant="ghost"
          size="sm"
          onClick={onCommentClick}
          className="flex-1"
        >
          <MessageCircle className="h-4 w-4 mr-2" />
          Comment
        </Button>
      </div>
    </Card>
  );
}
