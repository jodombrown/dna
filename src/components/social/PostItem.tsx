import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Heart, 
  MessageCircle,
  Share2,
  MoreHorizontal,
  ThumbsUp
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { useAuth } from '@/contexts/CleanAuthContext';
import { useToast } from '@/hooks/use-toast';
import FollowButton from '@/components/FollowButton';
import TagFollowButton from '@/components/TagFollowButton';
import BookmarkButton from '@/components/BookmarkButton';
import { CleanSocialPost } from '@/hooks/useCleanSocialPosts';

interface PostItemProps {
  post: CleanSocialPost;
}

const PostItem: React.FC<PostItemProps> = ({ post }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isLiked, setIsLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(post.likes_count);
  const [commentsCount, setCommentsCount] = useState(post.comments_count);

  const handleLike = () => {
    setIsLiked(!isLiked);
    setLikesCount(prev => isLiked ? prev - 1 : prev + 1);
    toast({
      title: isLiked ? "Unliked" : "Liked",
      description: `You ${isLiked ? 'unliked' : 'liked'} this post`,
    });
  };

  const handleComment = () => {
    toast({
      title: "Comments",
      description: "Comment feature coming soon!",
    });
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    toast({
      title: "Shared",
      description: "Post link copied to clipboard",
    });
  };

  const renderContent = (content: string) => {
    return content.split(/(\s+)/).map((word, index) => {
      if (word.startsWith('#')) {
        const tag = word.slice(1);
        return (
          <div key={index} className="inline-flex items-center gap-1">
            <Badge variant="secondary" className="inline-block bg-dna-mint text-dna-forest">
              {word}
            </Badge>
            <TagFollowButton tag={tag} />
          </div>
        );
      }
      return word;
    });
  };

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <Avatar className="w-10 h-10">
              <AvatarImage src={post.author?.avatar_url} alt={post.author?.full_name} />
              <AvatarFallback className="bg-dna-mint text-dna-forest">
                {post.author?.full_name?.charAt(0) || 'U'}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <p className="font-semibold text-gray-900">
                  {post.author?.display_name || post.author?.full_name || 'Community Member'}
                </p>
                {post.user_id && post.user_id !== user?.id && (
                  <FollowButton 
                    targetType="user" 
                    targetId={post.user_id} 
                    size="sm" 
                    variant="ghost"
                    showCount={false}
                  />
                )}
              </div>
              <p className="text-sm text-gray-600">
                {post.author?.profession && `${post.author.profession} • `}
                {formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <BookmarkButton targetType="post" targetId={post.id} />
            <Button variant="ghost" size="sm">
              <MoreHorizontal className="w-4 h-4" />
            </Button>
          </div>
        </div>

        <div className="mb-4">
          <p className="text-gray-800 leading-relaxed whitespace-pre-wrap">
            {renderContent(post.content)}
          </p>
        </div>

        {post.image_url && (
          <div className="mb-4">
            <img 
              src={post.image_url} 
              alt="Post content" 
              className="max-w-full h-auto rounded-lg border max-h-96 object-cover"
            />
          </div>
        )}

        {post.hashtags && post.hashtags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {post.hashtags.map((tag, index) => (
              <div key={index} className="flex items-center gap-1">
                <Badge
                  variant="secondary"
                  className="bg-dna-mint text-dna-forest hover:bg-dna-emerald hover:text-white text-xs"
                >
                  #{tag}
                </Badge>
                <TagFollowButton tag={tag} />
              </div>
            ))}
          </div>
        )}

        <Separator className="mb-4" />

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handleLike}
              className={`flex items-center gap-2 text-xs transition-colors ${
                isLiked ? 'text-red-500 bg-red-50' : 'text-gray-600 hover:text-red-500'
              }`}
            >
              {isLiked ? <Heart className="w-4 h-4 fill-current" /> : <ThumbsUp className="w-4 h-4" />}
              <span>{likesCount}</span>
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handleComment}
              className="flex items-center gap-2 text-xs text-gray-600 hover:text-blue-500 transition-colors"
            >
              <MessageCircle className="w-4 h-4" />
              <span>{commentsCount}</span>
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handleShare}
              className="flex items-center gap-2 text-xs text-gray-600 hover:text-green-500 transition-colors"
            >
              <Share2 className="w-4 h-4" />
              <span>{post.shares_count}</span>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default PostItem;
