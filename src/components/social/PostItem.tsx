
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Heart, 
  MessageCircle,
  Share,
  MoreHorizontal
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { useAuth } from '@/contexts/CleanAuthContext';
import FollowButton from '@/components/FollowButton';
import TagFollowButton from '@/components/TagFollowButton';
import { CleanSocialPost } from '@/hooks/useCleanSocialPosts';

interface PostItemProps {
  post: CleanSocialPost;
}

const PostItem: React.FC<PostItemProps> = ({ post }) => {
  const { user } = useAuth();

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
          <Button variant="ghost" size="sm">
            <MoreHorizontal className="w-4 h-4" />
          </Button>
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

        <div className="flex items-center justify-between pt-4 border-t">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" className="text-gray-500 hover:text-red-500 transition-colors">
              <Heart className="w-4 h-4 mr-1" />
              <span className="text-sm">{post.likes_count}</span>
            </Button>
            <Button variant="ghost" size="sm" className="text-gray-500 hover:text-blue-500 transition-colors">
              <MessageCircle className="w-4 h-4 mr-1" />
              <span className="text-sm">{post.comments_count}</span>
            </Button>
            <Button variant="ghost" size="sm" className="text-gray-500 hover:text-green-500 transition-colors">
              <Share className="w-4 h-4 mr-1" />
              <span className="text-sm">{post.shares_count}</span>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default PostItem;
