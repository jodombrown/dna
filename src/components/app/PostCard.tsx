import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Share2, Users, Handshake, Heart } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { Tables } from '@/integrations/supabase/types';
import ReactionBar from './ReactionBar';
import CommentsSection from './CommentsSection';
import { useReactions } from '@/hooks/useReactions';
import { useComments } from '@/hooks/useComments';

interface PostCardProps {
  post: Tables<'posts'> & {
    // Mock author data - in real app this would come from a join
    author?: {
      full_name?: string;
      avatar_url?: string;
      location?: string;
      profession?: string;
    };
  };
}

const PostCard = ({ post }: PostCardProps) => {
  const [showComments, setShowComments] = useState(false);
  const { 
    userReaction, 
    toggleReaction, 
    getReactionCounts 
  } = useReactions(post.id);
  
  const { 
    comments, 
    loading: commentsLoading,
    addComment 
  } = useComments(post.id);
  const pillarConfig = {
    connect: {
      icon: Users,
      label: 'Connect',
      className: 'bg-dna-emerald/10 text-dna-emerald'
    },
    collaborate: {
      icon: Handshake,
      label: 'Collaborate',
      className: 'bg-dna-copper/10 text-dna-copper'
    },
    contribute: {
      icon: Heart,
      label: 'Contribute',
      className: 'bg-dna-forest/10 text-dna-forest'
    }
  };

  const config = pillarConfig[post.pillar];
  const PillarIcon = config.icon;
  
  // Mock author data for now - would come from database join in real implementation
  const author = post.author || {
    full_name: 'DNA Member',
    avatar_url: null,
    location: 'Unknown Location',
    profession: 'Professional'
  };

  const timeAgo = formatDistanceToNow(new Date(post.created_at!), { addSuffix: true });

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex space-x-3">
          <Avatar className="h-10 w-10">
            <AvatarImage src={author.avatar_url || undefined} />
            <AvatarFallback className="bg-dna-emerald text-white">
              {author.full_name?.charAt(0) || 'U'}
            </AvatarFallback>
          </Avatar>
          
          <div className="flex-1">
            <div className="flex items-center space-x-2 mb-2">
              <h4 className="font-semibold">{author.full_name}</h4>
              <Badge variant="secondary" className={config.className}>
                <PillarIcon className="h-3 w-3 mr-1" />
                {config.label}
              </Badge>
            </div>
            
            <p className="text-sm text-gray-600 mb-2">
              {author.profession} • {author.location}
            </p>
            
            <p className="text-gray-800 mb-3 whitespace-pre-wrap">
              {post.content}
            </p>
            
            {post.media_url && (
              <div className="mb-3">
                <img 
                  src={post.media_url} 
                  alt="Post media" 
                  className="rounded-lg max-h-96 w-full object-cover"
                />
              </div>
            )}
            
            <div className="flex items-center justify-between text-sm text-gray-500 mb-3">
              <span>{timeAgo}</span>
              <div className="flex space-x-4">
                <span>{getReactionCounts().reduce((sum, r) => sum + r.count, 0)} reactions</span>
                <span>{comments.length} comments</span>
              </div>
            </div>
            
            {/* Reactions */}
            <ReactionBar
              postId={post.id}
              userReaction={userReaction}
              reactionCounts={getReactionCounts()}
              onReactionClick={toggleReaction}
            />
            
            {/* Comment Toggle & Share */}
            <div className="flex items-center space-x-4 text-gray-500 mt-3 pt-3 border-t">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setShowComments(!showComments)}
                className="hover:text-dna-forest"
              >
                💬 <span className="ml-1">Comment</span>
              </Button>
              <Button variant="ghost" size="sm" className="hover:text-dna-copper">
                <Share2 className="h-4 w-4 mr-1" />
                Share
              </Button>
            </div>
            
            {/* Comments Section */}
            {showComments && (
              <CommentsSection
                postId={post.id}
                comments={comments}
                loading={commentsLoading}
                onAddComment={addComment}
              />
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default PostCard;