import React, { useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Share2, Users, Handshake, Heart } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { Tables } from '@/integrations/supabase/types';
import ReactionBar from './ReactionBar';
import CommentsSection from './CommentsSection';
import { useReactions } from '@/hooks/useReactions';
import { useComments } from '@/hooks/useComments';
import MobileOptimizedCard from '@/components/ui/mobile-optimized-card';
import MobileTouchButton from '@/components/ui/mobile-touch-button';

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
    <MobileOptimizedCard padding="md" touchOptimized={false}>
      <div className="flex space-x-3">
        <Avatar className="h-8 w-8 sm:h-10 sm:w-10 flex-shrink-0">
          <AvatarImage src={author.avatar_url || undefined} />
          <AvatarFallback className="bg-dna-emerald text-white text-sm">
            {author.full_name?.charAt(0) || 'U'}
          </AvatarFallback>
        </Avatar>
        
        <div className="flex-1 min-w-0">
          <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 mb-2">
            <h4 className="font-semibold text-sm sm:text-base truncate">{author.full_name}</h4>
            <Badge variant="secondary" className={`${config.className} text-xs flex-shrink-0`}>
              <PillarIcon className="h-3 w-3 mr-1" />
              {config.label}
            </Badge>
          </div>
          
          <p className="text-xs sm:text-sm text-gray-600 mb-2 truncate">
            {author.profession} • {author.location}
          </p>
          
          <p className="text-gray-800 mb-3 whitespace-pre-wrap text-sm sm:text-base leading-relaxed">
            {post.content}
          </p>
          
          {post.media_url && (
            <div className="mb-3">
              <img 
                src={post.media_url} 
                alt="Post media" 
                className="rounded-lg max-h-64 sm:max-h-96 w-full object-cover"
              />
            </div>
          )}
          
          <div className="flex items-center justify-between text-xs sm:text-sm text-gray-500 mb-3">
            <span>{timeAgo}</span>
            <div className="flex space-x-2 sm:space-x-4">
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
          <div className="flex items-center space-x-2 sm:space-x-4 text-gray-500 mt-3 pt-3 border-t">
            <MobileTouchButton 
              variant="ghost" 
              size="sm" 
              onClick={() => setShowComments(!showComments)}
              className="hover:text-dna-forest text-xs sm:text-sm"
            >
              💬 <span className="ml-1">Comment</span>
            </MobileTouchButton>
            <MobileTouchButton 
              variant="ghost" 
              size="sm" 
              className="hover:text-dna-copper text-xs sm:text-sm"
            >
              <Share2 className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
              Share
            </MobileTouchButton>
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
    </MobileOptimizedCard>
  );
};

export default PostCard;