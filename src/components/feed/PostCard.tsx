import React, { useState } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Heart, MessageCircle, Share, Trash2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { EmbedPreview } from '@/components/social-feed/EmbedPreview';
import { usePostViewTracker } from '@/hooks/usePostViewTracker';
import { likePost, unlikePost, deletePost } from '@/services/postsService';
import { formatDistanceToNow } from 'date-fns';
import { PostComments } from '@/components/feed/PostComments';

interface Post {
  id: string;
  content: string;
  media_url?: string;
  type: string;
  pillar: string;
  created_at: string;
  embed_metadata?: any;
  profiles: {
    id: string;
    full_name: string;
    avatar_url?: string;
    location?: string;
    professional_role?: string;
  };
  like_count?: number;
  comment_count?: number;
  user_has_liked?: boolean;
}

interface PostCardProps {
  post: Post;
  onLike?: (postId: string) => void;
  onComment?: (postId: string) => void;
  onShare?: (postId: string) => void;
}

export const PostCard: React.FC<PostCardProps> = ({ 
  post, 
  onLike, 
  onComment, 
  onShare 
}) => {
  const [isLiked, setIsLiked] = useState(post.user_has_liked || false);
  const [likeCount, setLikeCount] = useState(post.like_count || 0);
  const [commentCount, setCommentCount] = useState(post.comment_count || 0);
  const [isLiking, setIsLiking] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();
  const viewRef = usePostViewTracker(post.id);


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

  const handleLike = async () => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please log in to like posts",
        variant: "destructive",
      });
      return;
    }

    if (isLiking) return;
    setIsLiking(true);

    try {
      if (isLiked) {
        await unlikePost(post.id);
        setIsLiked(false);
        setLikeCount(prev => Math.max(0, prev - 1));
      } else {
        await likePost(post.id);
        setIsLiked(true);
        setLikeCount(prev => prev + 1);
      }

      onLike?.(post.id);
    } catch (error) {
      console.error('Error toggling like:', error);
      toast({
        title: "Error",
        description: "Failed to update like. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLiking(false);
    }
  };

  const handleDelete = async () => {
    if (!user || user.id !== post.profiles.id) {
      return;
    }

    if (!confirm('Are you sure you want to delete this post?')) {
      return;
    }

    try {
      await deletePost(post.id);
      toast({
        title: "Post deleted",
        description: "Your post has been removed.",
      });
      // Optionally trigger a refresh
      window.location.reload();
    } catch (error) {
      console.error('Error deleting post:', error);
      toast({
        title: "Error",
        description: "Failed to delete post. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleComment = () => {
    onComment?.(post.id);
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: `Post by ${post.profiles.full_name}`,
        text: post.content,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast({
        title: "Link copied!",
        description: "Post link copied to clipboard.",
      });
    }
    onShare?.(post.id);
  };

  return (
    <Card className="bg-background border-border hover:bg-accent/5 transition-colors" ref={viewRef}>
      <CardHeader className="pb-3">
        <div className="flex items-start gap-3">
          <Avatar className="h-12 w-12">
            <AvatarImage 
              src={post.profiles.avatar_url} 
              alt={post.profiles.full_name} 
            />
            <AvatarFallback className="bg-dna-forest text-white text-sm">
              {getInitials(post.profiles.full_name)}
            </AvatarFallback>
          </Avatar>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h4 className="font-semibold text-foreground truncate">
                {post.profiles.full_name}
              </h4>
              <Badge 
                variant="secondary" 
                className={`text-xs ${getPillarColor(post.pillar)}`}
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
            
            <time className="text-xs text-muted-foreground">
              {formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}
            </time>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        <div className="space-y-4">
          {/* Show embed preview if embed_metadata exists, otherwise show content */}
          {post.embed_metadata ? (
            <div className="space-y-3">
              {/* Show content without URLs if it has additional text */}
              {post.content && post.content.trim() && !post.content.trim().match(/^https?:\/\/[^\s]+$/i) && (
                <p className="text-foreground whitespace-pre-wrap leading-relaxed">
                  {post.content.replace(/https?:\/\/[^\s]+/gi, '').trim()}
                </p>
              )}
              <EmbedPreview 
                embedData={post.embed_metadata} 
                onRemove={() => {}} 
                showRemoveButton={false}
              />
            </div>
          ) : (
            <p className="text-foreground whitespace-pre-wrap leading-relaxed">
              {post.content}
            </p>
          )}

          {post.media_url && (
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

          <div className="flex items-center justify-between pt-2 border-t">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLike}
                disabled={isLiking}
                className={`gap-2 ${isLiked ? 'text-red-500 hover:text-red-600' : 'text-muted-foreground hover:text-red-500'}`}
              >
                <Heart className={`h-4 w-4 ${isLiked ? 'fill-current' : ''}`} />
                <span>{likeCount}</span>
              </Button>

              <Button
                variant="ghost"
                size="sm"
                onClick={handleComment}
                className="gap-2 text-muted-foreground hover:text-foreground"
              >
                <MessageCircle className="h-4 w-4" />
                <span>{commentCount}</span>
              </Button>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleShare}
                className="gap-2 text-muted-foreground hover:text-foreground"
              >
                <Share className="h-4 w-4" />
                Share
              </Button>

              {user && user.id === post.profiles.id && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleDelete}
                  className="gap-2 text-muted-foreground hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                  Delete
                </Button>
              )}
            </div>
          </div>
        </div>
        
        {/* Comments Section */}
        <PostComments 
          postId={post.id} 
          initialCount={commentCount}
          onCommentCountChange={setCommentCount}
        />
      </CardContent>
    </Card>
  );
};