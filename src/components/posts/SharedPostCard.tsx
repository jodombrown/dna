import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card } from '@/components/ui/card';
import { PostWithAuthor } from '@/types/posts';
import { useNavigate } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { linkifyContent } from '@/utils/linkifyContent';

interface SharedPostCardProps {
  post: PostWithAuthor;
}

const CONTENT_PREVIEW_LENGTH = 200;

export function SharedPostCard({ post }: SharedPostCardProps) {
  const navigate = useNavigate();
  const [isExpanded, setIsExpanded] = useState(false);

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  if (!post.original_post_id) return null;

  const content = post.original_content || post.content || '';
  const shouldTruncate = content.length > CONTENT_PREVIEW_LENGTH;
  const displayContent = shouldTruncate && !isExpanded 
    ? content.slice(0, CONTENT_PREVIEW_LENGTH).trim() + '...' 
    : content;

  return (
    <Card className="p-4 border-l-4 border-l-primary/50 bg-muted/30 mt-3">
      <div className="flex items-start gap-3 mb-3">
        <Avatar 
          className="h-8 w-8 cursor-pointer"
          onClick={() => post.original_author_username && navigate(`/dna/${post.original_author_username}`)}
        >
          <AvatarImage 
            src={post.original_author_avatar_url} 
            alt={post.original_author_full_name || 'Original author'} 
          />
          <AvatarFallback className="bg-[hsl(151,75%,50%)] text-white text-xs">
            {post.original_author_full_name ? getInitials(post.original_author_full_name) : '??'}
          </AvatarFallback>
        </Avatar>
        
        <div className="flex-1 min-w-0">
          <p 
            className="font-semibold text-sm cursor-pointer hover:text-primary transition-colors"
            onClick={() => post.original_author_username && navigate(`/dna/${post.original_author_username}`)}
          >
            {post.original_author_full_name || 'Unknown User'}
          </p>
          {post.original_author_headline && (
            <p className="text-xs text-muted-foreground line-clamp-1">
              {post.original_author_headline}
            </p>
          )}
          {post.original_created_at && (
            <p className="text-xs text-muted-foreground">
              {formatDistanceToNow(new Date(post.original_created_at), { addSuffix: true })}
            </p>
          )}
        </div>
      </div>

      <motion.div
        layout
        initial={false}
        animate={{ opacity: 1 }}
        transition={{ 
          layout: { duration: 0.3, ease: "easeInOut" },
          opacity: { duration: 0.2 }
        }}
      >
        <p className="text-sm whitespace-pre-wrap">
          {linkifyContent(displayContent)}
        </p>
      </motion.div>
      
      {shouldTruncate && (
        <motion.button
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-sm text-primary hover:text-primary/80 font-medium mt-1 transition-colors"
          whileTap={{ scale: 0.98 }}
        >
          {isExpanded ? 'Show less' : 'Read more'}
        </motion.button>
      )}

      {post.original_image_url && (
        <div className="mt-3 rounded-lg overflow-hidden border max-h-64">
          {post.original_image_url.match(/\.(mp4|webm|mov|quicktime)$/i) ? (
            <video
              src={post.original_image_url}
              controls
              className="w-full h-full object-cover"
            >
              Your browser does not support the video tag.
            </video>
          ) : (
            <img
              src={post.original_image_url}
              alt="Shared post media"
              className="w-full h-full object-cover"
            />
          )}
        </div>
      )}
    </Card>
  );
}
